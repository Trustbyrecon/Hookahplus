import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, flavor, amount, duration, customerName, customerNotes, source, orderType } = body;

    // Validate required fields
    if (!tableId || !flavor || !amount || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a new fire session
    const session = {
      id: `session_${Date.now()}`,
      table: tableId,
      customerLabel: customerName,
      durationMin: parseInt(duration) || 30,
      bufferSec: 10,
      zone: 'A', // Default zone
      items: 1,
      etaMin: 5,
      position: 'Table',
      state: 'READY' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      flavor: flavor,
      addOns: [],
      currentAmount: amount,
      assignedStaff: undefined,
      sessionStartTime: undefined,
      bohState: 'WARMING_UP' as const,
      sessionTimer: 0,
      source: source || 'unknown',
      orderType: orderType || 'unknown',
      customerNotes: customerNotes || ''
    };

    // In a real application, you would save this to a database
    // For now, we'll just return the session data
    console.log('New fire session created:', session);

    return NextResponse.json({
      id: session.id,
      message: 'Fire session created successfully',
      session: session
    });

  } catch (error) {
    console.error('Error creating fire session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
