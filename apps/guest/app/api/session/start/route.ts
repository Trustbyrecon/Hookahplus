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
        source: sessionType === 'reservation' ? 'RESERVE' : 'QR', // QR code scan from guest build
        loungeId: loungeId,
        externalRef: `guest-${sessionId}`,
        sessionDuration: 45 * 60, // Default 45 minutes
        notes: `Guest session started from guest build via QR scan`
      };

      console.log(`[Session Start] Sending to app build API:`, JSON.stringify(appSessionPayload, null, 2));

      const appResponse = await fetch(`${appUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appSessionPayload),
      });

      // Parse response once (can't read body twice)
      let appResult: any;
      try {
        appResult = await appResponse.json();
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        const errorText = await appResponse.text().catch(() => 'Unknown error');
        appResult = { error: errorText || 'Failed to parse response' };
      }
      
      console.log(`[Session Start] App build response status:`, appResponse.status);
      console.log(`[Session Start] App build response:`, JSON.stringify(appResult, null, 2));
      
      // Extract session ID from multiple possible locations
      // Check: session.id, id, sessionId (in that order of preference)
      const appSessionId = appResult.session?.id || appResult.id || appResult.sessionId;
      
      console.log(`[Session Start] Extracted appSessionId:`, appSessionId);
      console.log(`[Session Start] Response has success:`, appResult.success);
      console.log(`[Session Start] Response is OK:`, appResponse.ok);
      console.log(`[Session Start] Response has session:`, !!appResult.session);
      
      // Check if response has a session (even if status is not 200, idempotency might return existing session)
      // Priority 1: success=true and has session ID
      if (appResult.success && appSessionId) {
        console.log(`[Session Start] ✅ Successfully created/synced session in app build database:`, appSessionId);
        
        // Merge app session data with guest session data
        return NextResponse.json({
          success: true,
          session: {
            ...sessionData,
            appSessionId: appSessionId,
            appSession: appResult.session
          },
          message: 'Session started successfully and synced to Fire Session Dashboard',
          synced: true
        });
      } 
      // Priority 2: HTTP OK and has session ID (even if success field is missing)
      else if (appResponse.ok && appSessionId) {
        console.log(`[Session Start] ✅ Session found in app build (HTTP OK):`, appSessionId);
        return NextResponse.json({
          success: true,
          session: {
            ...sessionData,
            appSessionId: appSessionId,
            appSession: appResult.session || appResult
          },
          message: 'Session started successfully and synced to Fire Session Dashboard',
          synced: true
        });
      }
      // Priority 3: Has session object with ID (even if success field is false or missing)
      else if (appResult.session?.id) {
        console.log(`[Session Start] ✅ Session found in app build (has session object):`, appResult.session.id);
        return NextResponse.json({
          success: true,
          session: {
            ...sessionData,
            appSessionId: appResult.session.id,
            appSession: appResult.session
          },
          message: 'Session started successfully and synced to Fire Session Dashboard',
          synced: true
        });
      } else {
        // No session found in response
        const errorData = appResult.error ? appResult : { 
          error: appResult.error || 'Unknown error',
          status: appResponse.status,
          statusText: appResponse.statusText,
          response: appResult
        };
        
        console.error(`[Session Start] ❌ Failed to sync to app build database:`, {
          status: appResponse.status,
          statusText: appResponse.statusText,
          error: errorData
        });
        
        // Continue anyway - guest session still works even if app build is unavailable
        return NextResponse.json({
          success: true,
          session: sessionData,
          message: 'Session started successfully (database sync unavailable)',
          warning: 'Could not sync to Fire Session Dashboard',
          syncError: errorData,
          synced: false
        });
      }
    } catch (appError) {
      const errorMessage = appError instanceof Error ? appError.message : String(appError);
      const errorStack = appError instanceof Error ? appError.stack : undefined;
      
      console.error(`[Session Start] ❌ Error connecting to app build:`, {
        error: errorMessage,
        stack: errorStack,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
        hint: 'Is the app build running on localhost:3002?'
      });
      
      // Continue anyway - guest session still works even if app build is unavailable
      return NextResponse.json({
        success: true,
        session: sessionData,
        message: 'Session started successfully (database sync unavailable)',
        warning: 'Could not sync to Fire Session Dashboard',
        syncError: {
          type: 'connection_error',
          message: errorMessage,
          hint: 'Check if app build is running on localhost:3002'
        },
        synced: false
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