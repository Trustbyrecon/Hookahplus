# T2 — Link session to member (memberId = HID)

## Goal
Allow session creation to accept an optional `memberId` (HID) and persist it on the session record for CODIGO, without breaking the canonical QR resolver path or existing clients.

## Scope
- Update session creation (`POST /api/sessions`) to accept `memberId` and map to `Session.hid`.
- Ensure all creation paths preserve HID:
  - Canonical QR resolver branch (table + lounge path)
  - Standard creation path
  - Raw SQL fallback insert path
- Ensure session responses include `hid` and a light member display (firstName/nickname) when available.

## Out of scope
- Forcing identity capture (never blocking).
- Merging identities across phone/email (handled in T3).

## Acceptance criteria
- Passing `memberId` in session create results in `Session.hid` set for the created/resolved session.
- Existing session creation clients still work unchanged.
- Raw SQL fallback insert does not drop HID.

## File touch list (target)
- `apps/app/app/api/sessions/route.ts`
- `apps/app/prisma/schema.prisma` (no model changes expected; `Session.hid` already exists)

