import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, updates } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // In production, update session in database
    console.log(`[Session Update] Updating session ${sessionId} with:`, updates);

    // Mock updated session data
    const updatedSession = {
      sessionId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: 'Session updated successfully'
    });

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ 
      error: 'Failed to update session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId parameter' }, { status: 400 });
    }

    // In production, fetch session from database
    const sessionData = {
      sessionId,
      loungeId: 'lounge_001',
      tableId: 'T-001',
      guestId: 'guest_123',
      sessionType: 'standard',
      status: 'active',
      startTime: new Date(Date.now() - 300000).toISOString(),
      duration: 300,
      flavors: ['mint', 'grape'],
      orders: [
        { id: 'order_1', item: 'Mint Hookah', price: 15.00, timestamp: new Date().toISOString() }
      ],
      totalAmount: 15.00,
      createdAt: new Date(Date.now() - 300000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      session: sessionData
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
