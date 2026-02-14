/**
 * H+ refund path: build ActionIntent, get Recon decision, then branch on REFUND_EXECUTOR.
 * - hookahplus: H+ calls Stripe when decision is ALLOW/ALLOW_WITH_REDUCTION, then updates session.
 * - recon: do not call Stripe; use execution_metadata from Recon to update session.
 * Uses same idempotency_key for Recon and H+ so retries do not double-execute.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SessionState } from "@prisma/client";
import { getCurrentUser, getCurrentTenant } from "@/lib/auth";
import { runPolicyCore } from "@/lib/recon/policy-core";
import { executeRefund } from "@/lib/recon/payment-executor";
import type { ActionIntent, ReconDecisionResponse } from "@/lib/recon/contract";
import { getStripe } from "@/lib/stripeServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REFUND_EXECUTOR_ENV = "REFUND_EXECUTOR";
const BREAK_GLASS_ENV = "BREAK_GLASS_REFUND_EXECUTOR";

/** In production, REFUND_EXECUTOR must be recon unless break-glass is set. See SECURITY_BOUNDARY.md */
function enforceProductionGuardrail(): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;
  const executor = process.env[REFUND_EXECUTOR_ENV] ?? "hookahplus";
  if (executor === "recon") return null;
  const breakGlass = process.env[BREAK_GLASS_ENV];
  if (breakGlass === "1" || breakGlass === "true") return null;
  return NextResponse.json(
    {
      error: "Refund executor guardrail",
      message: "In production, REFUND_EXECUTOR must be recon. Set BREAK_GLASS_REFUND_EXECUTOR=1 only for documented break-glass.",
    },
    { status: 403 }
  );
}

function getIdempotencyKey(req: NextRequest, sessionId: string, amountCents: number): string {
  const header = req.headers.get("Idempotency-Key")?.trim();
  if (header) return header;
  return `refund:${sessionId}:${amountCents}:${Date.now()}`;
}

function sessionDurationMin(session: { startedAt: Date | null; endedAt: Date | null; durationSecs: number | null }): number {
  if (session.durationSecs != null && session.durationSecs >= 0) {
    return Math.floor(session.durationSecs / 60);
  }
  if (session.startedAt && session.endedAt) {
    const ms = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
    return Math.max(0, Math.floor(ms / 60000));
  }
  return 0;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const user = await getCurrentUser(req);
    const tenantId = await getCurrentTenant(req);
    if (!user || !tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guardrail = enforceProductionGuardrail();
    if (guardrail) return guardrail;

    const dbSession = await prisma.session.findFirst({
      where: {
        OR: [{ id: sessionId }, { externalRef: sessionId }],
      },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (dbSession.tenantId && dbSession.tenantId !== tenantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: { amount_cents?: number; refund_reason?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const amountCents = body.amount_cents ?? dbSession.priceCents ?? 0;
    if (amountCents <= 0) {
      return NextResponse.json(
        { error: "Invalid amount_cents (must be positive)" },
        { status: 400 }
      );
    }

    const sessionTotal = dbSession.priceCents ?? 0;
    const idempotencyKey = getIdempotencyKey(req, dbSession.id, amountCents);

    const intent: ActionIntent = {
      action_type: "refund.request",
      amount: amountCents,
      session_id: dbSession.id,
      lounge_id: dbSession.loungeId,
      initiator_type: "human",
      initiator_id: user.id,
      session_total: sessionTotal,
      session_duration_min: sessionDurationMin(dbSession),
      refund_reason: body.refund_reason,
      timestamp: new Date().toISOString(),
      idempotency_key: idempotencyKey,
      payment_intent_id: dbSession.paymentIntent ?? undefined,
    };

    const response: ReconDecisionResponse = await runPolicyCore(intent);
    const executor = process.env[REFUND_EXECUTOR_ENV] ?? "hookahplus";

    if (executor === "recon" && (response.decision === "ALLOW" || response.decision === "ALLOW_WITH_REDUCTION")) {
      const execResult = await executeRefund({
        intent,
        adjusted_amount: response.adjusted_amount,
      });
      response.execution_metadata = execResult;
    }

    if (response.decision === "BLOCK" || response.decision === "ESCALATE") {
      return NextResponse.json(
        {
          error: "Refund not allowed",
          decision: response.decision,
          signed_artifact_id: response.signed_artifact_id,
        },
        { status: 403 }
      );
    }

    if (response.decision === "ALLOW" || response.decision === "ALLOW_WITH_REDUCTION") {
      const amountToRefund = response.adjusted_amount ?? amountCents;
      let stripeRefundId: string | null = null;

      if (executor === "hookahplus") {
        const paymentIntentId = dbSession.paymentIntent;
        if (!paymentIntentId) {
          return NextResponse.json(
            { error: "Session has no payment_intent; cannot refund via Stripe" },
            { status: 400 }
          );
        }
        try {
          const stripe = getStripe();
          const refund = await stripe.refunds.create(
            {
              payment_intent: paymentIntentId,
              amount: amountToRefund,
              reason: "requested_by_customer",
            },
            { idempotencyKey }
          );
          stripeRefundId = refund.id;
        } catch (stripeErr: unknown) {
          const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
          return NextResponse.json(
            { error: "Stripe refund failed", details: msg },
            { status: 502 }
          );
        }
      } else {
        const meta = response.execution_metadata;
        if (meta?.execution_status === "failed") {
          return NextResponse.json(
            {
              error: "Recon refund execution failed",
              details: meta.error,
              signed_artifact_id: response.signed_artifact_id,
            },
            { status: 502 }
          );
        }
        stripeRefundId = response.execution_metadata?.stripe_refund_id ?? null;
      }

      await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          state: SessionState.CANCELED,
          stage: "REFUNDED",
          action: "REFUNDED",
          tableNotes: dbSession.tableNotes
            ? `${dbSession.tableNotes}\n[${new Date().toISOString()}] REFUNDED (Recon: ${response.decision}${stripeRefundId ? `, Stripe: ${stripeRefundId}` : ""})`
            : `[${new Date().toISOString()}] REFUNDED (Recon: ${response.decision})`,
          endedAt: dbSession.endedAt ?? new Date(),
        } as any,
      });
    }

    return NextResponse.json({
      success: true,
      decision: response.decision,
      signed_artifact_id: response.signed_artifact_id,
      execution_metadata: response.execution_metadata,
    });
  } catch (e) {
    console.error("[Refund API] Error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
