// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { markPaid } from "../../../../lib/orders";
import { verifyTrust } from "../../../../lib/trustlock";

export const runtime = 'nodejs';           // required: NOT edge
export const dynamic = 'force-dynamic';    // do not cache

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') || '';
  const rawBody = await req.text(); // Stripe requires raw string

  let evt: Stripe.Event;
  try {
    evt = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  switch (evt.type) {
    case 'checkout.session.completed': {
      const session = evt.data.object as Stripe.Checkout.Session;
      const rsvId = session.metadata?.hp_reservation_id;
      const total = session.amount_total ?? 0;
      
      // Handle both new HookahPlus format and legacy format
      if (rsvId) {
        // New HookahPlus format
        await upsertHookahPlusPayment({
          rsvId,
          amount: total,
          type: 'ONLINE',
          stripeId: session.id,
          metadata: session.metadata,
        });
      } else {
        // Legacy format for backward compatibility
        const orderId = session.metadata?.orderId ?? "";
        const trustSig = session.metadata?.trustSig ?? "";

        // Verify Trust-Lock signature bound at session creation
        if (!orderId || !trustSig || !verifyTrust(orderId, trustSig)) {
          return new NextResponse("Trust verification failed", { status: 400 });
        }

        // Mark order paid for dashboard
        markPaid(orderId);
        
        // Audit log (MVP)
        console.log(`audit.order.paid: ${new Date().toISOString()} | orderId: ${orderId} | tableId: ${session.metadata?.tableId} | trustSig: ${trustSig}`);
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const pi = evt.data.object as Stripe.PaymentIntent;
      const rsvId = pi.metadata?.hp_reservation_id;
      await closeHookahPlusCheck({
        rsvId,
        amount: pi.amount ?? 0,
        stripeId: pi.id,
        itemsJson: pi.metadata?.hp_items,
      });
      break;
    }

    case 'charge.dispute.created': {
      const dispute = evt.data.object as Stripe.Dispute;
      await flagReservationUnderReview({ chargeId: dispute.charge as string });
      break;
    }
    default:
      // no-op
  }

  return NextResponse.json({ ok: true });
}

// --- HookahPlus internal helpers ---
async function upsertHookahPlusPayment(data: {
  rsvId: string;
  amount: number;
  type: 'ONLINE' | 'TERMINAL';
  stripeId: string;
  metadata?: any;
}) {
  console.log(`[WEBHOOK] Processing payment for reservation ${data.rsvId}:`, {
    amount: data.amount,
    type: data.type,
    stripeId: data.stripeId,
    timestamp: new Date().toISOString()
  });

  // TODO: Implement database operations
  // - Update reservation status to CONFIRMED
  // - Store payment record
  // - Set deposit_credit if applicable
  // - Send confirmation notifications

  // For now, just log the event
  console.log(`[WEBHOOK] Payment processed successfully for reservation ${data.rsvId}`);
}

async function closeHookahPlusCheck(data: {
  rsvId: string;
  amount: number;
  stripeId: string;
  itemsJson?: string;
}) {
  console.log(`[WEBHOOK] Closing check for reservation ${data.rsvId}:`, {
    amount: data.amount,
    stripeId: data.stripeId,
    items: data.itemsJson,
    timestamp: new Date().toISOString()
  });

  // TODO: Implement database operations
  // - Finalize session/check
  // - Update reservation status to CLOSED
  // - Generate receipt
  // - Process any remaining charges

  // For now, just log the event
  console.log(`[WEBHOOK] Check closed successfully for reservation ${data.rsvId}`);
}

async function flagReservationUnderReview(data: { chargeId: string }) {
  console.log(`[WEBHOOK] Flagging reservation under review for charge ${data.chargeId}:`, {
    timestamp: new Date().toISOString()
  });

  // TODO: Implement database operations
  // - Find reservation by charge ID
  // - Update status to UNDER_REVIEW
  // - Notify staff/admin
  // - Log dispute details

  // For now, just log the event
  console.log(`[WEBHOOK] Reservation flagged for review: ${data.chargeId}`);
}
