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
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { flavors, addOns, tableId, loungeId, amount, total } = body;

    // Validate required fields
    if (!flavors || !Array.isArray(flavors) || flavors.length === 0) {
      return NextResponse.json(
        { error: 'At least one flavor is required' },
        { status: 400 }
      );
    }

    if (!amount && !total) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    // Use total if provided, otherwise use amount (convert to cents)
    const amountInCents = total ? Math.round(total * 100) : amount;

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
      },
      customer_email: undefined, // Let Stripe collect email
      billing_address_collection: 'auto',
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Checkout API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

