# 🔐 Stripe Webhook Environment Variables Setup

## Safe Storage in `.env.local`

This guide shows how to safely configure Stripe webhook secrets in your local environment file.

## Environment Variables

### Test Mode (Sandbox) - For Development/Testing

Add these to `apps/app/.env.local`:

```bash
# ===========================================
# STRIPE TEST MODE (Sandbox)
# ===========================================
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here

# ===========================================
# DATABASE (Already configured)
# ===========================================
DATABASE_URL=postgresql://postgres.hsypmyqtlxjwpnkkacmo:****@aws-0-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&connection_limit=30&pool_timeout=10

# ===========================================
# APP CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3002
NODE_ENV=development
```

### Production Mode - For Vercel Production

**⚠️ DO NOT add production keys to `.env.local`**

Production keys should ONLY be set in Vercel Dashboard:
- Go to: Vercel Dashboard → Project Settings → Environment Variables
- Add for **Production** environment only

```bash
# Production (Vercel only - NOT in .env.local)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Live webhook secret
```

---

## Getting Webhook Secrets

### Test Mode Webhook Secret

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Create or select your test webhook endpoint
3. Click **"Reveal"** next to "Signing secret"
4. Copy the `whsec_...` value
5. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### Live Mode Webhook Secret

1. Go to: https://dashboard.stripe.com/webhooks (LIVE mode)
2. Create or select your production webhook endpoint
3. Click **"Reveal"** next to "Signing secret"
4. Copy the `whsec_...` value
5. Add to Vercel Production environment variables

---

## Security Best Practices

### ✅ DO:
- ✅ Keep `.env.local` in `.gitignore` (already configured)
- ✅ Use test keys for local development
- ✅ Use live keys ONLY in Vercel Production environment
- ✅ Rotate webhook secrets if compromised
- ✅ Use different webhook secrets for test and live modes

### ❌ DON'T:
- ❌ Commit `.env.local` to git
- ❌ Share webhook secrets in chat/email
- ❌ Use live keys in local development
- ❌ Use test keys in production
- ❌ Hardcode secrets in code

---

## Verification

### Check Test Mode Configuration

```bash
cd apps/app
npx tsx scripts/verify-stripe-webhook.ts
```

Expected output:
```
✅ Stripe Keys: Live Stripe keys configured
✅ Webhook Secret: Webhook secret configured
✅ Webhook Endpoint URL: Webhook endpoint: http://localhost:3002/api/webhooks/stripe
✅ Database for Webhooks: Database configured for webhook processing
```

### Test Webhook Locally

If testing locally, use Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3002/api/webhooks/stripe
```

This will give you a webhook secret - use this in `.env.local` for local testing.

---

## File Structure

```
apps/app/
├── .env.local              # Local environment variables (gitignored)
├── .gitignore              # Ensures .env.local is not committed
└── scripts/
    └── verify-stripe-webhook.ts  # Verification script
```

---

## Troubleshooting

### "Webhook secret not configured"
- Check `.env.local` exists in `apps/app/` directory
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Restart dev server after adding environment variables

### "Invalid signature"
- Ensure webhook secret matches Stripe Dashboard
- Check you're using test secret for test keys, live secret for live keys
- Verify endpoint URL matches exactly

### Environment variables not loading
- Ensure `.env.local` is in `apps/app/` directory (not root)
- Restart dev server: `npm run dev`
- Check file is not corrupted (no extra quotes, proper format)

---

**Last Updated:** 2025-01-16  
**Status:** Ready for Configuration ✅

