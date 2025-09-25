import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '../../../../lib/env';

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

export async function POST(req: NextRequest) {
  try {
    const { venueId, sessionId } = await req.json();
    
    if (!venueId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create refill request - only if Supabase is available
    try {
      const supaAdmin = getSupabaseClient();
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
    } catch (supabaseError) {
      // If Supabase is not available, return a mock response
      console.warn('Supabase not available, returning mock refill ID:', supabaseError);
      return NextResponse.json({ 
        refillId: `temp_refill_${Date.now()}`,
        warning: 'Database not available, refill not saved'
      });
    }
    
  } catch (error) {
    console.error('Refill request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
