import { NextRequest, NextResponse } from "next/server";
import { hasRole } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { getEffectiveReconcilePolicy, getReconcilePolicyDefaults } from "../../../../../lib/square/reconcile-policy";

/**
 * GET /api/admin/pos/reconcile-status
 *
 * Lightweight status endpoint for operator confidence:
 * - last reconcile cursor/run metadata per lounge
 * - last 24h drift intent counts per lounge
 *
 * Query:
 * - loungeId?: string
 * - loungeIds?: comma-separated list
 */
export async function GET(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== "production";
    const isAdmin = isDev ? true : await hasRole(req, ["admin", "owner"]);
    if (!isAdmin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const one = searchParams.get("loungeId");
    const many = (searchParams.get("loungeIds") || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const loungeIds = Array.from(new Set([...(one ? [one.trim()] : []), ...many])).slice(0, 25);

    if (loungeIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "loungeId or loungeIds is required" },
        { status: 400 },
      );
    }

    const now = Date.now();
    const since24h = new Date(now - 24 * 60 * 60 * 1000);
    const policyDefaults = getReconcilePolicyDefaults();

    const cursors = (prisma as any)?.squareReconCursor?.findMany
      ? await (prisma as any).squareReconCursor.findMany({
          where: { loungeId: { in: loungeIds } },
          select: {
            loungeId: true,
            lastRunId: true,
            lastWindowTo: true,
            updatedAt: true,
          },
        })
      : [];

    const driftEvents = (prisma as any)?.driftEvent?.findMany
      ? await (prisma as any).driftEvent.findMany({
          where: {
            lounge_id: { in: loungeIds },
            created_at: { gte: since24h },
            action_type: { startsWith: "recon.square." },
          },
          select: {
            lounge_id: true,
            action_type: true,
            severity: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
          take: 500,
        })
      : [];

    const cursorByLounge = new Map<string, any>();
    for (const c of cursors) cursorByLounge.set(c.loungeId, c);

    const driftByLounge = new Map<
      string,
      {
        total24h: number;
        critical24h: number;
        warning24h: number;
        byActionType: Record<string, number>;
        latestActionType: string | null;
        latestActionAt: Date | null;
      }
    >();

    for (const loungeId of loungeIds) {
      driftByLounge.set(loungeId, {
        total24h: 0,
        critical24h: 0,
        warning24h: 0,
        byActionType: {},
        latestActionType: null,
        latestActionAt: null,
      });
    }

    for (const event of driftEvents) {
      const loungeId = typeof event.lounge_id === "string" ? event.lounge_id : "";
      if (!loungeId || !driftByLounge.has(loungeId)) continue;
      const bucket = driftByLounge.get(loungeId)!;
      bucket.total24h += 1;
      if (event.severity === "critical") bucket.critical24h += 1;
      if (event.severity === "warning") bucket.warning24h += 1;
      if (typeof event.action_type === "string" && event.action_type) {
        bucket.byActionType[event.action_type] = (bucket.byActionType[event.action_type] || 0) + 1;
        if (!bucket.latestActionType) {
          bucket.latestActionType = event.action_type;
          bucket.latestActionAt = event.created_at instanceof Date ? event.created_at : null;
        }
      }
    }

    const lounges = loungeIds.map((loungeId) => {
      const cursor = cursorByLounge.get(loungeId) || null;
      const drift = driftByLounge.get(loungeId)!;
      const { policy: effectivePolicy, hasOverride } = getEffectiveReconcilePolicy(loungeId);
      return {
        loungeId,
        hasPolicyOverride: hasOverride,
        effectivePolicy,
        lastRunId: cursor?.lastRunId || null,
        lastWindowTo: cursor?.lastWindowTo || null,
        updatedAt: cursor?.updatedAt || null,
        drift24h: {
          total24h: drift.total24h,
          critical24h: drift.critical24h,
          warning24h: drift.warning24h,
          byActionType: drift.byActionType,
          latestActionType: drift.latestActionType,
          latestActionAt: drift.latestActionAt,
        },
      };
    });

    return NextResponse.json({
      success: true,
      generatedAt: new Date(now).toISOString(),
      policyDefaults,
      lounges,
    });
  } catch (error) {
    console.error("[pos][reconcile-status] error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reconcile status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
