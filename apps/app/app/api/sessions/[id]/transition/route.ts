import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/authz";

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

    const { user, roles } = await requireRole(req, ["BOH", "FOH", "MANAGER", "ADMIN"]);
    const s = await prisma.session.findUnique({ where: { id: params.id } });
    
    if (!s) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const can = (r: string) => roles.includes(r) || roles.includes("ADMIN");

    const updates: any = {};
    const now = new Date();

    switch (t) {
      case "START_PREP":
        if (!can("BOH") && !can("MANAGER")) return forbid();
        assertState(s.state, ["NEW"]);
        updates.state = "PREP_IN_PROGRESS";
        updates.assignedBOHId = user.id;
        break;

      case "MARK_READY":
        if (!can("BOH") && !can("MANAGER")) return forbid();
        assertState(s.state, ["PREP_IN_PROGRESS"]);
        updates.state = "READY_FOR_DELIVERY";
        break;

      case "TAKE_DELIVERY":
        if (!can("FOH") && !can("MANAGER")) return forbid();
        assertState(s.state, ["READY_FOR_DELIVERY"]);
        updates.state = "OUT_FOR_DELIVERY";
        updates.assignedFOHId = user.id;
        break;

      case "START_ACTIVE":
        if (!can("FOH") && !can("MANAGER")) return forbid();
        assertState(s.state, ["OUT_FOR_DELIVERY"]);
        updates.state = "ACTIVE";
        // Note: startedAt will be available after Prisma migration
        // updates.startedAt = now; // start timer
        break;

      case "PAUSE":
        if (!can("FOH") && !can("MANAGER")) return forbid();
        assertState(s.state, ["ACTIVE"]);
        updates.state = "PAUSED";
        break;

      case "RESUME":
        if (!can("FOH") && !can("MANAGER")) return forbid();
        assertState(s.state, ["PAUSED"]);
        updates.state = "ACTIVE";
        break;

      case "COMPLETE":
        if (!can("FOH") && !can("MANAGER")) return forbid();
        assertState(s.state, ["ACTIVE", "PAUSED"]);
        // require successful payment before complete
        // Note: paymentStatus will be available after Prisma migration
        // if (s.paymentStatus !== "succeeded") {
        //   return NextResponse.json({ error: "Payment required" }, { status: 409 });
        // }
        updates.state = "COMPLETED";
        updates.endedAt = now;
        // Note: startedAt will be available after Prisma migration
        // updates.durationSecs = s.startedAt ? Math.floor((+now - +s.startedAt) / 1000) : null;
        break;

      case "CANCEL":
        if (!can("MANAGER")) return forbid();
        updates.state = "CANCELLED";
        // Note: endedAt will be available after Prisma migration
        // updates.endedAt = now;
        break;

      case "SET_EDGE_CASE":
        if (!can("BOH") && !can("FOH") && !can("MANAGER")) return forbid();
        updates.edgeCase = edge ?? "OTHER";
        updates.edgeNote = note ?? "";
        break;

      case "RESOLVE_EDGE_CASE":
        if (!can("MANAGER")) return forbid();
        updates.edgeCase = null;
        updates.edgeNote = null;
        break;

      default:
        return NextResponse.json({ error: "Unknown transition" }, { status: 400 });
    }

    const updated = await prisma.session.update({
      where: { id: s.id },
      data: { ...updates },
    });

    // Log the transition (will be available after Prisma migration)
    // await prisma.sessionTransition.create({
    //   data: {
    //     sessionId: s.id,
    //     fromState: s.state,
    //     toState: updates.state,
    //     transition: t,
    //     userId: user.id,
    //     note: note,
    //   },
    // });

    // Fire analytics
    await logAnalytics(t, updated);

    return NextResponse.json({ ok: true, session: updated });
  } catch (error: any) {
    console.error("Session transition error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function assertState(current: string, allowed: string[]) {
  if (!allowed.includes(current)) {
    const msg = `Invalid state transition: ${current} → (allowed: ${allowed.join(",")})`;
    throw new Error(msg);
  }
}

function forbid() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  console.log("Analytics Event:", {
    event: Object.keys(events).find(key => events[key as keyof typeof events]),
    sessionId: session.id,
    tableId: session.tableId,
    state: session.state,
    transition,
    timestamp: new Date().toISOString(),
  });
}
