import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for sessions (in production, this would be a database)
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
  // Sample sessions for testing
  {
    id: 'session_001',
    session_id: 'T-001',
    lounge_id: 'fire-session-lounge',
    table_id: 'T-001',
    flavor_mix: ['Blue Mist', 'Mint'],
    status: 'active',
    state: 'ACTIVE',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
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
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
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
    created_at: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
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
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    started_at: new Date(Date.now() - 7200000).toISOString(),
    completed_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
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
    created_at: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
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
    created_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
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
      status: 'pending_guest_arrival',
      state: 'CREATED',
      created_at: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
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