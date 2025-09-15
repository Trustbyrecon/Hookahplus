import { NextRequest, NextResponse } from 'next/server';
import { fetchPriceByLookup, createCheckoutSession } from '@hookahplus/server/stripe';

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
      successUrl: `${process.env.NEXT_PUBLIC_GUEST_URL}/extend/success?sid=${sessionId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_GUEST_URL}/extend/cancel?sid=${sessionId}`,
    });

    return NextResponse.json({ url: checkout.url });
    
  } catch (error) {
    console.error('Extension checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
