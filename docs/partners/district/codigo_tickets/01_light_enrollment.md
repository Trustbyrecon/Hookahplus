# T1 — CODIGO Light Enrollment (HID + first name)

## Goal
Create a low-friction join flow for CODIGO that captures **firstName** (nickname optional), returns a stable **memberId**, and persists identity on-device without impacting POS workflows.

## Scope
- Add `/codigo/join` page (handheld-safe UI).
- Add `POST /api/codigo/join` endpoint that:
  - Resolves/creates HID (memberId = HID)
  - Stores CODIGO name prefs under `NetworkPreference.devicePrefs.codigo`
  - Returns `{ memberId: hid }`
- Persist `memberId` + a stable `deviceId` on the client (localStorage, per existing patterns).

## Out of scope
- Phone/email capture (handled in T3).
- True Apple Wallet `.pkpass` (handled as MVP card in T4).

## Acceptance criteria
- `/codigo/join` loads fast on small screens; form validates firstName.
- On submit, API returns memberId and UI shows success state.
- No changes to unrelated enrollment flows.

## File touch list (target)
- `apps/app/app/codigo/join/page.tsx`
- `apps/app/app/api/codigo/join/route.ts`
- `apps/app/lib/hid/resolver.ts` (reuse only; no changes expected)
- `apps/app/lib/db.ts` (existing Prisma proxy)

