# Task Brief: Fix Stripe SaaS Subscription Checkout

**Status:** In Progress  
**Priority:** High  
**Owner:** —  
**Created:** 2026-03-02  
**Root Cause (2026-03-02):** `api_key_expired` — Stripe secret key has expired

---

## Problem Statement

Checkout on `hookahplus.net/pricing` fails with a **500 Internal Server Error** when users click "Continue to Checkout" after entering their email. The `POST /api/subscribe` endpoint returns 500, preventing subscription signup for all tiers (Starter, Pro, Trust+).

---

## Success Criteria

- [ ] User can complete checkout flow for **Starter** tier (monthly & annual)
- [ ] User can complete checkout flow for **Pro** tier (monthly & annual)
- [ ] User can complete checkout flow for **Trust+** tier (monthly & annual)
- [ ] User is redirected to Stripe Checkout and can complete payment
- [ ] No 500 errors from `/api/subscribe`

---

## What's Been Done

| Action | Status |
|--------|--------|
| Created `scripts/seed-stripe-saas-tiers.js` for SaaS tier products | ✅ |
| Improved subscribe API error handling (validate price IDs, return `details`) | ✅ |
| Pushed env vars from `apps/site/.env.local` to Vercel (prod, preview, dev) | ✅ |
| Redeployed hookahplus-site production | ✅ |
| Created `scripts/vercel-env-push.sh` for future env sync | ✅ |
| Created `docs/PRICING_CHECKOUT_TEST.md` testing guide | ✅ |

---

## Remaining Work

### 1. Root Cause: Expired Stripe API Key

**Error:** `api_key_expired` (StripeAuthenticationError)

The `STRIPE_SECRET_KEY` in `apps/site/.env.local` and Vercel has expired. Stripe rotates keys periodically; you must use a current key.

### 2. Fix: Rotate Stripe Secret Key

1. **Get a new key:** [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys)
   - Use **Test mode** for development/preview
   - Use **Live mode** for production (hookahplus.net)
   - Click "Create secret key" or use the "Reveal" / "Roll key" option if the key was rotated

2. **Update local env:** Edit `apps/site/.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...   # or sk_live_... for production
   ```

3. **Push to Vercel:**
   ```bash
   bash scripts/vercel-env-push.sh
   ```

4. **Redeploy:**
   ```bash
   cd apps/site && vercel redeploy hookahplus.net
   ```

### 3. Other Possible Causes (if key is valid)

| If error is… | Fix |
|--------------|-----|
| "No such price" / invalid price ID | Re-run `npm run seed:stripe:saas` with correct Stripe key, update env vars, push to Vercel, redeploy |
| Test/live key mismatch | Ensure `STRIPE_SECRET_KEY` matches the Stripe account where prices exist (test vs live) |
| Missing env var | Add to Vercel, redeploy |

### 3. Validate Email Input

- Current validation: `email.includes('@')` only
- Screenshot shows `clark.dwayne@gmail` (incomplete)
- Consider stricter validation (e.g. `.com` or regex) to avoid downstream Stripe issues

### 4. Re-test After Fix

- Test each tier: Starter, Pro, Trust+
- Test both billing cycles: Monthly, Annual
- Use Stripe test card `4242 4242 4242 4242` if in test mode
- Confirm redirect to Stripe Checkout and successful completion

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/site/app/api/subscribe/route.ts` | Subscription checkout API |
| `apps/site/app/pricing/page.tsx` | Pricing page + checkout modal |
| `apps/site/lib/stripeServer.ts` | Stripe client (uses STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY) |
| `apps/site/.env.local` | Local env (source for Vercel) |
| `scripts/vercel-env-push.sh` | Push env to Vercel |
| `scripts/seed-stripe-saas-tiers.js` | Seed Stripe with tier products/prices |
| `apps/site/scripts/test-subscribe-api.js` | Diagnose Stripe errors (run from apps/site: `node scripts/test-subscribe-api.js`) |

---

## Env Vars Required (Vercel: hookahplus-site)

```
STRIPE_SECRET_KEY=sk_...
PRICE_TIER_STARTER=price_...
PRICE_TIER_STARTER_ANNUAL=price_...
PRICE_TIER_PRO=price_...
PRICE_TIER_PRO_ANNUAL=price_...
PRICE_TIER_TRUST_PLUS=price_...
PRICE_TIER_TRUST_PLUS_ANNUAL=price_...
# Add-on prices if add-ons are selectable
PRICE_ADDON_* = price_...
```

---

## Deployment Notes

- **Project:** hookahplus-site (serves hookahplus.net)
- **Redeploy after env changes:** `cd apps/site && vercel redeploy hookahplus.net`
- Env vars only apply to **new** deployments; redeploy is required after env updates

---

## References

- [PRICING_CHECKOUT_TEST.md](../PRICING_CHECKOUT_TEST.md) – Testing checklist
- [VERCEL_ENV_ALIGNMENT.md](../VERCEL_ENV_ALIGNMENT.md) – Env var reference
- [STRIPE_CATALOG_README.md](../../STRIPE_CATALOG_README.md) – Stripe catalog overview
