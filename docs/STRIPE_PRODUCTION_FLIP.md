# Stripe Production Flip: Test → Live

Switch hookahplus.net from Stripe test mode to live mode for real payments.

## Prerequisites

- Stripe account with live mode enabled
- Live secret key from [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) (toggle to **Live**)

## Steps

### 1. Get live Stripe key

1. Go to [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys)
2. Toggle **Test mode** to **Live**
3. Copy the **Secret key** (`sk_live_...`)

### 2. Update local env

Edit `apps/site/.env.local`:

```
STRIPE_SECRET_KEY=sk_live_...
```

Replace the test key with the live key.

### 3. Seed live products

Run the seed script to create products and prices in **live** Stripe:

```bash
npm run seed:stripe:saas
```

This creates tier products (Starter, Pro, Trust+) and add-ons in live mode. Copy the printed env vars.

### 4. Update .env.local with live price IDs

Replace the `PRICE_TIER_*` and `PRICE_ADDON_*` values in `.env.local` with the output from step 3. Live price IDs are different from test IDs.

### 5. Push to Vercel

Push env vars to production (and optionally preview/dev):

```bash
# Production only (recommended for live deploy)
bash scripts/vercel-env-push.sh --prod

# Or push to all environments
bash scripts/vercel-env-push.sh
```

### 6. Redeploy

```bash
cd apps/site && vercel redeploy hookahplus.net
```

### 7. Verify

- Visit https://hookahplus.net/pricing
- Click "Get Started" on any tier
- Enter email and "Continue to Checkout"
- Confirm redirect to Stripe Checkout (live mode)
- Use a real card or Stripe test card in live mode if available

## Notes

- **agentic_commerce_usage** is metered. Create it manually in Stripe Dashboard (live) if needed.
- Keep test keys in a separate `.env.test` or use Vercel Preview env vars for safe preview testing.
- Live keys charge real money. Test thoroughly before going live.
