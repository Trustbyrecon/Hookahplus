# Lumi Agent - REM Schema & SDK Mission

**Agent:** Lumi (Explorer)  
**Archetype:** Signal Expansion  
**Role:** Explorer  
**Worktree:** `wt-sdk`  
**Mission:** Define REM schema and migrate ReflexEvent to TrustEvent.v1

## Current State
- ✅ `ReflexEvent` model exists (`apps/app/prisma/schema.prisma`)
- ✅ `/api/reflex/track` endpoint exists
- ❌ No REM schema definition (TrustEvent.v1)
- ❌ ReflexEvent not REM-compliant
- ❌ No rem-lint validator

## REM Schema Overview

### TrustEvent.v1 Structure
```yaml
TrustEvent.v1:
  id: "TE-{yyyy}-{seq}"
  ts_utc: "2025-10-29T19:20:30Z"
  type: "loyalty.redeemed"  # order.*, payment.settled, loyalty.*, session.*
  actor: 
    customer_id: "CUST-1903"
    anon_hash: "sha256:..."
  venue_id: "HPLUS-NYC-001"
  session_id: "S-93F4-7X1"
  context:
    vertical: "hookah"
    zone: "Corner C"
    time_local: "21:12"
  behavior:
    action: "repeat_mix"
    payload: { duration_minutes: 58 }
  sentiment:
    inferred: "relaxed"
    confidence: 0.82
  effect:
    loyalty_delta: -12.0
    credit_type: "HPLUS_CREDIT"
    reflex_delta: +0.03
  security:
    signature: "ed25519:..."
    device_id: "POS-TOAST-5C21"
```

## Objectives (Priority Order)

### O3.1 - REM Schema Definition
- [ ] Create `/schema/rem/v1.yaml` with TrustEvent.v1 spec
- [ ] Create TypeScript types from schema (`/lib/reflex/rem-types.ts`)
- [ ] Create JSON schema for validation (`/schema/rem/v1.json`)

### O3.2 - REM Linter (`/bin/rem-lint`)
- [ ] Create CLI tool to validate REM events
- [ ] Check required fields (actor.anon_hash, effect.loyalty_delta)
- [ ] Validate signature format
- [ ] Report coverage statistics

### O3.3 - Migrate ReflexEvent to REM
- [ ] Update `/api/reflex/track` to emit TrustEvent.v1 format
- [ ] Migrate existing ReflexEvent records (if needed)
- [ ] Ensure backward compatibility during migration

### O3.4 - SDK Client Hooks
- [ ] Create `/lib/reflex/client.ts` with hooks:
  - `useReflexTrack()` - React hook for tracking events
  - `trackTrustEvent()` - Client-side event emitter
  - `getReflexScore()` - Fetch Reflex score for customer

### O3.5 - Schema Coverage
- [ ] Ensure 100% schema coverage for:
  - `order.*` events
  - `payment.settled` events
  - `loyalty.*` events
  - `session.*` events
- [ ] Validate all events emit REM format

## Success Criteria
- ✅ REM schema defined and documented
- ✅ rem-lint validator functional
- ✅ 100% schema coverage
- ✅ All events emit TrustEvent.v1 format
- ✅ SDK client hooks available

## Guardrail G3
**Rule:** Every issuance/redemption must emit REM (TrustEvent.v1)  
**Status:** Not enforced yet  
**Action:** Complete O3.1-O3.5 to enforce

## Files to Create/Modify
```
apps/app/
├── schema/
│   └── rem/
│       ├── v1.yaml              # NEW: REM schema definition
│       ├── v1.json              # NEW: JSON schema
│       └── README.md             # NEW: Schema documentation
├── lib/
│   └── reflex/
│       ├── rem-types.ts         # NEW: TypeScript types
│       ├── client.ts              # NEW: SDK client hooks
│       └── validator.ts          # NEW: REM validator
├── bin/
│   └── rem-lint                 # NEW: CLI linter tool
├── app/
│   └── api/
│       └── reflex/
│           └── track/
│               └── route.ts     # MODIFY: Emit REM format
└── prisma/
    └── schema.prisma            # MODIFY: Update ReflexEvent model
```

## Next Steps
1. Create `/schema/rem/v1.yaml` with TrustEvent.v1 spec
2. Generate TypeScript types from schema
3. Create rem-lint validator
4. Migrate `/api/reflex/track` to emit REM format
5. Build SDK client hooks
6. Achieve 100% schema coverage

## Branch
- **Work branch:** `feat/rem-schema`
- **Target:** `main`

