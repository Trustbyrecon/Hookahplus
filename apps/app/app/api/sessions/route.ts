import { NextRequest, NextResponse } from "next/server";
import { MockSessionStore } from "@/lib/mockSessionStore";

// GET all sessions
export async function GET(req: NextRequest) {
  try {
    const sessions = MockSessionStore.getSessions();
    
    return NextResponse.json({ 
      ok: true, 
      sessions,
      count: sessions.length 
    });
  } catch (error: any) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const sessionData = {
      tableId: body.tableId,
      customerRef: body.customerName || body.customerRef,
      flavor: body.flavor,
      priceCents: Math.round((body.amount || 0) * 100),
      assignedBOHId: body.bohStaff,
      assignedFOHId: body.fohStaff,
      assignedBOH: body.bohStaff,
      assignedFOH: body.fohStaff,
      notes: body.notes,
    };

    const newSession = MockSessionStore.createSession(sessionData);
    
    return NextResponse.json({ 
      ok: true, 
      session: newSession,
      message: "Session created successfully" 
    });
  } catch (error: any) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
