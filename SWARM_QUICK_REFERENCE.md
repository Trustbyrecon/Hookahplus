# Swarm Agent Quick Reference

## 🚀 Agent Commands

### Noor (POS Reconciliation)
```bash
# Test reconciliation job
cd apps/app
npx tsx jobs/settle.ts

# Run via API
curl -X POST http://localhost:3002/api/pos/reconcile

# Check reconciliation status
curl http://localhost:3002/api/pos/reconcile
```

### Lumi (REM Schema)
```bash
# Check REM coverage
cd apps/app
npx tsx bin/rem-lint.ts --coverage

# Validate event file
npx tsx bin/rem-lint.ts path/to/event.json

# Test REM types
node -e "const { validateTrustEvent } = require('./lib/reflex/rem-types'); console.log(validateTrustEvent({...}))"
```

### EchoPrime (EP Gates)
```bash
# Run all EP gates
cd apps/app
node -e "
import('./lib/ep-gates/runner.js').then(async (m) => {
  const result = await m.runEPGates([]);
  console.log(JSON.stringify(result, null, 2));
});
"

# Run E2E tests
npx playwright test e2e/flows/pos-to-ui.spec.ts
```

## 📋 Key Files

### Noor
- `apps/app/jobs/settle.ts` - Reconciliation job
- `apps/app/app/api/pos/reconcile/route.ts` - Reconciliation API

### Lumi
- `apps/app/schema/rem/v1.yaml` - REM schema definition
- `apps/app/lib/reflex/rem-types.ts` - TypeScript types
- `apps/app/bin/rem-lint.ts` - CLI validator

### EchoPrime
- `apps/app/lib/ep-gates/runner.ts` - Gate runner
- `apps/app/lib/ep-gates/*.ts` - Individual gate checkers
- `apps/app/e2e/flows/pos-to-ui.spec.ts` - E2E tests

## 🔒 Guardrail Enforcement

| Guardrail | Gate | Status | Check |
|-----------|------|--------|-------|
| G1: POS-first | EP.POS.Ready | 🔴 Active | `checkPosReady()` |
| G3: Canonical REM | EP.REM.Coverage | 🟡 Ready | `checkREMCoverage()` |
| G5: Drift watch | EP.Drift.Alert | 🟡 Ready | `checkDriftAlert()` |

## 📊 Success Metrics

**Noor:**
- Target: Reconciliation rate ≥ 95%
- Current: TBD (run job to measure)

**Lumi:**
- Target: REM coverage ≥ 95%
- Current: TBD (run `rem-lint --coverage`)

**EchoPrime:**
- Target: All EP gates passing
- Current: ✅ Framework ready

## 🎯 Daily Checklist

- [ ] Noor: Run reconciliation job, check rate
- [ ] Lumi: Check REM coverage, migrate events
- [ ] EchoPrime: Run EP gates, check CI
- [ ] Update SWARM_EXECUTION_STATUS.md
- [ ] Report any blockers

