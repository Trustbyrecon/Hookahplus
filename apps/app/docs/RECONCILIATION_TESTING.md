# POS Reconciliation Testing Guide

**Agent:** Noor  
**Objective:** Test POS reconciliation job and achieve ≥95% reconciliation rate

## Overview

The reconciliation job matches Stripe charges with POS tickets and calculates reconciliation metrics. This guide covers both test mode (mock data) and production mode (real Stripe API).

## Test Mode (Mock Data)

Test mode allows you to test reconciliation logic without requiring Stripe API keys.

### Running Test Script

```bash
cd apps/app
export DATABASE_URL="file:./prisma/dev.db"
npx tsx scripts/test-reconciliation.ts
```

### What It Does

1. Creates test POS tickets (Square, Toast)
2. Creates mock Stripe charges that match/unmatch POS tickets
3. Runs reconciliation job in test mode
4. Reports reconciliation metrics
5. Cleans up test data

### Expected Output

```
🧪 [Noor] Testing POS Reconciliation Job

Step 1: Creating test POS tickets...
✅ Created 2 test POS tickets

Step 2: Creating mock Stripe charges...
✅ Created 3 mock Stripe charges

Step 3: Running reconciliation job...
[Noor] Starting POS reconciliation job...
[Noor] Reconciliation complete: {
  reconciliationRate: '66.67%',
  pricingParity: '100.00%',
  matched: 2,
  orphaned: 1
}

📊 Reconciliation Results:
  Total Stripe Charges: 3
  Total POS Tickets: 2
  Matched: 2
  Orphaned Stripe Charges: 1
  Orphaned POS Tickets: 0
  Reconciliation Rate: 66.67%
  Pricing Parity: 100.00%

✅ Matched Pairs:
  1. ch_test_match_001 ↔ TEST-POS-...-1 (high)
  2. ch_test_match_002 ↔ TEST-POS-...-2 (high)

⚠️  Orphaned Charges:
  1. ch_test_orphan_001: $50.00 - No matching POS ticket found
```

## Stripe Test Mode Setup (Recommended)

**Use Stripe test mode for reconciliation testing** - Safe, free, and validates reconciliation logic.

### Quick Setup

```bash
# 1. Get Stripe test key
#    Go to: https://dashboard.stripe.com/apikeys
#    Toggle to "Test mode" (top right)
#    Copy "Secret key" (starts with sk_test_)

# 2. Set environment variable
export STRIPE_SECRET_KEY="sk_test_51ABC123..."  # Your test key

# 3. Set database URL
export DATABASE_URL="file:./prisma/dev.db"

# 4. Run setup script (creates test charges + POS tickets)
cd apps/app
npx tsx scripts/setup-test-reconciliation.ts

# 5. Run reconciliation job
npx tsx jobs/settle.ts
```

### What the Setup Script Does

1. **Verifies Stripe Connection** - Checks your API key is valid
2. **Creates Test Stripe Charges** - 3 charges using test card `4242 4242 4242 4242`
3. **Creates Matching POS Tickets** - 2 tickets that match 2 of the charges
4. **Leaves 1 Orphaned Charge** - For testing orphan detection

### Expected Results

```
📊 Summary:
   - Stripe charges created: 3
   - POS tickets created: 2
   - Expected matches: 2
   - Expected orphaned charges: 1
   - Expected reconciliation rate: 66.67% (2/3)
```

**Note:** This initial rate is below 95% target. To achieve ≥95%, you need:
- More matching charges (5+ charges with 95%+ match rate)
- Or improve matching logic

### Cleanup Test Data

```bash
# Remove test POS tickets and reconciliation records
npx tsx scripts/setup-test-reconciliation.ts --cleanup
```

**Note:** Stripe charges cannot be deleted via API. They remain in your Stripe dashboard but won't affect future tests.

---

## Production Mode (Real Stripe API)

Production mode uses real Stripe charges from your Stripe account.

### Prerequisites

1. Stripe account with API access
2. Stripe secret key (test or live mode)
3. Environment variable configured

### Setup

```bash
# Set Stripe secret key
export STRIPE_SECRET_KEY="sk_test_..."  # Test mode (recommended)
# OR
export STRIPE_SECRET_KEY="sk_live_..."  # Live mode (production only)

# Set database URL
export DATABASE_URL="file:./prisma/dev.db"

# Run reconciliation job
cd apps/app
npx tsx jobs/settle.ts
```

### API Endpoint

You can also trigger reconciliation via API:

```bash
# POST to /api/pos/reconcile
curl -X POST http://localhost:3002/api/pos/reconcile \
  -H "Content-Type: application/json"

# GET to check status
curl http://localhost:3002/api/pos/reconcile
```

### Dashboard

View reconciliation metrics in the dashboard:

```
http://localhost:3002/reconciliation
```

## Webhook Replay Tool

Test reconciliation with POS webhook fixtures:

```bash
cd apps/app
export DATABASE_URL="file:./prisma/dev.db"
npx tsx tools/replayFixtures.ts
```

This tool:
- Replays Square, Toast, and Clover webhook fixtures
- Creates POS tickets from webhooks
- Tests idempotency (replaying same fixtures)
- Reports reconciliation rate

## Reconciliation Metrics

### Reconciliation Rate

```
Reconciliation Rate = Matched Charges / Total Stripe Charges
```

**Target:** ≥95%

### Pricing Parity

```
Pricing Parity = Exact Amount Matches / Total Matches
```

**Target:** ≥99%

### Match Confidence

- **High:** Exact amount match within 1 minute
- **Medium:** Amount match within tolerance (±$0.10) within 5 minutes
- **Low:** Amount match within tolerance but >2 minutes apart

## Matching Logic

Charges are matched to POS tickets based on:

1. **Amount Match:** Within tolerance (default: ±$0.10)
2. **Time Window:** Within 5 minutes (configurable)
3. **Session ID:** Optional exact match requirement

## Troubleshooting

### Error: "Stripe not configured"

**Solution:** Set `STRIPE_SECRET_KEY` environment variable or use test mode.

### Error: "The column does not exist"

**Solution:** Run database migration:
```bash
export DATABASE_URL="file:./prisma/dev.db"
npx prisma db push
```

### Low Reconciliation Rate

**Check:**
1. POS tickets have correct `amountCents` and `createdAt`
2. Stripe charges have matching amounts and timestamps
3. Session IDs match (if using `sessionIdMatch: true`)
4. Time window is sufficient (default: 5 minutes)

### Orphaned Charges

**Common Causes:**
- POS ticket not created (webhook failed)
- Amount mismatch (rounding differences)
- Time window too narrow
- Session ID mismatch

## Guardrail G1

When reconciliation rate ≥95%, the `POS_SYNC_READY` flag is automatically set:

```typescript
// In lib/config.ts
FEATURE_FLAGS.POS_SYNC_READY = true;
```

This unlocks:
- QR-only changes allowed
- Jules (Loyalty Ledger) can start
- Guardrail G1 enforcement relaxed

## Next Steps

1. **Achieve ≥95% reconciliation rate** → Unlocks G1
2. **Monitor reconciliation dashboard** → Track metrics over time
3. **Investigate orphaned charges** → Improve matching logic
4. **Set up alerts** → Notify when rate drops below 95%

## Related Files

- `apps/app/jobs/settle.ts` - Reconciliation job logic
- `apps/app/app/api/pos/reconcile/route.ts` - API endpoint
- `apps/app/app/reconciliation/page.tsx` - Dashboard UI
- `apps/app/scripts/test-reconciliation.ts` - Test script
- `apps/app/tools/replayFixtures.ts` - Webhook replay tool

