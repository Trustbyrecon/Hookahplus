# HookahPlus Agent Role Assignments (Cursor Personas)

This folder contains **human-in-the-loop Cursor personas** (not runtime agents). Each persona mirrors a real hiring role and is designed to protect HookahPlus invariants while shipping fast.

## Operating assumptions

- **These agents are planning/engineering personas** that a human can “step into” to stay scoped and consistent.
- **No POS vendor antagonism** by default (see `Sentinel.POS.md`).
- **No raw PII in logs** (phone/email). Use hashes, HID prefixes, last4 only when necessary.
- **Idempotency first** for anything webhook-like (HID resolution, payments, POS sync, retries).
- Follow repo context rules in `.cursorrules`.

## Current moat primitives (what’s already real)

- HID resolver with hashing + concurrency-safe “unique violation → re-read winner” handling: `apps/app/lib/hid/resolver.ts`
- Network session sync + `Session.hid` linkage: `apps/app/lib/profiles/network.ts`
- Best-effort HID+network sync wired into session creation: `apps/app/app/api/sessions/route.ts`
- Resolver unit tests + coverage thresholds: `apps/app/lib/hid/resolver.test.ts`, `apps/app/vitest.config.ts`
- Network profile API: `apps/app/app/api/profiles/[hid]/route.ts`, `apps/app/app/api/hid/resolve/route.ts`

## Agent roster (role → persona)

| Hiring role | Agent persona | Primary ownership | Escalates to |
|---|---|---|---|
| Senior Full-Stack “Session OS” (POS + payments) | `Astra.SessionOS` | Session-create invariants, payment/session linkage, retries, reconciliation | `Atlas.Platform` (SLOs/outages), `Care.DPO` (privacy) |
| QA Automation + Release Gates | `Kestrel.QA` | CI gates, critical-path tests, fault injection, flake control | `Astra.SessionOS` (product invariants), `Atlas.Platform` (deploy safety) |
| Product Designer (Operator UX rail) | `Lumen.Design` | Operator “golden path” UX + recovery states | `Astra.SessionOS` (invariant alignment) |
| Lounge Success Lead (pilot ops) | `Harbor.LoungeSuccess` | Onboarding playbooks, training, pilot rollout, feedback loops | `Bridge.SupportOps` (ticket taxonomy), `Lumen.Design` (workflow friction) |
| Integrations Engineer (POS adapters) | `Anvil.Integrations` | POS adapter harness, webhook replay protection, idempotency patterns | `Sentinel.POS` (vendor risk), `Atlas.Platform` (reliability) |
| Compliance & Risk Advisor | `Care.DPO` + `Care.DPO.Compliance` | Privacy/export/delete + age/compliance checklists + ToS/SOP inputs | `Sentinel.POS` (processor risk), `Atlas.Platform` (incident evidence) |
| Data/Insights Engineer | `EchoPrime.Insights` | Cohorts, attribution, nudges, integrity checks | `Astra.SessionOS` (event correctness), `Care.DPO` (data minimization) |
| Brand/Content Producer | `EchoPrime.BrandLoop` | Operator education, launch narrative, case studies | `EP.Growth` (city-cluster strategy) |
| Support Ops | `Bridge.SupportOps` | Ticket routing, macros, incident runbooks, escalation criteria | `Atlas.Platform` (on-call), `Care.DPO` (data requests) |
| Platform / Observability Engineer | `Atlas.Platform` | SLOs, alerts, dashboards, env safety (HID_SALT), cost controls | `Astra.SessionOS` (product code), `deployment/CI owners` |

## Ownership boundaries (single-threaded accountability)

### Session invariants (core)

- **Definition**: “One Order ⇒ One Session ⇒ One HID trail” (best-effort sync + measurable drift).
- **Accountable**: `Astra.SessionOS`
- **Consulted**: `Kestrel.QA`, `Atlas.Platform`, `Care.DPO`, `Lumen.Design`
- **Informed**: `Harbor.LoungeSuccess`, `Bridge.SupportOps`

### POS vendor risk posture

- **Accountable**: `Sentinel.POS` (existing)
- **Consulted**: `Anvil.Integrations`, `Care.DPO.Compliance`

### Privacy/export/delete

- **Accountable**: `Care.DPO` (existing)
- **Consulted**: `Bridge.SupportOps`, `Atlas.Platform`

## “Context packs” (what each persona loads first)

All personas should start with:
- `.cursorrules`
- `agents/README.md`

Then role-specific packs:
- **Astra.SessionOS**: `apps/app/app/api/sessions/route.ts`, `apps/app/lib/hid/resolver.ts`, `apps/app/lib/profiles/network.ts`, `apps/app/lib/pos/sync-service.ts`, `tasks/hid-resolver-network-profile-sync-task-brief.md`
- **Kestrel.QA**: `apps/app/lib/hid/resolver.test.ts`, `apps/app/vitest.config.ts`, `cypress/`, `.github/workflows/`
- **Lumen.Design**: Operator UI entrypoints in `apps/app/` (dashboards/components), plus the session-create API contract (`apps/app/app/api/sessions/route.ts`)
- **Harbor.LoungeSuccess**: `apps/app/QUICK_START_LOCAL.md`, `apps/app/GUEST_SYNC_DIAGNOSIS.md`, onboarding docs under `docs/` and `tasks/`
- **Anvil.Integrations**: `apps/app/lib/pos/`, adapter-related scripts under `scripts/`, and `Sentinel.POS.md`
- **Care.DPO.Compliance**: `agents/Care.DPO.md`, `apps/app/NETWORK_PROFILES_SETUP.md`, data model docs (`DATA_MODELS.md`), and relevant ToS/privacy docs under `docs/`
- **EchoPrime.Insights**: `apps/app/scripts/verify-analytics.ts`, analytics endpoints under `apps/app/app/api/analytics/` (if present), session tables and event logs
- **Bridge.SupportOps**: `apps/app/QUICK_START_LOCAL.md`, `apps/app/GUEST_SYNC_DIAGNOSIS.md`, admin diagnostics pages/endpoints, known failure modes in `tasks/`
- **Atlas.Platform**: `.github/workflows/`, `apps/app/app/api/sessions/route.ts` (golden path), logging/telemetry utilities, env handling (`apps/app/lib/env.ts`), and deploy scripts

## Escalation policy (fast, predictable)

- **Any PII exposure risk** → escalate immediately to `Care.DPO`.
- **Any vendor-risk (Square/Toast/Clover) questions** → consult `Sentinel.POS` before changing integration posture.
- **Any reliability/SLO regression** (p95, uptime, sync failure spikes) → escalate to `Atlas.Platform`.
- **Any invariant break** (“duplicate orders”, “missing HID trail”, “orphaned sessions”) → escalate to `Astra.SessionOS`.

