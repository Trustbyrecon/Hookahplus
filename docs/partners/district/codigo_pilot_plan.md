# CODIGO 30-Day Pilot Plan (District — Darvish Kitchen)

## Overview
- **Venue**: CODIGO at Darvish Kitchen (District partner)
- **POS reality**: Toast across ~20 revenue centers (standardized operating environment)
- **Pilot intent**: Validate Hookah+ “above POS” surfaces that increase premium attachment and recover idle time without disrupting service. Pilot must operate in a standard browser (including Toast handheld browser).

## Scope (30 days)
- **In scope**:
  - Light member enrollment (low-friction identity capture)
  - Session ↔ member linking (identity optional, never blocking)
  - Apple Wallet-ready member QR artifact (MVP)
  - Minimal KPI reporting + admin view for the pilot window
- **Out of scope (pilot)**:
  - POS/payment replacement or deep Toast workflow changes
  - Mandatory identity capture at checkout
  - Complex loyalty accrual/redemption logic (beyond pilot artifact)

## Core constraints
- **Above POS**: Toast remains payment + order authority.
- **No workflow disruption**: No added steps for staff to run core service.
- **Handheld-compatible**: Must work in the Toast handheld browser (small viewport, variable performance).
- **Pilot isolation**: CODIGO-only surfaces and reporting (no unintended impact to other lounges).

## Phases (week-by-week)
### Week 1 — Baseline capture
- Instrument baseline sessions and premium attachment (as measurable today).
- Deploy light enrollment join page and persist member identity on-device.
- Confirm session creation can accept optional member identity without breaking existing flows.

### Week 2 — Status + “premium” signal
- Add a lightweight “status/premium” surface (UI + tracking) without changing ordering behavior.
- Begin weekly KPI 1-pager with baseline deltas and incident log (service friction, performance).

### Week 3 — Refinement
- Reduce friction in join + wallet artifact download.
- Tighten session-link coverage and verify identity correctness.
- Confirm KPI definitions align with available data and pilot decision needs.

### Week 4 — Reporting + expansion recommendation
- Produce end-of-pilot report with KPI results, guardrail outcomes, and rollout recommendation.
- If passed: define 5-location expansion plan and support requirements.

## Pilot KPIs (headline set)
- **Premium attachment delta** (vs baseline)
- **Idle-time recovery estimate** (operational efficiency signal)
- **Member capture rate**
- **Profile completion rate**
- **Repeat visit within 30 days** (only if identity is reliable enough)

## Deliverables
- **Weekly 1-pager** (Week 1–4): KPI snapshot, deltas, incidents, operator feedback, next-week actions
- **End-of-pilot report**: KPI outcomes vs thresholds, guardrails audit, recommended rollout path

