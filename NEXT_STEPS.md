# 🎯 Next Steps on the Plan

**Current Status:** Phase 2 Complete ✅  
**Updated:** $(date)

## 📊 Agent Progress & Next Steps

### 🔴 Priority P0: Noor (POS Spine) - Critical Path to Unlock G1

**Completed:**
- ✅ O1.1: Reconciliation job created (`jobs/settle.ts`)
- ✅ API endpoint created (`app/api/pos/reconcile/route.ts`)
- ✅ Test script created (`scripts/test-reconciliation.ts`)

**Next Objectives (in order):**

#### O1.2 - Webhook Replay System ⏳ NEXT
**File:** `apps/app/tools/replayFixtures.ts`  
**Goal:** Create webhook replay tool for testing
- [ ] Replay POS webhook fixtures
- [ ] Test reconciliation logic
- [ ] Validate idempotency
- [ ] Report reconciliation rate

#### O1.3 - Square Adapter Reconciliation ⏳
**File:** `apps/app/lib/pos/square.ts`  
**Goal:** Enhance Square adapter
- [ ] Add reconciliation methods
- [ ] Improve order↔payment matching
- [ ] Handle edge cases (refunds, partial payments)
- [ ] Add logging for reconciliation metrics

#### O1.4 - Toast/Clover Reconciliation ⏳
**Files:** `apps/app/lib/pos/toast.ts`, `apps/app/lib/pos/clover.ts`  
**Goal:** Add reconciliation to all adapters
- [ ] Add reconciliation to Toast adapter
- [ ] Add reconciliation to Clover adapter
- [ ] Ensure consistent reconciliation API

#### O1.5 - Metrics & Reporting ⏳
**Goal:** Create reconciliation dashboard
- [ ] Track reconciliation rate over time
- [ ] Alert on reconciliation rate < 95%
- [ ] Set `POS_SYNC_READY = true` when rate ≥ 95% ⚠️ **UNLOCKS G1**

**🎯 Critical Milestone:** Achieve ≥95% reconciliation rate → Unlocks G1 Guardrail

---

### 🟡 Priority P1: Lumi (REM Schema) - Parallel Work

**Completed:**
- ✅ O3.1: REM schema defined (`schema/rem/v1.yaml`)
- ✅ O3.2: rem-lint validator created (`bin/rem-lint.ts`)
- ✅ O3.3: `/api/reflex/track` migrated to REM format

**Next Objectives:**

#### O3.4 - SDK Client Hooks ⏳ NEXT
**File:** `apps/app/lib/reflex/client.ts`  
**Goal:** Create React hooks for tracking
- [ ] `useReflexTrack()` - React hook for tracking events
- [ ] `trackTrustEvent()` - Client-side event emitter
- [ ] `getReflexScore()` - Fetch Reflex score for customer

#### O3.5 - Schema Coverage ⏳
**Goal:** Ensure 100% coverage
- [ ] Verify all `order.*` events emit REM format
- [ ] Verify all `payment.settled` events emit REM format
- [ ] Verify all `loyalty.*` events emit REM format
- [ ] Verify all `session.*` events emit REM format
- [ ] Run `rem-lint --coverage` to validate ≥95%

**🎯 Critical Milestone:** Achieve ≥95% REM coverage → Enables G3 enforcement

---

### 🟡 Priority P0: EchoPrime (EP Gates) - Parallel Work

**Completed:**
- ✅ O5.1: EP gates framework created
- ✅ O5.2: GitHub Actions workflow created (`.github/workflows/ep-gates.yml`)

**Next Objectives:**

#### O5.3 - E2E Test Graph ⏳ NEXT
**Files:** `apps/app/e2e/`  
**Goal:** Build complete test graph
- [ ] Create mock POS fixtures
- [ ] Create mock SDK events
- [ ] Create mock Ledger responses
- [ ] Build POS→SDK→Ledger→UI test flow

