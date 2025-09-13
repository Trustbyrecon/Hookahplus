// app/api/checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Stripe Secret Key available:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Stripe Secret Key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));
    
    const { lineItems, successUrl, cancelUrl, tableId, flavor, amount, sessionTier = 'base' } = await request.json();

    // Validate required fields
    if (!lineItems || !Array.isArray(lineItems)) {
      return NextResponse.json(
        { error: 'Invalid line items' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}/cancel`,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      metadata: {
        source: 'hookahplus-web',
        session_type: 'hookah_session',
        tableId: tableId || 'T-001',
        flavor: flavor || 'Blue Mist + Mint',
        sessionTier: sessionTier,
      },
    });

    console.log('Stripe session created successfully:', session.id);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
      amount: amount,
      tableId,
      flavor,
      sessionTier,
      status: 'open'
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message,
        stripeError: error.type || 'unknown'
      },
      { status: 500 }
    );
  }
}
