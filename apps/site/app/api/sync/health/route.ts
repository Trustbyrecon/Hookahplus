import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check real build status by hitting health endpoints
    const buildChecks = await Promise.allSettled([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_GUEST_URL || 'http://localhost:3001'}/api/health`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/api/health`, { cache: 'no-store' })
    ]);

    const buildStatus = {
      app: buildChecks[0].status === 'fulfilled' && buildChecks[0].value.ok ? 'green' : 'red',
      guest: buildChecks[1].status === 'fulfilled' && buildChecks[1].value.ok ? 'green' : 'red', 
      site: buildChecks[2].status === 'fulfilled' && buildChecks[2].value.ok ? 'green' : 'red'
    };

    // Get real metrics from ghost-log
    const ghostLogResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ghost-log?limit=100`, {
      cache: 'no-store'
    });
    
    let metrics = {
      form_submit: 0,
      checkout_completed: 0,
      webhook_ok: 0,
      session_opened: 0,
    };

    if (ghostLogResponse.ok) {
      const ghostLogData = await ghostLogResponse.json();
      const logs = ghostLogData.logs || [];
      
      // Count event types
      metrics.form_submit = logs.filter((log: any) => log.kind?.includes('waitlist') || log.kind?.includes('lead')).length;
      metrics.checkout_completed = logs.filter((log: any) => log.kind?.includes('checkout') || log.kind?.includes('payment')).length;
      metrics.webhook_ok = logs.filter((log: any) => log.kind?.includes('webhook') && !log.kind?.includes('failed')).length;
      metrics.session_opened = logs.filter((log: any) => log.kind?.includes('session')).length;
    }

    return NextResponse.json({
      ok: true,
      metrics,
      timestamp: new Date().toISOString(),
      build_status: buildStatus,
      environment: {
        app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        guest_url: process.env.NEXT_PUBLIC_GUEST_URL || 'http://localhost:3001',
        site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metrics: {
        form_submit: 0,
        checkout_completed: 0,
        webhook_ok: 0,
        session_opened: 0,
      },
      timestamp: new Date().toISOString(),
      build_status: {
        app: 'unknown',
        guest: 'unknown', 
        site: 'unknown'
      }
    }, { status: 500 });
  }
}
