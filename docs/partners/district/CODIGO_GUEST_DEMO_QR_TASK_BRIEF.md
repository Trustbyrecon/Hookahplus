# CODIGO Guest Build + Demo QR Sync — Task Brief

**Status:** Implemented (Phase 1)  
**Created:** 2026-03-02  
**Purpose:** Enable Guest app to sync into CODIGO via Demo QR scan; coal requests, refills, and NAN kitchen notifications.

---

## Summary

The Guest build can now:
1. **Sync to CODIGO** via Demo QR codes that encode `loungeId=CODIGO` and `tableId`
2. **Request coal refills** via the guest app; NAN kitchen (BOH) sees requests in a dedicated section
3. **Use CODIGO pilot flags** (guest features enabled for CODIGO)

---

## 1. Demo QR Code for CODIGO

### URL Format
```
{GUEST_BASE_URL}/guest/CODIGO?loungeId=CODIGO&tableId={tableId}
```
With Demo mode: `&ref=demo` for tracking.

### Where to Generate
- **Admin QR page**: `/admin/qr` (in app build)
- **Lounge**: CODIGO (default)
- **Tables**: CODIGO floorplan (301–313, 401–403, 501–502, 601–603, 701–705)
- **Demo mode**: Checkbox adds `ref=demo` when loungeId is CODIGO

### Env
- `NEXT_PUBLIC_GUEST_BASE_URL` — Guest app base URL (e.g. `https://guest.hookahplus.net` or `http://localhost:3001`)

---

## 2. Guest Build → CODIGO Instance Sync

### Flow
1. Guest scans Demo QR → opens `{GUEST_URL}/guest/CODIGO?tableId=301`
2. Guest app calls `POST /api/guest/enter` with `loungeId`, `tableId`, `deviceId`
3. Guest enter proxy calls app build `POST /api/session/resolve` with `loungeId`, `tableId`, `identityToken`
4. Session is created or joined in the CODIGO app instance

### Env
- **Guest build**: `NEXT_PUBLIC_APP_URL` must point to the CODIGO app instance (e.g. `https://app.hookahplus.net`)

---

## 3. Coal Request, Refills, Upgrades/Add-ons

### Implemented
| Action | Flow | Status |
|--------|------|--------|
| **Coal request** | Guest → `POST /api/sessions/{id}/refill` → `edgeCase: 'refill_requested'` | Done |
| **New flavor bowl** | Same refill API with `refillType: 'flavor'` | Done |
| **Complete refill** | Staff → `PATCH /api/sessions/{id}/refill` | Done |

### Future (Phase 2)
| Action | Flow | Status |
|--------|------|--------|
| **Paid refill ($30)** | Guest → Stripe checkout → refill complete | Not implemented |
| **Other add-ons** | New add-on API + Stripe | Not implemented |

---

## 4. Guest Refill Requests (Kitchen)

### Implemented
- **BOH tab**: "Guest Refill Requests — Kitchen" section at top
- Shows ACTIVE sessions with `edgeCase: 'refill_requested'` or `refillStatus: 'requested'`
- Staff can "Complete refill" from each session card

### Location
- Fire Session Dashboard → BOH tab → first section when refill requests exist

---

## 5. CODIGO Pilot Flags

- **CODIGO** added to `PILOT_LOUNGES` in `apps/guest/config/flags.ts`
- Guest features (QR, anonymous mode, etc.) enabled for CODIGO

---

## 6. End-to-End Demo Flow

1. **Generate Demo QR**: Admin → `/admin/qr` → Lounge: CODIGO, Table: 301, Demo mode on
2. **Guest scans QR**: Opens guest app with `/guest/CODIGO?tableId=301&ref=demo`
3. **Guest enters**: Session resolve or join
4. **Staff creates session**: Fire Session Dashboard → Create Session (if needed)
5. **Guest requests coal**: Guest app → Request Coal Refill
6. **Kitchen sees**: BOH tab → "Guest Refill Requests" section
7. **Staff completes**: Click "Complete refill" on session card

---

## 7. Key Files Changed

| File | Change |
|------|--------|
| `apps/guest/config/flags.ts` | Added CODIGO to PILOT_LOUNGES |
| `apps/app/app/admin/qr/page.tsx` | CODIGO floorplan tables, Demo mode checkbox |
| `apps/app/components/SimpleFSDDesign.tsx` | BOH "Guest Refill Requests" section |

---

## 8. References

- `docs/partners/district/codigo_pilot_checklist.md` — E2E checklist
- `docs/partners/district/CODIGO_PILOT_DEMO_TASK_BRIEF.md` — Main demo task brief
- `apps/app/scripts/seed-codigo-pilot.ts` — Pilot config + floorplan
- `apps/app/app/api/sessions/[id]/refill/route.ts` — Refill API
