// app/api/sessions/[id]/command/route.ts
import { NextResponse } from "next/server";
import { reduce, getSession, putSession, seedSession, type Command } from "@/lib/sessionState";
import { publishSessionEvent } from "@/lib/eventBus";
import { extractIdempotencyKey, withIdempotency } from "@/lib/idempotency";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
  const idempotencyKey = extractIdempotencyKey(req);
  
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
    const eventType =
      cmd === "PAYMENT_CONFIRMED"
        ? "payment_confirmed"
        : cmd === "CLOSE_SESSION"
        ? "session_closed"
        : cmd === "PAYMENT_FAILED"
        ? "payment_failed"
        : "session_command";

    const { result, cached } = await withIdempotency({
      key: idempotencyKey,
      sessionId,
      eventType,
      payload: { cmd, data, actor },
      handler: async () => {
        const next = reduce(structuredClone(s0), cmd, actor, data);
        putSession(next);

    // publish to per-session & role topics
        publishSessionEvent(sessionId, { session: next, cmd, data });
        return next;
      },
    });

    return NextResponse.json(
      {
      ok: true, 
        new_state: result.state,
        message: `Session state changed from ${s0.state} to ${result.state} by ${actor}`,
        session: result,
        idempotent: cached,
      },
      cached ? { status: 200, headers: { "X-Idempotent-Cache": "hit" } } : undefined
    );
  } catch (e: any) {
    const code = typeof e?.code === "number" ? e.code : 500;
    return NextResponse.json({ error: e?.message || "Command failed" }, { status: code });
  }
}