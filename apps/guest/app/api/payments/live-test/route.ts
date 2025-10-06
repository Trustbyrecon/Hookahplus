import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripeServer";
import { checkPaymentOperation } from "../../../../lib/reflex-integration";
import { paymentRateLimit, createRateLimitResponse } from "../../../../lib/rate-limit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Proxy guests -> app live-test so only APP needs Stripe secret
export async function POST(req: Request) {
  try {
    // Rate limiting check
    const rateLimitResult = paymentRateLimit(req as any);
    if (!rateLimitResult.success) {
      console.warn('[Guest:$1-smoke] ⚠️ Rate limit exceeded');
      return createRateLimitResponse(rateLimitResult);
    }
    
    const admin = process.env.ADMIN_TEST_TOKEN || '';
    const appBase = process.env.NEXT_PUBLIC_APP_URL || '';
    const body = await req.json().catch(() => ({}));
    
    // Reflex Layer: Check payment operation quality
    const shouldProceed = await checkPaymentOperation(body);
    if (!shouldProceed) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Payment operation failed quality check' 
      }, { status: 400 });
    }
    
    // Try to proxy to app if URL is available
    if (appBase) {
      try {
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
      } catch (proxyError) {
        console.log('Proxy failed, falling back to local Stripe:', proxyError);
      }
    }
    
    // Fallback: run locally if Stripe secret is available
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
      return NextResponse.json({ 
        ok, 
        message: ok ? 'Stripe $1 test succeeded (guests fallback)' : `Stripe status: ${intent.status}`,
        id: intent.id,
        status: intent.status
      });
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: 'No Stripe secret key available for fallback' 
    }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'proxy error' }, { status: 500 });
  }
}
