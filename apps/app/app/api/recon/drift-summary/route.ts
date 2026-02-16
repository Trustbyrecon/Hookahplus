import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/recon/drift-summary?action_type=recon.session.multi_active&hours=24
 * Returns: { ok: true, count: number, items: Array<...> }
 *
 * Read-only staff cockpit helper. Keeps drift surfaces actionable without exposing
 * full Recon executor internals.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const actionType = (searchParams.get("action_type") || "recon.session.multi_active").trim();
    const hours = Math.max(1, Math.min(168, Number(searchParams.get("hours") || "24") || 24)); // clamp 1h..7d
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const rows = await prisma.driftEvent.findMany({
      where: {
        action_type: actionType,
        created_at: { gte: since },
      },
      orderBy: { created_at: "desc" },
      take: 25,
      select: {
        id: true,
        action_type: true,
        lounge_id: true,
        location_id: true,
        severity: true,
        created_at: true,
        evidence: true,
        idempotency_key: true,
      },
    });

    return NextResponse.json({
      ok: true,
      action_type: actionType,
      hours,
      count: rows.length,
      items: rows.map((r) => ({
        id: r.id,
        action_type: r.action_type,
        loungeId: r.lounge_id,
        tableId: r.location_id,
        severity: r.severity,
        createdAt: r.created_at,
        evidence: r.evidence,
        idempotencyKey: r.idempotency_key,
        resolutionPath:
          r.lounge_id && r.location_id
            ? `/admin/pos-ops?loungeId=${encodeURIComponent(r.lounge_id)}&tableId=${encodeURIComponent(r.location_id)}`
            : null,
      })),
    });
  } catch (error: any) {
    console.error("[recon/drift-summary] error", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load drift summary",
        details: error?.message || "unknown_error",
      },
      { status: 500 },
    );
  }
}

