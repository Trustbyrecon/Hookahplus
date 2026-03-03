# QR -> Session Codepath Inventory

This is the required discovery output for deterministic resolver insertion and duplicate-session risk mapping.

## Canonical Resolver

- Endpoint: `apps/app/app/api/session/resolve/route.ts`
- Creates sessions: **Yes** (when no active session for table)
- Participant reuse hook: `apps/app/lib/session/participant-resolver.ts` via `identityKey` lookup
- Duplicate-session risk handling: blocks on multi-active with drift emit (`recon.session.multi_active`)

## Guest-Facing QR Entry Paths

1) `apps/guest/app/api/guest/enter/route.ts`
- Creates sessions: **No direct DB create** (delegates to resolver when `tableId` present)
- Participant reuse hook point: POST body `deviceId|guestId|u` -> resolver `identityToken`
- Duplicate-session risk: handled by resolver 409 blocked response

2) `apps/guest/app/api/guest/session/start/route.ts`
- Creates sessions: **No direct DB create** (delegates to resolver)
- Participant reuse hook point: `guestId` -> resolver `identityToken`
- Duplicate-session risk: handled by resolver conflict response

3) `apps/guest/app/api/session/start/route.ts`
- Creates sessions: **No direct DB create** (delegates to resolver)
- Participant reuse hook point: `guestId` + `notMe` -> resolver
- Duplicate-session risk: handled by resolver conflict response

## Staff / Operational Paths

4) `apps/app/app/api/session/join/route.ts`
- Creates sessions: **No direct DB create** (delegates to resolver)
- Participant reuse hook point: `identityToken` and `notMe`
- Duplicate-session risk: handled by resolver conflict response

5) `apps/app/app/api/sessions/route.ts`
- Creates sessions: **Yes** (legacy direct session creation path for operational/API use)
- Participant reuse hook: **none currently**
- Duplicate-session risk: **medium** if this path is used for QR runtime instead of resolver
- Required guardrail: keep QR runtime routed through `/api/session/resolve`

## QR Generation Paths (mapping integrity)

6) `apps/app/app/api/admin/qr/route.ts`
- Role: canonical QR URL generation for lounge/table mapping
- Runtime target: `/guest/{loungeId}?loungeId={loungeId}&tableId={tableId}`
- Duplicate-session risk: **low** (does not create sessions)

7) `apps/app/app/api/qr-generator/route.ts`
- Role: bulk generation + durable storage wrapper
- Delegates generation to `/api/admin/qr`
- Duplicate-session risk: **low** (does not create sessions)

## Insertion Points Summary

- Deterministic resolver logic insertion: already centralized in
  - `apps/app/lib/session/participant-resolver.ts`
  - `apps/app/app/api/session/resolve/route.ts`
- Participant reuse enforcement:
  - `apps/guest/app/api/guest/enter/route.ts`
  - `apps/guest/app/api/guest/session/start/route.ts`
  - `apps/guest/app/api/session/start/route.ts`
  - `apps/app/app/api/session/join/route.ts`
- Multi-active drift/blocked guest UX:
  - Emit: `apps/app/lib/session/participant-resolver.ts`
  - Return blocked message: resolver + guest routes above

## Remaining Duplicate-Session Exposure

- Any QR flow that bypasses `/api/session/resolve` and directly calls `/api/sessions` for creation.
- Mitigation: reserve `/api/sessions` creation for non-QR operational paths; all QR scans must route via resolver.
# QR -> Session Codepath Inventory (Insertion Points)

This inventory maps where QR scans or QR-derived flows can create/resolve sessions and where deterministic resolver logic must be inserted.

## Canonical target
- New canonical resolver endpoint: `apps/app/app/api/session/resolve/route.ts`
- Return contract: `{ session_id, participant_id, mode }`
- Modes: `create | join | rejoin | blocked_multi_active`

## Existing codepaths

1) `apps/guest/app/api/guest/enter/route.ts`
- Creates local/in-memory guest session IDs via `sharedSessions`.
- Risk: can create duplicate runtime session intent before table/session truth check.
- Insertion point: replace local session creation with call to canonical resolver.

2) `apps/guest/app/api/guest/session/start/route.ts`
- Creates in-memory guest session object directly.
- Risk: duplicate active sessions by table when multiple guests scan.
- Insertion point: route start to canonical resolver + participant assignment.

3) `apps/guest/app/api/session/start/route.ts`
- Proxies to app `/api/sessions` POST and can effectively create new sessions per request.
- Risk: no deterministic table active-session reuse guarantee.
- Insertion point: call canonical resolver first; only create session when resolver mode is `create`.

4) `apps/app/app/api/session/join/route.ts`
- Uses process-local in-memory `sessions` array and creates missing sessions.
- Risk: non-authoritative state and duplicate active sessions.
- Insertion point: delegate fully to canonical resolver.

5) `apps/app/app/api/session/start/route.ts`
- Checkout-oriented entry creates temporary session IDs.
- Risk: separate creation path not table-deterministic for QR flow.
- Insertion point: keep checkout use, but do not use for QR table resolution.

6) `apps/app/app/api/sessions/route.ts` (missing in current branch, required by callers)
- Multiple callers assume this endpoint supports session create/update/list.
- Risk: current absence forces fallback/mock patterns and fragmented create semantics.
- Insertion point: restore endpoint and make create path internally use canonical resolver for QR/table flows.

7) `apps/app/app/api/admin/qr/route.ts`
- Generates QR URLs to `/api/guest/enter` with lounge params.
- Good insertion point: include `tableId` and direct canonical guest entry path consistently.

8) `apps/app/app/api/qr-generator/route.ts`
- Uses in-memory `Map` for generated QR records.
- Risk: runtime-critical mapping becomes process-local.
- Insertion point: replace in-memory with durable storage and shared generation path.

9) `apps/app/lib/launchpad/qr-storage.ts`
- TODO-only persistence; currently no durable reads/writes.
- Insertion point: implement durable storage and retrieval used by QR generator APIs.

10) `apps/guest/lib/tableDataSync.ts`
- Explicit mock data and simulated sync.
- Risk: non-deterministic table/session mapping against DB truth.
- Insertion point: use app API DB-backed truth for table/session resolution.

## Participant reuse hooks
- Identity derivation in guest path:
  - `apps/guest/app/guest/[loungeId]/page.tsx`
  - `apps/guest/components/guest/QRGate.tsx`
- Resolver-side participant lookup/create:
  - `apps/app/app/api/session/resolve/route.ts`
- Staff participant visibility:
  - `apps/app/app/staff/scan/[sessionId]/page.tsx`
  - `apps/app/app/api/sessions/[id]/participants/route.ts` (new)

## Duplicate-session risk hotspots
- Any endpoint creating sessions without `table_id + ACTIVE` uniqueness check:
  - `apps/guest/app/api/guest/session/start/route.ts`
  - `apps/guest/app/api/session/start/route.ts`
  - `apps/app/app/api/session/join/route.ts`

## Drift integration insertion points
- Emit `recon.session.multi_active` when resolver detects >1 ACTIVE sessions for same table:
  - `apps/app/app/api/session/resolve/route.ts`
  - `apps/app/lib/recon/contract.ts`
  - `apps/app/lib/recon/validator.ts`
  - `apps/app/lib/recon/policy-core.ts`
  - `apps/app/app/api/recon/decision/route.ts`
