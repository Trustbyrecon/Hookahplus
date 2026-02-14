// apps/web/app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getAllSessions,
  getSession,
  getSessionsByState,
  getSessionsByTable,
  putSession,
  seedSession,
  type Session,
  type SessionState,
} from "@/lib/sessionState";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, tableId, state, meta } = body || {};
    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    const base = getSession(sessionId) || seedSession(sessionId, tableId || "T-1");

    const next: Session = {
      ...base,
      id: sessionId,
      table: tableId || base.table,
      state: (state as SessionState) || base.state,
      meta: {
        ...base.meta,
        loungeId: meta?.loungeId || base.meta.loungeId || "lounge_demo",
        createdBy: meta?.createdBy || base.meta.createdBy || "system",
        ...(meta || {}),
      },
    };

    putSession(next);

    return NextResponse.json({
      success: true,
      session: next,
      message: "Session stored",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const state = searchParams.get("state") as SessionState | null;
    const table = searchParams.get("table");

    if (sessionId) {
      const session = getSession(sessionId);
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      return NextResponse.json({ success: true, session });
    }

    let sessions: Session[] = [];
    if (state) sessions = getSessionsByState(state);
    else if (table) sessions = getSessionsByTable(table);
    else sessions = getAllSessions();

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch sessions" }, { status: 500 });
  }
}