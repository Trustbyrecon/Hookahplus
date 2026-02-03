# Demo NAN (Claim Prep) Flow + E2E Test — Task Brief

## Goal
Ensure the NAN (Payment → Prep → Ready → Deliver → Light) workflow flows correctly from **Claim Prep** in both:
1. **Demo UI** (`/demo/districk-hookah` → Fire Session Dashboard)
2. **E2E test** (Night After Night engine spec)

---

## What Was Fixed

### 1. Demo UI — NAN not advancing after Claim Prep
- **Cause:** In demo mode, `updateSessionState` used `nextStateWithTrust`, which set `status` and `currentStage` but did **not** set `stage` (Payment/Prep/Ready/Deliver/Light) or `action`. The UI uses `session.stage` first, so the NAN bar stayed at Payment.
- **Fix (apps/app/hooks/useLiveSessionData.ts):**
  - After `nextStateWithTrust`, set:
    - `updatedSession.stage = STATUS_TO_TRACKER_STAGE[updatedSession.status]` (with fallback)
    - `updatedSession.action = sessionAction`
  - Default demo data: first session is **PAID_CONFIRMED** with `stage: 'Payment'` so Claim Prep is available; second session remains already-Lit for later stages.

### 2. API — GET session by ID returning stage/action for NAN
- **Fix (apps/app/app/api/sessions/[id]/route.ts):** Include `stage` and `action` in the Prisma `select` so persisted NAN fields are returned after PATCH (Claim Prep, etc.).

### 3. E2E — Running when app is already on port 3002
- **Fix (apps/app/playwright.config.ts):** When `USE_EXISTING_SERVER=1`, skip starting the webServer so Playwright does not try to bind to 3002. Run the app manually, then run E2E.

### 4. Demo UI — Claim Prep not advancing (callback args reversed)
- **Cause:** `SimpleFSDDesign` called `onSessionAction(action, sessionId)` while the dashboard’s `handleStatusChange(sessionId, action)` expects `(sessionId, action)`. So `updateSessionState('claim_prep', 'demo-session-1')` was called, session lookup failed, and the NAN bar never moved.
- **Fix (apps/app/components/SimpleFSDDesign.tsx):** Call `onSessionAction(sessionId, action)` in both places (demo callback path and fallback path).

---

## How to Run E2E (Night After Night / Claim Prep)

### Prerequisites
- App running (e.g. `npm run dev` in `apps/app`) on `http://localhost:3002`
- Database available (sessions created by `/api/test-session/create-paid` and updated by PATCH `/api/sessions`)

### Run the NAN E2E test
```bash
cd apps/app

# Option A: Let Playwright start the server (port 3002 must be free)
npm run test:e2e -- e2e/flows/night-after-night-engine.spec.ts

# Option B: Use existing server (app already running on 3002)
USE_EXISTING_SERVER=1 npx playwright test e2e/flows/night-after-night-engine.spec.ts --project=chromium
```

### Relevant tests
- **Pathway 2:** Session → CLAIM_PREP → HEAT_UP → READY_FOR_DELIVERY → DELIVER_NOW → MARK_DELIVERED → START_ACTIVE → expect `ACTIVE`
- **Pathway 5:** Create paid session → checkout success page → CLAIM_PREP → GET session → expect `status === 'PREP_IN_PROGRESS'`

---

## Verification (Demo UI)
1. Open `https://app.hookahplus.net/demo/districk-hookah` (or `/fire-session-dashboard?mode=demo&lounge=districk-hookah`).
2. Confirm at least one session in **Payment** (e.g. "Demo Guest" at T-001).
3. Click **Claim Prep** on that session.
4. NAN bar should move from **Payment** to **Prep**; session should show as prep in progress.
5. Continue with Heat Up, Ready for Delivery, etc.; NAN should advance through Ready → Deliver → Light.

---

## Files Touched
| File | Change |
|------|--------|
| `apps/app/hooks/useLiveSessionData.ts` | Set `stage` and `action` after `nextStateWithTrust`; default demo data: PAID_CONFIRMED + already-Lit |
| `apps/app/app/api/sessions/[id]/route.ts` | Add `stage`, `action` to Prisma select |
| `apps/app/playwright.config.ts` | Skip webServer when `USE_EXISTING_SERVER=1` |
| `apps/app/components/SimpleFSDDesign.tsx` | Call `onSessionAction(sessionId, action)` so demo Claim Prep receives correct args |
