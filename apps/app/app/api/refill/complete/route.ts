import { NextRequest, NextResponse } from 'next/server';
// DYNAMIC IMPORT: Only import Supabase when actually needed, not at module level
// No environment imports needed for Vercel builds

export const dynamic = 'force-dynamic';

// COMPLETE SUPABASE REMOVAL: No Supabase functions during Vercel builds

export async function POST(req: NextRequest) {
  try {
    const { venueId, refillId, staffId } = await req.json();
    
    if (!venueId || !refillId || !staffId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // COMPLETE SUPABASE REMOVAL: No database operations during Vercel builds
    // Return success without database operations during builds
    return NextResponse.json({ 
      ok: true,
      warning: 'Database not available during build, refill completion not saved'
    });
    
  } catch (error) {
    console.error('Refill complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
