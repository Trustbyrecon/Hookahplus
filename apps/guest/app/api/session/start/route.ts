import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      loungeId, 
      tableId, 
      guestId, 
      sessionType = 'standard',
      items = [],
      totalAmount = 0,
      customerName,
      customerPhone,
      flavorMix = []
    } = body;

    // Validate required fields
    if (!loungeId) {
      return NextResponse.json({ error: 'Missing loungeId' }, { status: 400 });
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create session data for guest response
    const sessionData = {
      sessionId,
      loungeId,
      tableId: tableId || 'T-001',
      guestId: guestId || `guest_${Date.now()}`,
      sessionType,
      status: 'active',
      startTime: new Date().toISOString(),
      duration: 0,
      flavors: flavorMix || [],
      orders: items || [],
      totalAmount: totalAmount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`[Session Start] Creating session ${sessionId} for lounge ${loungeId}`);

    // Connect to app build's database via API
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      console.log(`[Session Start] Connecting to app build at: ${appUrl}`);

      // Map guest session data to app session format
      const appSessionPayload = {
        tableId: tableId || 'T-001',
        customerName: customerName || guestId || `Guest ${Date.now()}`,
        customerPhone: customerPhone || undefined,
        flavor: Array.isArray(flavorMix) && flavorMix.length > 0 
          ? flavorMix.join(' + ') 
          : (typeof flavorMix === 'string' ? flavorMix : 'Custom Mix'),
        amount: totalAmount > 0 ? Math.round(totalAmount * 100) : 3000, // Convert to cents, default $30
        source: sessionType === 'reservation' ? 'RESERVE' : 
                sessionType === 'vip' ? 'VIP' : 'WALK_IN',
        loungeId: loungeId,
        externalRef: `guest-${sessionId}`,
        sessionDuration: 45 * 60, // Default 45 minutes
        notes: `Guest session started from guest build`
      };

      console.log(`[Session Start] Sending to app build API:`, JSON.stringify(appSessionPayload, null, 2));

      const appResponse = await fetch(`${appUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appSessionPayload),
      });

      if (appResponse.ok) {
        const appResult = await appResponse.json();
        console.log(`[Session Start] Successfully created session in app build database:`, appResult.session?.id);
        
        // Merge app session data with guest session data
        return NextResponse.json({
          success: true,
          session: {
            ...sessionData,
            appSessionId: appResult.session?.id,
            appSession: appResult.session
          },
          message: 'Session started successfully and synced to database'
        });
      } else {
        const errorData = await appResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.warn(`[Session Start] Failed to sync to app build database:`, errorData);
        // Continue anyway - guest session still works even if app build is unavailable
        return NextResponse.json({
          success: true,
          session: sessionData,
          message: 'Session started successfully (database sync unavailable)',
          warning: 'Could not sync to Fire Session Dashboard'
        });
      }
    } catch (appError) {
      console.error(`[Session Start] Error connecting to app build:`, appError);
      // Continue anyway - guest session still works even if app build is unavailable
      return NextResponse.json({
        success: true,
        session: sessionData,
        message: 'Session started successfully (database sync unavailable)',
        warning: 'Could not sync to Fire Session Dashboard'
      });
    }

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