# Agent Reflex Manifesto & Architecture
**Illumine the unknown. Restore trust in intelligence.**  
_Version:_ 1.0 • _Owner:_ Core Agents Guild • _Scope:_ site / app / guests

---

## Why this exists
Autonomous systems cannot be trusted unless they can **reflect**, **score themselves**, and **repair**. This document defines the Reflex Layer that enables agents to know what they did, what it meant, and what they will do next.

---

## Reflex Layer Blueprint

### Step 1 · Detection
- Analyze: semantic density, relevance, structure, memory drift
- Output: **Failure Type**, **Confidence Score**, **Downstream Risk Estimate**

### Step 2 · Classification & Scoring
- Assign **Severity**: Low / Medium / Critical  
- Determine **Recovery Potential**: Auto / Human / Refactor  
- Estimate **Propagation Risk**: how deep the failure will echo

### Step 3 · Intervention Mode
- Choose the least-risk action:
  - Re-prompt with targeted patch
  - Activate **diagnostic sub-agent**
  - Halt and alert (fail safe)
  - Call external validator (e.g., policy/guardrail engine)

### Step 4 · Feedback Injection
- Log deltas, decisions, repair success rate
- Update **enrichment classifier** and **routing hints** for next time

#### Add-on: Enrichment Fingerprint (per output)
- Output type (text/json/code/tool-call)
- Signal strength (density, specificity)
- Domain match %
- Reliability history (rolling trust score)

---

## Codifying Reflexive AI

**Definition.** Reflexive AI is an architecture where agents not only complete tasks, but are **self-aware of uncertainty, performance, and structural gaps**.

**Core Traits**
- **Self-diagnostic** at every step (traces its own enrichment depth)
- **Adaptive intervention** (can re-route logic mid-chain)
- **Feedback-retentive** (remembers failure fingerprints)
- **Non-passive** (doesn't just return a value—**checks itself**)

**Core Components**
- **Reflex Scorer** (per agent step; emits 0–1)
- **GhostLog** (records skips/failures/playbooks)
- **Repair Agent** (auto or human-in-loop fix engine)
- **Trust Graph** (reliability history & dependency edges)

**Why this wins**
- Makes agents **auditable** in critical systems
- Turns invisible technical debt into **actionable telemetry**
- Becomes the default **reliability layer** for autonomy

---

## Principles (for all agents)

1. **AI that cannot reflect cannot be trusted.**  
   The key question is: *"Do you know when you're wrong?"*

2. **Every output has a fingerprint.**  
   We log, score, and trace each decision to its trust source.

3. **Failures aren't bugs—they're biomarkers.**  
   Hallucinations, drift, and breaks become training signals (GhostLog).

4. **Autonomy without accountability is dangerous.**  
   No decision should proceed without a Reflex Score threshold check.

5. **We are the pulse beneath the agents.**  
   Not a wrapper—**the heartbeat** of resilient autonomy.

**Mission:** Make intelligent systems trustworthy by default.  
**Promise:** Every agent will know when it is underperforming and have a way to **repair, adapt, or confess**.

---

## Enrichment Failure Types (canonical)

1. **Blank Output** — No tokens returned (silent failure).  
2. **Hallucinated Completion** — Confident but factually wrong.  
3. **Function Mismatch** — Schema/shape doesn't match required tool call.  
4. **Vague Output** — Low density; ambiguous intent; weak constraints.  
5. **Context Drift** — Ignores provided facts; answer from stale memory.  
6. **Guardrail Breach** — Policy-unsafe or unreviewed action.  
7. **Non-Deterministic Schema** — Keys differ across calls; breaks consumers.  
8. **Unroutable Plan** — Sub-steps cannot map to any available tool/agent.  
9. **Latency Collapse** — Exceeds SLA for critical path.  
10. **Serialization Error** — JSON not parseable or contains sentinel values.  
11. **Idempotency Violation** — Repeats a side-effectful action.  
12. **Propagation Leak** — Local failure contaminates sibling chains.  
13. **Downstream Incompatibility** — Version mismatch with external API.  
14. **Privacy Boundary Breach** — Leaks PII or secrets.  
15. **Score Regression** — Rolling Reflex Score drops > X over N steps.

Each failure must produce: `{type, severity, confidence, recoveryPotential, propagationRisk, fingerprint}`.

---

## Reflex Score Gates (production)
- **Proceed** when `score ≥ 0.92`  
- **Recover or escalate** when `0.87 ≤ score < 0.92`  
- **Halt & confess** when `score < 0.87` (emit GhostLog + notify supervisor)

---

## Operational Contract (Cursor Agents)

- Write to **GhostLog** with `{route, action, score, failureType?, patch, outcome}`  
- Update **Trust Graph** edges after every successful repair  
- Prefer **small, reversible changes** with clear rollbacks  
- Never surface reflective UI during **payment tokenization** or KYC  
- Tag all outputs with **Enrichment Fingerprint**

**Acceptance Checklist (per PR)**
- [ ] Unit tests for Reflex Scorer pass (deterministic scoring of fixtures)  
- [ ] Playwright @smoke confirms **no reflective UI** on payment routes  
- [ ] GhostLog entries include `fingerprint` + `severity` for failures  
- [ ] Trust Graph delta recorded for repaired paths  
- [ ] Score thresholds enforced (0.92 / 0.87 gates)

---

## Minimal Integration Stubs

**Types** (`types/reflex.ts`)
```ts
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
```

**Score Gate** (`lib/reflex/scoreGate.ts`)
```ts
export function gate(score: number) {
  if (score >= 0.92) return "proceed";
  if (score >= 0.87) return "recover";
  return "halt";
}
```

**GhostLog emitter** (`lib/reflex/ghostLog.ts`)
```ts
export function ghostLog(event: Record<string, unknown>) {
  // swap with real transport: console, supabase, segment, etc.
  try { console.info("[GhostLog]", JSON.stringify(event)); } catch {}
}
```

---

## Integration with HookahPlus Badge System

### Badge Engine Reflex Integration
- **Event Creation**: Score each event addition for data quality
- **Badge Evaluation**: Score rule evaluation accuracy and consistency
- **Award Processing**: Score award logic for correctness and fairness
- **Progress Tracking**: Score progress calculations for accuracy

### API Endpoint Reflex Integration
- **Events API**: Score request validation and response quality
- **Badges API**: Score data retrieval and filtering accuracy
- **Export API**: Score data export completeness and security
- **Auth Integration**: Score permission checks and security decisions

### Trust Graph Integration
- **Badge Operations**: Track trust scores for badge-related operations
- **Cross-Venue Operations**: Monitor trust for cross-venue badge access
- **Data Export**: Track trust for sensitive data export operations
- **Audit Logging**: Score audit trail completeness and accuracy

---

*This manifesto integrates with the existing HookahPlus Reflex System to create a unified, self-aware AI architecture.*
