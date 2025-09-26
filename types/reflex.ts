export type FailureType =
  | "blank" | "hallucinated" | "function_mismatch" | "vague"
  | "context_drift" | "guardrail_breach" | "nondet_schema"
  | "unroutable_plan" | "latency_collapse" | "serialization_error"
  | "idempotency_violation" | "propagation_leak" | "downstream_incompat"
  | "privacy_breach" | "score_regression";

export interface EnrichmentFingerprint {
  outputType: "text" | "json" | "code" | "tool";
  signal: number;        // 0..1 semantic density / specificity
  domainMatch: number;   // 0..1 to active business domain
  reliability: number;   // rolling trust score 0..1
}

export interface ReflexEvent {
  route: string;
  action: string;
  score: number;
  failureType?: FailureType;
  patch?: string;
  outcome: "proceed" | "recover" | "halt";
  fingerprint: EnrichmentFingerprint;
  timestamp: string;
  severity: "low" | "medium" | "critical";
}

export interface ReflexScore {
  value: number;         // 0..1 overall confidence
  components: {
    semanticDensity: number;    // 0..1 how specific/detailed
    relevance: number;          // 0..1 how well it matches context
    structure: number;          // 0..1 how well-formed the output
    memoryConsistency: number;  // 0..1 how consistent with history
  };
  failureType?: FailureType;
  confidence: number;    // 0..1 how confident we are in this score
  downstreamRisk: number; // 0..1 how much this could break other things
}

export interface TrustGraphNode {
  id: string;
  type: "agent" | "route" | "tool" | "data";
  reliability: number;   // 0..1 rolling average
  lastUpdated: string;
  failureCount: number;
  successCount: number;
  dependencies: string[]; // IDs of nodes this depends on
}

export interface RepairAction {
  type: "re_prompt" | "diagnostic" | "halt" | "external_validation";
  target: string;        // what to repair
  patch?: string;        // specific fix to apply
  confidence: number;    // 0..1 how likely this will work
  rollback?: string;     // how to undo if it fails
}
