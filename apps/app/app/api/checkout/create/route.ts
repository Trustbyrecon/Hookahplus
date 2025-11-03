import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: Request) {
  try {
    const {
      sessionId,
      loungeId = 'demo-lounge-001',
      flavorMix = [],
      basePrice = 3000,
      addOns = [],
      notes = '',
      ref = ''
    } = await req.json();

    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://hookahplus.net';

    const line_items = [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Hookah Session' },
          unit_amount: basePrice
        },
        quantity: 1
      },
      ...addOns.map((a: { name: string; amount: number }) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: a.name },
          unit_amount: a.amount
        },
        quantity: 1
      }))
    ];

    const metadata = {
      hp_session_id: sessionId || `hp_${Date.now()}`,
      hp_lounge_id: loungeId,
      hp_flavor_mix: Array.isArray(flavorMix) ? flavorMix.join('|') : String(flavorMix || ''),
      hp_notes: notes,
      hp_ref: ref || ''
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata,
      success_url: `${base}/checkout/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancel`
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
