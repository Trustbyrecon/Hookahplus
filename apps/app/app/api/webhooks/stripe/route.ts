export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { PrismaClient, SessionState, SessionSource } from '@prisma/client';
import crypto from "crypto";

const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

const seal = (o: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

async function readRawBody(req: Request): Promise<string> {
  // For Stripe webhook signature verification, we need the raw body
  // as a Buffer to preserve exact formatting (including newlines and whitespace)
  const arrayBuffer = await req.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('utf8');
}

export async function POST(req: Request) {
  try {
    if (!stripe) {
      console.error('[Stripe Webhook] Stripe not configured - missing STRIPE_SECRET_KEY');
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    // Check for both STRIPE_WEBHOOK_SECRET and STRIPE_WEBHOOK_SECRET_APP
    // (some deployments use the _APP suffix for app-specific config)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET_APP;
    if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
      console.error('[Stripe Webhook] Webhook secret not configured');
      console.error('[Stripe Webhook] Checked: STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_APP');
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Check DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('[Stripe Webhook] DATABASE_URL not configured');
      console.error('[Stripe Webhook] Make sure DATABASE_URL is set for Production environment in Vercel');
      return Response.json({ 
        error: "Database not configured",
        details: "DATABASE_URL environment variable is missing. Please add it to Vercel Production environment variables."
      }, { status: 500 });
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return Response.json("Missing stripe-signature header", { status: 400 });
    }

    // Read raw body - must be exact bytes as sent by Stripe
    const raw = await readRawBody(req);
    
    if (!raw || raw.length === 0) {
      console.error('[Stripe Webhook] Empty request body');
      return Response.json("Empty request body", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        raw,
        sig,
        webhookSecret
      );
      console.log('[Stripe Webhook] Verified event:', event.id, event.type);
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      console.error('[Stripe Webhook] Body length:', raw.length);
      console.error('[Stripe Webhook] Signature header:', sig.substring(0, 20) + '...');
      return Response.json(`Webhook Error: ${err.message}`, { status: 400 });
    }

      if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // SECURITY: Only use opaque session ID from metadata (h_session)
      // All business logic is looked up from our DB, not Stripe metadata
      const sessionId = session.metadata?.h_session as string;
      const action = session.metadata?.h_action as string;
      
      if (!sessionId) {
        console.error('[Stripe Webhook] Missing h_session in metadata - cannot link payment to session');
        return Response.json({ error: "Missing session ID in metadata" }, { status: 400 });
      }

      // Handle session extension
      if (action === 'extend') {
        return await handleSessionExtension(session, sessionId);
      }
    
      // PRIVATE LOOKUP: Get all business logic from our database
      const existingSession = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      });
      
      if (!existingSession) {
        console.error('[Stripe Webhook] Session not found in database:', sessionId);
        return Response.json({ error: "Session not found" }, { status: 404 });
      }
      
      // Use session data from our DB (not Stripe metadata)
      const loungeId = existingSession.loungeId || "default-lounge";
      const externalRef = session.id; // Stripe checkout session ID
      const tableId = existingSession.tableId || "T-001";
      const flavorMix = existingSession.flavorMix || existingSession.flavor || null;
      
      // Parse flavors array from our DB
      let flavorsArray: string[] = [];
      if (existingSession.flavorMix) {
        try {
          const parsed = JSON.parse(existingSession.flavorMix);
          flavorsArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          flavorsArray = [existingSession.flavorMix];
        }
      } else if (existingSession.flavor) {
        flavorsArray = [existingSession.flavor];
      }
      
      // Calculate price from session amount
      const priceCents = session.amount_total || existingSession.priceCents || 0;
      
      // Get payment intent ID if available
      const paymentIntentId = session.payment_intent as string | undefined;

      // Create trust signature using our DB data
      const trustSignature = seal({
        loungeId,
        source: existingSession.source || SessionSource.QR,
        externalRef,
        customerPhone: session.customer_details?.phone || existingSession.customerPhone,
        flavorMix,
      });

      // Update session with payment confirmation
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          paymentStatus: session.payment_status === 'paid' ? 'succeeded' : session.payment_status,
          paymentIntent: paymentIntentId,
          priceCents: priceCents,
          externalRef: externalRef, // Store Stripe checkout session ID
          // Update state to PAID_CONFIRMED if payment succeeded
          ...(session.payment_status === 'paid' && {
            state: SessionState.PENDING, // Will transition to PAID_CONFIRMED via state machine
          }),
        },
      });
      
      // Apply loyalty and trust events (all business logic stays in H+)
      try {
        const { initializeReflexChain } = await import('../../../../lib/reflex-chain/integration');
        const fireSession = {
          id: existingSession.id,
          status: 'PAID_CONFIRMED' as const,
          flavorMix: flavorMix || undefined,
          tableId: tableId || undefined,
          source: (existingSession.source || 'QR') as const,
          notes: existingSession.tableNotes || undefined,
        };
        await initializeReflexChain(fireSession as any);
        console.log('[Webhook] Reflex Chain initialized for paid session:', existingSession.id);
      } catch (reflexError) {
        console.error('[Webhook] Failed to initialize Reflex Chain:', reflexError);
        // Don't fail the webhook if Reflex Chain initialization fails
      }
      
      // Legacy code path removed - sessions are always created before checkout
      // All business logic (flavorMix, tableId, loungeId) is stored in our DB, not Stripe
      console.log('[Webhook] Payment confirmed for session:', sessionId, 'from Stripe checkout:', externalRef);
    }
    
    // Handle payment_intent.succeeded for additional payment confirmation
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // SECURITY: Only use opaque session ID from metadata
      const sessionId = paymentIntent.metadata?.h_session as string;
      
      if (!sessionId) {
        console.warn('[Stripe Webhook] PaymentIntent succeeded but missing h_session - may be from legacy checkout');
        return Response.json("ok", { status: 200 }); // Don't fail, just log
      }
      
      // PRIVATE LOOKUP: Get session from our DB
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });
      
      if (session) {
        // Update payment status if not already updated
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            paymentStatus: 'succeeded',
            paymentIntent: paymentIntent.id,
            // State will be updated via checkout.session.completed webhook
          },
        });
        console.log('[Webhook] PaymentIntent confirmed for session:', sessionId);
      } else {
        console.warn('[Webhook] PaymentIntent succeeded but session not found:', sessionId);
      }
    }

    return Response.json("ok", { status: 200 });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error);
    return Response.json(
      {
        error: "Webhook handler failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle session extension after payment confirmation
 */
async function handleSessionExtension(
  checkoutSession: Stripe.Checkout.Session,
  sessionId: string
) {
  try {
    const extensionMinutes = parseInt(checkoutSession.metadata?.h_extension_minutes || '30', 10);
    const extensionCost = parseFloat(checkoutSession.metadata?.h_extension_cost || '0');
    const pricingModel = (checkoutSession.metadata?.h_pricing_model || 'time-based') as 'flat' | 'time-based';

    // Find session
    const dbSession = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!dbSession) {
      console.error('[Webhook Extension] Session not found:', sessionId);
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    // Validate session can still be extended (might have changed since checkout)
    const { convertPrismaSessionToFireSession } = await import('../../sessions/route');
    const fireSession = convertPrismaSessionToFireSession(dbSession);
    const { canExtendSession } = await import('../../../../lib/session-utils');
    
    const validation = canExtendSession(fireSession);
    if (!validation.canExtend) {
      console.error('[Webhook Extension] Session cannot be extended:', validation.reason);
      // Refund will be handled separately - for now, just log
      return Response.json({ 
        error: "Session cannot be extended",
        details: validation.reason
      }, { status: 400 });
    }

    // Calculate new timer duration
    const currentTimerDuration = dbSession.timerDuration || 45 * 60;
    const extensionSeconds = extensionMinutes * 60;
    const newTimerDuration = currentTimerDuration + extensionSeconds;

    // Update session with extended duration
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        timerDuration: newTimerDuration,
        durationSecs: (dbSession.durationSecs || 45 * 60) + extensionSeconds,
        // Update price to include extension cost
        priceCents: (dbSession.priceCents || 3000) + Math.round(extensionCost * 100),
        paymentStatus: checkoutSession.payment_status === 'paid' ? 'succeeded' : checkoutSession.payment_status,
        paymentIntent: checkoutSession.payment_intent as string | undefined,
        updatedAt: new Date()
      }
    });

    // Log extension event
    try {
      await prisma.reflexEvent.create({
        data: {
          type: 'session.extended',
          source: 'webhook',
          sessionId: sessionId,
          payload: JSON.stringify({
            action: 'extend_session',
            extensionMinutes,
            extensionCost,
            newDuration: newTimerDuration,
            checkoutSessionId: checkoutSession.id,
            businessLogic: 'Session extended via Stripe payment - timer duration increased'
          }),
          payloadHash: `extend_${sessionId}_${Date.now()}`
        }
      });
    } catch (eventError) {
      console.warn('[Webhook Extension] Failed to create analytics event:', eventError);
    }

    console.log('[Webhook Extension] Session extended:', {
      sessionId,
      extensionMinutes,
      extensionCost,
      newDuration: newTimerDuration
    });

    return Response.json({ 
      success: true,
      message: "Session extended successfully",
      sessionId,
      extensionMinutes,
      newDuration: newTimerDuration
    });

  } catch (error: any) {
    console.error('[Webhook Extension] Error:', error);
    return Response.json({ 
      error: "Failed to extend session",
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

