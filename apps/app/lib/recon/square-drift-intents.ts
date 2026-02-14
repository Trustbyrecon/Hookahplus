import type { SquareDriftActionIntent } from "./contract";

export type SquareDriftIntentInput = {
  action_type: SquareDriftActionIntent["action_type"];
  lounge_id: string;
  tenant_id?: string | null;
  location_id?: string | null;
  window: { from: string; to: string };
  counts?: { expected?: number; observed?: number; delta?: number; delta_pct?: number };
  evidence?: { sample_ids?: string[]; reason?: string };
  risk_hints?: string[];
  severity?: "info" | "warning" | "critical";
  idempotency_key: string;
};

/**
 * Build a Recon drift ActionIntent from canonical DriftEvent fields.
 * Sandbox-first: intent is used to mint a signed artifact + decision.
 */
export function buildSquareDriftIntent(input: SquareDriftIntentInput): SquareDriftActionIntent {
  return {
    action_type: input.action_type,
    lounge_id: input.lounge_id,
    tenant_id: input.tenant_id ?? null,
    location_id: input.location_id ?? null,
    window: input.window,
    counts: input.counts,
    evidence: input.evidence,
    risk_hints: input.risk_hints ?? [],
    severity: input.severity ?? "warning",
    timestamp: new Date().toISOString(),
    idempotency_key: input.idempotency_key,
  };
}

