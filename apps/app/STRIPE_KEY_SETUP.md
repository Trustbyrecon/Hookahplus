# Stripe Key Setup for Local Development

**Issue:** "Stripe not configured" error when trying to process payments

## Quick Fix

The app is looking for `STRIPE_SECRET_KEY` in your environment variables. For local development, you need to add it to `.env.local`.

### Step 1: Get Stripe Test Key

1. Go to: https://dashboard.stripe.com/apikeys
2. Make sure you're in **Test mode** (toggle in top right)
3. Copy your **Secret key** (starts with `sk_test_...`)

### Step 2: Add to .env.local

Create or edit `apps/app/.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**Important:** 
- The key should start with `sk_test_` (test mode)
- Never commit this file to git (it's in `.gitignore`)
- Restart your dev server after adding the key

### Step 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd apps/app
npm run dev
```

### Step 4: Verify

1. Try creating a new session
2. Payment checkout should open automatically
3. Use test card: `4242 4242 4242 4242`

## Why This Happens

The app checks for `process.env.STRIPE_SECRET_KEY` at runtime. If it's not set, payment features are disabled. This is intentional for security - keys should never be hardcoded.

## Production

In production (Vercel), the key is set in environment variables:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `STRIPE_SECRET_KEY` with your live key (starts with `sk_live_...`)

