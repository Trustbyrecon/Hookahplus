# Pricing Checkout Testing Guide

Test Stripe subscription checkout for all tiers (Starter, Pro, Trust+) on `/pricing`.

## Prerequisites

1. **Stripe keys** in `apps/site/.env.local` or Vercel:
   - `STRIPE_SECRET_KEY` or `STRIPE_TEST_SECRET_KEY`
   - Use test keys (`sk_test_...`) for local/preview; live for production

2. **Price IDs** for each tier. If missing, run:

   ```bash
   npm run seed:stripe:saas
   ```

   This creates products in Stripe and prints env vars. Copy them to `apps/site/.env.local`:

   ```
   PRICE_TIER_STARTER=price_xxx
   PRICE_TIER_STARTER_ANNUAL=price_xxx
   PRICE_TIER_PRO=price_xxx
   PRICE_TIER_PRO_ANNUAL=price_xxx
   PRICE_TIER_TRUST_PLUS=price_xxx
   PRICE_TIER_TRUST_PLUS_ANNUAL=price_xxx
   ```

## Testing Checklist

| Tier    | Monthly | Annual | Notes                    |
|---------|---------|--------|--------------------------|
| Starter | $79/mo  | $790/yr| 1 lounge, basic features |
| Pro     | $249/mo | $2490/yr| Up to 3 lounges         |
| Trust+  | $499/mo | $4990/yr| Up to 7 lounges         |

1. Go to `https://hookahplus.net/pricing` (or `http://localhost:3000/pricing` locally)
2. Toggle **Monthly** / **Annual** billing
3. Click **Get Started** on each tier
4. Enter email in the "Almost There!" modal
5. Click **Continue to Checkout**
6. Verify redirect to Stripe Checkout
7. Use test card `4242 4242 4242 4242` in test mode

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Stripe pricing is not configured" | Run `npm run seed:stripe:saas` and add env vars |
| "STRIPE_SECRET_KEY missing" | Add Stripe key to `.env.local` or Vercel |
| "No such price: 'undefined'" | Price IDs not set; run seed and add env vars |
| 500 with `details` in response | Check server logs; `details` often includes Stripe error |

## Vercel

For `hookahplus.net`, set all env vars in **Vercel → Project → Settings → Environment Variables** for Production and Preview. The site app reads from `apps/site` (marketing site).
