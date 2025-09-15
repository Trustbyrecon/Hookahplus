import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supaAdmin = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_ANON_KEY!, 
  {
    auth: { persistSession: false }
  }
);

export async function POST(req: NextRequest) {
  try {
    const { venueId, refillId, staffId } = await req.json();
    
    if (!venueId || !refillId || !staffId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supaAdmin
      .from('refills')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', refillId)
      .eq('venue_id', venueId);
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to complete refill' }, { status: 500 });
    }

    // Log the event
    await supaAdmin.from('ghostlog').insert({
      venue_id: venueId, 
      event: 'REFILL_COMPLETED', 
      actor: `staff_${staffId}`, 
      meta: { refillId }
    });

    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Refill complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
