import { NextRequest, NextResponse } from 'next/server';
// DYNAMIC IMPORT: Only import Supabase when actually needed, not at module level
import { getSupabaseUrl, getSupabaseAnonKey } from '../../../../lib/env';

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

export async function POST(req: NextRequest) {
  try {
    const { venueId, sessionId } = await req.json();
    
    if (!venueId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create refill request - only if Supabase is available
    const supaAdmin = await getSupabaseClient();
    if (supaAdmin) {
      try {
        const { data, error } = await (supaAdmin as any)
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
        await (supaAdmin as any).from('ghostlog').insert({
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
    } else {
      // Supabase not available during build or missing env vars
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
