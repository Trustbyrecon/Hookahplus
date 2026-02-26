# CODIGO Pilot Checklist (E2E)

## Deploy
- **App**: deploy `apps/app` (Next.js app) with `DATABASE_URL` set.
- **DB**: ensure Prisma migrations are applied for the `Session.hid` + network profile tables used by the pilot.
- **Smoke**: verify `/codigo/join` loads on desktop and Toast handheld browser.

## Verify join flow (light enrollment)
- Open `/codigo/join`
- Enter first name (nickname optional) → submit
- Confirm success state shows “You’re in”
- Confirm localStorage contains:
  - `hp_codigo_device_id_v1`
  - `hp_codigo_member_id_v1` (HID)

## Verify session linking (memberId = HID)
- Using the returned HID (memberId), create a session via `POST /api/sessions` with JSON containing `memberId`.
- Confirm response includes `member` and the session is created successfully.
- Fetch `GET /api/sessions/[id]` and confirm it includes `member` when `hid` is present.

## Verify wallet card download
- From `/codigo/join` success state, click **Add to Wallet**
- Confirm a PNG download occurs from:
  - `GET /api/codigo/wallet-card?memberId=...`
- Confirm the PNG encodes the `memberId` (QR scan).

## Verify profile completion (optional)
- Open `/codigo/profile`
- Submit phone OR email (one required), optional Instagram handle
- Toggle **cross-lounge recognition (opt-in)** if offered (portability consent)
- Confirm API returns success:
  - `POST /api/codigo/profile`
- Confirm profile completion rate changes in KPI view after at least one completed profile exists.

## Verify portability consent + scope (institutional memory)
- Open `/codigo/privacy` to view/update portability, export, delete
- After profile completion, resolve HID profile:
  - `GET /api/hid/resolve?hid=<memberId>&scope=network`
- Confirm `consentLevel` is:
  - `claimed` when profile is completed without portability opt-in
  - `network_shared` when portability opt-in is enabled
- (If testing multi-lounge) Verify lounge isolation vs network scope:
  - `GET /api/profiles/<memberId>?loungeId=<A>&scope=lounge` shows lounge A + network-scoped notes only
  - `GET /api/profiles/<memberId>?loungeId=<B>&scope=lounge` does not leak lounge A–only notes

## Verify KPI endpoint + admin view
- Call:
  - `GET /api/codigo/kpis/summary?start=<iso>&end=<iso>`
- Confirm fields return with explicit `null` where not available (premium definition, durations, etc.).
- Open:
  - `/admin/codigo-kpis`
- Confirm date range selector works and cards populate.

## Common failure points + fixes
- **DB connection errors**:
  - Confirm `DATABASE_URL` is set and reachable (pooler vs direct URL considerations).
- **Premium attachment shows “Not configured”**:
  - Ensure CODIGO has `Flavor` rows with `isPremium=true` and matching `name` values used in sessions.
- **Profile completion conflicts (409)**:
  - Phone/email is already linked to another HID; use a different identifier for testing.
- **No idle-time samples**:
  - Requires `endedAt` or duration coverage; ensure sessions are being closed and timestamps are present.

