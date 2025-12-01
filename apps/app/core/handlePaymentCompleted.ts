import { PrismaClient, SessionState, SessionSource } from '@prisma/client';
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
          flavorMix: flavorMix || null,
          loungeId,
          priceCents: amountCents || 3000,
          paymentStatus: isDemo ? 'succeeded' : null,
          sessionType: 'flat',
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

    // 6) Emit Trust/Reflex log entry for analytics
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

