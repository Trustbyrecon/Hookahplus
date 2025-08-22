import { NextResponse } from "next/server";
import { fireSessionWorkflow } from "../../../lib/fire-session-workflow";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, sessionId, tableId, flavorMix, prepStaffId, button, staffRole, staffId, metadata } = body;

    switch (action) {
      case 'create':
        if (!sessionId || !tableId || !flavorMix || !prepStaffId) {
          return NextResponse.json({ 
            error: "Missing required fields: sessionId, tableId, flavorMix, prepStaffId" 
          }, { status: 400 });
        }

        const session = fireSessionWorkflow.createSession(sessionId, tableId, flavorMix, prepStaffId);
        return NextResponse.json({ success: true, session });

      case 'press_button':
        if (!sessionId || !button || !staffRole || !staffId) {
          return NextResponse.json({ 
            error: "Missing required fields: sessionId, button, staffRole, staffId" 
          }, { status: 400 });
        }

        const event = fireSessionWorkflow.pressButton(sessionId, button, staffRole, staffId, metadata);
        if (!event) {
          return NextResponse.json({ 
            error: "Invalid button press for this role or session state" 
          }, { status: 400 });
        }

        return NextResponse.json({ success: true, event });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Fire session API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status') as any;
    const staffId = searchParams.get('staffId');

    if (sessionId) {
      // Get specific session
      const session = fireSessionWorkflow.getSession(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      return NextResponse.json({ session });
    }

    if (staffId) {
      // Get sessions by staff member
      const sessions = fireSessionWorkflow.getSessionsByStaff(staffId);
      return NextResponse.json({ sessions });
    }

    if (status) {
      // Get sessions by status
      const sessions = fireSessionWorkflow.getSessionsByStatus(status);
      return NextResponse.json({ sessions });
    }

    // Get all sessions and metrics
    const allSessions = Array.from(fireSessionWorkflow.getSessionMetrics());
    const metrics = fireSessionWorkflow.getSessionMetrics();
    
    return NextResponse.json({ 
      sessions: allSessions, 
      metrics 
    });

  } catch (error: any) {
    console.error('Fire session query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
