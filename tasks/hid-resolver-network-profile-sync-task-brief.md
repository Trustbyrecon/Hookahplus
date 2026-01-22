# Task Brief v2 (Hybrid Flywheel + Moat Spark)
## Task: H+ ID Resolver (HID) + Network Profile Sync (POS-agnostic identity layer)

**What:** Productionize the existing HID resolver + network profile services, and wire them into core session creation/sync flows so every identified guest produces a portable `hid` + network profile trail.

**Why:** This is the “above the POS” moat: portable customer memory (notes/preferences/badges) that travels across lounges, creating switching costs and network effects while remaining POS-agnostic.

**Who needs what:**
- **Inputs**: `phone`, `email`, `qrToken`, `deviceId` (any one), `loungeId`, `sessionId`, network-scoped notes (`share_scope=network`)
- **Dependencies**:
  - `HID_SALT` set in runtime environment (see `apps/app/lib/env.ts`, `apps/app/NETWORK_PROFILES_SETUP.md`)
  - Prisma migrations applied for `network_*` tables + `Session.hid` column (see `apps/app/prisma/schema.prisma`)
  - DB connectivity (no “demo fallback” for identity writes)
- **Integrations**:
  - Operator session create flow (`apps/app/app/api/sessions/route.ts`)
  - POS sync flow (`apps/app/lib/pos/sync-service.ts`) (already calls HID + sync)
  - Session notes API (`apps/app/app/api/session/notes/route.ts`) (already syncs network-scoped notes)
  - Guest build → app build proxy (`apps/guest/app/api/session/start/route.ts`) (passes `customerPhone` into app build)

---

## Flywheel Work Order (Strongest Signal / Convenience)

**Immediate Actions (P0):**
- Ensure session creation resolves HID and syncs a `network_sessions` record when `customerPhone`/`customerEmail` is present.
- Make HID resolver idempotent under concurrency (no duplicate `network_pii_links` unique violations).
- Ensure `/api/profiles/[hid]` returns usable network note content (not just IDs) for staff UX.

**Blockers to Remove (P0):**
- Runtime missing/weak `HID_SALT` should be detectable + observable (warn/alert), not silently defaulting.

---

## How it will be verified
- ✅ `POST /api/hid/resolve` with phone/email returns `{ hid, status, profile }` and is idempotent across repeated calls.
- ✅ Creating a session with `customerPhone` results in:
  - `Session.hid` populated (best-effort; failure does not block session creation)
  - `network_sessions` upserted for that `sessionId`
- ✅ Creating a session note with `share_scope=network` and `customer_phone` or `customer_email` results in `network_session_notes` upsert.
- ✅ `GET /api/profiles/[hid]?scope=network` returns profile + network notes including `noteText` + timestamps.
- ✅ Error handling is non-leaky (no raw phone/email values logged; only hashed/last4 where needed).
- ✅ Reflex score ≥0.92 for `hid.resolve` + `network.sync_session` + `network.sync_note`.

**When:** P0 / Critical Path (Sequence 1)

---

## Signals to Instrument

### Telemetry
**Sentry Events (namespacing):**
- `hid.resolve` (tags: `component:hid`, `action:resolve`, `result:new|existing`, `hasPhone`, `hasEmail`, `hasQrToken`, `hasDeviceId`)
- `hid.resolve_failed` (tags: `component:hid`, `action:resolve`, `errorType`)
- `network.sync_session` (tags: `component:network`, `action:sync_session`, `loungeId`)
- `network.sync_session_failed` (tags: `component:network`, `action:sync_session`, `errorType`)
- `network.sync_note` (tags: `component:network`, `action:sync_note`, `loungeId`, `shareScope`)
- `network.sync_note_failed` (tags: `component:network`, `action:sync_note`, `errorType`)

**Pino Log Keys:**
- `{ component: "hid", action: "resolve", hidPrefix, result, latencyMs, requestId }`
- `{ component: "network", action: "sync_session", hidPrefix, sessionId, loungeId, latencyMs, requestId }`
- `{ component: "network", action: "sync_note", hidPrefix, noteId, loungeId, shareScope, latencyMs, requestId }`

**Reflex Scoring (targets):**
- `reflexScoreAudit.recordScore("hid", "resolve", >=0.92, ...)`
- `reflexScoreAudit.recordScore("network", "sync_session", >=0.92, ...)`
- `reflexScoreAudit.recordScore("network", "sync_note", >=0.92, ...)`

### Metrics
- **HID resolve latency (P95):** <100ms (DB-backed)
- **Network sync success rate:** ≥99% (best-effort, non-blocking)
- **Unique constraint collisions (piiType+piiHash):** 0 under normal operation (or handled via re-read)

### Failure Modes
**Primary Failure: `HID_SALT` missing/weak**
- **What breaks first:** HIDs become unstable across environments; identity graph fragments.
- **Alert fires:** `hid.resolve_failed` tagged `errorType:misconfig`
- **Recovery:** Set `HID_SALT` in runtime env; redeploy; rerun migration/sync script if needed.

**Secondary Failure: DB unique violation on `network_pii_links`**
- **What breaks first:** concurrent resolves attempt to create the same `piiHash`.
- **Alert fires:** `hid.resolve_failed` tagged `errorType:unique_violation`
- **Recovery:** retry by re-reading link then returning existing profile (idempotency).

**Tertiary Failure: network tables not migrated**
- **What breaks first:** sync attempts fail; sessions still create but lack network memory.
- **Alert fires:** `network.sync_session_failed` with `errorType:missing_table_or_column`
- **Recovery:** run Prisma migrations; rerun `apps/app/scripts/migrate-to-network-profiles.ts`.

### Evidence Location
- **API**: `POST /api/hid/resolve`, `GET /api/profiles/[hid]`
- **DB**: `network_profiles`, `network_pii_links`, `network_sessions`, `network_session_notes`, and `Session.hid`
- **Docs**: `apps/app/NETWORK_PROFILES_SETUP.md`, `reflex_memory/POS_TAKEOVER_MOAT_STRATEGY.md`

---

## Definition of Done (DoD)

### Functionality ✅
- [ ] HID resolve is idempotent and safe under concurrency
- [ ] Session create path attempts HID resolve + network sync when identifiers are present
- [ ] Profile API returns staff-usable network note content (text + timestamps)

### Observability ✅
- [ ] Sentry + structured logs emit on success/failure for resolve + sync
- [ ] No raw PII leakage in logs (no full phone/email)
- [ ] Evidence queries documented (SQL snippets + expected rows)

### Recovery ✅
- [ ] Rollback: disable network sync behind a feature flag / try-catch (non-blocking)
- [ ] Backfill: rerun `apps/app/scripts/migrate-to-network-profiles.ts`

---

## Implementation Notes (starting points)
- `apps/app/lib/hid/resolver.ts`
- `apps/app/app/api/hid/resolve/route.ts`
- `apps/app/lib/profiles/network.ts`
- `apps/app/app/api/profiles/[hid]/route.ts`
- `apps/app/app/api/sessions/route.ts`

---

## References
- `reflex_memory/POS_TAKEOVER_MOAT_STRATEGY.md`
- `apps/app/NETWORK_PROFILES_SETUP.md`

---

**Created:** 2026-01-22  
**Owner:** Aliethia (agent)  
**Status:** [ ] Draft | [ ] In Progress | [ ] Complete

