import { NextRequest, NextResponse } from "next/server";
import { hasRole } from "../../../../../lib/auth";
import { processSquareRawEvents } from "../../../../../lib/square/processor";
import { reconcileAndHealSquare } from "../../../../../lib/square/reconcile";
import { getReconcilePolicyDefaults } from "../../../../../lib/square/reconcile-policy";

type ReconcileNowBody = {
  loungeId?: string;
  loungeIds?: string[];
  sinceMinutes?: number;
  orderLimit?: number;
  processLimit?: number;
};

/**
 * POST /api/admin/pos/reconcile-now
 *
 * Protected operator action to manually run Square reconcile/heal.
 * - Dev: allowed without auth
 * - Prod: admin/owner required
 */
export async function POST(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== "production";
    const isAdmin = isDev ? true : await hasRole(req, ["admin", "owner"]);
    if (!isAdmin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const body = (await req.json().catch(() => ({}))) as ReconcileNowBody;
    const loungeIds = Array.from(
      new Set(
        [
          ...(typeof body.loungeId === "string" && body.loungeId.trim() ? [body.loungeId.trim()] : []),
          ...((Array.isArray(body.loungeIds) ? body.loungeIds : []).map((id) => (typeof id === "string" ? id.trim() : "")).filter(Boolean)),
        ].filter(Boolean),
      ),
    ).slice(0, 20);

    if (loungeIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "loungeId or loungeIds is required" },
        { status: 400 },
      );
    }

    const policyDefaults = getReconcilePolicyDefaults();
    const processLimitRaw = Number(body.processLimit ?? policyDefaults.processLimit);
    const processLimit = Number.isFinite(processLimitRaw)
      ? Math.max(10, Math.min(1000, processLimitRaw))
      : policyDefaults.processLimit;

    const sinceMinutesRaw = Number(body.sinceMinutes ?? policyDefaults.sinceMinutes);
    const sinceMinutes = Number.isFinite(sinceMinutesRaw)
      ? Math.max(5, Math.min(60 * 24 * 14, sinceMinutesRaw))
      : policyDefaults.sinceMinutes;

    const orderLimitRaw = Number(body.orderLimit ?? policyDefaults.orderLimit);
    const orderLimit = Number.isFinite(orderLimitRaw)
      ? Math.max(1, Math.min(200, orderLimitRaw))
      : policyDefaults.orderLimit;

    const processed = await processSquareRawEvents(processLimit);
    const perLounge = [] as Array<{ loungeId: string; ok: boolean; result?: unknown; error?: string }>;

    for (const loungeId of loungeIds) {
      try {
        const recon = await reconcileAndHealSquare({
          loungeId,
          sinceMinutes,
          limit: orderLimit,
          graceWindowMinutes: policyDefaults.graceWindowMinutes,
          cadenceMinutes: policyDefaults.cadenceMinutes,
          suppressionWindowMinutes: policyDefaults.suppressionWindowMinutes,
          unassignedTicketAlertAfterRuns: policyDefaults.unassignedTicketAlertAfterRuns,
          reconcileDeltaAlertMin: policyDefaults.reconcileDeltaAlertMin,
          reconcileDeltaPctAlertMin: policyDefaults.reconcileDeltaPctAlertMin,
          widenWindowMinutes: policyDefaults.widenWindowMinutes,
        });
        perLounge.push({ loungeId, ok: true, result: recon });
      } catch (error) {
        perLounge.push({
          loungeId,
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const failed = perLounge.filter((x) => !x.ok).length;
    return NextResponse.json({
      success: failed === 0,
      processed,
      policyDefaults,
      requestedLounges: loungeIds,
      perLounge,
      failed,
    });
  } catch (error) {
    console.error("[pos][reconcile-now] error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run reconcile now",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
