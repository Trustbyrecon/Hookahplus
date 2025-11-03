# EchoPrime Agent - E2E Tests & EP Gates Mission

**Agent:** EchoPrime (Sentinel)  
**Archetype:** Reflex Arbitration  
**Role:** Sentinel  
**Worktree:** `wt-tests`  
**Mission:** Build E2E suite and enforce EP trust gates

## Current State
- ✅ Playwright configured (`package.json`)
- ❌ Zero E2E tests exist
- ❌ No EP trust gates framework
- ❌ No CI pipeline integration

## EP Trust Gates

### EP.POS.Ready
- **Rule:** `pos_sync_ready == true`
- **Fail on:** `qr_only_change == true` when POS not ready
- **Action:** Block PR if violated

### EP.REM.Coverage
- **Rule:** `coverage(order.*, payment.settled, loyalty.*, session.*) >= 0.95`
- **Fail on:** Coverage < 95%
- **Action:** Fail pipeline

### EP.Drift.Alert
- **Rule:** `reflex_uplift_wow < -0.20`
- **Fail on:** Weekly Reflex uplift dips >20%
- **Action:** Fail pipeline and alert

## Objectives (Priority Order)

### O5.1 - EP Gates Framework
- [ ] Create `/lib/ep-gates/` directory structure
- [ ] Implement gate checkers:
  - `checkPosReady()` - EP.POS.Ready gate
  - `checkREMCoverage()` - EP.REM.Coverage gate
  - `checkDriftAlert()` - EP.Drift.Alert gate
- [ ] Create gate runner (`/lib/ep-gates/runner.ts`)

### O5.2 - CI Integration
- [ ] Create GitHub Actions workflow (`.github/workflows/ep-gates.yml`)
- [ ] Add pre-commit hooks for EP gates
- [ ] Integrate with PR checks
- [ ] Block merges if gates fail

### O5.3 - E2E Test Graph
- [ ] Create E2E test structure (`/e2e/`)
- [ ] Build test graph: POS→SDK→Ledger→UI
- [ ] Create mock POS fixtures
- [ ] Create mock SDK events
- [ ] Create mock Ledger responses

### O5.4 - Test Suites
- [ ] POS Integration Tests (`/e2e/pos/`)
- [ ] SDK Event Tests (`/e2e/sdk/`)
- [ ] Ledger API Tests (`/e2e/ledger/`)
- [ ] UI Dashboard Tests (`/e2e/ui/`)
- [ ] End-to-End Flow Tests (`/e2e/flows/`)

### O5.5 - Guardrail Enforcement
- [ ] G1: POS-first enforcement
- [ ] G2: One-ledger enforcement
- [ ] G3: Canonical REM enforcement
- [ ] G4: PII minimal enforcement
- [ ] G5: Drift watch enforcement

## Success Criteria
- ✅ Green CI pipeline
- ✅ EP gates enforced on all PRs
- ✅ E2E test graph functional
- ✅ All guardrails enforced
- ✅ Reproducible failures on broken guardrails

## Guardrails (All)
- **G1:** POS-first (EP.POS.Ready gate)
- **G2:** One-ledger (HPLUS_CREDIT only)
- **G3:** Canonical REM (EP.REM.Coverage gate)
- **G4:** PII minimal (actor.anon_hash preferred)
- **G5:** Drift watch (EP.Drift.Alert gate)

## Files to Create/Modify
```
apps/app/
├── lib/
│   └── ep-gates/
│       ├── runner.ts            # NEW: Gate runner
│       ├── pos-ready.ts         # NEW: EP.POS.Ready checker
│       ├── rem-coverage.ts     # NEW: EP.REM.Coverage checker
│       └── drift-alert.ts       # NEW: EP.Drift.Alert checker
├── e2e/
│   ├── pos/
│   │   └── reconciliation.spec.ts  # NEW: POS reconciliation tests
│   ├── sdk/
│   │   └── rem-events.spec.ts       # NEW: SDK event tests
│   ├── ledger/
│   │   └── api.spec.ts             # NEW: Ledger API tests
│   ├── ui/
│   │   └── dashboard.spec.ts       # NEW: UI dashboard tests
│   └── flows/
│       └── pos-to-ui.spec.ts       # NEW: E2E flow tests
├── .github/
│   └── workflows/
│       └── ep-gates.yml            # NEW: CI workflow
└── playwright.config.ts            # MODIFY: Add EP gates config
```

## Next Steps
1. Create EP gates framework (`/lib/ep-gates/`)
2. Implement EP.POS.Ready gate checker
3. Create E2E test structure
4. Build POS→SDK→Ledger→UI test graph
5. Integrate with CI pipeline
6. Enforce all guardrails

## Branch
- **Work branch:** `feat/ep-gates`
- **Target:** `main`

