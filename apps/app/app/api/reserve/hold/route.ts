import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { getStripeSecretKey, getSupabaseUrl, getSupabaseAnonKey } from '../../../../lib/env';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Supabase client inside function to avoid build-time errors
function getSupabaseClient() {
  // Skip Supabase initialization during build time
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' && !process.env.SUPABASE_URL) {
    throw new Error('Supabase client cannot be initialized during Vercel build without environment variables');
  }
  
  try {
    const SUPABASE_URL = getSupabaseUrl();
    const SUPABASE_ANON_KEY = getSupabaseAnonKey();
    
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
      throw new Error('Supabase client cannot be initialized during Vercel build without environment variables');
    }
    throw error;
  }
}

async function createPaymentIntent({
  amount,
  currency = 'usd',
  captureMethod = 'automatic',
  metadata
}: {
  amount: number;
  currency?: string;
  captureMethod?: 'automatic' | 'manual';
  metadata: Record<string, string>;
}) {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    capture_method: captureMethod,
    metadata
  });
}

export async function POST(req: NextRequest) {
  try {
    const { venueId, tableId } = await req.json();
    
    if (!venueId || !tableId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create payment intent with manual capture
    const pi = await createPaymentIntent({
      amount: 1000, // $10.00
      currency: 'usd', 
      captureMethod: 'manual',
      metadata: { 
        venue_id: venueId, 
        table_id: tableId, 
        type: 'reservation_hold' 
      }
    });

    // Create reservation record - only if Supabase is available
    try {
      const supaAdmin = getSupabaseClient();
      const { data, error } = await supaAdmin
        .from('reservations')
        .insert({
          venue_id: venueId, 
          table_id: tableId, 
          payment_intent_id: pi.id, 
          status: 'HOLD'
        })
        .select()
        .single();
        
      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
      }

      return NextResponse.json({ 
        reservationId: data.id, 
        clientSecret: pi.client_secret 
      });
    } catch (supabaseError) {
      // If Supabase is not available, return payment intent only
      console.warn('Supabase not available, returning payment intent only:', supabaseError);
      return NextResponse.json({ 
        paymentIntentId: pi.id,
        clientSecret: pi.client_secret,
        warning: 'Database not available, reservation not saved'
      });
    }
    
  } catch (error) {
    console.error('Reservation hold error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
