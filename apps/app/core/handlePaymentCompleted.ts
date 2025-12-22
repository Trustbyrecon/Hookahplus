import { PrismaClient, SessionState, SessionSource, Prisma } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const seal = (o: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

export interface PaymentCompletedPayload {
  source: "stripe" | "simulated";
  externalSessionId: string; // Stripe session id or sim id
  sessionId: string; // Internal Hookah+ session ID
  loungeId: string;
  operatorId?: string;
  demoMode?: "simulated" | "stripe_test";
  isDemo: boolean;
  amountCents?: number;
  paymentIntentId?: string;
  flavorMix?: string | null;
  tableId?: string;
  customerPhone?: string;
}

/**
 * Shared payment completion handler for both Stripe and simulated flows
 * Handles session creation, flavor mix attachment, loyalty preview, analytics
 */
export async function handlePaymentCompleted(payload: PaymentCompletedPayload) {
  const {
    source,
    sessionId,
    loungeId,
    externalSessionId,
    operatorId,
    demoMode,
    isDemo,
    amountCents,
    paymentIntentId,
    flavorMix,
    tableId,
    customerPhone,
  } = payload;

  console.log(`[Payment Handler] Processing ${source} payment completion for session:`, sessionId);

  try {
    // 1) Get or create Hookah+ session record
    let existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      // Session should already exist, but create if missing (for simulated flow)
      console.warn(`[Payment Handler] Session ${sessionId} not found, creating...`);
      
      const trustSignature = seal({
        loungeId,
        source: SessionSource.QR,
        externalRef: externalSessionId,
        customerPhone,
        flavorMix,
      });

      existingSession = await prisma.session.create({
        data: {
          id: sessionId,
          externalRef: externalSessionId,
          source: SessionSource.QR,
          state: SessionState.PENDING,
          trustSignature,
          tableId: tableId || 'table-001',
          customerPhone: customerPhone || null,
          flavor: null,
          flavorMix: flavorMix ? flavorMix : Prisma.JsonNull,
          loungeId,
          priceCents: amountCents || 3000,
          paymentStatus: isDemo ? 'succeeded' : null,
          durationSecs: 45 * 60,
        },
      });
    }

    // 2) Update session with payment confirmation
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        paymentStatus: 'succeeded',
        paymentIntent: paymentIntentId || null,
        priceCents: amountCents || existingSession.priceCents || 3000,
        externalRef: externalSessionId,
        // Update state to PENDING (will transition to PAID_CONFIRMED via state machine)
        state: SessionState.PENDING,
      },
    });

    // 3) Create Payment record if tenant exists
    if (existingSession.tenantId && paymentIntentId) {
      try {
        const existingPayment = await prisma.payment.findFirst({
          where: {
            stripeChargeId: paymentIntentId,
          },
        });

        if (!existingPayment) {
          await prisma.payment.create({
            data: {
              tenantId: existingSession.tenantId,
              sessionId: sessionId,
              stripeChargeId: paymentIntentId,
              amountCents: amountCents || existingSession.priceCents || 3000,
              status: 'succeeded',
              paidAt: new Date(),
            },
          });
          console.log('[Payment Handler] Payment record created:', paymentIntentId);
        }
      } catch (paymentError) {
        console.error('[Payment Handler] Failed to create payment record (non-blocking):', paymentError);
      }
    }

    // 4) Attach flavor mix and update session metadata
    if (flavorMix) {
      try {
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            flavorMix: flavorMix,
          },
        });
      } catch (flavorError) {
        console.error('[Payment Handler] Failed to update flavor mix (non-blocking):', flavorError);
      }
    }

    // 5) Trigger loyalty + analytics (Reflex Chain)
    try {
      const { initializeReflexChain } = await import('../lib/reflex-chain/integration');
      const fireSession = {
        id: existingSession.id,
        status: 'PAID_CONFIRMED' as const,
        flavorMix: flavorMix || existingSession.flavorMix || undefined,
        tableId: tableId || existingSession.tableId || undefined,
        source: (existingSession.source || SessionSource.QR) as SessionSource,
        notes: existingSession.tableNotes || undefined,
      };
      await initializeReflexChain(fireSession as any);
      console.log('[Payment Handler] Reflex Chain initialized for paid session:', existingSession.id);
    } catch (reflexError) {
      console.error('[Payment Handler] Failed to initialize Reflex Chain:', reflexError);
      // Don't fail if Reflex Chain initialization fails
    }

    // 6) Award loyalty points if customer phone is available
    if (customerPhone) {
      try {
        await awardLoyaltyPoints({
          customerPhone,
          loungeId,
          sessionId,
          amountCents: amountCents || existingSession.priceCents || 3000,
          tenantId: existingSession.tenantId || null
        });
      } catch (loyaltyError) {
        console.error('[Payment Handler] Failed to award loyalty points (non-blocking):', loyaltyError);
      }
    }

    // 7) Emit Trust/Reflex log entry for analytics
    try {
      await prisma.reflexEvent.create({
        data: {
          type: 'session.payment_completed',
          source: isDemo ? 'demo' : source,
          sessionId: sessionId,
          payload: JSON.stringify({
            action: 'payment_completed',
            source,
            demoMode,
            isDemo,
            externalSessionId,
            loungeId,
            operatorId,
            amountCents: amountCents || existingSession.priceCents || 3000,
            businessLogic: isDemo
              ? `Demo ${source} payment completed - session ready for NAN workflow`
              : `${source} payment completed - session ready for prep`
          }),
          payloadHash: seal({
            action: 'payment_completed',
            source,
            sessionId,
            demoMode,
            isDemo
          }),
          tenantId: existingSession.tenantId || null
        }
      });
    } catch (eventError) {
      console.error('[Payment Handler] Failed to create analytics event (non-blocking):', eventError);
    }

    console.log(`[Payment Handler] ✅ Payment completed successfully for session:`, sessionId);
    return { success: true, sessionId };
  } catch (error: any) {
    console.error('[Payment Handler] Error processing payment completion:', error);
    throw error;
  }
}

