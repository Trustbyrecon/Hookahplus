import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '../../../../lib/stripeServer';

/**
 * POST /api/checkout/preorder
 * 
 * Creates a Stripe Checkout Session for pre-orders
 * Test mode by default - uses Stripe test keys
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, tier, amount, metadata } = body;

    if (!email || !name || !tier || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, tier, amount' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Use $1 test amount for sandbox mode
    const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || 
                       process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true';
    const testAmount = 100; // $1.00 in cents for test mode
    
    console.log(`[Pre-Order Checkout] Mode: ${isTestMode ? 'TEST (Sandbox)' : 'LIVE'}`);
    console.log(`[Pre-Order Checkout] Amount: $${isTestMode ? testAmount / 100 : amount / 100}`);

    // Create Stripe Checkout Session
    // customer_email is optional in Stripe API - only include if email is provided
    const sessionParams: any = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hookah+ ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan - Pre-Order${isTestMode ? ' (Test Mode)' : ''}`,
              description: isTestMode 
                ? `TEST MODE: Pre-order for Hookah+ ${tier} plan. $1 test charge. You'll be charged when Hookah+ launches.`
                : `Pre-order for Hookah+ ${tier} plan. You'll be charged when Hookah+ launches.`,
            },
            unit_amount: isTestMode ? testAmount : amount, // Use $1 for test mode
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        ...metadata,
        customer_name: name,
        tier: tier,
        preorder: 'true',
      },
      success_url: `${siteUrl}/thank-you/preorder?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/owners?canceled=true`,
      // Test mode indicator
      payment_intent_data: {
        metadata: {
          test_mode: isTestMode ? 'true' : 'false',
          preorder: 'true',
          original_amount: amount.toString(),
          test_amount: isTestMode ? testAmount.toString() : undefined,
        },
      },
    };
    
    // Only add customer_email if email is provided and is a valid string
    if (email && typeof email === 'string' && email.trim().length > 0) {
      sessionParams.customer_email = email.trim();
    }
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Pre-Order Checkout] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

