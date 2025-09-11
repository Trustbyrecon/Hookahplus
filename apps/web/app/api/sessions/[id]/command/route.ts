<<<<<<< HEAD
import { NextResponse } from "next/server";
import { reduce, getSession, putSession, seedSession, type Command } from "@/lib/sessionState";
import { publish, publishSessionEvent, publishFloorEvent, publishPrepEvent } from "@/lib/eventBus";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
  
=======
// app/api/sessions/[id]/command/route.ts
import { NextResponse } from "next/server";
import { reduce, getSession, putSession, seedSession, type Command } from "@/lib/sessionState";
import { publishSessionEvent } from "@/lib/eventBus";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
  // seed if missing (for local/dev)
  const s0 = getSession(sessionId) || seedSession(sessionId);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty body is OK
  }

  const cmd = body?.cmd as Command;
  const data = body?.data ?? {};
  const actor = (body?.actor as "foh" | "boh" | "system" | "agent") || "agent";

  if (!cmd) {
    return NextResponse.json({ error: "Missing cmd" }, { status: 400 });
  }

  try {
    const s1 = reduce(structuredClone(s0), cmd, actor, data);
    putSession(s1);

    // publish to per-session & role topics
<<<<<<< HEAD
    const event = { session: s1, cmd, data, actor, timestamp: Date.now() };
    
    publishSessionEvent(sessionId, event);
    publishFloorEvent(event); // FOH board could subscribe
    publishPrepEvent(event);  // BOH board could subscribe

    return NextResponse.json({ 
      ok: true, 
      new_state: s1.state, 
      session: s1,
      event 
    });
  } catch (e: any) {
    const code = typeof e?.code === "number" ? e.code : 500;
    return NextResponse.json({ 
      error: e?.message || "Command failed",
      details: e?.code ? `Error code: ${e.code}` : undefined
    }, { status: code });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
  const session = getSession(sessionId);
  
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}
=======
    publishSessionEvent(sessionId, { session: s1, cmd, data });

    return NextResponse.json({ ok: true, new_state: s1.state, session: s1 });
  } catch (e: any) {
    const code = typeof e?.code === "number" ? e.code : 500;
    return NextResponse.json({ error: e?.message || "Command failed" }, { status: code });
  }
}
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