#### O5.4 - Test Suites ⏳
**Files:** `apps/app/e2e/pos/`, `apps/app/e2e/sdk/`, `apps/app/e2e/ledger/`, `apps/app/e2e/ui/`  
**Goal:** Complete all test suites
- [ ] POS Integration Tests (`e2e/pos/reconciliation.spec.ts`)
- [ ] SDK Event Tests (`e2e/sdk/rem-events.spec.ts`)
- [ ] Ledger API Tests (`e2e/ledger/api.spec.ts`)
- [ ] UI Dashboard Tests (`e2e/ui/dashboard.spec.ts`)

#### O5.5 - Guardrail Enforcement ⏳
**Goal:** Verify all guardrails enforced
- [ ] G1: POS-first enforcement (via EP.POS.Ready)
- [ ] G2: One-ledger enforcement
- [ ] G3: Canonical REM enforcement (via EP.REM.Coverage)
- [ ] G4: PII minimal enforcement
- [ ] G5: Drift watch enforcement (via EP.Drift.Alert)

---

## 🚦 Immediate Next Actions (This Week)

### 1. Noor → Test Reconciliation (Priority 1)
```bash
cd apps/app
npx tsx scripts/test-reconciliation.ts
```
**Goal:** Measure current reconciliation rate, identify gaps

### 2. Noor → Create Webhook Replay Tool (Priority 2)
**File:** `apps/app/tools/replayFixtures.ts`  
**Goal:** Enable testing reconciliation logic with sample data

### 3. Lumi → Create SDK Client Hooks (Priority 3)
**File:** `apps/app/lib/reflex/client.ts`  
**Goal:** Enable client-side REM event tracking

### 4. EchoPrime → Complete E2E Test Graph (Priority 4)
**Goal:** Build POS→SDK→Ledger→UI test flow

---

## 🔒 Guardrail Status & Dependencies

| Guardrail | Status | Blocker | Unlock Condition |
|-----------|--------|---------|------------------|
| **G1: POS-first** | 🔴 Active | Noor O1.5 | Reconciliation rate ≥ 95% |
| **G2: One-ledger** | 🟡 Ready | None | Always enforced |
| **G3: Canonical REM** | 🟡 Ready | Lumi O3.5 | REM coverage ≥ 95% |
| **G4: PII minimal** | 🟡 Ready | None | Always enforced |
| **G5: Drift watch** | 🟡 Ready | None | EP gates active |

**Critical Path:** Noor must complete O1.2-O1.5 to unlock G1, which then unblocks:
- Jules (Loyalty Ledger) can start
- QR-only changes become allowed

---

## 📋 Week 1 Sprint Plan

### Monday-Tuesday: Noor Testing & Webhook Replay
- [ ] Run reconciliation test script
- [ ] Analyze reconciliation rate
- [ ] Create webhook replay tool (`tools/replayFixtures.ts`)
- [ ] Test with sample POS webhook fixtures

### Wednesday-Thursday: Lumi SDK Hooks
- [ ] Create SDK client hooks (`lib/reflex/client.ts`)
- [ ] Implement `useReflexTrack()` hook
- [ ] Implement `trackTrustEvent()` function
- [ ] Implement `getReflexScore()` function

### Friday: EchoPrime E2E Tests
- [ ] Create mock POS fixtures
- [ ] Create mock SDK events
- [ ] Create mock Ledger responses
- [ ] Build POS→SDK→Ledger→UI test flow

---

## 🎯 Success Metrics

**Noor:**
- Target: Reconciliation rate ≥ 95%
- Current: TBD (run test to measure)

**Lumi:**
- Target: REM coverage ≥ 95%
- Current: TBD (run `rem-lint --coverage`)

**EchoPrime:**
- Target: All E2E tests passing
- Current: Framework ready, tests pending

---

**Status:** Ready for Phase 3 - Testing & Enhancement

