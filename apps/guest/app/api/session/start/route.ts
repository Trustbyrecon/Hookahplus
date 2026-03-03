import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      loungeId,
      tableId,
      guestId,
      customerName,
      sessionType = 'standard',
      flavorMix = [],
      notMe = false,
    } = body;

    // Validate required fields
    if (!loungeId || !tableId) {
      return NextResponse.json({ error: 'Missing loungeId or tableId' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const resolveResp = await fetch(`${appUrl}/api/session/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loungeId,
        tableId,
        identityToken: guestId || `guest-${Date.now()}`,
        displayName: customerName || 'Guest',
        notMe: Boolean(notMe),
      }),
    });

    const resolveData = await resolveResp.json().catch(() => ({}));
    if (!resolveResp.ok || resolveData?.blocked) {
      return NextResponse.json({
        success: false,
        blocked: true,
        message: resolveData?.message || 'We need staff to confirm your table before continuing.',
        conflictSessionIds: resolveData?.conflictSessionIds || [],
      }, { status: 409 });
    }

    const sessionId = resolveData.session_id as string;
    const participantId = resolveData.participant_id as string;
    const mode = resolveData.mode as string;

    let appSession: any = null;
    try {
      const appSessionResponse = await fetch(`${appUrl}/api/sessions/${sessionId}`);
      appSession = await appSessionResponse.json().catch(() => null);
    } catch {
      appSession = null;
    }

    return NextResponse.json({
      success: true,
      synced: true,
      message: mode === 'create'
        ? 'Session created and joined successfully'
        : 'Joined active table session successfully',
      session: {
        sessionId,
        loungeId,
        tableId,
        guestId: guestId || null,
        participantId,
        mode,
        sessionType,
        flavors: flavorMix || [],
        appSession,
      },
    });

  } catch (error) {
    console.error('[Session Start] Error starting session:', error);
    return NextResponse.json({ 
      error: 'Failed to start session',
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

    // In production, fetch from database
    // For now, return mock data
    const sessionData = {
      sessionId,
      loungeId: 'lounge_001',
      tableId: 'T-001',
      guestId: 'guest_123',
      sessionType: 'standard',
      status: 'active',
      startTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
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