import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * POST /api/checkout-session
 * Creates Stripe Checkout Session or PaymentIntent for guest build
 * Supports both payment models:
 * - Independent operator (80%): Verified payment before services
 * - Internal lounge: Payment hold at start, settle at end
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('[Guest Checkout] ❌ STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing',
          hint: 'Add STRIPE_SECRET_KEY=sk_test_... to apps/guest/.env.local and restart the dev server',
          setupUrl: 'https://dashboard.stripe.com/apikeys',
          isConfigurationError: true
        },
        { status: 503 } // Service Unavailable - more appropriate than 500 for missing config
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil' as any,
    });

    const body = await request.json();
    const { 
      sessionId, 
      amount, 
      loungeId,
      paymentModel = 'independent' // 'independent' or 'internal'
    } = body;

    // SECURITY: sessionId is required - we only send opaque IDs to Stripe
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session ID required',
          details: 'sessionId must be provided to link payment to session'
        },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount',
          details: 'Amount must be greater than 0'
        },
        { status: 400 }
      );
    }

    // Amount is already in cents from guest build (subtotal is in cents)
    // Only multiply by 100 if amount is less than 100 (likely in dollars)
    const amountInCents = amount < 100 ? Math.round(amount * 100) : Math.round(amount);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const guestUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

    // Determine payment model: independent (80%) requires verified payment, internal uses hold
    const isIndependentOperator = paymentModel === 'independent';
    
    if (isIndependentOperator) {
      // Independent operator: Require verified payment before services
      // Create Stripe Checkout Session with immediate capture
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Hookah Session',
                description: `Session ${sessionId.substring(0, 8)}`
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${guestUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&app_session=${sessionId}&loungeId=${loungeId || 'default-lounge'}`,
        cancel_url: `${guestUrl}/?canceled=true`,
        // SECURITY: Only send opaque session ID to Stripe
        metadata: {
          h_session: sessionId,
          h_order: `H+ ${sessionId.substring(0, 8)}`,
          lounge_id: loungeId || 'default-lounge'
        },
        payment_intent_data: {
          description: `Hookah Plus Session ${sessionId.substring(0, 8)}`,
          metadata: {
            h_session: sessionId,
          },
        },
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      });

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
        paymentModel: 'independent',
        mode: 'payment'
      });
    } else {
      // Internal lounge: Payment hold at start, settle at end
      // Create PaymentIntent with manual capture (authorize only)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        capture_method: 'manual', // Authorize only, settle later
        description: `Hookah Plus Session ${sessionId.substring(0, 8)}`,
        // SECURITY: Only send opaque session ID to Stripe
        metadata: {
          h_session: sessionId,
          h_order: `H+ ${sessionId.substring(0, 8)}`,
          lounge_id: loungeId || 'default-lounge',
          payment_model: 'internal_hold'
        },
        // Store payment intent ID in session for later settlement
        statement_descriptor: 'Hookah+ Session',
      });

      // For internal lounge, we can route immediately after hold is placed
      // Payment will be settled at session end
      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        paymentModel: 'internal',
        mode: 'hold',
        amount: amountInCents,
        message: 'Payment hold created. Session can proceed. Payment will be settled at session end.'
      });
    }

  } catch (error: any) {
    console.error('[Guest Checkout] Error:', error);
    
    // Check if error is due to missing Stripe configuration
    if (error?.message?.includes('STRIPE_SECRET_KEY') || error?.message?.includes('Stripe not configured')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing. Please configure Stripe in your environment variables.',
          hint: 'Add STRIPE_SECRET_KEY=sk_test_... to your .env.local file'
        },
        { status: 500 }
      );
    }
    
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
          details: error.message || 'Invalid payment request',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

