# CODIGO Session Starting Flow

## What Should Happen After Checkout ("Session Starting")

### 1. Guest Experience: Hookah Tracker (transparency)
After successful checkout, the guest is redirected to **Hookah Tracker** (`/hookah-tracker?sessionId=...&loungeId=CODIGO&tableId=...`) to see real-time session progress (NAN stages: Prep → Heat Up → Ready → Delivered).

**Implemented:** `onCheckoutSuccess` in `apps/guest/app/guest/[loungeId]/page.tsx` redirects to Hookah Tracker when `loungeId === 'CODIGO'` and `qrData?.tableId` exists. Uses `appSessionId` (from checkout response) when available so the tracker fetches the correct app session.

---

### 2. Staff Experience: Fire Session Dashboard (BOH/NAN)
Payment metadata flows to the app's Fire Session Dashboard (`/fire-session-dashboard?lounge=CODIGO`). The NAN workflow begins: staff see the session, claim prep, heat up, deliver.

**Implemented:** `sendSessionToBOH` in `apps/guest/app/api/guest/checkout/route.ts` calls `POST /api/sessions` on the app build (`NEXT_PUBLIC_APP_URL` or `APP_API_URL`). Creates session with `codigoOperator: true` for CODIGO as PENDING + paymentStatus succeeded → PAID_CONFIRMED in UI. Floor shows "Prep" (pending); Kitchen shows Claim Prep for NAN flow. Returns `appSessionId` in checkout response for Hookah Tracker redirect.

---

### 3. Session ID Alignment (Guest vs App)

| Stage | ID Format | Source |
|-------|-----------|--------|
| **Guest session** | `session_${uuid}` | `POST /api/guest/session/create` (sharedSessions, in-memory) |
| **App session** | UUID | `POST /api/sessions` (Prisma DB) |

**Flow:**
1. Guest selects flavors → `session/create` → guest session ID (`session_xxx`)
2. Guest checkout → `POST /api/guest/checkout` → `sendSessionToBOH` → `POST /api/sessions` (app) → app session ID (UUID)
3. Checkout response includes `appSessionId` when BOH ingest succeeds
4. `onCheckoutSuccess(appSessionId || guestSessionId)` → redirect uses app session ID for Hookah Tracker
5. Hookah Tracker fetches `GET /api/sessions/{appSessionId}` from app (or guest proxy)

**Linking:** `externalRef: guest_${sessionId}_${receiptId}` on app session for idempotency and traceability.

---

## Implementation Checklist

- [x] Redirect guest to Hookah Tracker after checkout (CODIGO)
- [x] Wire `sendSessionToBOH` to app API
- [x] Align session IDs (guest ↔ app) via `appSessionId` in checkout response
- [ ] Verify Hookah Tracker can fetch session status for CODIGO sessions (manual test)

---

## CODIGO Flavors (Future)

The full flavor catalog is in `apps/app/scripts/seed-codigo-pilot.ts` (menuCatalogs). The lounge config API merges these into `configData.flavors` for CODIGO. To replace demo flavors app-wide:

1. **Guest app:** `FlavorMixSelector` CODIGO_PRESETS + `MobileFlavorSelector` MOCK_FLAVORS
2. **App CreateSessionModal:** Hardcoded `flavors` array (fallback when config doesn't load)
3. **Run seed:** `npx tsx scripts/seed-codigo-pilot.ts` to ensure PilotConfig has menuCatalogs in production
