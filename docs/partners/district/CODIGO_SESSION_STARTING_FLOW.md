# CODIGO Session Starting Flow

## What Should Happen After Checkout ("Session Starting")

### 1. Guest Experience: Hookah Tracker (transparency)
After successful checkout, the guest should be redirected to **Hookah Tracker** (`/hookah-tracker?sessionId=...&loungeId=CODIGO&tableId=...`) to see real-time session progress (NAN stages: Prep → Heat Up → Ready → Delivered).

**Current state:** Guest stays on `/guest/CODIGO` and sees "Session Starting" card. No redirect to Hookah Tracker.

**Fix:** Add redirect to Hookah Tracker in `onCheckoutSuccess` for CODIGO guest flow.

---

### 2. Staff Experience: Fire Session Dashboard (BOH/NAN)
Payment metadata should flow to the app's Fire Session Dashboard (`https://app.hookahplus.net/fire-session-dashboard?lounge=CODIGO`). The NAN (Need and Now) workflow begins: staff see the session, claim prep, heat up, deliver.

**Current state:** `sendSessionToBOH` in `apps/guest/app/api/guest/checkout/route.ts` is **commented out**. It only logs to console. No API call to the app.

**Fix needed:** 
- Create or use an app API endpoint to receive guest checkout sessions (e.g. `POST /api/guest-checkout/ingest` or update existing session via `PATCH /api/sessions/[id]`).
- Uncomment and wire `sendSessionToBOH` to call that endpoint with `NEXT_PUBLIC_APP_URL` or `APP_API_URL`.
- Session IDs: Guest creates session via `session/create` (sharedSessions). App session is from `resolve` (DB). These may differ—consider aligning so one session ID is used end-to-end.

---

### 3. What's Missing
- **Session ID alignment:** Guest `session/create` generates `session_${uuid}`. App `resolve` creates a different session ID. Checkout uses guest sessionId. BOH needs to know which app session to update.
- **Real-time sync:** Hookah Tracker fetches from app's `/api/sessions/status` or similar. Ensure guest sessionId maps to app session for status polling.
- **CODIGO lounge filter:** Fire Session Dashboard should filter by `lounge=CODIGO` when opened from CODIGO context.

---

## Implementation Checklist

- [ ] Redirect guest to Hookah Tracker after checkout (CODIGO)
- [ ] Wire `sendSessionToBOH` to app API
- [ ] Align session IDs (guest ↔ app) or add mapping
- [ ] Verify Hookah Tracker can fetch session status for CODIGO sessions

---

## CODIGO Flavors (Future)

The full flavor catalog is in `apps/app/scripts/seed-codigo-pilot.ts` (menuCatalogs). The lounge config API merges these into `configData.flavors` for CODIGO. To replace demo flavors app-wide:

1. **Guest app:** `FlavorMixSelector` CODIGO_PRESETS + `MobileFlavorSelector` MOCK_FLAVORS
2. **App CreateSessionModal:** Hardcoded `flavors` array (fallback when config doesn't load)
3. **Run seed:** `npx tsx scripts/seed-codigo-pilot.ts` to ensure PilotConfig has menuCatalogs in production
