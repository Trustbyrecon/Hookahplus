import { NextRequest, NextResponse } from "next/server";
import { MockSessionStore } from "@/lib/mockSessionStore";

type Transition =
  | "START_PREP"
  | "MARK_READY"
  | "TAKE_DELIVERY"
  | "START_ACTIVE"
  | "PAUSE"
  | "RESUME"
  | "COMPLETE"
  | "CANCEL"
  | "SET_EDGE_CASE"
  | "RESOLVE_EDGE_CASE";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const t: Transition = body.transition;
    const note: string | undefined = body.note;
    const edge: string | undefined = body.edge; // EdgeCase enum name

    // Mock user authentication - in production, use proper auth
    const mockUser = { id: 'user-1', roles: ['BOH', 'FOH', 'MANAGER', 'ADMIN'] };
    
    // Get session from mock store
    const session = MockSessionStore.getSession(params.id);
    
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Role-based authorization (simplified for mock)
    const can = (role: string) => mockUser.roles.includes(role) || mockUser.roles.includes("ADMIN");

    // Validate role permissions for each transition
    switch (t) {
      case "START_PREP":
      case "MARK_READY":
        if (!can("BOH") && !can("MANAGER")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        break;

      case "TAKE_DELIVERY":
      case "START_ACTIVE":
      case "PAUSE":
      case "RESUME":
      case "COMPLETE":
        if (!can("FOH") && !can("MANAGER")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        break;

      case "CANCEL":
      case "RESOLVE_EDGE_CASE":
        if (!can("MANAGER")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        break;

      case "SET_EDGE_CASE":
        if (!can("BOH") && !can("FOH") && !can("MANAGER")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        break;

      default:
        return NextResponse.json({ error: "Unknown transition" }, { status: 400 });
    }

    // Perform the transition using mock store
    try {
      const updatedSession = MockSessionStore.transitionSession(params.id, t, { edge, note });
      
      if (!updatedSession) {
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
      }

      // Log analytics
      await logAnalytics(t, updatedSession);

      return NextResponse.json({ 
        ok: true, 
        session: updatedSession,
        message: `Session transitioned: ${t}` 
      });

    } catch (error: any) {
      console.error("Transition error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Session transition error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve session data
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = MockSessionStore.getSession(params.id);
    
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, session });
  } catch (error: any) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function logAnalytics(transition: string, session: any) {
  // Analytics events for tracking
  const events = {
    session_created: transition === "START_PREP" && session.state === "PREP_IN_PROGRESS",
    prep_started: transition === "START_PREP",
    ready_for_delivery: transition === "MARK_READY",
    out_for_delivery: transition === "TAKE_DELIVERY",
    active_started: transition === "START_ACTIVE",
    paused: transition === "PAUSE",
    resumed: transition === "RESUME",
    completed: transition === "COMPLETE",
    cancelled: transition === "CANCEL",
    edge_case_set: transition === "SET_EDGE_CASE",
    edge_case_resolved: transition === "RESOLVE_EDGE_CASE",
  };

  // Log to console for now - replace with real analytics service
  console.log("🔥 Fire Session Analytics Event:", {
    event: Object.keys(events).find(key => events[key as keyof typeof events]),
    sessionId: session.id,
    tableId: session.tableId,
    state: session.state,
    transition,
    timestamp: new Date().toISOString(),
    customerRef: session.customerRef,
    flavor: session.flavor,
    priceCents: session.priceCents,
  });
}