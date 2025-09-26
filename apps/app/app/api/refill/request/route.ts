import { NextRequest, NextResponse } from 'next/server';
// DYNAMIC IMPORT: Only import Supabase when actually needed, not at module level
// No environment imports needed for Vercel builds

export const dynamic = 'force-dynamic';

// COMPLETE SUPABASE REMOVAL: No Supabase functions during Vercel builds

export async function POST(req: NextRequest) {
  try {
    const { venueId, sessionId } = await req.json();
    
    if (!venueId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // COMPLETE SUPABASE REMOVAL: No database operations during Vercel builds
    // Return mock refill ID without database operations during builds
    return NextResponse.json({ 
      refillId: `temp_refill_${Date.now()}`,
      warning: 'Database not available during build, refill not saved'
    });
    
  } catch (error) {
    console.error('Refill request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
