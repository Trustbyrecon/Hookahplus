// app/api/sessions/[id]/command/route.ts
import { NextResponse } from "next/server";
import { reduce, getSession, putSession, seedSession, type Command } from "@/lib/sessionState";
import { publishSessionEvent } from "@/lib/eventBus";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
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
    publishSessionEvent(sessionId, { session: s1, cmd, data });

    return NextResponse.json({ ok: true, new_state: s1.state, session: s1 });
  } catch (e: any) {
    const code = typeof e?.code === "number" ? e.code : 500;
    return NextResponse.json({ error: e?.message || "Command failed" }, { status: code });
  }
}
