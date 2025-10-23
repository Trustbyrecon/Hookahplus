import { NextRequest, NextResponse } from "next/server";
import { MockSessionStore } from "../../../../lib/mockSessionStore";

// GET session status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const tableId = searchParams.get('tableId');

    if (!sessionId && !tableId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing sessionId or tableId parameter'
      }, { status: 400 });
    }

    let session;
    
    if (sessionId) {
      session = MockSessionStore.getSession(sessionId);
    } else if (tableId) {
      const sessions = MockSessionStore.getSessions();
      session = sessions.find(s => s.tableId === tableId && s.state === 'ACTIVE');
    }

    if (!session) {
      return NextResponse.json({
        ok: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Calculate time remaining if session has timer
    let timeRemaining = 0;
    if (session.timerDuration && session.startedAt) {
      const startTime = new Date(session.startedAt).getTime();
      const currentTime = new Date().getTime();
      const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
      timeRemaining = Math.max(0, session.timerDuration - elapsedMinutes);
    }

    // Format session data for guest build
    const sessionData = {
      id: session.id,
      tableId: session.tableId,
      status: session.state,
      startedAt: session.startedAt,
      duration: session.timerDuration || 60,
      timeRemaining,
      items: [
        {
          name: session.flavor || 'Hookah Session',
          quantity: 1,
          price: session.priceCents
        }
      ],
      totalAmount: session.priceCents,
      staffAssigned: {
        foh: session.assignedFOH || null,
        boh: session.assignedBOH || null
      }
    };

    return NextResponse.json({
      ok: true,
      session: sessionData
    });
  } catch (error: any) {
    console.error("Get session status error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
