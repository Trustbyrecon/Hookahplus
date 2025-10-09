import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

  // TODO: replace with real fetch from your event store
  const events = [
    // Example shape
    { 
      event_id: "e1", 
      type: "guest.event.waitlist_submitted", 
      created_at: new Date().toISOString(), 
      payload_hash: "abc123",
      session_id: "session_001",
      payment_intent_id: null
    },
    { 
      event_id: "e2", 
      type: "app.lead.created", 
      created_at: new Date().toISOString(), 
      payload_hash: "abc123",
      session_id: "session_001",
      payment_intent_id: null
    },
    { 
      event_id: "e3", 
      type: "order.paid", 
      created_at: new Date().toISOString(), 
      payload_hash: "def456",
      session_id: "session_002",
      payment_intent_id: "pi_test_123"
    },
  ].slice(0, limit);

  // Simple flag demo
  const flagged = events.map((e) => ({
    ...e,
    flags:
      e.type === "app.lead.created" ? [] :
      e.type === "qr.join.failed" ? ["missing_join"] :
      e.type === "webhook.failover.trigger" ? ["webhook_error"] :
      [],
  }));

  return NextResponse.json({ events: flagged });
}
