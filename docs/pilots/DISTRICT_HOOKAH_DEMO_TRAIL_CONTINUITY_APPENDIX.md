# District Hookah × Hookah+ — Demo Trail / Continuity Appendix

Use this as **speaker notes** or an **appendix slide** so the deck narrative stays anchored to real product surfaces.

## How to use
- Replace `{{APP_URL}}` with your production app URL (code defaults suggest `https://app.hookahplus.net`).
- Keep 3 tabs ready:
  - **Live Ops**: `{{APP_URL}}/fire-session-dashboard`
  - **Pilot Metrics**: `{{APP_URL}}/admin/metrics`
  - **LaunchPad**: `{{APP_URL}}/launchpad`

## “Journey of Coherence” (one-line framing)
**We don’t promise large lift immediately. We standardize session truth, measure lift safely, then compound across locations.**

---

## Slide-by-slide continuity

### Slide 1 — Title
**Talk track (measured)**: “This is an enterprise session standardization program. We install a session truth layer above POS, validate lift, then compound EBITDA over time.”

- **Open**: `{{APP_URL}}/fire-session-dashboard`
- **Point at**: live session workflow, staff assignment, and the fact this is *operational* (not a vanity dashboard).

---

### Slide 2 — 13 venues, 3 archetypes, 1 shared challenge
**Talk track**: “Different venues behave differently. Our system keeps identity fixed per location, then adapts intensity within that identity—so we can compare like-to-like across clusters.”

- **Open (enterprise skeleton / 13 locations)**: `{{APP_URL}}/admin/operator-onboarding`
- **Point at**: multi-location lead fields (`locationCount`, `locationNamesCsv`) and stage progression.

Optional supporting view (for cross-location ops posture):
- **Open**: `{{APP_URL}}/fire-session-dashboard` (location-scoped views supported via query params; see Slide 7–9)

---

### Slide 3 — Hookah is a session business (we run above POS)
**Talk track**: “POS captures transactions. Hookah+ captures *sessions*: time, behavior, and memory. This runs above POS—even if POS integration is deferred.”

- **Open (session truth layer)**: `{{APP_URL}}/fire-session-dashboard`
- **Point at**: session lifecycle, extension/refill behaviors, and staff workflow cues (this is where behavioral lift is operationalized).

Optional demo-mode shortcut (if you want a clean starting state):
- **Open**: `{{APP_URL}}/demo/night-after-night`
  - Redirects to demo-mode dashboard: `/fire-session-dashboard?mode=demo&lounge=night-after-night`

---

### Slide 4 — The Triple-Anchor Pilot (fixed venue identity + adaptive intensity + guardrails)
**Talk track**: “We lock identity per anchor (velocity / momentum / memory). Then we operate conservatively: reduce chaos before we optimize lift.”

- **Open (multi-location provisioning)**: `{{APP_URL}}/launchpad`
  - **Optional**: `{{APP_URL}}/launchpad?debug=1` to show multi-location transparency bar when multi-location is enabled.
- **Point at**:
  - Step 1 (Venue Snapshot) for org + location capture
  - Steps 3–5 for session rules + POS posture (“runs above POS”)

Venue identity (stable, manually defined):
- **Admin UI (recommended)**: `{{APP_URL}}/admin/venue-identity` (added to avoid raw API calls in demos)
- **API (if needed)**: `POST {{APP_URL}}/api/lounges/{loungeId}/venue-identity`
  - Body: `{ "venueIdentity": "casino_velocity" | "sports_momentum" | "luxury_memory" }`

---

### Slide 5 — Measured, not assumed (Primary KPI + Guardrail KPI)
**Talk track**: “Every optimization is gated by guardrails. If guardrails worsen, the system throttles back—protecting customer experience and memory accuracy.”

- **Open (pilot KPI surface)**: `{{APP_URL}}/admin/metrics`
- **Open (analytics + export)**: `{{APP_URL}}/analytics`
- **Point at**:
  - KPI surfaces and time windows (baseline vs pilot)
  - Export capability for exec-ready artifacts

