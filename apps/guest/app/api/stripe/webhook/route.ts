// apps/guest/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "../../../../lib/stripeServer";
import { getStripeWebhookSecret } from "../../../../lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// No Supabase usage during build; idempotency is assumed in preview

async function lockEventOnce(eventId: string, type: string) {
  return true;
}

const handlers: Record<string, (evt: Stripe.Event) => Promise<void>> = {
  "checkout.session.completed": async (evt) => {
    const session = evt.data.object as Stripe.Checkout.Session;
    // TODO: mark guest-facing order/session as paid, unlock table QR flow
    console.log("[guest] checkout.session.completed ->", session.id, session.client_reference_id);
  },
  "payment_intent.succeeded": async (evt) => {
    const pi = evt.data.object as Stripe.PaymentIntent;
    console.log("[guest] payment_intent.succeeded ->", pi.id, pi.amount_received);
  },
  "payment_intent.payment_failed": async (evt) => {
    const pi = evt.data.object as Stripe.PaymentIntent;
    console.warn("[guest] payment_intent.payment_failed ->", pi.id, pi.last_payment_error?.message);
  },
};

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature") ?? "";
    const body = await req.text();
    let event: Stripe.Event;

    try {
      const stripe = getStripe();
      const WEBHOOK_SECRET = getStripeWebhookSecret();
      event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error("[guest] ❌ Invalid signature:", err?.message);
      return new NextResponse(`Webhook Error: ${err?.message}`, { status: 400 });
    }

    const isNew = await lockEventOnce(event.id, event.type);
    if (!isNew) {
      return NextResponse.json({ ok: true, deduped: true });
    }

    const handler = handlers[event.type];
    if (handler) {
      await handler(event);
    } else {
      console.log("[guest] ignored event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[guest] Webhook handler error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
