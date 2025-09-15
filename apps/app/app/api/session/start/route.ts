import { NextRequest, NextResponse } from 'next/server';
import { fetchPriceByLookup, createCheckoutSession } from '@hookahplus/server/stripe';
import { supaAdmin } from '@hookahplus/server/supabase';

export async function POST(req: NextRequest) {
  try {
    const { venueId, tableId, tier, flavors = [], priceLookupKey } = await req.json();
    
    if (!venueId || !tableId || !tier || !priceLookupKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const price = await fetchPriceByLookup(priceLookupKey);
    const duration = Number(price.metadata['hp:duration_minutes'] || 90);

    // Create session record
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
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sessions/${session.id}?paid=1`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sessions/${session.id}?cancel=1`,
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
