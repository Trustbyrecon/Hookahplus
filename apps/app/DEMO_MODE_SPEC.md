### Hookah+ Demo Mode & Test Link Spec

#### 1. URL Shape
- **Public-facing test link**  
  - Pattern: `/demo/{loungeSlug}`  
  - Example: `/demo/night-after-night`
- **Internal resolution**  
  - Resolves to:  
    - `/fire-session-dashboard?tenant={loungeSlug}&mode=demo&t={token}`  
  - Query params:
    - `tenant`: resolves to a Tenant row (Supabase/Prisma).
    - `mode=demo`: enables demo-mode behavior.
    - `t={token}`: optional invite token (for private pilots).

#### 2. Tenant Configuration Assumptions
- Each onboarding lead that is “demo-ready” maps to a **Tenant** with:
  - `name` / `slug` used in `{loungeSlug}`.
  - Menu & flavors configured (for Fire Session Dashboard).
  - Base hookah price and simple pricing rules (flat or time-based).
  - Optional layout (zones/tables) if they provided photos/notes.
- Tenant flags:
  - `isDemoReady: boolean` — can safely be used in demo mode.
  - `defaultMode: 'demo' | 'live'` — how the test link should open.

#### 3. Demo Mode Behavior (App)
- **Session Engine**
  - Uses the same `Session` model and state machine as live:
    - `NEW → PAID_CONFIRMED → PREP_IN_PROGRESS → HEAT_UP → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED → ACTIVE → CLOSED`.
  - Sessions created in demo mode:
    - Are tagged logically (e.g., `source = 'WALK_IN'` and a `demo` flag or tenant-mode).
    - May be excluded from production analytics if desired, but can still be used for UX checks.

- **Payments**
  - No real Stripe charges:
    - Checkout endpoints either:
      - Short-circuit with a “demo payment succeeded” response, or
      - Are disabled and replaced with a local “Confirm Payment” UX.
  - Fire Session Dashboard flows should rely on **session state transitions**, not actual Stripe events, during demo.

- **Visual Indicators**
  - A top banner in the Fire Session Dashboard when `mode=demo`:
    - Text: e.g., “Demo Mode — safe to tap everything, no real payments.”
    - Non-dismissible for clarity.
  - Optional subtle badge on session cards indicating demo-mode origin (for internal debugging only).

#### 4. Constraints & Safety
- Test link should:
  - Not require login for pilots (or use a soft magic-link style if needed).
  - Never mutate production payment or external POS state.
  - Only operate within the context of a single lounge tenant.
- When `mode=demo`:
  - Stripe webhooks should no-op or ignore demo-mode sessions.
  - Any POS sync endpoints should either:
    - Be disabled, or
    - Explicitly ignore demo-flagged sessions.

#### 5. What Staff Can Do in Demo Mode
- From `/fire-session-dashboard` in `mode=demo`, staff should be able to:
  - Create new sessions using the **Create Session** modal, with:
    - Their menu, base pricing, and zones/tables.
  - Walk sessions along the full state machine:
    - BOH: CLAIM_PREP → HEAT_UP → READY_FOR_DELIVERY.
    - FOH: DELIVER_NOW → MARK_DELIVERED → START_ACTIVE → CLOSE_SESSION.
  - Trigger refills & holds:
    - REQUEST_REFILL / COMPLETE_REFILL.
    - PUT_ON_HOLD / RESOLVE_HOLD.
- All of the above should “feel real” while being safely sandboxed.

#### 6. Analytics & Moat Signals from Demo
- Even in demo, we can capture:
  - Which states/operators staff spend the most time in.
  - How intuitive the BOH/FOH actions are (based on which actions get used).
  - Qualitative feedback:
    - “Did this screen make your night feel easier or harder?”
- For pilots, analytics endpoints (`/api/analytics/sessions`) can:
  - Either filter out demo sessions or expose a `mode` dimension so we can compare demo vs live.


