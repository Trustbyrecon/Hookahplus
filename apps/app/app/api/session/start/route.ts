import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '../../../../lib/stripeServer';
// DYNAMIC IMPORT: Only import Supabase when actually needed, not at module level
import { getStripeSecretKey, getAppUrl } from '../../../../lib/env';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// COMPLETE SUPABASE REMOVAL: No Supabase functions during Vercel builds

async function fetchPriceByLookup(lookupKey: string) {
  const stripe = getStripe();
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
  const stripe = getStripe();
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
    const { venueId, tableId, tier, flavors = [], priceLookupKey } = await req.json();
    
    if (!venueId || !tableId || !tier || !priceLookupKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const price = await fetchPriceByLookup(priceLookupKey);
    const duration = Number(price.metadata['hp:duration_minutes'] || 90);

    // COMPLETE SUPABASE REMOVAL: No database operations during Vercel builds
    // Create a temporary session ID for checkout without database operations during builds
    let session = { id: `temp_${Date.now()}` };

    // Create checkout session
    const checkout = await createCheckoutSession({
      lineItems: [{ price: price.id, quantity: 1 }],
      metadata: { 
        venue_id: venueId, 
        session_id: session.id, 
        table_id: tableId,
        duration_minutes: duration.toString()
      },
      successUrl: `${getAppUrl()}/sessions/${session.id}?paid=1`,
      cancelUrl: `${getAppUrl()}/sessions/${session.id}?cancel=1`,
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      checkoutUrl: checkout.url, 
      duration 
    });
    
  } catch (error) {
    console.error('Session start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
