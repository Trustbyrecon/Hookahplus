import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) return `${proto}://${host}`;
  // Fallback to NEXT_PUBLIC_APP_URL or localhost
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002").replace(/\/$/, "");
}

/**
 * GET /api/staff-panel/health
 *
 * Staff-readable health probe for QR lifecycle + resolver readiness.
 * - Verifies DB connectivity via a tiny query
 * - Checks resolver and QR minting endpoints are reachable (expects non-500)
 * - Returns most recent durable QR storage update (if available)
 */
export async function GET(req: NextRequest) {
  try {
    const origin = buildOrigin(req);

    // 1) DB check (cheap)
    const dbOk = await prisma.session
      .findFirst({ select: { id: true } })
      .then(() => true)
      .catch(() => false);

    // 2) Latest QR storage update (best-effort)
    const qrSetting = await prisma.orgSetting
      .findFirst({
        where: { category: "qr", isActive: true },
        orderBy: { updatedAt: "desc" },
        select: { key: true, updatedAt: true },
      })
      .catch(() => null);

    // 3) Endpoint reachability (best-effort)
    const resolverOk = await fetch(`${origin}/api/session/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loungeId: "health", tableId: "health", identityToken: "health" }),
      cache: "no-store",
    })
      .then((r) => r.status < 500)
      .catch(() => false);

    const mintOk = await fetch(`${origin}/api/admin/qr?loungeId=health&tableId=health&size=128&format=png`, {
      method: "GET",
      cache: "no-store",
    })
      .then((r) => r.status < 500)
      .catch(() => false);

    return NextResponse.json({
      ok: true,
      db: { ok: dbOk },
      resolver: { ok: resolverOk },
      qrMinting: { ok: mintOk },
      qrStorage: qrSetting
        ? { ok: true, key: qrSetting.key, updatedAt: qrSetting.updatedAt }
        : { ok: false },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[staff-panel/health] error", error);
    return NextResponse.json(
      { ok: false, error: "health_check_failed", details: error?.message || "unknown_error" },
      { status: 500 },
    );
  }
}