/**
 * Award loyalty points to customer after payment
 * Exported for use in settlement flow
 */
export async function awardLoyaltyPoints(params: {
  customerPhone: string;
  loungeId: string;
  sessionId: string;
  amountCents: number;
  tenantId: string | null;
}) {
  const { customerPhone, loungeId, sessionId, amountCents, tenantId } = params;
  
  try {
    // Find or create loyalty account
    const where: any = { customerPhone, loungeId };
    if (tenantId) where.tenantId = tenantId;

    let account = await prisma.loyaltyAccount.findFirst({ where });

    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: {
          loungeId,
          tenantId: tenantId || null,
          customerPhone,
          currentTier: 'bronze'
        }
      });
    }

    if (!account.isActive) {
      console.log('[Loyalty] Account is inactive, skipping points award');
      return;
    }

    // Get customer's current tier to determine points per dollar
    const tier = await prisma.loyaltyTier.findFirst({
      where: {
        tierName: account.currentTier,
        isActive: true,
        ...(loungeId ? { loungeId } : {}),
        ...(tenantId ? { tenantId } : {})
      }
    });

    // Calculate points: amount in dollars * points per dollar (default 1 if no tier)
    const amountDollars = amountCents / 100;
    const pointsPerDollar = tier?.pointsPerDollar || 1;
    const pointsEarned = Math.round(amountDollars * pointsPerDollar);

    if (pointsEarned <= 0) {
      console.log('[Loyalty] No points to award (amount too small)');
      return;
    }

    // Update account with new points
    const updatedAccount = await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: { increment: pointsEarned },
        totalPointsEarned: { increment: pointsEarned },
        visitCount: { increment: 1 },
        lastVisitAt: new Date()
      }
    });

    // Create transaction record
    await prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'EARN',
        amountCents: 0, // Points are separate from cents
        balanceBeforeCents: account.pointsBalance,
        balanceAfterCents: updatedAccount.pointsBalance,
        source: 'purchase',
        sessionId
      }
    });

    // Check and update tier if points threshold reached
    const tiers = await prisma.loyaltyTier.findMany({
      where: {
        isActive: true,
        ...(loungeId ? { loungeId } : {}),
        ...(tenantId ? { tenantId } : {})
      },
      orderBy: { minPoints: 'desc' }
    });

    let newTier = 'bronze';
    for (const t of tiers) {
      if (updatedAccount.pointsBalance >= t.minPoints) {
        newTier = t.tierName;
        break;
      }
    }

    if (updatedAccount.currentTier !== newTier) {
      await prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { currentTier: newTier }
      });
      console.log(`[Loyalty] Customer ${customerPhone} upgraded to ${newTier} tier`);
    }

    console.log(`[Loyalty] Awarded ${pointsEarned} points to customer ${customerPhone} for session ${sessionId}`);
  } catch (error) {
    console.error('[Loyalty] Error awarding points:', error);
    throw error;
  }
}

