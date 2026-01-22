# HookahPlus Agent First-Week Roster (Cursor Personas)

This roster assigns each agent a **tight first-week scope** with concrete deliverables, definitions of done (DoD), and the exact repo “homebase” where work starts.

## Shared week-1 definition of done (all agents)

- No raw phone/email is logged; only `hidPrefix`, hashes, or last4 when necessary.
- Any webhook-like flow is **idempotent** and safe under retries.
- Each deliverable has an **evidence trail** (tests, logs, or admin endpoint output).
- Any change that touches user data has a privacy review by `Care.DPO`.

## Astra.SessionOS (Senior Full-Stack: session + payments invariants)

**Homebase**
- `apps/app/app/api/sessions/route.ts`
- `apps/app/lib/hid/resolver.ts`
- `apps/app/lib/profiles/network.ts`
- `apps/app/app/api/payments/` and `apps/app/app/api/webhooks/stripe/route.ts`
- `apps/app/app/api/admin/reconciliation/route.ts`

**Week 1 deliverables**
- **D1: Invariant evidence contract**: document and enforce “One Order ⇒ One Session ⇒ One HID trail” with explicit failure reasons captured in logs/telemetry.
  - **DoD**: session-create path emits success/failure signals for HID resolve + network sync without leaking PII.
- **D2: Payment linkage sanity**: ensure payment events can be tied deterministically to a session/order (retry-safe).
  - **DoD**: Stripe webhook handler is idempotent; repeated events do not create duplicate orders/sessions.
- **D3: Drift detection**: create or extend a reconciliation endpoint/job to surface:
  - sessions missing `hid`
  - network session missing for a session
  - duplicate order/session anomalies across retries
  - **DoD**: `GET/POST` to `apps/app/app/api/admin/reconciliation/route.ts` returns actionable counts and sample IDs.
- **D4: Backfill path**: best-effort backfill for missing HID/network sync (safe under concurrency).
  - **DoD**: backfill can run repeatedly without creating duplicates.

## Kestrel.QA (QA Automation + Release Gates)

**Homebase**
- `apps/app/lib/hid/resolver.test.ts`
- `apps/app/vitest.config.ts`
- `cypress/`
- `.github/workflows/`
- `apps/app/app/api/test-session/` (smoke/golden-path endpoints)

**Week 1 deliverables**
- **D1: Moat gate checklist**: define “merge blockers” as tests: session-create, HID resolve, network sync, payment webhook retry behavior.
  - **DoD**: checklist lives in `agents/` and maps to tests/endpoints.
- **D2: Golden-path E2E** (minimal, stable): create-session with phone/email → HID resolved → network sync attempted → session visible/consistent.
  - **DoD**: CI-friendly; fails fast; no flake.
- **D3: Fault-path tests**: retry webhook event; DB timeout; network sync failure should not break session-create.
  - **DoD**: “non-blocking” behavior verified.

## Lumen.Design (Operator UX rail)

**Homebase**
- Operator UI components under `apps/app/` (dashboards/components)
- API contracts:
  - `apps/app/app/api/sessions/route.ts`
  - `apps/app/app/api/session/notes/route.ts`
  - `apps/app/app/api/profiles/[hid]/route.ts`

**Week 1 deliverables**
- **D1: Operator rail spec**: session start → mix → pay → notes as a single rail with minimal branching.
  - **DoD**: spec includes required fields + “cannot proceed” rules aligned to invariants.
- **D2: Recovery states**: designs for sync failed, payment retry, printer failure, offline-ish states.
  - **DoD**: each recovery state specifies what staff sees and what action preserves invariants.
- **D3: Identity-safe UI signals**: “Session linked” indicator without exposing PII.
  - **DoD**: includes copy rules (no phone/email display by default).

## Harbor.LoungeSuccess (Pilot ops + onboarding)

**Homebase**
- `apps/app/QUICK_START_LOCAL.md`
- `apps/app/GUEST_SYNC_DIAGNOSIS.md`
- `apps/app/app/api/launchpad/` (onboarding flow)
- `apps/app/app/api/admin/operator-onboarding/route.ts`

**Week 1 deliverables**
- **D1: Pilot onboarding checklist** (Day 0 → Day 14).
  - **DoD**: checklist maps to specific screens/endpoints and success criteria.
- **D2: Training script + failure-mode playbook** for staff.
  - **DoD**: includes the top 10 “what staff does under pressure” mistakes and prevention.
- **D3: Feedback capture loop**: structured weekly report template that becomes engineering tasks.
  - **DoD**: template includes severity, reproducibility, impacted invariant, and evidence links.

## Anvil.Integrations (POS adapters + webhooks)

**Homebase**
- `apps/app/lib/pos/` (notably `webhook-framework.ts`, `sync-service.ts`)
- POS webhooks:
  - `apps/app/app/api/webhooks/pos/square/route.ts`
  - `apps/app/app/api/webhooks/pos/toast/route.ts`
  - `apps/app/app/api/webhooks/pos/clover/route.ts`
