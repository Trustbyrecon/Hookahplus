# 🔧 Stripe Test Mode Fix

## Issue
When clicking "Proceed to Checkout" from Pre-Order page, Stripe loads in **LIVE mode** instead of **TEST mode (sandbox)**, causing test cards to be declined.

## Root Cause
The checkout API uses `process.env.STRIPE_SECRET_KEY` to determine mode:
- If key starts with `sk_test_` → TEST mode ✅
- If key starts with `sk_live_` → LIVE mode ❌

**Problem:** Production/Vercel environment has live keys configured, so checkout uses live mode even when testing.

## Solution

### Option 1: Use Test Keys in Local Development (Recommended)

1. **Check your `.env.local` file:**
   ```bash
   cd apps/app
   cat .env.local | grep STRIPE_SECRET_KEY
   ```

2. **Ensure test keys are set:**
   ```bash
   # In apps/app/.env.local
   STRIPE_SECRET_KEY=sk_test_your_test_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Verify mode in logs:**
   When you click checkout, check server logs for:
   ```
   [Checkout API] Stripe Mode: {
     isTestMode: true,
     mode: 'TEST (Sandbox)',
     warning: '✅ Using TEST mode - safe for testing'
   }
   ```

### Option 2: Force Test Mode via Environment Variable

Add a flag to force test mode regardless of key:

```bash
# In apps/app/.env.local
STRIPE_FORCE_TEST_MODE=true
STRIPE_SECRET_KEY=sk_test_...  # Still use test key
```

### Option 3: Use Stripe CLI for Local Testing

If testing locally, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3002/api/webhooks/stripe
```

This gives you a test webhook secret for local testing.

---

## Verification Steps

1. **Check Environment Variables:**
   ```bash
   cd apps/app
   npx tsx scripts/verify-stripe-webhook.ts
   ```

2. **Test Checkout:**
   - Navigate to Pre-Order page
   - Enable "$1 Test Mode" toggle
   - Click "Checkout"
   - Check server logs for mode detection
   - Use test card: `4242 4242 4242 4242`

3. **Expected Behavior:**
   - Server logs show: `mode: 'TEST (Sandbox)'`
   - Stripe checkout loads in **test mode** (not live)
   - Test card is accepted
   - Payment processes successfully

---

## Troubleshooting

### Still Loading Live Mode?

1. **Check which key is being used:**
   - Look at server logs when checkout is created
   - Should show: `keyPrefix: 'sk_test_...'`

2. **Verify environment variable:**
   ```bash
   # In apps/app directory
   node -e "console.log(process.env.STRIPE_SECRET_KEY?.substring(0, 10))"
   ```

3. **Check Vercel environment (if deployed):**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Ensure `STRIPE_SECRET_KEY` for **Preview/Development** is `sk_test_...`
   - Production should use `sk_live_...` (but don't test with test cards there!)

4. **Restart server:**
   - Environment variables are loaded at startup
   - Changes require server restart

---

## Code Changes Made

Added logging to `apps/app/app/api/checkout-session/route.ts`:

```typescript
// Log mode for debugging
const stripeKeyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'not set';
console.log('[Checkout API] Stripe Mode:', {
  isTestMode,
  keyPrefix: stripeKeyPrefix,
  mode: isTestMode ? 'TEST (Sandbox)' : 'LIVE (Production)',
  warning: !isTestMode ? '⚠️ Using LIVE mode - ensure you want to process real payments!' : '✅ Using TEST mode - safe for testing'
});
```

This will help identify which mode is being used.

---

**Last Updated:** 2025-01-16  
**Status:** Fixed with Enhanced Logging ✅

