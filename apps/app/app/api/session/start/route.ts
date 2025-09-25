import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { getStripeSecretKey, getSupabaseUrl, getSupabaseAnonKey, getAppUrl } from '../../../../lib/env';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Supabase client inside function to avoid build-time errors
function getSupabaseClient() {
  const SUPABASE_URL = getSupabaseUrl();
  const SUPABASE_ANON_KEY = getSupabaseAnonKey();
  
  // Validate URL format
  if (!SUPABASE_URL.startsWith('http://') && !SUPABASE_URL.startsWith('https://')) {
    throw new Error(`Invalid Supabase URL: ${SUPABASE_URL}. Must be a valid HTTP or HTTPS URL.`);
  }
  
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
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
    const { venueId, tableId, tier, flavors = [], priceLookupKey } = await req.json();
    
    if (!venueId || !tableId || !tier || !priceLookupKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const price = await fetchPriceByLookup(priceLookupKey);
    const duration = Number(price.metadata['hp:duration_minutes'] || 90);

    // Create session record
    const supaAdmin = getSupabaseClient();
    const { data: session, error } = await supaAdmin
      .from('sessions')
      .insert({
        venue_id: venueId, 
        table_id: tableId, 
        tier, 
        flavors,
        status: 'PENDING', 
        price_lookup_key: priceLookupKey
      })
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

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

    // Log the event
    await supaAdmin.from('ghostlog').insert({
      venue_id: venueId, 
      session_id: session.id, 
      actor: 'system',
      event: 'SESSION_INITIATED', 
      meta: { tier, priceLookupKey, flavors, duration }
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
