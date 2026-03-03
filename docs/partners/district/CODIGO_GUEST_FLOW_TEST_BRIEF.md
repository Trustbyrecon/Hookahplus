# CODIGO Guest Flow — Test Brief

**Status:** In Progress  
**Purpose:** Align and verify the CODIGO guest flow so guests can reach the ordering experience without "Access Denied"  
**Created:** 2026-02-27

---

## 1. Problem Statement

Guests visiting `guest.hookahplus.net/guest/CODIGO?tableId=301` see:

- **UI:** "Access Denied — We need staff to confirm your table before continuing."
- **Console:** 409 on `/api/guest/enter`, "Guest initialization error: Error: We need staff to confirm your table before continuing."

Root cause: the participant resolver blocks when multiple active sessions exist for the same table. CODIGO-specific handling is in place to avoid this block.

---

## 2. Prerequisites

### Environment Variables

| Project | Variable | Value | Purpose |
|--------|----------|-------|---------|
| **hookahplus-guests** | `NEXT_PUBLIC_APP_URL` | `https://app.hookahplus.net` | Guest app calls app for session resolve |
| **hookahplus-app** | `DATABASE_URL` | (prod DB) | Session/participant resolution |

### Deployments

- **App** (`app.hookahplus.net`): Must include:
  - `/api/session/resolve` in public routes (no auth)
  - CODIGO bypass in participant resolver (join most recent session when multiple active)
- **Guest** (`guest.hookahplus.net`): Must include CODIGO in `PILOT_LOUNGES`.

### Database

- CODIGO pilot config seeded (`apps/app/scripts/seed-codigo-pilot.ts`)
- Table 301 present in CODIGO floorplan

---

## 3. Test Cases

### TC-1: Guest Entry — Happy Path (No Conflicting Sessions)

**Steps:**

1. Ensure table 301 has 0 or 1 active session (close others if needed).
2. Open `https://guest.hookahplus.net/guest/CODIGO?tableId=301`.
3. Wait for the page to load.

**Expected:**

- No "Access Denied"
- Session Pricing shows **$60.00 fixed** (CODIGO flat fee)
- 5 CODIGO presets visible (Noor Al Ein, Shah's Eclipse, Zarafshan Gold, Lailat Al Ward, Noor al-Layl)
- Flavor selection and checkout flow usable

**Failure:** 409 on `/api/guest/enter` → see Section 5.

---

### TC-2: Guest Entry — Multiple Active Sessions (CODIGO Bypass)

**Steps:**

1. Create 2+ active sessions for CODIGO table 301 (e.g. via Fire Session Dashboard).
2. Open `https://guest.hookahplus.net/guest/CODIGO?tableId=301`.
3. Wait for the page to load.

**Expected:**

- No "Access Denied"
- Guest joins the most recent session
- Stale sessions are closed

**Failure:** Same 409 → CODIGO bypass may not be deployed.

---

### TC-3: Session Pricing — CODIGO Flat Fee

**Steps:**

1. Complete TC-1.
2. Inspect the Session Pricing section.

**Expected:**

- Flat Fee: **$60.00 fixed**
- Description: "Fixed $60.00 includes flavors"

**Failure:** $30.00 or other amount → guest config or pricing logic not updated.

---

### TC-4: CODIGO Presets

**Steps:**

1. Complete TC-1.
2. Inspect the flavor selection area.

**Expected:**

- "Signature Presets" section with 5 CODIGO presets
- No generic presets (Mango, Peach, Caramel, etc.) as primary options

---

### TC-5: Admin QR — Demo Mode

**Steps:**

1. Open `https://app.hookahplus.net/admin/qr?mode=demo`.
2. Select Lounge: CODIGO, Table: 301, Demo mode on.
3. Generate QR and scan (or use the URL).

**Expected:**

- URL: `guest.hookahplus.net/guest/CODIGO?tableId=301&ref=demo`
- Guest flow completes as in TC-1.

---

## 4. Verification Checklist

| Check | How to Verify |
|-------|---------------|
| Session resolve is public | `curl -X POST https://app.hookahplus.net/api/session/resolve -H "Content-Type: application/json" -d '{"loungeId":"CODIGO","tableId":"301","identityToken":"test-device"}'` → 200, not 401 |
| CODIGO bypass enabled | Multiple active sessions for 301 → guest still enters |
| Guest env | Vercel → hookahplus-guests → Settings → Environment Variables → `NEXT_PUBLIC_APP_URL` = `https://app.hookahplus.net` |
| App deployment | Vercel → hookahplus-app → Deployments → Production includes "Fix participant resolver" or equivalent |

---

## 5. Common Failure Points

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 401 on `/api/session/resolve` | Route protected by middleware | Add `/api/session/resolve` to public routes in `apps/app/middleware.ts` |
| 409 "staff to confirm" | Multiple active sessions, no CODIGO bypass | Deploy participant resolver with CODIGO bypass (`apps/app/lib/session/participant-resolver.ts`) |
| 409 "staff to confirm" after deploy | App production not rebuilt | Promote app preview to production or merge and redeploy |
| $30 instead of $60 | Price logic not CODIGO-aware | Ensure `SessionPricing` and `price/quote` use CODIGO pricing |
| Generic presets only | Presets not loaded for CODIGO | Ensure `CODIGO_PRESETS` passed to `FlavorMixSelector` when `loungeId === 'CODIGO'` |
| `randomUUID` error | Client-side crypto | Use `client-hash` for GhostLog in client components |

---

## 6. Key Files

| File | Change |
|------|--------|
| `apps/app/middleware.ts` | `/api/session/resolve` public and early bypass |
| `apps/app/lib/session/participant-resolver.ts` | CODIGO bypass when multiple active sessions |
| `apps/guest/components/guest/SessionPricing.tsx` | CODIGO $60 flat fee |
| `apps/guest/app/api/guest/price/quote/route.ts` | CODIGO $60 base price |
| `apps/guest/components/customer/FlavorMixSelector.tsx` | CODIGO presets and `flavorAddOnFree` |

---

## 7. References

- `docs/partners/district/CODIGO_GUEST_DEMO_QR_TASK_BRIEF.md` — Demo QR flow
- `docs/partners/district/codigo_pilot_checklist.md` — E2E checklist
- `apps/app/scripts/seed-codigo-pilot.ts` — Pilot config + floorplan
