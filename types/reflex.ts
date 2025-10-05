// types/reflex.ts
// Agent Reflex Manifesto - Core Type Definitions

export type FailureType =
  | "blank" 
  | "hallucinated" 
  | "function_mismatch" 
  | "vague"
  | "context_drift" 
  | "guardrail_breach" 
  | "nondet_schema"
  | "unroutable_plan" 
  | "latency_collapse" 
  | "serialization_error"
  | "idempotency_violation" 
  | "propagation_leak" 
  | "downstream_incompat"
  | "privacy_breach" 
  | "score_regression";

export type Severity = "low" | "medium" | "critical";

export type RecoveryPotential = "auto" | "human" | "refactor";

export type OutputType = "text" | "json" | "code" | "tool";

export type GateDecision = "proceed" | "recover" | "halt";

export interface EnrichmentFingerprint {
  outputType: OutputType;
  signal: number;        // 0..1 semantic density / specificity
  domainMatch: number;   // 0..1 to active business domain
  reliability: number;   // rolling trust score 0..1
  timestamp: number;
  agentId: string;
  operationId: string;
}

export interface FailureAnalysis {
  type: FailureType;
  severity: Severity;
  confidence: number;    // 0..1 confidence in failure detection
  recoveryPotential: RecoveryPotential;
  propagationRisk: number; // 0..1 risk of affecting other operations
  fingerprint: EnrichmentFingerprint;
  context: Record<string, any>;
  suggestedPatch?: string;
  escalationRequired: boolean;
}

export interface ReflexScore {
  value: number;         // 0..1 overall reflex score
  components: {
    accuracy: number;    // 0..1 correctness of output
    completeness: number; // 0..1 completeness of response
    consistency: number; // 0..1 consistency with context
    efficiency: number;  // 0..1 efficiency of operation
    security: number;    // 0..1 security compliance
  };
  gateDecision: GateDecision;
  confidence: number;    // 0..1 confidence in score accuracy
  timestamp: number;
  agentId: string;
  operationId: string;
}

export interface GhostLogEntry {
  id: string;
  timestamp: number;
  agentId: string;
  operationId: string;
  route: string;
  action: string;
  score: number;
  failureType?: FailureType;
  patch?: string;
  outcome: "success" | "failure" | "recovery" | "escalation";
  fingerprint: EnrichmentFingerprint;
  context: Record<string, any>;
  escalationReason?: string;
  recoveryActions?: string[];
}

export interface TrustGraphNode {
  agentId: string;
  trustScore: number;    // 0..1 trust level
  lastInteraction: number;
  successRate: number;   // 0..1 historical success rate
  failurePatterns: FailureType[];
  capabilities: string[];
  connections: string[]; // connected agent IDs
}

export interface TrustGraphEdge {
  from: string;
  to: string;
  trustScore: number;
  relationship: "high_confidence" | "needs_guidance" | "escalated" | "collaborative";
  lastVerified: number;
  interactionCount: number;
  successRate: number;
}

export interface ReflexContext {
  agentId: string;
  operationId: string;
  route: string;
  startTime: number;
  maxLatency?: number;
  requiredPermissions?: string[];
  criticalPath: boolean;
  fallbackActions?: string[];
}

export interface ReflexResult<T = any> {
  data?: T;
  score: ReflexScore;
  failures: FailureAnalysis[];
  ghostLogEntry: GhostLogEntry;
  trustUpdates: TrustGraphNode[];
  nextActions: string[];
  requiresHumanReview: boolean;
}

// Badge-specific reflex types
export interface BadgeReflexContext extends ReflexContext {
  profileId: string;
  venueId?: string;
  badgeId?: string;
  operationType: "evaluate" | "award" | "progress" | "export" | "audit";
}

export interface BadgeReflexResult<T = any> extends ReflexResult<T> {
  badgeOperation: {
    type: string;
    profileId: string;
    venueId?: string;
    badgeId?: string;
    success: boolean;
    dataQuality: number;
    securityCompliance: number;
  };
}

// API-specific reflex types
export interface APIReflexContext extends ReflexContext {
  endpoint: string;
  method: string;
  requestId: string;
  userId?: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface APIReflexResult<T = any> extends ReflexResult<T> {
  apiOperation: {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    dataIntegrity: number;
    securityCompliance: number;
  };
}
