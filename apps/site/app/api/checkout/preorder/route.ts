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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hookah+ ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan - Pre-Order`,
              description: `Pre-order for Hookah+ ${tier} plan. You'll be charged when Hookah+ launches.`,
            },
            unit_amount: amount,
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
          test_mode: 'true',
          preorder: 'true',
        },
      },
    });

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

