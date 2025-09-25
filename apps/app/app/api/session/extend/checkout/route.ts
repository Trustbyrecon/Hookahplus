import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../../lib/stripe';
import { getStripeSecretKey, getGuestUrl } from '../../../../../lib/env';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// NUCLEAR BUILD GUARD: Completely prevent any Supabase-related execution during Vercel builds
if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
  console.log('VERCEL BUILD DETECTED: Skipping any Supabase-related code execution');
}

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
      successUrl: `${getGuestUrl()}/extend/success?sid=${sessionId}`,
      cancelUrl: `${getGuestUrl()}/extend/cancel?sid=${sessionId}`,
    });

    return NextResponse.json({ url: checkout.url });
    
  } catch (error) {
    console.error('Extension checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
