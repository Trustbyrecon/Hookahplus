import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import https from 'https';

// Enhanced Stripe Configuration for Production
let stripe: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    // Production-optimized Stripe configuration
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
      timeout: 45000, // 45 seconds for production
      maxNetworkRetries: 5, // Increased retries
      telemetry: false, // Disable telemetry for better performance
      httpAgent: new https.Agent({
        keepAlive: true,
        maxSockets: 10,
        timeout: 45000,
        keepAliveMsecs: 30000,
      }),
    });
    console.log('[RWO:$1-smoke] ✅ Enhanced Stripe initialized for production');
  } else {
    console.warn('[RWO:$1-smoke] ⚠️ STRIPE_SECRET_KEY not found');
  }
} catch (error) {
  console.error('[RWO:$1-smoke] ❌ Stripe initialization error:', error);
}

// Retry logic with exponential backoff for production reliability
async function createPaymentWithRetry(params: any, maxRetries = 3): Promise<Stripe.PaymentIntent> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[RWO:$1-smoke] 💳 Payment attempt ${attempt}/${maxRetries}...`);
      const paymentIntent = await stripe!.paymentIntents.create(params);
      console.log(`[RWO:$1-smoke] ✅ PaymentIntent created on attempt ${attempt}: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error: any) {
      console.error(`[RWO:$1-smoke] ❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`[RWO:$1-smoke] ⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All retry attempts failed');
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

    console.log('[RWO:$1-smoke] 💳 Creating PaymentIntent with retry logic...');
    
    // Create PaymentIntent with retry logic and enhanced metadata
    const paymentIntent = await createPaymentWithRetry({
      amount: 100,
      currency: 'usd',
      confirm: true,
      payment_method: 'pm_card_visa',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/checkout/success`,
      metadata: {
        source: 'order-mgmt:$1-smoke',
        env: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION || 'unknown',
        timestamp: new Date().toISOString(),
        rwo: 'RWO-STRIPE-001'
      }
    });

    const duration = Date.now() - startTime;
    console.log(`[RWO:$1-smoke] ✅ PaymentIntent created: ${paymentIntent.id} (${duration}ms)`);

    // Use fallback account ID for dashboard URL
    const stripeAccountId = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') 
      ? 'acct_test_fallback' 
      : 'acct_live_fallback';

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