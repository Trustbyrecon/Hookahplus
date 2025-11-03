import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      console.error('[Checkout API] Stripe not configured - STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { 
          success: false,
          error: 'Stripe not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { flavors, addOns, tableId, loungeId, amount, total, pricingModel, sessionDuration } = body;

    console.log('[Checkout API] Request:', { 
      flavors, 
      addOns, 
      tableId, 
      total, 
      amount,
      pricingModel 
    });

    // Validate required fields
    if (!flavors || !Array.isArray(flavors) || flavors.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'At least one flavor is required' 
        },
        { status: 400 }
      );
    }

    if (!amount && !total) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Amount is required' 
        },
        { status: 400 }
      );
    }

    // Use total if provided, otherwise use amount (convert to cents)
    const amountInCents = total ? Math.round(total * 100) : amount;

    // Validate amount is positive and valid
    if (isNaN(amountInCents) || amountInCents <= 0) {
      console.error('[Checkout API] Invalid amount:', { total, amount, amountInCents });
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid amount',
          details: `Amount must be a positive number. Received: total=${total}, amount=${amount}, cents=${amountInCents}`
        },
        { status: 400 }
      );
    }

    console.log('[Checkout API] Creating Stripe session with amount:', amountInCents);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hookah Session - ${flavors.join(' + ')}`,
              description: `Flavor mix: ${flavors.join(', ')}${addOns && addOns.length > 0 ? ` | Add-ons: ${addOns.join(', ')}` : ''}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/checkout/cancel`,
      metadata: {
        flavors: JSON.stringify(flavors),
        addOns: JSON.stringify(addOns || []),
        tableId: tableId || '',
        loungeId: loungeId || 'default-lounge',
        flavorMix: flavors.join(' + '),
        pricingModel: pricingModel || 'flat',
        sessionDuration: sessionDuration ? String(sessionDuration) : '',
      },
      customer_email: undefined, // Let Stripe collect email
      billing_address_collection: 'auto',
    });

    console.log('[Checkout API] Session created successfully:', session.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('[Checkout API] Error:', error);
    
    // Handle Stripe-specific errors
    if (error?.type === 'StripeCardError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Card error',
          details: error.message || 'Your card was declined',
        },
        { status: 400 }
      );
    }
    
    if (error?.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.message || 'Invalid Stripe request',
        },
        { status: 400 }
      );
    }
    
    // Handle Stripe API errors
    if (error?.code) {
      console.error('[Checkout API] Stripe error code:', error.code);
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe API error',
          details: error.message || `Stripe error: ${error.code}`,
          code: error.code,
        },
        { status: 500 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

