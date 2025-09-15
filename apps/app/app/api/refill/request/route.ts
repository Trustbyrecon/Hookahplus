import { NextRequest, NextResponse } from 'next/server';
import { supaAdmin } from '@hookahplus/server/supabase';

export async function POST(req: NextRequest) {
  try {
    const { venueId, sessionId } = await req.json();
    
    if (!venueId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supaAdmin
      .from('refills')
      .insert({ 
        venue_id: venueId, 
        session_id: sessionId 
      })
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create refill request' }, { status: 500 });
    }

    // Log the event
    await supaAdmin.from('ghostlog').insert({
      venue_id: venueId, 
      session_id: sessionId, 
      actor: 'guest', 
      event: 'REFILL_REQUESTED', 
      meta: { refillId: data.id }
    });

    return NextResponse.json({ refillId: data.id });
    
  } catch (error) {
    console.error('Refill request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
