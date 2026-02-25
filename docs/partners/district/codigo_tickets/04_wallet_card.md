# T4 — CODIGO Wallet-ready QR card (MVP)

## Goal
From the join success screen, allow a member to download a **Wallet-ready QR card** artifact (PNG) encoding their `memberId` (HID). Code should be structured so a real `.pkpass` can replace later.

## Scope
- Add `GET /api/codigo/wallet-card?memberId=...` returning a downloadable PNG.
- Generate QR code server-side (encode HID).
- Minimal dark card styling with:
  - CODIGO name
  - Tier: `Member` (default)
  - QR + memberId (small text)
- Wire a “Add to Wallet” (download) button on join success state.

## Out of scope
- Apple Wallet signing/cert chain (`.pkpass`) and Apple Wallet distribution.

## Acceptance criteria
- Download works in desktop + Toast handheld browser.
- Returned content type and headers trigger file download.

## File touch list (target)
- `apps/app/app/api/codigo/wallet-card/route.ts`
- `apps/app/app/codigo/join/page.tsx` (success UI wiring)
- `apps/app/lib/*` (small util for QR/card rendering if needed)

