# 🔑 Stripe Keys Setup Guide

## Current Issue
The Stripe API keys in `.env.local` are invalid or truncated. We need to get fresh test keys from Stripe Dashboard.

## Step 1: Get Stripe Test Keys

### 1.1 Access Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test mode** (toggle in top-left)
3. Copy the following keys:

### 1.2 Copy API Keys
```bash
# Publishable key (starts with pk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secret key (starts with sk_test_)
STRIPE_SECRET_KEY=sk_test_...

# Webhook secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
```

## Step 2: Update Environment Variables

### 2.1 Update Local Environment
```bash
# Update .env.local with valid keys
STRIPE_SECRET_KEY=sk_test_51RwvVARfdmLBb2p9YOUR_ACTUAL_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RwvVARfdmLBb2p9YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET_TEST=whsec_YOUR_ACTUAL_WEBHOOK_SECRET_HERE
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 2.2 Update Vercel Environment Variables
1. Go to Vercel Dashboard
2. Select each project (site, app, guest)
3. Go to Settings > Environment Variables
4. Add/update the following variables:

#### For All Apps:
```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=https://app-ndnxzy6jl-dwaynes-projects-1c5c280a.vercel.app
NEXT_PUBLIC_GUEST_URL=https://guest-98640stzs-dwaynes-projects-1c5c280a.vercel.app
NEXT_PUBLIC_SITE_URL=https://hookahplus-site-1kuwwh4eu-dwaynes-projects-1c5c280a.vercel.app
SESSION_DEFAULT_MINUTES=90
```

#### For App and Guest (Stripe Integration):
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET_APP=whsec_YOUR_APP_WEBHOOK_SECRET
STRIPE_WEBHOOK_SECRET_GUEST=whsec_YOUR_GUEST_WEBHOOK_SECRET
```

## Step 3: Test Stripe Connection

### 3.1 Test API Keys
```bash
# Test with curl
curl -X GET 'https://api.stripe.com/v1/products' \
  -H "Authorization: Bearer YOUR_STRIPE_SECRET_KEY"
```

### 3.2 Run Catalog Sync
```bash
# After updating keys, run the sync script
node scripts/sync-stripe-catalog.js
```

## Step 4: Configure Webhooks

### 4.1 Create Webhook Endpoints
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Add these endpoints:

#### App Webhook:
- **URL**: `https://app-ndnxzy6jl-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook`
- **Events**: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

#### Guest Webhook:
- **URL**: `https://guest-98640stzs-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook`
- **Events**: `checkout.session.completed`, `payment_intent.succeeded`

### 4.2 Copy Webhook Secrets
- Copy the webhook secret for each endpoint
- Add to Vercel environment variables

## Step 5: Verify Setup

### 5.1 Test Complete Flow
1. Update environment variables
2. Redeploy applications
3. Run API endpoint tests
4. Test payment flow

### 5.2 Success Indicators
- ✅ Stripe catalog sync completes without errors
- ✅ API endpoints respond correctly
- ✅ Webhooks receive test events
- ✅ Database connections work

## Troubleshooting

### Common Issues:
- **Invalid API Key**: Check key format and test mode
- **Webhook not receiving**: Verify URL and events
- **Database connection failed**: Check Supabase URL and keys
- **Environment variables not loading**: Redeploy applications

### Support:
- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
