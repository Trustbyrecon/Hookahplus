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

    // Clean the Stripe key to remove any invalid characters
    const cleanStripeKey = process.env.STRIPE_SECRET_KEY.trim().replace(/[^\x20-\x7E]/g, '');
    
    // Create Stripe instance with minimal config
    const stripe = new Stripe(cleanStripeKey, {
      apiVersion: '2025-08-27.basil',
    });

    console.log('[Simple Stripe Test] 💳 Creating simple PaymentIntent...');
    
    // Create a simple PaymentIntent
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.vercel.app';
    const validReturnUrl = returnUrl.startsWith('http') ? `${returnUrl}/checkout/success` : 'https://hookahplus.vercel.app/checkout/success';
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'usd',
      confirm: true,
      payment_method: 'pm_card_visa',
      return_url: validReturnUrl,
      metadata: {
        test: 'simple-stripe-test'
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
