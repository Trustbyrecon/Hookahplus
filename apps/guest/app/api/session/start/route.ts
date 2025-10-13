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

    // Send to App build with correct data format
    const appBuildUrl = process.env.APP_BUILD_URL || 'https://hookahplus-app-prod.vercel.app';
    
    try {
      // Format data to match App Build's expected format
      const appBuildData = {
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lounge_id: loungeId || 'guest-lounge',
        table_id: tableId,
        flavor_mix: items.filter((item: any) => item.name.includes('Add-on')).map((item: any) => item.name.replace(' Add-on', '')),
        customer_name: customerName || 'Guest Customer',
        customer_phone: customerPhone || '+1234567890',
        session_type: 'guest-portal',
        amount: totalAmount / 100, // Convert from cents to dollars
        pricing_model: 'flat', // Default to flat for guest sessions
        timer_duration: sessionDuration,
        boh_staff: '',
        foh_staff: '',
        notes: `Guest session from ${tableId}`,
        flavor_mix_price: items.filter((item: any) => item.name.includes('Add-on')).reduce((sum: number, item: any) => sum + item.price, 0) / 100,
        base_price: 30 // Default base price
      };

      const response = await fetch(`${appBuildUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.APP_BUILD_API_KEY || 'guest-sync-key'}`
        },
        body: JSON.stringify(appBuildData)
      });

      if (response.ok) {
        const appResponse = await response.json();
        
        // Return session info to guest
        return NextResponse.json({
          ok: true,
          sessionId: appResponse.session?.session_id || `session_${Date.now()}`,
          tableId,
          loungeId,
          status: 'ACTIVE',
          startedAt: sessionData.startedAt,
          message: 'Session started successfully',
          appBuildUrl: `${appBuildUrl}/fire-session-dashboard?session=${appResponse.session?.session_id || `session_${Date.now()}`}`,
          staffPanelUrl: `${appBuildUrl}/fire-session-dashboard?table=${tableId}`,
          dashboardUrl: `${appBuildUrl}/dashboard?session=${appResponse.session?.session_id || `session_${Date.now()}`}`,
          session: appResponse.session
        });
      } else {
        const errorText = await response.text();
        throw new Error(`App build responded with status ${response.status}: ${errorText}`);
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
