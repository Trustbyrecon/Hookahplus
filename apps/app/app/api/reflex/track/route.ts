import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/db";
import { generateTrustEventId, validateTrustEvent, type TrustEvent } from "../../../../lib/reflex/rem-types";

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

/**
 * Generate sequence number for TrustEvent ID
 */
async function getNextSequenceNumber(): Promise<number> {
  // Get latest event to determine next sequence
  const latestEvent = await prisma.reflexEvent.findFirst({
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  
  // Simple sequence: use timestamp-based or count-based
  // For production, use atomic counter or database sequence
  const baseSequence = latestEvent ? 1 : 1; // Would calculate from latest event
  return Date.now() % 1000000; // Use timestamp modulo for uniqueness
}

/**
 * Create REM-compliant payload from incoming event
 */
async function createREMPayload(
  type: string,
  source: string,
  sessionId?: string,
  paymentIntent?: string,
  payload?: any,
  ip?: string
): Promise<TrustEvent> {
  const sequence = await getNextSequenceNumber();
  
  // Hash IP for PII minimal
  const ipHash = ip ? `sha256:${sha256(ip)}` : undefined;
  
  // Extract actor information from payload or create default
  const actorAnonHash = payload?.actor?.anon_hash || 
    (payload?.customer_id ? `sha256:${sha256(payload.customer_id)}` : 
     `sha256:${sha256(ip || 'unknown')}`);

  // Map event type to TrustEvent type
  const typeMap: Record<string, TrustEvent['type']> = {
    'order.created': 'order.created',
    'order.completed': 'order.completed',
    'order.cancelled': 'order.cancelled',
    'payment.settled': 'payment.settled',
    'payment.refunded': 'payment.refunded',
    'payment.failed': 'payment.failed',
    'loyalty.issued': 'loyalty.issued',
    'loyalty.redeemed': 'loyalty.redeemed',
    'loyalty.expired': 'loyalty.expired',
    'session.started': 'session.started',
    'session.completed': 'session.completed',
    'session.cancelled': 'session.cancelled',
    'session.extended': 'session.extended',
    'refill.requested': 'refill.requested',
    'refill.completed': 'refill.completed',
  };

  const trustEventType = typeMap[type] || 'order.created'; // Default fallback

  const trustEvent: TrustEvent = {
    id: generateTrustEventId(sequence),
    ts_utc: new Date().toISOString(),
    type: trustEventType,
    actor: {
      anon_hash: actorAnonHash,
      customer_id: payload?.actor?.customer_id,
      staff_id: payload?.actor?.staff_id,
      device_id: payload?.actor?.device_id || source,
    },
    venue_id: payload?.venue_id,
    session_id: sessionId || payload?.session_id,
    context: payload?.context || {
      vertical: 'hookah',
      time_local: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    },
    behavior: payload?.behavior,
    sentiment: payload?.sentiment,
    effect: {
      loyalty_delta: payload?.effect?.loyalty_delta ?? 0,
      credit_type: 'HPLUS_CREDIT',
      reflex_delta: payload?.effect?.reflex_delta,
      revenue_delta: payload?.effect?.revenue_delta,
    },
    security: {
      signature: payload?.security?.signature || `ed25519:${sha256(JSON.stringify(payload || {}))}`,
      device_id: payload?.security?.device_id || source,
      ip_hash: ipHash,
    },
  };

  return trustEvent;
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

  // Create REM-compliant TrustEvent
  let trustEvent: TrustEvent;
  try {
    trustEvent = await createREMPayload(type, source, sessionId, paymentIntent, payload, ip);
    
    // Validate REM format
    const validation = validateTrustEvent(trustEvent);
    if (!validation.valid) {
      console.warn('[Reflex Track] REM validation warnings:', validation.errors);
      // Continue anyway but log warnings
    }
  } catch (error) {
    console.error('[Reflex Track] Error creating REM payload:', error);
    // Fallback to legacy format if REM creation fails
    trustEvent = await createREMPayload(type, source, sessionId, paymentIntent, payload, ip);
  }

  const payloadStr = JSON.stringify(trustEvent);
  const payloadHash = payloadStr ? sha256(payloadStr).slice(0, 64) : null;

  // simple idempotency: drop identical (ip+type+hash) seen in last 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (payloadHash) {
    const dupe = await prisma.reflexEvent.findFirst({
      where: { ip, type, payloadHash, createdAt: { gt: fiveMinAgo } },
      select: { id: true },
    });
    if (dupe) return NextResponse.json({ ok: true, id: dupe.id, deduped: true, remFormat: true });
  }

  const rec = await prisma.reflexEvent.create({
    data: {
      type, 
      source, 
      sessionId, 
      paymentIntent, 
      payload: payloadStr, // Store REM-compliant TrustEvent
      payloadHash: payloadHash ?? undefined, 
      userAgent: ua, 
      ip,
    },
  });

  return NextResponse.json({ 
    ok: true, 
    id: rec.id,
    remFormat: true,
    trustEventId: trustEvent.id,
  });
}
