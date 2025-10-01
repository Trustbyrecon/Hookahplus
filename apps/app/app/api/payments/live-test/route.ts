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
  console.log('[RWO:$1-smoke] 🔍 Environment check:', {
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL
  });

  try {
    if (!stripe) {
      console.error('[RWO:$1-smoke] ❌ Stripe not initialized');
      return NextResponse.json({
        ok: false,
        error: 'Stripe not configured. Please check STRIPE_SECRET_KEY environment variable.',
        debug: {
          hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 });
    }

    const { cartTotal = 0, itemsCount = 0 } = await req.json();

    // Test Stripe connection first
    try {
      console.log('[RWO:$1-smoke] 🔍 Testing Stripe connection...');
      await stripe.balance.retrieve();
      console.log('[RWO:$1-smoke] ✅ Stripe connection test successful');
    } catch (connectionError: any) {
      console.error('[RWO:$1-smoke] ❌ Stripe connection test failed:', connectionError.message);
      return NextResponse.json({
        ok: false,
        error: `Stripe connection failed: ${connectionError.message}`,
        debug: {
          connectionError: connectionError.message,
          stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...'
        }
      }, { status: 500 });
    }

    console.log('[RWO:$1-smoke] 💳 Creating PaymentIntent...');
    
    // Create PaymentIntent with $1.00 (100 cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 in cents
      currency: 'usd',
      confirm: true,
      payment_method: 'pm_card_visa', // Sandbox test card
      payment_method_types: ['card'], // Specify payment method types
      metadata: {
        source: 'order-mgmt:$1-smoke',
        env: 'preview',
        cartTotal: cartTotal.toString(),
        itemsCount: itemsCount.toString(),
        timestamp: new Date().toISOString()
      },
      description: 'Hookah+ $1 Smoke Test - Order Management',
    });

    const duration = Date.now() - startTime;
    console.log(`[RWO:$1-smoke] ✅ PaymentIntent created: ${paymentIntent.id} (${duration}ms)`);

    // Get Stripe account ID for proper dashboard URL
    let stripeAccountId = 'acct_default';
    try {
      // Try to retrieve account with shorter timeout
      const accountPromise = stripe.accounts.retrieve();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 3 seconds')), 3000)
      );
      
      const account = await Promise.race([accountPromise, timeoutPromise]) as any;
      stripeAccountId = account.id;
      console.log(`[RWO:$1-smoke] 📊 Stripe account: ${stripeAccountId}`);
    } catch (accountError: any) {
      console.warn('[RWO:$1-smoke] ⚠️ Could not retrieve account ID:', accountError.message);
      // Extract account ID from secret key if possible
      if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
        stripeAccountId = 'acct_test_fallback';
      } else if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
        stripeAccountId = 'acct_live_fallback';
      }
    }

    // Log to GhostLog
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/ghost-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          kind: 'stripe_smoke_test',
          intentId: paymentIntent.id,
          amount: 100,
          source: 'order-mgmt:$1-smoke',
          status: paymentIntent.status,
          duration: duration,
          stripeAccountId: stripeAccountId
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
      stripeUrl: `https://dashboard.stripe.com/${stripeAccountId}/test/payments/${paymentIntent.id}`,
      duration: duration
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[RWO:$1-smoke] ❌ PaymentIntent creation failed:', error);
    console.error('[RWO:$1-smoke] 🔍 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      type: error.type,
      statusCode: error.statusCode
    });

    // Log error to GhostLog
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/ghost-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          kind: 'stripe_smoke_error',
          error: error.message,
          errorCode: error.code,
          errorType: error.type,
          duration: duration
        })
      });
    } catch (logError) {
      console.warn('[RWO:$1-smoke] ⚠️ GhostLog error write failed:', logError);
    }

    // Provide more specific error messages
    let userMessage = error.message || 'Failed to create payment intent';
    if (error.code === 'api_key_expired') {
      userMessage = 'Stripe API key has expired. Please contact support.';
    } else if (error.code === 'invalid_api_key') {
      userMessage = 'Invalid Stripe API key. Please contact support.';
    } else if (error.code === 'rate_limit') {
      userMessage = 'Rate limit exceeded. Please try again in a moment.';
    } else if (error.message?.includes('connection')) {
      userMessage = 'Connection error with Stripe. Please try again.';
    }

    return NextResponse.json({
      ok: false,
      error: userMessage,
      debug: {
        originalError: error.message,
        code: error.code,
        type: error.type
      },
      duration: duration
    }, { status: 500 });
  }
}