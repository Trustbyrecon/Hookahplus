// apps/app/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // never cache webhooks

// --- env
import { getEnvVar } from '../../../lib/env';

const STRIPE_SECRET_KEY = getEnvVar('STRIPE_SECRET_KEY');
const WEBHOOK_SECRET = getEnvVar('STRIPE_WEBHOOK_SECRET_APP');
const SUPABASE_URL = getEnvVar('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

// --- clients
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Utility: idempotency insert. Returns true if event is new; false if seen.
async function lockEventOnce(eventId: string, type: string) {
  const { data, error } = await supabaseAdmin
    .from("stripe_webhook_events")
    .insert({ id: eventId, type })
    .select("id")
    .single();

  // If a unique constraint violation happened, this event was processed already.
  if (error && error.code === "23505") return false;
  if (error) throw error;
  return Boolean(data?.id);
}

// Router of event handlers
const handlers: Record<string, (evt: Stripe.Event) => Promise<void>> = {
  "checkout.session.completed": async (evt) => {
    const session = evt.data.object as Stripe.Checkout.Session;
    // TODO: mark order/session as paid for operator flow
    console.log("[app] checkout.session.completed ->", session.id, session.client_reference_id);
  },
  "payment_intent.succeeded": async (evt) => {
    const pi = evt.data.object as Stripe.PaymentIntent;
    console.log("[app] payment_intent.succeeded ->", pi.id, pi.amount_received);
  },
  "payment_intent.payment_failed": async (evt) => {
    const pi = evt.data.object as Stripe.PaymentIntent;
    console.warn("[app] payment_intent.payment_failed ->", pi.id, pi.last_payment_error?.message);
  },
  "invoice.payment_succeeded": async (evt) => {
    const inv = evt.data.object as Stripe.Invoice;
    console.log("[app] invoice.payment_succeeded ->", inv.id, inv.customer);
  },
  "customer.subscription.updated": async (evt) => {
    const sub = evt.data.object as Stripe.Subscription;
    console.log("[app] subscription.updated ->", sub.id, sub.status);
  },
};

export async function POST(req: NextRequest) {
  try {
    // 1) Verify signature
    const sig = req.headers.get("stripe-signature") ?? "";
    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error("[app] ❌ Invalid signature:", err?.message);
      return new NextResponse(`Webhook Error: ${err?.message}`, { status: 400 });
    }

    // 2) Idempotency guard
    const isNew = await lockEventOnce(event.id, event.type);
    if (!isNew) {
      return NextResponse.json({ ok: true, deduped: true });
    }

    // 3) Route only whitelisted events
    const handler = handlers[event.type];
    if (handler) {
      await handler(event);
    } else {
      // ignore unlisted types (safe)
      console.log("[app] ignored event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[app] Webhook handler error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}