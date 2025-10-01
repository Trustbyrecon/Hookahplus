import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
let stripe: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });
    console.log('[RWO:$1-smoke] ✅ Stripe initialized successfully');
  } else {
    console.warn('[RWO:$1-smoke] ⚠️ STRIPE_SECRET_KEY not found');
  }
} catch (error) {
  console.error('[RWO:$1-smoke] ❌ Stripe initialization error:', error);
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('[RWO:$1-smoke] 🚀 Starting $1 smoke test...');

  try {
    if (!stripe) {
      return NextResponse.json({
        ok: false,
        error: 'Stripe not configured. Please check STRIPE_SECRET_KEY environment variable.'
      }, { status: 500 });
    }

    const { cartTotal = 0, itemsCount = 0 } = await req.json();

    // Create PaymentIntent with $1.00 (100 cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 in cents
      currency: 'usd',
      confirm: true,
      payment_method: 'pm_card_visa', // Sandbox test card
      metadata: {
        source: 'order-mgmt:$1-smoke',
        env: 'preview',
        cartTotal: cartTotal.toString(),
        itemsCount: itemsCount.toString(),
        timestamp: new Date().toISOString()
      },
      description: 'Hookah+ $1 Smoke Test - Order Management',
      automatic_payment_methods: {
        enabled: false, // Using specific test payment method
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[RWO:$1-smoke] ✅ PaymentIntent created: ${paymentIntent.id} (${duration}ms)`);

    // Log to GhostLog
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ghost-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          kind: 'stripe_smoke_test',
          intentId: paymentIntent.id,
          amount: 100,
          source: 'order-mgmt:$1-smoke',
          status: paymentIntent.status,
          duration: duration
        })
      });
    } catch (logError) {
      console.warn('[RWO:$1-smoke] ⚠️ GhostLog write failed:', logError);
    }

    return NextResponse.json({
      ok: true,
      intentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: 100,
      currency: 'usd',
      stripeUrl: `https://dashboard.stripe.com/test/payments/${paymentIntent.id}`,
      duration: duration
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[RWO:$1-smoke] ❌ PaymentIntent creation failed:', error);

    // Log error to GhostLog
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ghost-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          kind: 'stripe_smoke_error',
          error: error.message,
          duration: duration
        })
      });
    } catch (logError) {
      console.warn('[RWO:$1-smoke] ⚠️ GhostLog error write failed:', logError);
    }

    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to create payment intent',
      duration: duration
    }, { status: 500 });
  }
}