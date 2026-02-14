/**
 * Recon Execution Architecture — Shared contract types.
 * H+ and Recon both consume these; no Stripe or executor logic here.
 */

export const ACTION_TYPES = [
  "refund.request",
  // Drift intents (Square): Recon-native anomaly promotion (sandbox-first).
  "recon.square.unassigned_ticket",
  "recon.square.reconciliation_drop",
  "recon.square.payment_mismatch",
  "recon.square.refund_mismatch",
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export type InitiatorType = "human" | "ai";

/** Request: H+ → Recon */
export type ActionIntent = RefundActionIntent | SquareDriftActionIntent;

export interface RefundActionIntent {
  action_type: "refund.request";
  amount: number; // cents
  session_id: string;
  lounge_id: string;
  initiator_type: InitiatorType;
  initiator_id: string;
  session_total: number; // cents
  session_duration_min: number;
  refund_reason?: string;
  historical_refund_rate?: number;
  operator_refund_rate?: number;
  timestamp: string; // ISO 8601
  idempotency_key: string;
  payment_intent_id?: string; // Stripe PI for refund
}

export interface SquareDriftActionIntent {
  action_type:
    | "recon.square.unassigned_ticket"
    | "recon.square.reconciliation_drop"
    | "recon.square.payment_mismatch"
    | "recon.square.refund_mismatch";
  lounge_id: string;
  tenant_id?: string | null;
  location_id?: string | null;
  window: { from: string; to: string };
  counts?: { expected?: number; observed?: number; delta?: number; delta_pct?: number };
  evidence?: { sample_ids?: string[]; reason?: string };
  risk_hints?: string[];
  severity?: "info" | "warning" | "critical";
  timestamp: string; // ISO 8601
  idempotency_key: string;
}

/** Decision from policy core */
export const DECISIONS = [
  "ALLOW",
  "ALLOW_WITH_REDUCTION",
  "BLOCK",
  "ESCALATE",
] as const;
export type Decision = (typeof DECISIONS)[number];

/** When Recon executes refund (REFUND_EXECUTOR=recon) */
export interface ExecutionMetadata {
  execution_status: "completed" | "failed";
  stripe_refund_id?: string;
  error?: string;
}

/** Response: Recon → H+ */
export interface ReconDecisionResponse {
  decision: Decision;
  signed_artifact_id: string;
  execution_metadata?: ExecutionMetadata;
  /** When ALLOW_WITH_REDUCTION, suggested amount (e.g. cents) */
  adjusted_amount?: number;
}

/** Operating mode for policy core */
export type ReconMode = 0 | 1 | 2;
// 0 = FULL (future: supervisor + micro-policies)
// 1 = DEGRADED (deterministic only, medium+ → escalate)
// 2 = HALT (block money-moving)
