import { NextRequest, NextResponse } from 'next/server';
import { createGhostLogEntry } from '../../ghost-log/route';

// Import sessions from the sessions route (in production, this would be a shared database)
let sessions: Array<{
  id: string;
  session_id: string;
  lounge_id: string;
  table_id?: string;
  flavor_mix: string[];
  status: 'pending_guest_arrival' | 'ready_to_start' | 'arrived' | 'active' | 'completed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body;

    // Validate required fields
    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Find the session
    let session = sessions.find(s => s.session_id === session_id);
    
    if (!session) {
      // Create a new session if it doesn't exist
      session = {
        id: `session_${Date.now()}`,
        session_id,
        lounge_id: 'L-TEST-001', // Default test lounge
        flavor_mix: [],
        status: 'arrived' as const,
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString()
      };
      sessions.push(session);
    } else {
      // Update existing session status
      session.status = 'arrived';
      session.started_at = new Date().toISOString();
    }

    // Log QR join event
    await createGhostLogEntry({
      kind: 'qr.session.joined',
      session_id,
      status: session.status,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      session,
      message: 'Session joined successfully'
    });

  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
