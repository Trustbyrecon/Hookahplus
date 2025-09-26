import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripeServer";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.json().catch(() => ({}));
    const intent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "usd",
      description: "Hookah+ $1 sandbox smoke test (guests)",
      payment_method: "pm_card_visa",
      confirm: true,
      metadata: {
        app: "hookahplus-guests",
        flow: "sandbox_smoke",
        source: body?.source ?? "unknown",
      },
    });
    const ok = intent.status === 'succeeded' || intent.status === 'requires_capture';
    return NextResponse.json({ ok, message: ok ? 'Stripe $1 test succeeded' : `Stripe status: ${intent.status}` });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Stripe error' }, { status: 500 });
  }
}


