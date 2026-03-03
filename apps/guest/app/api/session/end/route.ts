import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, reason = 'completed', finalAmount } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // In production, end session in database
    console.log(`[Session End] Ending session ${sessionId} with reason: ${reason}`);

    const endedSession = {
      sessionId,
      status: 'ended',
      endTime: new Date().toISOString(),
      reason,
      finalAmount: finalAmount || 0,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      session: endedSession,
      message: 'Session ended successfully'
    });

  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ 
      error: 'Failed to end session',
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

    // In production, fetch ended session from database
    const sessionData = {
      sessionId,
      loungeId: 'lounge_001',
      tableId: 'T-001',
      guestId: 'guest_123',
      sessionType: 'standard',
      status: 'ended',
      startTime: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      endTime: new Date().toISOString(),
      duration: 1800,
      flavors: ['mint', 'grape'],
      orders: [
        { id: 'order_1', item: 'Mint Hookah', price: 15.00, timestamp: new Date(Date.now() - 1800000).toISOString() }
      ],
      totalAmount: 15.00,
      reason: 'completed',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      session: sessionData
    });

  } catch (error) {
    console.error('Error fetching ended session:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
