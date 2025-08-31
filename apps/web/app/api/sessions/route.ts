import { NextRequest, NextResponse } from 'next/server';

// Mock database for demo purposes
let sessions = [
  {
    id: 'session-1',
    tableId: 'T-001',
    flavor: 'Blue Mist + Mint',
    amount: 3000,
    status: 'active',
    createdAt: Date.now() - 3600000,
    sessionStartTime: Date.now() - 3600000,
    sessionDuration: 3600000,
    coalStatus: 'needs_refill',
    customerName: 'Alex Johnson',
    tableType: 'table',
    deliveryStatus: 'delivered',
    totalRevenue: 3000
  },
  {
    id: 'session-2',
    tableId: 'T-003',
    flavor: 'Double Apple',
    amount: 3200,
    status: 'active',
    createdAt: Date.now() - 1800000,
    sessionStartTime: Date.now() - 1800000,
    sessionDuration: 1800000,
    coalStatus: 'active',
    customerName: 'Sarah Chen',
    tableType: 'booth',
    deliveryStatus: 'delivered',
    totalRevenue: 3200
  }
];

export async function GET() {
  try {
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, flavor, amount, customerName } = body;

    // Validate required fields
    if (!tableId || !flavor || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, flavor, amount' },
        { status: 400 }
      );
    }

    // Create new session
    const newSession = {
      id: `session-${Date.now()}`,
      tableId,
      flavor,
      amount,
      status: 'active',
      createdAt: Date.now(),
      sessionStartTime: Date.now(),
      sessionDuration: 0,
      coalStatus: 'active',
      customerName: customerName || 'Anonymous',
      tableType: tableId.startsWith('Bar') ? 'bar' : 'table',
      deliveryStatus: 'preparing',
      totalRevenue: amount
    };

    sessions.push(newSession);

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: id, updates' },
        { status: 400 }
      );
    }

    const sessionIndex = sessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session
    sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };

    return NextResponse.json(sessions[sessionIndex]);
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    const sessionIndex = sessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Remove session
    const deletedSession = sessions.splice(sessionIndex, 1)[0];

    return NextResponse.json({ message: 'Session deleted', session: deletedSession });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
