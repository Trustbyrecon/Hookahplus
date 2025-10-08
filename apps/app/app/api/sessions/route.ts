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
    
    // Handle guest build requests
    if (body.source === 'guest_portal') {
      const sessionData = {
        tableId: body.tableId,
        customerRef: body.customerName || body.customerId,
        flavor: body.items?.[0]?.name || 'Mixed Flavor',
        priceCents: body.totalAmount || 0,
        assignedBOHId: body.bohStaff || 'BOH_AUTO',
        assignedFOHId: body.fohStaff || 'FOH_AUTO',
        assignedBOH: body.bohStaff || 'BOH_AUTO',
        assignedFOH: body.fohStaff || 'FOH_AUTO',
        notes: `Guest session from ${body.loungeId}`,
        timerDuration: body.sessionDuration || 60,
        state: 'ACTIVE' as const,
        startedAt: new Date(),
        paymentStatus: 'completed'
      };

      const newSession = MockSessionStore.createSession(sessionData);
      
      return NextResponse.json({ 
        ok: true, 
        sessionId: newSession.id,
        session: newSession,
        message: "Guest session created successfully" 
      });
    }
    
    // Handle regular app build requests
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
