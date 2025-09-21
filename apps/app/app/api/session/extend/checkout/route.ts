import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey } from '../../../../../lib/env';

const stripe = new Stripe(getStripeSecretKey(), { 
  apiVersion: '2023-10-16' 
});

async function fetchPriceByLookup(lookupKey: string) {
  const r = await stripe.prices.list({ 
    lookup_keys: [lookupKey], 
    expand: ['data.product'], 
    limit: 1 
  });
  if (!r.data[0]) throw new Error(`Price not found for ${lookupKey}`);
  return r.data[0];
}

async function createCheckoutSession({
  mode = 'payment',
  lineItems,
  metadata,
  successUrl,
  cancelUrl,
  customerEmail
}: {
  mode?: 'payment' | 'subscription';
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  return await stripe.checkout.sessions.create({
    mode,
    line_items: lineItems,
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { venueId, sessionId, priceLookupKey } = await req.json();
    
    if (!venueId || !sessionId || !priceLookupKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const price = await fetchPriceByLookup(priceLookupKey);
    const extendMinutes = Number(price.metadata['hp:duration_minutes'] || 20);

    const checkout = await createCheckoutSession({
      lineItems: [{ price: price.id, quantity: 1 }],
      metadata: { 
        venue_id: venueId, 
        session_id: sessionId, 
        extend_minutes: extendMinutes.toString()
      },
      successUrl: `${process.env.NEXT_PUBLIC_GUEST_URL}/extend/success?sid=${sessionId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_GUEST_URL}/extend/cancel?sid=${sessionId}`,
    });

    return NextResponse.json({ url: checkout.url });
    
  } catch (error) {
    console.error('Extension checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
