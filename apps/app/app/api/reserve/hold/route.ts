import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@hookahplus/server/stripe';
import { supaAdmin } from '@hookahplus/server/supabase';

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
