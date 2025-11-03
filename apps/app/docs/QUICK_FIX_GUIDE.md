# 🔧 Quick Fix Guide - Running Reconciliation & Analytics

## Issue 1: Stripe Not Configured

When running `npx tsx jobs/settle.ts` without Stripe keys, you get:
```
Error: Stripe not configured
```

### Solution Options:

**Option A: Run in Test Mode (No Stripe Required)**
```bash
cd apps/app
TEST_MODE=true npx tsx jobs/settle.ts

# Or use the flag:
npx tsx jobs/settle.ts --test-mode
```

This will:
- ✅ Run reconciliation with POS tickets only (no Stripe charges)
- ✅ Test loyalty credit issuance logic
- ✅ Work without Stripe API keys

**Option B: Use Your Existing Test Script**
```bash
cd apps/app
npx tsx scripts/test-loyalty-e2e.ts
```

This creates everything you need and tests the full flow.

**Option C: Set Up Stripe Test Mode**
```bash
# Set Stripe test key (get from https://dashboard.stripe.com/apikeys)
export STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"

# Then run reconciliation
cd apps/app
npx tsx jobs/settle.ts
```

---

## Issue 2: Server Not Running

When trying to curl the analytics endpoint:
```
curl: (7) Failed to connect to localhost port 3000
```

### Solution: Start Next.js Dev Server

```bash
cd apps/app

# Start the dev server
npm run dev

# Wait for: "Ready on http://localhost:3000"

# Then in another terminal, test the analytics endpoint:
curl http://localhost:3000/api/loyalty/analytics

# Or with pretty output:
curl http://localhost:3000/api/loyalty/analytics | jq
```

---

## 🎯 Quick Test Commands

### Test Loyalty System (E2E)
```bash
cd apps/app
npx tsx scripts/test-loyalty-e2e.ts
```

### Run Reconciliation (Test Mode - No Stripe)
```bash
cd apps/app
TEST_MODE=true npx tsx jobs/settle.ts
```

### Run Reconciliation (With Stripe)
```bash
cd apps/app
export STRIPE_SECRET_KEY="sk_test_..."
npx tsx jobs/settle.ts
```

### Test Analytics Endpoint
```bash
# Terminal 1: Start server
cd apps/app
npm run dev

# Terminal 2: Test endpoint
curl http://localhost:3000/api/loyalty/analytics | jq
```

---

## 📋 Complete Workflow Example

```bash
# 1. Start dev server
cd apps/app
npm run dev

# 2. In another terminal, run E2E test
cd apps/app
npx tsx scripts/test-loyalty-e2e.ts

# 3. Check analytics (while server is running)
curl http://localhost:3000/api/loyalty/analytics | jq

# 4. Run reconciliation in test mode
TEST_MODE=true npx tsx jobs/settle.ts
```

---

## ✅ Summary

- **Reconciliation without Stripe:** Use `TEST_MODE=true` or `--test-mode` flag
- **Analytics endpoint:** Requires `npm run dev` to be running
- **E2E test:** Works standalone, no server needed
- **Production reconciliation:** Requires `STRIPE_SECRET_KEY` environment variable