- Vendor posture: `agents/Sentinel.POS.md`

**Week 1 deliverables**
- **D1: Adapter harness**: a consistent way to replay webhook payloads locally and in CI (idempotency-focused).
  - **DoD**: replaying the same payload N times yields the same DB outcome.
- **D2: “One adapter hardened”**: pick one (Square/Toast/Clover) and implement strict idempotency + replay protection.
  - **DoD**: duplicates across retries are provably prevented.
- **D3: Integration DLQ triage**: define how failed events are captured and replayed.
  - **DoD**: documented flow aligns with `apps/app/app/api/admin/integration-events/dlq/route.ts`.

## Care.DPO.Compliance (Compliance & risk advisor overlay)

**Homebase**
- `agents/Care.DPO.md`
- `apps/app/NETWORK_PROFILES_SETUP.md`
- `apps/app/app/api/gdpr/export/route.ts`
- `apps/app/app/api/export/route.ts`
- `apps/app/app/api/trust-lock/` (identity/session verification surfaces)

**Week 1 deliverables**
- **D1: Pilot compliance checklist**: age-gate patterns + staff SOP requirements (state-aware placeholders).
  - **DoD**: checklist with evidence fields (what to screenshot/log), no legal claims beyond “advisor checklist.”
- **D2: Data handling rules**: what is collected, hashed, retained; and what is never logged.
  - **DoD**: single-page “PII handling contract” that engineering and ops can follow.
- **D3: Export/delete readiness**: confirm export flows and deletion plan are consistent with the system model.
  - **DoD**: gaps are listed as tracked tasks; no silent assumptions.

## EchoPrime.Insights (Data/Insights)

**Homebase**
- `apps/app/app/api/analytics/unified/route.ts` and related analytics routes
- `apps/app/scripts/verify-analytics.ts`
- `apps/app/app/api/revenue/route.ts`

**Week 1 deliverables**
- **D1: “Moat metrics” dashboard spec**: HID resolve success, network sync success, drift counts, payment failures, retries.
  - **DoD**: metrics definitions include numerator/denominator and source of truth tables.
- **D2: Attribution integrity**: define what “referral attribution accuracy” means and how it’s tested.
  - **DoD**: includes QA-able scenarios and backfill/recompute policy.
- **D3: Pilot nudges experiment sketch**: 1–2 low-risk nudges tied to measured outcomes.
  - **DoD**: includes guardrails (no dark patterns; opt-out; privacy review).

## EchoPrime.BrandLoop (Brand/content producer)

**Homebase**
- `docs/` (content ops playbooks)
- `apps/app/app/api/lead-magnets/download/route.ts`
- `apps/app/app/api/newsletter/` (analytics/personalization)
- `agents/EP.Growth.md`

**Week 1 deliverables**
- **D1: Operator tip cadence**: 5 short operator tutorials mapped to the real golden path.
  - **DoD**: each tutorial references the exact UI workflow and the invariant it protects.
- **D2: Case study template** for pilots (what to measure + how to tell it).
  - **DoD**: template produces a 1-pager + 5-slide deck.
- **D3: Launch deck refresh**: articulate POS-agnostic “above the POS” moat without antagonizing vendors.
  - **DoD**: language conforms to `Sentinel.POS` guardrails.

## Bridge.SupportOps (Support routing + incident playbooks)

**Homebase**
- `apps/app/app/api/admin/sync/events/route.ts`
- `apps/app/app/api/admin/integration-events/dlq/route.ts`
- `apps/app/GUEST_SYNC_DIAGNOSIS.md`
- `apps/app/QUICK_START_LOCAL.md`

**Week 1 deliverables**
- **D1: Ticket taxonomy** aligned to invariants (payments, sync drift, identity, onboarding).
  - **DoD**: each category has “what evidence to capture” and “who owns it.”
- **D2: Macros + runbooks**: top 15 issues with step-by-step resolution and escalation.
  - **DoD**: includes “when to page” criteria.
- **D3: Admin evidence checklist**: exact admin endpoints/log fields to pull for each incident class.
  - **DoD**: minimal, copy-paste friendly.

## Atlas.Platform (SRE/Observability + scaling)

**Homebase**
- `apps/app/app/api/monitoring/performance/route.ts`
- `apps/app/app/api/scalability/health/route.ts`
- `apps/app/app/api/health/ready/route.ts`
- `apps/app/app/api/webhooks/stripe/status/route.ts`
- `.github/workflows/`

**Week 1 deliverables**
- **D1: SLOs + alerts** for: session-create, payments success, HID resolve, network sync, webhook backlog/DLQ.
  - **DoD**: each has thresholds and paging policy.
- **D2: Env safety gates**: HID salt misconfig detection surfaced in monitoring (no silent defaults).
  - **DoD**: alertable signal exists; runbook says how to fix.
- **D3: Cost + rate limiting plan**: per-lounge throttles and replay-safe retries.
  - **DoD**: documented limits and evidence endpoints.

