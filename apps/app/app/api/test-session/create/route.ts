import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { tableId, customerInfo } = await req.json();

    // Create a $1 test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 in cents
      currency: 'usd',
      metadata: {
        type: 'test_hookah_session',
        tableId: tableId || 'T-TEST',
        customerName: customerInfo?.name || 'Test Customer',
        customerPhone: customerInfo?.phone || '(555) 123-4567',
        flavor: 'Test Flavor Mix',
        testMode: 'true'
      },
      description: 'Test Hookah Session - $1',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: 100,
      currency: 'usd',
      metadata: paymentIntent.metadata
    });

  } catch (error: any) {
    console.error('Test session creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create test session' 
      },
      { status: 500 }
    );
  }
}
