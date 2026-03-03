# What's Missing in Production (hookahplus.net)

Sandbox works. Production returns 500 on `/api/subscribe`. Here's the gap.

## Root Cause: Live Key + Test Price IDs

Your `apps/site/.env.local` has:
- **STRIPE_SECRET_KEY** = `sk_live_...` (live key)
- **PRICE_TIER_*** = `price_1Sb26...` (test price IDs)
- **PRICE_ADDON_*** = `price_1Sb3Yk...` (test price IDs)

The subscribe API uses `STRIPE_SECRET_KEY` first, so production uses the **live** key. But Stripe test and live modes use **separate** product/price catalogs. Test price IDs do not exist in live mode. Stripe returns an error (e.g. "No such price"), which surfaces as a 500.

## What's Missing

| Item | Status | Action |
|------|--------|--------|
| Live Stripe key | ✅ In .env.local | — |
| **Live price IDs** | ❌ Missing | Create in live Stripe, then update env |
| Env vars in Vercel production | ❓ Unknown | Push and verify |
| Redeploy after env change | ❓ Unknown | Redeploy so new env is used |

## Fix: 3 Steps

### 1. Seed live products (get live price IDs)

With `STRIPE_SECRET_KEY=sk_live_...` in `.env.local`:

```bash
npm run seed:stripe:saas
```

This creates products in **live** Stripe and prints new price IDs. Copy them.

### 2. Update .env.local with live price IDs

Replace all `PRICE_TIER_*` and `PRICE_ADDON_*` values with the output from step 1. Live IDs will look different (e.g. `price_1Abc...` instead of `price_1Sb26...`).

### 3. Push to Vercel and redeploy

```bash
bash scripts/vercel-env-push.sh --prod
cd apps/site && vercel redeploy hookahplus.net
```

## Quick Check

After fixing, run locally to confirm live works:

```bash
cd apps/site && node scripts/test-subscribe-api.js
```

If that succeeds, production should work after push + redeploy.
