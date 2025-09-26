import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripeServer";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Proxy guests -> app live-test so only APP needs Stripe secret
export async function POST(req: Request) {
  try {
    const admin = process.env.ADMIN_TEST_TOKEN || '';
    const appBase = process.env.NEXT_PUBLIC_APP_URL || '';
    if (!appBase) {
      return NextResponse.json({ ok: false, error: 'NEXT_PUBLIC_APP_URL missing' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${appBase}/api/payments/live-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': admin,
      },
      body: JSON.stringify({ ...body, source: body?.source ?? 'guests:$1-smoke' }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    // Fallback: run locally if Stripe secret is available (for 401, 500, etc.)
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = getStripe();
      const intent = await stripe.paymentIntents.create({
        amount: 100,
        currency: 'usd',
        description: 'Hookah+ $1 sandbox smoke test (guests fallback)',
        payment_method: 'pm_card_visa',
        confirm: true,
        metadata: {
          app: 'hookahplus-guests',
          flow: 'sandbox_smoke_fallback',
          source: body?.source ?? 'guests:$1-smoke',
        },
      });
      const ok = intent.status === 'succeeded' || intent.status === 'requires_capture';
      return NextResponse.json({ ok, message: ok ? 'Stripe $1 test succeeded (fallback)' : `Stripe status: ${intent.status}` });
    }
    return NextResponse.json({ ok: false, error: data?.error || `proxy failed with ${res.status}` }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'proxy error' }, { status: 500 });
  }
}
