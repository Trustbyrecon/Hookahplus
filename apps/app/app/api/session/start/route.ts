import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { getStripeSecretKey, getSupabaseUrl, getSupabaseAnonKey, getAppUrl } from '../../../../lib/env';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Supabase client inside function to avoid build-time errors
function getSupabaseClient() {
  // Skip Supabase initialization during build time
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' && !process.env.SUPABASE_URL) {
    return null; // Return null instead of throwing during build
  }
  
  try {
    const SUPABASE_URL = getSupabaseUrl();
    const SUPABASE_ANON_KEY = getSupabaseAnonKey();
    
    // Check for placeholder values that indicate missing environment variables
    if (SUPABASE_URL === 'https://placeholder.supabase.co' || 
        SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder') {
      return null; // Return null for placeholder values
    }
    
    // Validate URL format
    if (!SUPABASE_URL.startsWith('http://') && !SUPABASE_URL.startsWith('https://')) {
      throw new Error(`Invalid Supabase URL: ${SUPABASE_URL}. Must be a valid HTTP or HTTPS URL.`);
    }
    
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  } catch (error) {
    // During build time, environment variables might not be available
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
      return null; // Return null instead of throwing during build
    }
    throw error;
  }
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

    // Create session record - only if Supabase is available
    let session = null;
    const supaAdmin = getSupabaseClient();
    if (supaAdmin) {
      try {
        const { data, error } = await supaAdmin
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
        session = data;
        
        // Log the event
        await supaAdmin.from('ghostlog').insert({
          venue_id: venueId, 
          session_id: session.id, 
          actor: 'system',
          event: 'SESSION_INITIATED', 
          meta: { tier, priceLookupKey, flavors, duration }
        });
      } catch (supabaseError) {
        // If Supabase is not available, continue without database record
        console.warn('Supabase not available, continuing without database record:', supabaseError);
        session = { id: `temp_${Date.now()}` }; // Create a temporary session ID
      }
    } else {
      // Supabase not available during build or missing env vars
      session = { id: `temp_${Date.now()}` }; // Create a temporary session ID
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
