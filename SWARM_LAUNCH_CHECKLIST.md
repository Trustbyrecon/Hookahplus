# 🎯 Swarm Agent Launch Checklist

**Status:** ✅ Setup Complete - Ready for Execution  
**Date:** $(date)

## ✅ Infrastructure Verified

### Worktrees Status
- ✅ `wt-pos` - Noor (POS Spine)
- ✅ `wt-ledger` - Jules (Loyalty Ledger) 
- ✅ `wt-sdk` - Lumi (REM Schema & SDK)
- ✅ `wt-ui` - 6 (Operator UI)
- ✅ `wt-tests` - EchoPrime (E2E & EP Gates)

### Mission Files
- ✅ `wt-pos/NOOR_MISSION.md` - Objectives defined
- ✅ `wt-sdk/LUMI_MISSION.md` - Objectives defined
- ✅ `wt-tests/ECHOPRIME_MISSION.md` - Objectives defined
- ✅ All README files created

### Feature Flags
- ✅ `apps/app/lib/config.ts` - Feature flags configured
- ✅ `POS_SYNC_READY = false` (Guardrail G1 active)
- ✅ All thresholds set (95% reconciliation, 95% REM coverage, -20% drift)

## 🚀 Agent Launch Sequence

### Phase 1: Immediate Start (P0)

#### Noor - POS Reconciliation
```bash
cd wt-pos
git checkout -b feat/pos-reconciliation
# Review: cat NOOR_MISSION.md
# Start: Create apps/app/jobs/settle.ts
```

**First Task:** Create reconciliation job
- File: `apps/app/jobs/settle.ts`
- Purpose: Match Stripe charges ↔ POS tickets
- Success: ≥95% reconciliation rate

#### Lumi - REM Schema (Parallel)
```bash
cd wt-sdk
git checkout -b feat/rem-schema
# Review: cat LUMI_MISSION.md
# Start: Create apps/app/schema/rem/v1.yaml
```

**First Task:** Define REM schema
- File: `apps/app/schema/rem/v1.yaml`
- Purpose: TrustEvent.v1 specification
- Success: 100% schema coverage

#### EchoPrime - EP Gates Framework (Parallel)
```bash
cd wt-tests
git checkout -b feat/ep-gates
# Review: cat ECHOPRIME_MISSION.md
# Start: Create apps/app/lib/ep-gates/runner.ts
```

**First Task:** EP gates framework
- Directory: `apps/app/lib/ep-gates/`
- Purpose: Guardrail enforcement
- Success: All gates functional

### Phase 2: After Dependencies (P1-P2)

#### Jules - Loyalty Ledger (Blocked)
**Status:** ⏸️ Waiting for `POS_SYNC_READY = true`
**Unlock:** Noor completes POS reconciliation

#### 6 - Operator UI (Blocked)
**Status:** ⏸️ Waiting for SDK + Ledger
**Unlock:** Lumi completes REM schema + Jules completes Ledger

## 🔒 Guardrail Status

| Guardrail | Status | Enforcement | Unlock Condition |
|-----------|--------|-------------|------------------|
| **G1: POS-first** | 🔴 ACTIVE | EP.POS.Ready gate | Noor achieves ≥95% reconciliation |
| **G2: One-ledger** | 🟡 READY | Manual + EP gates | N/A (always enforced) |
| **G3: Canonical REM** | 🟡 READY | EP.REM.Coverage gate | Lumi completes REM schema |
| **G4: PII minimal** | 🟡 READY | Manual + linting | N/A (always enforced) |
| **G5: Drift watch** | 🟡 READY | EP.Drift.Alert gate | EchoPrime implements gate |

## 📊 Success Metrics

### Noor (POS Spine)
- [ ] Reconciliation rate ≥ 95%
- [ ] Pricing parity ≥ 99%
- [ ] `POS_SYNC_READY = true` set
- [ ] Webhook replay system functional

### Lumi (REM Schema)
- [ ] REM schema defined (v1.yaml)
- [ ] rem-lint validator functional
- [ ] 100% schema coverage
- [ ] All events emit TrustEvent.v1 format

### EchoPrime (EP Gates)
- [ ] EP gates framework created
- [ ] E2E test graph functional
- [ ] CI integration complete
- [ ] All guardrails enforced

## 🎯 Next Actions

1. **Noor** → Start reconciliation job (`apps/app/jobs/settle.ts`)
2. **Lumi** → Start REM schema (`apps/app/schema/rem/v1.yaml`)
3. **EchoPrime** → Start EP gates (`apps/app/lib/ep-gates/`)

## 📝 Daily Pulse Template

```
## Daily Pulse - [Date]

### Completed Today
- Noor: [Achievement]
- Lumi: [Achievement]
- EchoPrime: [Achievement]

### In Progress
- Noor: [Current task] - [ETA]
- Lumi: [Current task] - [ETA]
- EchoPrime: [Current task] - [ETA]

### Blocked
- Jules: Waiting for POS_SYNC_READY
- 6: Waiting for SDK + Ledger

### Guardrail Status
- G1: 🔴 Active (blocking QR-only)
- G2-G5: 🟡 Ready

### Tomorrow Priority
- [Agent]: [Must-ship item]
```

---

**✅ All systems ready for swarm execution!**

