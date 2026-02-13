import { NextRequest, NextResponse } from "next/server";
import { processSquareRawEvents } from "../../../../lib/square/processor";
import { reconcileAndHealSquare } from "../../../../lib/square/reconcile";

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function isCronAuthorized(req: NextRequest): boolean {
  const token = getBearerToken(req);
  if (!token) return false;

  const cronSecret = process.env.CRON_SECRET;
  const processorToken = process.env.SQUARE_PROCESSOR_TOKEN;

  // Fail-closed if no secret configured.
  if (!cronSecret && !processorToken) return false;
  return token === cronSecret || token === processorToken;
}

async function handle(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing/invalid cron authorization" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const loungeId = searchParams.get("loungeId") || "";
  if (!loungeId) {
    return NextResponse.json({ error: "loungeId is required" }, { status: 400 });
  }

  // Stage 1: process webhook backlog (raw events → normalized rows)
  const processLimit = parseInt(searchParams.get("processLimit") || searchParams.get("limit") || "200", 10);
  const processed = await processSquareRawEvents(processLimit);

  // Stage 2: reconciliation fallback (truth pull + heal + intents + slack)
  const sinceMinutes = searchParams.get("sinceMinutes") ? Number(searchParams.get("sinceMinutes")) : 120;
  const orderLimit = searchParams.get("orderLimit") ? Number(searchParams.get("orderLimit")) : 50;

  const graceWindowMinutes = searchParams.get("graceWindowMinutes") ? Number(searchParams.get("graceWindowMinutes")) : 10;
  const cadenceMinutes = searchParams.get("cadenceMinutes") ? Number(searchParams.get("cadenceMinutes")) : 15;
  const suppressionWindowMinutes = searchParams.get("suppressionWindowMinutes")
    ? Number(searchParams.get("suppressionWindowMinutes"))
    : 60;

  const reconcileDeltaAlertMin = searchParams.get("reconcileDeltaAlertMin") ? Number(searchParams.get("reconcileDeltaAlertMin")) : 2;
  const reconcileDeltaPctAlertMin = searchParams.get("reconcileDeltaPctAlertMin")
    ? Number(searchParams.get("reconcileDeltaPctAlertMin"))
    : 1;
  const unassignedTicketAlertAfterRuns = searchParams.get("unassignedTicketAlertAfterRuns")
    ? Number(searchParams.get("unassignedTicketAlertAfterRuns"))
    : 2;

  const recon = await reconcileAndHealSquare({
    loungeId,
    sinceMinutes,
    limit: orderLimit,
    graceWindowMinutes,
    cadenceMinutes,
    suppressionWindowMinutes,
    unassignedTicketAlertAfterRuns,
    reconcileDeltaAlertMin,
    reconcileDeltaPctAlertMin,
  });

  return NextResponse.json({
    success: true,
    loungeId,
    process: processed,
    recon,
  });
}

/**
 * GET /api/square/reconcile
 * Bearer-protected cron endpoint:
 * - Processes raw Square webhook events
 * - Runs fallback reconciliation + heal + drift intents + Slack alerts
 */
export async function GET(req: NextRequest) {
  try {
    return await handle(req);
  } catch (error: any) {
    console.error("[Square Reconcile] Error:", error);
    return NextResponse.json(
      { error: "Failed to reconcile Square ingestion", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handle(req);
  } catch (error: any) {
    console.error("[Square Reconcile] Error:", error);
    return NextResponse.json(
      { error: "Failed to reconcile Square ingestion", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

