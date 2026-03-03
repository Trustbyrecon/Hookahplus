# CODIGO Pilot Rollout Gate (Pass/Fail)

## Conservative pass/fail thresholds (30 days)
- **Guardrails (must-pass)**:
  - No measurable service slowdown attributable to Hookah+ surfaces (operator-confirmed; no recurring incidents).
  - Join flow is optional and never blocks session/order workflows.
  - Works reliably on Toast handheld browser (no critical UI breaks; acceptable load times).
- **Pilot KPIs (target, directional)**:
  - Premium attachment: positive delta vs Week 1 baseline (target +5pp; accept lower if coverage is limited).
  - Member capture rate: ≥20% of sessions linked to a member identity (if join is discoverable from QR pathway).
  - Profile completion rate: ≥10% of captured members add phone or email (if profile step is live).
  - Idle-time estimate: show a credible gap-time baseline and a directional improvement OR a clear operational learning for Week 5–8 rollout.

## Guardrails (non-negotiable)
- **No added friction**: No staff steps required to keep service moving.
- **No payment disruption**: Toast stays payment authority; Hookah+ stays above POS.
- **Privacy discipline**: Collect minimum necessary data; store hashed identifiers; no raw PII in logs. Portability is **H+ Passport** consent-scoped (opt-in) and enforced by scope.
- **Operational reversibility**: Pilot can be disabled without affecting core session creation.

## Decision meeting checklist (review with Mohamed)
- **KPI summary**: baseline vs pilot, coverage, variance explanations.
- **Incidents**: any handheld browser issues, timeouts, or workflow complaints.
- **Adoption**: how customers found join (QR placement, staff mention, signage).
- **Identity quality**: duplication rate, link success rate, profile completion.
- **Premium signal**: what counted as “premium” and how reliable the measure is.
- **Rollout readiness**: required playbook updates, training notes, support burden.

## If passed: expansion path
- **Step 1 — Expand to 5 locations** (2–4 weeks)
  - Standardize QR placement + join messaging
  - Confirm KPI pipeline stability and handheld performance at higher load
- **Step 2 — Expand to 10 locations** (next 4–6 weeks)
  - Add light operational tooling (admin KPI view + basic troubleshooting)
  - Validate repeat-rate directionality with larger sample size
- **Step 3 — Expand to 20 locations** (next 6–10 weeks)
  - Formalize SOP + support runbook
  - Define pricing and success criteria for long-term rollout