Guardrail + throttle-back behavior (where it lives):
- Policy definition: `apps/app/lib/aliethia/policy.ts`
- UI enforcement (keeps only urgent prompts under throttle-back): `apps/app/components/StaffWorkflowAssistant.tsx`

---

### Slide 6 — 30-day pilot objective (3–7% high-margin behavioral lift)
**Talk track**: “We target small, high-margin behavioral lift first (3–7%)—with guardrail stability maintained. No rollout without validation.”

- **Open**: `{{APP_URL}}/admin/metrics`
- **Point at**: session engine health and behavioral counters (extensions/refills as early proof points).

Optional “immune system” view (drift signal in ops cockpit):
- **Open**: `{{APP_URL}}/staff-panel`
- **Point at**: drift summary (24h) and health signals (used as guardrail/chaos detection inputs).

---

### Slide 7 — From pilot to enterprise system (benchmarking + standardization)
**Talk track**: “After validation, we compare venues within archetype clusters, standardize what’s proven, and publish EBITDA-focused reporting—not vanity metrics.”

- **Open (analytics)**: `{{APP_URL}}/analytics`
  - Switch to **Unified Dashboard** view for rollup framing.
- **Open (live ops)**: `{{APP_URL}}/fire-session-dashboard`
  - Location scoping is supported through query params in the dashboard code path.

Org rollups (Week-1 Wins; useful as “early operator value” proof):
- **API**: `GET {{APP_URL}}/api/launchpad/week1-wins?organizationId=...`
- **Point at**: “minutes saved per shift” / wins rollups (labor efficiency proxy).

---

### Slide 8 — Incremental lift compounds (EBITDA framing)
**Talk track**: “We emphasize contribution margin on incremental revenue. We treat 10–30% EBITDA improvement as 12–24 month compounding potential—not a pilot promise.”

- **Open**: `{{APP_URL}}/analytics`
- **Point at**: export workflow + repeatable cadence (weekly exec reporting posture).

If you want an ops-first “no vanity metrics” supporting surface:
- **Open**: `{{APP_URL}}/admin/ghost-log`
- **Point at**: drift/exception capture and traceability (reduces chaos before lift).

---

### Slide 9 — Standardize → Optimize → Compound (timeline coherence)
**Talk track**: “30 days standardize and validate. 90 days optimize behaviors with throttle-back logic. 12–24 months: enterprise harmonization and EBITDA amplification.”

- **Standardize**: `{{APP_URL}}/launchpad`
- **Optimize**: `{{APP_URL}}/admin/metrics` and `{{APP_URL}}/analytics`
- **Compound**: `{{APP_URL}}/analytics` (Unified) + cross-location ops in `{{APP_URL}}/fire-session-dashboard`

---

### Slide 10 — 30-day Triple-Anchor Pilot (investment + what’s included)
**Talk track**: “The investment covers provisioning, archetype configuration, staff enablement, and executive reporting. We do not replace POS—we run above it.”

- **Open (LaunchPad)**: `{{APP_URL}}/launchpad`
- **Point at**: the step system + Go Live flow (multi-location provisioning).

Pilot outputs you can link to (for continuity artifacts):
- **QR packs**: `GET {{APP_URL}}/api/launchpad/download/qr/{loungeId}/{tableId}`
- **Config (YAML/JSON)**: `GET {{APP_URL}}/api/launchpad/download/config/{loungeId}?format=yaml`
- **Staff playbook**: `GET {{APP_URL}}/api/launchpad/download/playbook/{loungeId}`

---

## Guardrails (enterprise-safe phrasing)
- **Do**: “3–7% behavioral lift target in pilot; rollout gated by measured validation.”
- **Do**: “10–30% EBITDA improvement is compounding potential over 12–24 months.”
- **Don’t**: present “30%” as a short-term pilot promise.

