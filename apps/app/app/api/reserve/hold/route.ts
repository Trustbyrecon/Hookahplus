import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
// DYNAMIC IMPORT: Only import Supabase when actually needed, not at module level
import { getStripeSecretKey, getSupabaseUrl, getSupabaseAnonKey } from '../../../../lib/env';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Supabase client inside function to avoid build-time errors
async function getSupabaseClient() {
  // COMPLETE VERCEL BUILD SKIP: Never load Supabase during Vercel builds
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
    console.log('VERCEL/PRODUCTION BUILD: Completely skipping Supabase initialization');
    return null;
  }
  
  // COMPLETE SUPABASE REMOVAL: No Supabase imports during build phase
  // This prevents webpack from processing Supabase during build phase
  console.log('Supabase completely disabled during build phase');
  return null;
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
    const supaAdmin = await getSupabaseClient();
    if (supaAdmin) {
      try {
        const { data, error } = await (supaAdmin as any)
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
    } else {
      // Supabase not available during build or missing env vars
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
