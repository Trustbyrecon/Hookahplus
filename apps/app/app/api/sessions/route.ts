import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for sessions (in production, this would be a database)
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || searchParams.get('id');

    if (sessionId) {
      const session = sessions.find(s => s.session_id === sessionId || s.id === sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, session });
    }

    // Return all sessions if no sessionId specified
    return NextResponse.json({ success: true, sessions });

  } catch (error) {
    console.error('Error retrieving sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      session_id, 
      lounge_id, 
      table_id, 
      flavor_mix,
      customer_name,
      customer_phone,
      session_type,
      amount,
      pricing_model,
      timer_duration,
      boh_staff,
      foh_staff,
      notes,
      flavor_mix_price,
      base_price
    } = body;

    // Generate session_id if not provided
    const finalSessionId = session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Validate required fields
    if (!finalSessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Check if session already exists
    const existingSession = sessions.find(s => s.session_id === finalSessionId);
    if (existingSession) {
      return NextResponse.json({ 
        session: existingSession,
        message: 'Session already exists'
      });
    }

    // Create new session
    const session = {
      id: `session_${Date.now()}`,
      session_id: finalSessionId,
      lounge_id: lounge_id || 'fire-session-lounge',
      table_id: table_id || 'table-001',
      flavor_mix: flavor_mix || [],
      status: 'pending_guest_arrival' as const,
      created_at: new Date().toISOString(),
      // Additional fields
      customer_name: customer_name || 'Guest Customer',
      customer_phone: customer_phone || '+1234567890',
      session_type: session_type || 'walk-in',
      amount: amount || 30,
      pricing_model: pricing_model || 'flat',
      timer_duration: timer_duration || 60,
      boh_staff: boh_staff || '',
      foh_staff: foh_staff || '',
      notes: notes || '',
      flavor_mix_price: flavor_mix_price || 0,
      base_price: base_price || 30
    };

    sessions.push(session);

    return NextResponse.json({ 
      success: true, 
      session,
      message: 'Session created successfully'
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}