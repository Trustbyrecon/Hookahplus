### Hookah+ Pilot Runbook (2–4 Week Operator-First Block)

#### 1. Where staff should live during service
- **Primary screen**: `Fire Session Dashboard` (`/fire-session-dashboard`)
  - `OVERVIEW` tab: quick scan of **New**, **Active**, **Edge cases**.
  - `BOH` tab: all sessions in **Prep / Heat Up / Ready for Delivery**.
  - `FOH` tab: all sessions **Out for Delivery / Delivered / Active**.
- **Backup / reporting**: `Admin → Metrics` (`/admin/metrics`) for nightly debrief.

#### 2. Start → Track → Close (no ghost sessions)
- **Start a session**
  - Tap **New Session** in the dashboard.
  - Fill: **Table**, **Name**, **Phone**, **Flavors**, **Duration**, **Pricing model (Flat vs Time-based)**.
  - Submit – session appears as **NEW** in `OVERVIEW`, with table + name visible.
- **Track the workflow**
  - BOH:
    - `PAID_CONFIRMED → CLAIM_PREP → HEAT_UP → READY_FOR_DELIVERY`.
  - FOH:
    - `READY_FOR_DELIVERY → DELIVER_NOW → MARK_DELIVERED → START_ACTIVE`.
  - CUSTOMER:
    - `ACTIVE → CLOSE_SESSION` when session is done.
- **Close cleanly**
  - FOH or MANAGER clicks **Close Session** on an `ACTIVE` or `CLOSE_PENDING` card.
  - Closed sessions move out of BOH/FOH lists and never reappear as active (no duplicates per table).

#### 3. Time-Based & Refill logic (operator view)
- **Choosing pricing**
  - In **Create Session**, select **Pricing model**:
    - `Flat`: one price for the full session.
    - `Time-based`: priced by minutes.
  - The FSD card shows:
    - **Pricing**: `Time-based session` or `Flat session`.
    - **Refill Window**:
      - `Free refill window` – first refill on time-based sessions.
      - `Billable refill` – additional refills.
- **Requesting a refill**
  - FOH on an **ACTIVE** session presses **REQUEST_REFILL**.
  - BOH sees the same session with **Refill requested** notes; completes via **COMPLETE_REFILL**.
  - After completion, the card shows **Refill Status: delivered** and the session is counted as `had_refill`.

#### 4. Edge cases, escalation, and Reflex
- **Edge cases / problems**
  - `STAFF_HOLD`, `STOCK_BLOCKED`, `REMAKE`, `FAILED_PAYMENT`, `VOIDED` appear in the **Edge Cases & Escalations** tab.
  - Manager uses **RESOLVE_HOLD** or **REQUEST_REMAKE** to clear issues and return the session to the main flow.
- **Reflex cues**
  - Session cards show a small **Reflex** badge when:
    - The timer is near expiry (prep for close-out).
    - The session is stale or on hold for too long.
  - Nightly metrics (`/admin/metrics`) show:
    - **extensionCount + refillCount** as total Reflex interventions.

#### 5. What to review after each night
- **From `/admin/metrics`**
  - **Session Engine**
    - Total / Active / Closed sessions.
    - Average session duration.
    - Count of Reflex events (extensions + refills).
  - **Time-Based & Refills**
    - `% of sessions that were **time-based**`.
    - Average length of time-based sessions.
    - **Refill rate**: `% of sessions with at least one refill`.
- **Operator questions to ask**
  - Did any table get **stuck** (prep too long, delivery too slow)?
  - Are time-based sessions **longer** or **higher value** than flat?
  - Are refills happening where they should (VIP / high-value tables) vs where they create congestion?

#### 6. Quick “what to do if…” guide
- **If a session won’t start**
  - Confirm **Table** and **Name** are filled in the modal.
  - If error persists, check `/api/sessions` via dashboard error banner and retry.
- **If a session disappears**
  - Check `Edge Cases` tab for **VOIDED / FAILED_PAYMENT / STAFF_HOLD**.
  - Use **RESOLVE_HOLD** or re-create the session if it was intentionally canceled.
- **If timers feel wrong**
  - Confirm the selected **duration** in the session modal.
  - For time-based sessions, use **Extend** on the card to add more time instead of creating a new session.


