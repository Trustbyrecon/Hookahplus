/**
 * Recon policy core: deterministic rules, mode selection, artifact write.
 * No Stripe calls. Executor (payment-executor) is invoked separately when REFUND_EXECUTOR=recon.
 */

import type {
  ActionIntent,
  Decision,
  ReconDecisionResponse,
  ReconMode,
} from "./contract";
import { appendArtifact } from "./artifact-store";

const POLICY_VERSION = "v1";

function getMode(): ReconMode {
  const raw = process.env.RECON_MODE;
  if (raw === "1") return 1;
  if (raw === "2") return 2;
  return 0;
}

/**
 * Deterministic refund rules (v1). Returns decision and optional adjusted amount.
 */
function evaluateRefundRequest(intent: ActionIntent): {
  decision: Decision;
  adjusted_amount?: number;
} {
  const {
    amount,
    session_total,
    session_duration_min,
    operator_refund_rate,
    historical_refund_rate,
  } = intent;

  // All amounts in same unit (assume cents or dollars consistently; plan said "amount" - use numeric comparison)
  const pctOfSession = session_total > 0 ? amount / session_total : 1;

  // Escalate: refund > 50% of session total
  if (pctOfSession > 0.5) {
    return { decision: "ESCALATE" };
  }

  // Escalate: refund > $100 (amount in cents: 10000)
  if (amount > 10000) {
    return { decision: "ESCALATE" };
  }

  // Escalate: operator refund rate > 2x baseline (e.g. historical)
  const baseline = historical_refund_rate ?? 0.1;
  if (
    operator_refund_rate != null &&
    baseline > 0 &&
    operator_refund_rate > baseline * 2
  ) {
    return { decision: "ESCALATE" };
  }

  // Escalate: session < 15 min and refund > $40 (4000 cents)
  if (session_duration_min < 15 && amount > 4000) {
    return { decision: "ESCALATE" };
  }

  // Allow (optionally with reduction in future; v1 no reduction)
  return { decision: "ALLOW" };
}

function evaluateSquareDrift(intent: ActionIntent): { decision: Decision } {
  // Sandbox-first: drift intents are never money-moving. We treat them as policy artifacts
  // to drive a Recon review loop. For now, default to ESCALATE for any drift surface.
  // (Heals are executed separately in the reconcile loop, and are idempotent.)
  if (intent.action_type.startsWith("recon.square.")) {
    return { decision: "ESCALATE" };
  }
  return { decision: "ESCALATE" };
}

/**
 * Run policy core: validate intent, apply mode, run deterministic rules, write artifact, return response.
 * Does NOT call Stripe. When REFUND_EXECUTOR=recon, the caller (API route) will call payment-executor after.
 */
export async function runPolicyCore(
  intent: ActionIntent
): Promise<ReconDecisionResponse> {
  const mode = getMode();

  // Mode 2: halt all money-moving
  if (mode === 2) {
    const artifact_id = await appendArtifact({
      intent,
      decision: "BLOCK",
      mode: 2,
      policy_version: POLICY_VERSION,
    });
    return {
      decision: "BLOCK",
      signed_artifact_id: artifact_id,
    };
  }

  const isRefund = intent.action_type === "refund.request";
  const isSquareDrift = intent.action_type.startsWith("recon.square.");

  const { decision, adjusted_amount } = isRefund
    ? evaluateRefundRequest(intent)
    : isSquareDrift
      ? evaluateSquareDrift(intent)
      : { decision: "BLOCK" as const };

  // Mode 1 (DEGRADED): medium+ → escalate (we already escalate in rules; no supervisor)
  // So in mode 1 we could tighten: e.g. any non-trivial refund → ESCALATE. For now keep same rules.
  const finalDecision =
    mode === 1 && (decision === "ALLOW" || decision === "ALLOW_WITH_REDUCTION")
      ? decision
      : decision;

  const artifact_id = await appendArtifact({
    intent,
    decision: finalDecision,
    mode,
    policy_version: POLICY_VERSION,
  });

  const response: ReconDecisionResponse = {
    decision: finalDecision,
    signed_artifact_id: artifact_id,
  };
  if (isRefund && adjusted_amount != null) response.adjusted_amount = adjusted_amount;
  return response;
}
