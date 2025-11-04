import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  console.log('[Simple Stripe Test] 🧪 Testing basic Stripe functionality...');
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        ok: false,
        error: 'STRIPE_SECRET_KEY not found',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Check if we're in test mode or live mode
    const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    
    if (!isTestMode) {
      return NextResponse.json({
        ok: false,
        error: 'This test endpoint only works in test mode. Use test API keys (sk_test_...) for testing.',
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    // Create Stripe instance with minimal config
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    });

    console.log('[Simple Stripe Test] 💳 Creating simple PaymentIntent (TEST MODE ONLY)...');
    
    // Create a simple PaymentIntent - only use test payment methods in test mode
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'usd',
      confirm: true,
      payment_method: 'pm_card_visa', // Only valid in test mode
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      return_url: 'https://hookahplus-app-prod.vercel.app/payment/return',
      metadata: {
        test: 'simple-stripe-test',
        test_type: 'smoke_test',
        mode: 'test'
      }
    });

    console.log('[Simple Stripe Test] ✅ PaymentIntent created:', paymentIntent.id);

    return NextResponse.json({
      ok: true,
      message: 'Simple Stripe test successful',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Simple Stripe Test] ❌ Test failed:', error);
    
    return NextResponse.json({
      ok: false,
      error: error.message || 'Unknown error',
      code: error.code,
      type: error.type,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
