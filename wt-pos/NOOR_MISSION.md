# Noor Agent - POS Spine Mission

**Agent:** Noor (Builder)  
**Archetype:** Structure Fusion  
**Role:** Builder  
**Worktree:** `wt-pos`  
**Mission:** Complete POS spine adapters and achieve ≥95% reconciliation rate

## Current State
- ✅ Square adapter exists (`apps/app/lib/pos/square.ts`)
- ✅ Toast adapter exists (`apps/app/lib/pos/toast.ts`)
- ✅ Clover adapter exists (`apps/app/lib/pos/clover.ts`)
- ❌ Reconciliation job missing (`apps/app/jobs/settle.ts`)
- ❌ Webhook replay system missing (`apps/app/tools/replayFixtures.ts`)
- ❌ Reconciliation rate unknown (likely < 95%)

## Objectives (Priority Order)

### O1.1 - Reconciliation Job (`/jobs/settle.ts`)
- [ ] Create reconciliation job that:
  - Matches Stripe charges ↔ POS tickets
  - Calculates reconciliation rate
  - Generates orphaned charge reports
  - Updates `SettlementReconciliation` table

### O1.2 - Webhook Replay System (`/tools/replayFixtures.ts`)
- [ ] Create webhook replay tool that:
  - Replays POS webhook fixtures
  - Tests reconciliation logic
  - Validates idempotency
  - Reports reconciliation rate

### O1.3 - Square Adapter Reconciliation
- [ ] Enhance `/lib/pos/square.ts`:
  - Add reconciliation methods
  - Improve order↔payment matching
  - Handle edge cases (refunds, partial payments)
  - Add logging for reconciliation metrics

### O1.4 - Toast/Clover Reconciliation
- [ ] Add reconciliation to Toast adapter
- [ ] Add reconciliation to Clover adapter
- [ ] Ensure consistent reconciliation API across all adapters

### O1.5 - Metrics & Reporting
- [ ] Create reconciliation dashboard/metrics
- [ ] Track reconciliation rate over time
- [ ] Alert on reconciliation rate < 95%
- [ ] Set `POS_SYNC_READY = true` when rate ≥ 95%

## Success Criteria
- ✅ Reconciliation rate ≥ 95%
- ✅ Pricing parity ≥ 99%
- ✅ `POS_SYNC_READY = true` (unlocks G1 guardrail)
- ✅ Webhook replay system functional
- ✅ All adapters support reconciliation

## Guardrail G1
**Rule:** No QR-only changes unless `POS_SYNC_READY == true`  
**Status:** Currently blocking QR-only changes  
**Action:** Complete O1.1-O1.5 to unlock

## Files to Create/Modify
```
apps/app/
├── jobs/
│   └── settle.ts              # NEW: Reconciliation job
├── tools/
│   └── replayFixtures.ts      # NEW: Webhook replay tool
├── lib/
│   ├── pos/
│   │   ├── square.ts          # MODIFY: Add reconciliation
│   │   ├── toast.ts            # MODIFY: Add reconciliation
│   │   └── clover.ts           # MODIFY: Add reconciliation
│   └── config.ts              # MODIFY: Update POS_SYNC_READY flag
└── app/
    └── api/
        └── pos/
            └── reconcile/     # NEW: Reconciliation API endpoint
                └── route.ts
```

## Next Steps
1. Create `/jobs/settle.ts` reconciliation job
2. Create `/tools/replayFixtures.ts` webhook replay tool
3. Enhance Square adapter with reconciliation methods
4. Test reconciliation with sample data
5. Achieve ≥95% reconciliation rate
6. Set `POS_SYNC_READY = true` in config

## Branch
- **Work branch:** `feat/pos-reconciliation`
- **Target:** `main`

