/**
 * Recon Execution Architecture — Shared contract types.
 * H+ and Recon both consume these; no Stripe or executor logic here.
 */

export const ACTION_TYPES = ["refund.request"] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export type InitiatorType = "human" | "ai";

/** Request: H+ → Recon */
export interface ActionIntent {
  action_type: ActionType;
  amount: number; // cents or dollars (document which in API_CONTRACT)
  session_id: string;
  lounge_id: string;
  initiator_type: InitiatorType;
  initiator_id: string;
  session_total: number;
  session_duration_min: number;
  refund_reason?: string;
  historical_refund_rate?: number;
  operator_refund_rate?: number;
  timestamp: string; // ISO 8601
  idempotency_key: string;
  payment_intent_id?: string; // Stripe PI for refund
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
