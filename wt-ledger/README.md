# Jules Agent - Loyalty Ledger (Pending POS Sync)

This directory contains Jules' work on the non-crypto loyalty ledger.

## Status: ⏸️ Waiting for POS Sync Ready

Jules' work is blocked until Noor completes POS reconciliation and sets `POS_SYNC_READY = true`.

## Quick Start (After POS Sync Ready)

```bash
# Navigate to worktree
cd wt-ledger

# Create feature branch
git checkout -b feat/loyalty-ledger

# Review mission (to be created)
```

## Objectives (Pending)

- [ ] POST /loyalty/issue endpoint
- [ ] POST /loyalty/redeem endpoint
- [ ] GET /wallet/:id/balance endpoint
- [ ] ACID ledger tables
- [ ] Issue→Redeem round-trip < 60s

