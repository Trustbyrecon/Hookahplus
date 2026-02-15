# QR -> Session Codepath Map (Resolver Insertion)

This is the required discovery output for deterministic QR resolution and participant reuse.

## Canonical Resolver (target path)

- **Endpoint**: `POST /api/session/resolve`
- **File**: `apps/app/app/api/session/resolve/route.ts`
- **Creates sessions?**: Yes (via resolver service when no ACTIVE session exists)
- **Participant reuse hook**: `apps/app/lib/session/participant-resolver.ts` (`findFirst` on `sessionId + identityKey + ACTIVE`)
- **Duplicate-session risk handling**: Blocks when >1 ACTIVE session per table, emits `recon.session.multi_active`

## Current QR-triggered Session Creation/Join Paths

### 1) Guest entry bootstrap
- **Endpoint**: `POST /api/guest/enter`
- **File**: `apps/guest/app/api/guest/enter/route.ts`
- **Creates sessions?**: Yes (via call to `/api/session/resolve` with `tableId`), legacy fallback local session when no table context
- **Participant reuse hook**: Passes `identityToken`, `notMe`, returns `participantId` + `mode`
- **Duplicate-session risk**: Handled by resolver (returns blocked + conflict IDs)

### 2) Guest session start (guest namespace)
- **Endpoint**: `POST /api/guest/session/start`
- **File**: `apps/guest/app/api/guest/session/start/route.ts`
- **Creates sessions?**: Yes (indirect via `/api/session/resolve`)
- **Participant reuse hook**: Resolver handles `identityToken` and `notMe`
- **Duplicate-session risk**: Handled by resolver response (`409` blocked)

### 3) Guest session start (cross-app bridge)
- **Endpoint**: `POST /api/session/start`
- **File**: `apps/guest/app/api/session/start/route.ts`
- **Creates sessions?**: Yes (indirect via `/api/session/resolve`)
- **Participant reuse hook**: Resolver handles `identityToken` and `notMe`
- **Duplicate-session risk**: Handled by resolver response (`409` blocked)

### 4) Session join API (app side)
- **Endpoint**: `POST /api/session/join`
- **File**: `apps/app/app/api/session/join/route.ts`
- **Creates sessions?**: Yes (indirect via resolver)
- **Participant reuse hook**: Resolver
- **Duplicate-session risk**: Resolver blocked mode
- **Note**: Functional overlap with `/api/session/resolve`; should remain thin wrapper or be deprecated.

### 5) Direct session create API (legacy path with idempotency checks)
- **Endpoint**: `POST /api/sessions`
- **File**: `apps/app/app/api/sessions/route.ts`
- **Creates sessions?**: Yes (direct DB create and legacy fallback)
- **Participant reuse hook**: None today (not participant-aware by default)
- **Duplicate-session risk**: Manual checks by table/externalRef; not canonical resolver-based
- **Insertion point**: Before legacy idempotency checks, route QR table joins through resolver service for deterministic behavior.

## Supporting QR lifecycle paths

### A) Canonical QR generation endpoint
- **Endpoint**: `GET|POST /api/admin/qr`
- **File**: `apps/app/app/api/admin/qr/route.ts`
- **Expected output**: URL encoding `{ loungeId, tableId }` for resolver-based flow.

### B) Secondary QR generation endpoint
- **Endpoint**: `GET|POST /api/qr-generator`
- **File**: `apps/app/app/api/qr-generator/route.ts`
- **Current role**: Durable QR storage + calls `/api/admin/qr`
- **Consolidation target**: Keep as orchestration wrapper; no divergent URL logic or in-memory runtime mapping.

### C) QR storage
- **File**: `apps/app/lib/launchpad/qr-storage.ts`
- **Current role**: Durable storage in `org_settings` (JSON)
- **Risk status**: Acceptable for durability baseline; not used as runtime session source of truth.

## Duplicate session risk summary

- Highest risk remains **legacy direct create** via `POST /api/sessions` when called from non-resolver pathways.
- Deterministic guarantees are strongest when all QR-driven entry points route through:
  - `apps/app/app/api/session/resolve/route.ts`
  - `apps/app/lib/session/participant-resolver.ts`

