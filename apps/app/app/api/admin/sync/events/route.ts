import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

  try {
    // Fetch real events from ghost-log API
    const ghostLogResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/ghost-log?limit=${limit}`, {
      cache: 'no-store'
    });
    
    if (!ghostLogResponse.ok) {
      throw new Error(`Ghost-log API returned ${ghostLogResponse.status}`);
    }
    
    const ghostLogData = await ghostLogResponse.json();
    const logs = ghostLogData.logs || [];

    // Transform ghost-log entries to sync events format
    const events = logs.map((log: any, index: number) => ({
      event_id: `e${index + 1}`,
      type: log.kind || 'unknown',
      created_at: log.timestamp,
      payload_hash: log.data?.payload_hash || log.data?.ghostHash || 'no-hash',
      session_id: log.data?.sessionId || log.data?.session_id || null,
      payment_intent_id: log.data?.payment_intent_id || log.data?.paymentIntentId || null,
      flags: []
    }));

    // Add flagging logic based on event types
    const flagged = events.map((e: any) => ({
      ...e,
      flags:
        e.type === "app.lead.created" ? [] :
        e.type === "qr.join.failed" ? ["missing_join"] :
        e.type === "webhook.failover.trigger" ? ["webhook_error"] :
        e.type === "stripe.webhook.failed" ? ["webhook_error"] :
        [],
    }));

    return NextResponse.json({ events: flagged });
  } catch (error) {
    console.error('Failed to fetch sync events:', error);
    
    // Fallback to mock data if real API fails
    const mockEvents = [
      { 
        event_id: "e1", 
        type: "guest.event.waitlist_submitted", 
        created_at: new Date().toISOString(), 
        payload_hash: "abc123",
        session_id: "session_001",
        payment_intent_id: null,
        flags: []
      },
      { 
        event_id: "e2", 
        type: "app.lead.created", 
        created_at: new Date().toISOString(), 
        payload_hash: "abc123",
        session_id: "session_001",
        payment_intent_id: null,
        flags: []
      },
    ].slice(0, limit);

    return NextResponse.json({ events: mockEvents });
  }
}
