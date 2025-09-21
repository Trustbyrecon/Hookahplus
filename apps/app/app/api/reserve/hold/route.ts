import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getStripeSecretKey, getSupabaseUrl, getSupabaseAnonKey } from '../../../../lib/env';

const stripe = new Stripe(getStripeSecretKey(), { 
  apiVersion: '2023-10-16' 
});

const supaAdmin = createClient(
  getSupabaseUrl(), 
  getSupabaseAnonKey(), 
  {
    auth: { persistSession: false }
  }
);

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

    // Create reservation record
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
    
  } catch (error) {
    console.error('Reservation hold error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
