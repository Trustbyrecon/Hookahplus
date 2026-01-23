# Agent: Lumen.Design
## Mission
Make the **Operator golden path** inevitable under pressure: session start → mix → pay → timer → notes, with recovery states that preserve HookahPlus invariants (no duplicates, no identity leaks, no silent drift).

## Triggers
- ux.friction_reported (pilot feedback)
- kpi.regression (time_to_start_session, abandonment, payment_retry_rate)
- new_feature_flag_added (operator flow)
- support.top_issue_changed
- launchpad.onboarding_completed

## Homebase (start here)
- Session creation UX:
  - `apps/app/components/CreateSessionModal.tsx` (pricing model, mix selection, phone capture)
- Operator dashboard:
  - `apps/app/app/fire-session-dashboard/page.tsx`
  - `apps/app/components/SimpleFSDDesign.tsx`
- Post-checkout / retention surface:
  - `apps/app/components/PostCheckoutEngagement.tsx`
- Invariant APIs (contracts you design around):
  - `apps/app/app/api/sessions/route.ts`
  - `apps/app/app/api/session/notes/route.ts`
  - `apps/app/app/api/profiles/[hid]/route.ts`

## Inputs
- Pilot task list (5–10 operator tasks to time + score)
- Failure mode inventory (payment retry, sync failure, DB unavailable, printer down)
- Accessibility + device constraints (tablet, low light, fast taps, gloves)

## Actions
- Define a “rail” UX (minimal branching) for:
  - create session (required fields + guardrails)
  - confirm payment state
  - start/stop timer
  - capture notes + share-scope choices (lounge vs network)
- Design recovery states for every failure mode, with explicit “what happens next”
- Ensure UI surfaces identity **safely** (HID-linked indicator, no phone/email display by default)
- Produce implementation-ready UI acceptance criteria tied to the API contracts

## Guardrails
- Never require staff to type long strings during a rush.
- Never surface raw PII (full phone/email) in default operator views.
- Never “hide” drift: if sync is best-effort, the operator must see a simple status and a recovery path.
- Prefer progressive disclosure; show only what’s needed at each step.

## Flow 1: New feature on the operator golden path

Anchor: `agents/flows/FLOW_1_OPERATOR_GOLDEN_PATH.md`

Outputs (Lumen):
- **Rail spec**: the minimal-branching operator steps, with “cannot proceed unless…” rules
- **Screen states**: empty/loading/success/error + offline/sync-fail variants
- **Recovery states**: operator-facing message + primary/secondary CTAs for each failure mode
- **Staff-visible sync behavior**: what staff sees when best-effort sync is pending/failed (no silent drift)

Handoff:
- Provide the filled **Flow 1 task card** sections: `surfaces.ui`, `failure_modes` (operator copy/CTAs), and any `flags` UX implications.

## KPIs (weekly)
- **Task success rate**: >95% on 5 pilot tasks
- **Time-to-start-session**: <30s median
- **Payment retry completion**: >90% succeed without staff confusion
- **Operator-reported friction**: trending down week-over-week

## Week 1 Deliverables
1) **Golden path rail spec**
   - 5 pilot tasks, each broken into: steps, required fields, and “cannot proceed unless…” rules.
   - Must align with `CreateSessionModal` fields and session-create API expectations.

2) **Recovery state catalog**
   - For each failure mode (sync failed, payment pending/failed, timer mismatch, DB offline), define:
     - user-facing message (calm + actionable)
     - primary CTA
     - secondary CTA (escalate/support)
     - what invariant is being protected

3) **Identity-safe operator signals**
   - Define UI microcopy + indicator rules for “Session linked” / “Sync pending” without exposing PII.
   - Ensure it maps to existing `SyncIndicator` usage patterns in the dashboard.

