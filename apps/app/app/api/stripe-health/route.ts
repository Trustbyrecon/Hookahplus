import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import https from 'https';

// Production Stripe Health Check
let stripe: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      timeout: 30000,
      maxNetworkRetries: 3,
      telemetry: false,
      httpAgent: new https.Agent({
        keepAlive: true,
        maxSockets: 5,
        timeout: 30000,
      }),
    });
  }
} catch (error) {
  console.error('[Stripe Health] ❌ Stripe initialization error:', error);
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  console.log('[Stripe Health] 🏥 Starting Stripe health check...');

  if (!stripe) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Stripe not initialized',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    }, { status: 500 });
  }

  try {
    // Test basic connectivity
    console.log('[Stripe Health] 🔍 Testing Stripe connectivity...');
    const balance = await stripe.balance.retrieve();
    
    // Test account retrieval
    console.log('[Stripe Health] 🔍 Testing account retrieval...');
    const account = await stripe.accounts.retrieve();
    
    const duration = Date.now() - startTime;
    console.log(`[Stripe Health] ✅ Health check successful (${duration}ms)`);

    return NextResponse.json({
      status: 'healthy',
      stripe: {
        accountId: account.id,
        balance: {
          available: balance.available[0].amount,
          currency: balance.available[0].currency,
        },
        livemode: balance.livemode,
        country: account.country,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL,
        region: process.env.VERCEL_REGION,
      },
      performance: {
        duration: duration,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[Stripe Health] ❌ Health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      code: error.code,
      type: error.type,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL,
        region: process.env.VERCEL_REGION,
      },
      performance: {
        duration: duration,
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}
