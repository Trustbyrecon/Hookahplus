import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// COMPLETE SUPABASE REMOVAL: No Supabase functions during Vercel builds

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

    // COMPLETE SUPABASE REMOVAL: No database operations during Vercel builds
    // Return payment intent only during builds
    return NextResponse.json({ 
      paymentIntentId: pi.id,
      clientSecret: pi.client_secret,
      warning: 'Database not available during build, reservation not saved'
    });
    
  } catch (error) {
    console.error('Reservation hold error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
