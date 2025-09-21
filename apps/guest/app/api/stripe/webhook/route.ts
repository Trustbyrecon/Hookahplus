// apps/guest/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getStripeSecretKey, getStripeWebhookSecret, getSupabaseUrl, getSupabaseServiceRoleKey } from "../../lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STRIPE_SECRET_KEY = getStripeSecretKey();
const WEBHOOK_SECRET = getStripeWebhookSecret();
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function lockEventOnce(eventId: string, type: string) {
  const { data, error } = await supabaseAdmin
    .from("stripe_webhook_events")
    .insert({ id: eventId, type })
    .select("id")
    .single();

  if (error && error.code === "23505") return false;
  if (error) throw error;
  return Boolean(data?.id);
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
