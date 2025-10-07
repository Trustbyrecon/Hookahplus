import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      tableId, 
      loungeId, 
      customerId, 
      items, 
      totalAmount, 
      customerName, 
      customerPhone,
      sessionDuration = 60 
    } = body;

    // Validate required fields
    if (!tableId || !loungeId || !items || !totalAmount) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required fields: tableId, loungeId, items, totalAmount'
      }, { status: 400 });
    }

    // Create session data for App build
    const sessionData = {
      tableId,
      loungeId,
      customerId: customerId || `guest_${Date.now()}`,
      customerName: customerName || 'Guest Customer',
      customerPhone: customerPhone || '',
      items,
      totalAmount,
      sessionDuration,
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      paymentStatus: 'completed',
      source: 'guest_portal'
    };

    // Send to App build
    const appBuildUrl = process.env.APP_BUILD_URL || 'https://hookahplus-app-prod.vercel.app';
    
    try {
      const response = await fetch(`${appBuildUrl}/api/sessions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.APP_BUILD_API_KEY || 'guest-sync-key'}`
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const appResponse = await response.json();
        
        // Return session info to guest
        return NextResponse.json({
          ok: true,
          sessionId: appResponse.sessionId || `session_${Date.now()}`,
          tableId,
          loungeId,
          status: 'ACTIVE',
          startedAt: sessionData.startedAt,
          message: 'Session started successfully',
          appBuildUrl: `${appBuildUrl}/fire-session-dashboard?session=${appResponse.sessionId || `session_${Date.now()}`}`,
          staffPanelUrl: `${appBuildUrl}/fire-session-dashboard?table=${tableId}`,
          dashboardUrl: `${appBuildUrl}/dashboard?session=${appResponse.sessionId || `session_${Date.now()}`}`
        });
      } else {
        throw new Error(`App build responded with status ${response.status}`);
      }
    } catch (appError) {
      // Fallback: create local session
      console.log('App build unavailable, creating local session:', appError);
      
      const localSessionId = `session_${Date.now()}`;
      
      return NextResponse.json({
        ok: true,
        sessionId: localSessionId,
        tableId,
        loungeId,
        status: 'ACTIVE',
        startedAt: sessionData.startedAt,
        message: 'Session started (local mode)',
        appBuildUrl: `${appBuildUrl}/fire-session-dashboard?session=${localSessionId}`,
        staffPanelUrl: `${appBuildUrl}/fire-session-dashboard?table=${tableId}`,
        dashboardUrl: `${appBuildUrl}/dashboard?session=${localSessionId}`
      });
    }
  } catch (error) {
    console.error('Session start error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Failed to start session: ' + (error as Error).message
    }, { status: 500 });
  }
}
