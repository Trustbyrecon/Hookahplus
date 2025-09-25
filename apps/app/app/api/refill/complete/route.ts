import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '../../../../lib/env';

export const dynamic = 'force-dynamic';

// Initialize Supabase client inside function to avoid build-time errors
function getSupabaseClient() {
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

export async function POST(req: NextRequest) {
  try {
    const { venueId, refillId, staffId } = await req.json();
    
    if (!venueId || !refillId || !staffId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supaAdmin = getSupabaseClient();
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
