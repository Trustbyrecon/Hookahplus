import { NextRequest, NextResponse } from "next/server";

function isRemLikePayload(payload: any): boolean {
  if (!payload || typeof payload !== "object") return false;
  const actor = (payload as any).actor;
  const effect = (payload as any).effect;
  const security = (payload as any).security;
  return (
    actor &&
    typeof actor === "object" &&
    typeof actor.anon_hash === "string" &&
    effect &&
    typeof effect === "object" &&
    typeof effect.credit_type === "string" &&
    security &&
    typeof security === "object" &&
    typeof security.signature === "string"
  );
}

function getTrustEventId(body: any): string {
  const payload = body?.payload;
  const candidate =
    typeof payload?.id === "string"
      ? payload.id
      : typeof body?.trustEventId === "string"
        ? body.trustEventId
        : undefined;

  if (candidate && candidate.length > 0) return candidate;

  const year = new Date().getUTCFullYear();
  return `TE-${year}-${Date.now()}`;
}

/**
 * POST /api/reflex/track
 *
 * Lightweight tracking endpoint for REM/TrustEvents.
 * For MVP + CI smoke usage, we accept the event and return whether the payload
 * appears REM-like, plus a `trustEventId`.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const trustEventId = getTrustEventId(body);
    const remFormat = isRemLikePayload(body?.payload);

    return NextResponse.json({
      ok: true,
      trustEventId,
      remFormat,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        remFormat: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
