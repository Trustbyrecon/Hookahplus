import { NextRequest, NextResponse } from 'next/server';

// Import sessions from the main route (in production, this would be a shared database)
// For now, we'll recreate the sessions array to match the main route
let sessions: Array<{
  id: string;
  session_id: string;
  lounge_id: string;
  table_id?: string;
  flavor_mix: string[];
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  customer_name?: string;
  customer_phone?: string;
  session_type?: string;
  amount?: number;
  pricing_model?: string;
  timer_duration?: number;
  boh_staff?: string;
  foh_staff?: string;
  notes?: string;
  flavor_mix_price?: number;
  base_price?: number;
  state?: string;
  lastUpdated?: string;
}> = [
  // Sample sessions for testing (same as main route)
  {
    id: 'session_001',
    session_id: 'T-001',
    lounge_id: 'fire-session-lounge',
    table_id: 'T-001',
    flavor_mix: ['Blue Mist', 'Mint'],
    status: 'active',
    state: 'ACTIVE',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    started_at: new Date(Date.now() - 3600000).toISOString(),
    lastUpdated: new Date().toISOString(),
    customer_name: 'Alex Johnson',
    customer_phone: '+1 (555) 123-4567',
    session_type: 'walk-in',
    amount: 35,
    pricing_model: 'time-based',
    timer_duration: 60,
    boh_staff: 'Mike Rodriguez',
    foh_staff: 'Sarah Chen',
    notes: 'Customer prefers mild flavors',
    flavor_mix_price: 5,
    base_price: 30
  },
  {
    id: 'session_002',
    session_id: 'T-003',
    lounge_id: 'fire-session-lounge',
    table_id: 'T-003',
    flavor_mix: ['Strawberry', 'Mint', 'Lime'],
    status: 'prep_in_progress',
    state: 'PREP_IN_PROGRESS',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    lastUpdated: new Date().toISOString(),
    customer_name: 'Maria Garcia',
    customer_phone: '+1 (555) 234-5678',
    session_type: 'walk-in',
    amount: 28,
    pricing_model: 'flat',
    timer_duration: 60,
    boh_staff: 'David Wilson',
    foh_staff: 'Emily Davis',
    notes: 'First-time customer, prefers mild flavors, table near window',
    flavor_mix_price: 3,
    base_price: 25
  },
  {
    id: 'session_003',
    session_id: 'T-005',
    lounge_id: 'fire-session-lounge',
    table_id: 'T-005',
    flavor_mix: ['Double Apple', 'Cardamom'],
    status: 'ready_for_delivery',
    state: 'READY_FOR_DELIVERY',
    created_at: new Date(Date.now() - 900000).toISOString(),
    lastUpdated: new Date().toISOString(),
    customer_name: 'Ahmed Hassan',
    customer_phone: '+1 (555) 345-6789',
    session_type: 'walk-in',
    amount: 42,
    pricing_model: 'time-based',
    timer_duration: 90,
    boh_staff: 'Mike Rodriguez',
    foh_staff: 'James Brown',
    notes: 'Regular customer, prefers strong flavors',
    flavor_mix_price: 7,
    base_price: 35
  },
  {
    id: 'session_004',
    session_id: 'T-007',
    lounge_id: 'fire-session-lounge',
    table_id: 'T-007',
    flavor_mix: ['Watermelon', 'Mint'],
    status: 'completed',
    state: 'COMPLETED',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    started_at: new Date(Date.now() - 7200000).toISOString(),
    completed_at: new Date(Date.now() - 3600000).toISOString(),
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    customer_name: 'Jennifer Lee',
    customer_phone: '+1 (555) 456-7890',
    session_type: 'walk-in',
    amount: 32,
    pricing_model: 'flat',
    timer_duration: 60,
    boh_staff: 'David Wilson',
    foh_staff: 'Sarah Chen',
    notes: 'Completed session successfully',
    flavor_mix_price: 2,
    base_price: 30
  },
  {
    id: 'session_005',
    session_id: 'T-009',
    lounge_id: 'fire-session-lounge',
    table_id: 'T-009',
    flavor_mix: ['Rose', 'Lavender'],
    status: 'paused',
    state: 'PAUSED',
    created_at: new Date(Date.now() - 2700000).toISOString(),
    started_at: new Date(Date.now() - 2700000).toISOString(),
    lastUpdated: new Date().toISOString(),
    customer_name: 'Robert Kim',
    customer_phone: '+1 (555) 567-8901',
    session_type: 'walk-in',
    amount: 45,
    pricing_model: 'time-based',
    timer_duration: 90,
    boh_staff: 'Mike Rodriguez',
    foh_staff: 'Emily Davis',
    notes: 'Customer stepped out for phone call, will return in 10 minutes',
    flavor_mix_price: 10,
    base_price: 35
  },
  {
    id: 'session_006',
    session_id: 'T-011',
    lounge_id: 'fire-session-lounge',
    table_id: 'T-011',
    flavor_mix: ['Double Apple'],
    status: 'payment_failed',
    state: 'PAYMENT_FAILED',
    created_at: new Date(Date.now() - 600000).toISOString(),
    lastUpdated: new Date().toISOString(),
    customer_name: 'Lisa Wang',
    customer_phone: '+1 (555) 678-9012',
    session_type: 'walk-in',
    amount: 0,
    pricing_model: 'flat',
    timer_duration: 60,
    boh_staff: 'David Wilson',
    foh_staff: 'James Brown',
    notes: 'Payment declined - card expired, customer needs to update payment method',
    flavor_mix_price: 0,
    base_price: 25
  }
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { 
      newState, 
      operatorId, 
      workflow,
      businessLogic,
      timestamp 
    } = body;

    const { id: sessionId } = await params;

    // Find the session
    const sessionIndex = sessions.findIndex(s => s.session_id === sessionId || s.id === sessionId);
    
    if (sessionIndex === -1) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[sessionIndex];

    // Update session state
    const updatedSession = {
      ...session,
      state: newState,
      status: newState.toLowerCase().replace(/_/g, ' '),
      lastUpdated: timestamp || new Date().toISOString()
    };

    // Update the session in the array
    sessions[sessionIndex] = updatedSession;

    console.log(`Session ${sessionId} transitioned from ${session.state} to ${newState}`);

    return NextResponse.json({ 
      success: true, 
      session: updatedSession,
      message: `Session ${sessionId} transitioned to ${newState}`,
      transition: {
        from: session.state,
        to: newState,
        operatorId,
        workflow,
        businessLogic,
        timestamp: updatedSession.lastUpdated
      }
    });

  } catch (error) {
    console.error('Error transitioning session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Find the session
    const session = sessions.find(s => s.session_id === sessionId || s.id === sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      session 
    });

  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}