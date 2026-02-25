# T3 — CODIGO Profile Completion (phone/email attach)

## Goal
Provide an optional profile completion step that attaches **phone OR email** (one required) to an existing member identity (HID) without disrupting the pilot.

## Scope
- Add `/codigo/profile` page (not auto-prompted).
- Add `POST /api/codigo/profile` endpoint that:
  - Accepts `memberId` (HID) + phone/email + optional instagramHandle
  - Creates/updates identity links for the existing HID (hashed identifiers)
  - Records completion so profile completion rate can be measured

## Out of scope
- Mandatory enrollment / gating.
- Marketing automations.

## Acceptance criteria
- Light enrollment continues to function without profile completion.
- API never creates a new HID when attaching phone/email; it must attach to the provided HID.
- Profile completion is measurable for KPI reporting.

## File touch list (target)
- `apps/app/app/codigo/profile/page.tsx`
- `apps/app/app/api/codigo/profile/route.ts`
- `apps/app/lib/hid/resolver.ts` (reuse hashing strategy)
- `apps/app/prisma/schema.prisma` (expect no changes; `NetworkPIILink` exists)

