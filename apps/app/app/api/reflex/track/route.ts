import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/db";

const envLimit = Number(process.env.REFLEX_LIMIT_PER_MIN ?? 120);

// very small in-memory limiter (per IP) — replace with Redis in prod
const buckets = new Map<string, { count: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  const slot = Math.floor(now / 60000); // minute window
  const key = `${ip}:${slot}`;
  const b = buckets.get(key) ?? { count: 0, reset: slot * 60000 + 60000 };
  b.count += 1;
  buckets.set(key, b);
  return { blocked: b.count > envLimit, retryAfterMs: Math.max(0, b.reset - now) };
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "";

  // rate-limit
  const { blocked, retryAfterMs } = limited(ip);
  if (blocked) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    });
  }

  let body: unknown;
  try { 
    body = await req.json(); 
  } catch { 
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); 
  }

  // Basic validation
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const { type, source = "ui", sessionId, paymentIntent, payload } = body as any;
  
  if (!type || typeof type !== 'string') {
    return NextResponse.json({ ok: false, error: "Missing or invalid type" }, { status: 400 });
  }

  const payloadStr = payload ? JSON.stringify(payload) : "";
  const payloadHash = payloadStr ? sha256(payloadStr).slice(0, 64) : null;

  // simple idempotency: drop identical (ip+type+hash) seen in last 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (payloadHash) {
    const dupe = await prisma.reflexEvent.findFirst({
      where: { ip, type, payloadHash, createdAt: { gt: fiveMinAgo } },
      select: { id: true },
    });
    if (dupe) return NextResponse.json({ ok: true, id: dupe.id, deduped: true });
  }

  const rec = await prisma.reflexEvent.create({
    data: {
      type, 
      source, 
      sessionId, 
      paymentIntent, 
      payload: payloadStr || undefined, 
      payloadHash: payloadHash ?? undefined, 
      userAgent: ua, 
      ip,
    },
  });

  return NextResponse.json({ ok: true, id: rec.id });
}
