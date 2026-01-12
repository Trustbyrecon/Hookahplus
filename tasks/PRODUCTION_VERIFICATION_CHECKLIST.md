# Production Environment Verification Checklist

**Date:** 2025-01-27  
**Purpose:** Step-by-step checklist to verify production environment is ready  
**Reference:** `tasks/production-environment-verification-task-brief.md`

---

## ✅ Environment Variables Verification

### Required Variables (Check in Vercel Dashboard)

Go to: Vercel Dashboard → Project → Settings → Environment Variables

- [ ] `DATABASE_URL` - Supabase database connection string
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (live, starts with `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (starts with `whsec_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key (live, starts with `pk_live_`)
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL (e.g., `https://app.hookahplus.net`)
- [ ] `NEXT_PUBLIC_GUEST_URL` - Guest app URL
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] Supabase service role key (environment variable)
- [ ] Supabase anonymous key (environment variable)
- [ ] `RESEND_API_KEY` - Resend email API key (if email sending enabled)
- [ ] `SENTRY_DSN` - Sentry DSN (if error tracking enabled)

**Verification:**
- [ ] All variables are set for "Production" environment
- [ ] No variables are missing
- [ ] Variable values are correct (not placeholders)

---

## ✅ Stripe Webhook Verification

### Step 1: Check Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. **Make sure you're in LIVE mode** (not test mode)
3. Check if webhook endpoint exists:
   - URL: `https://hookahplus.net/api/webhooks/stripe`
   - Or: `https://app.hookahplus.net/api/webhooks/stripe`

### Step 2: Create Webhook (If Missing)

If webhook doesn't exist:
1. Click **"Add endpoint"**
2. URL: `https://hookahplus.net/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret (starts with `whsec_`)

### Step 3: Verify Webhook Secret

1. Go to Vercel Dashboard → Environment Variables
2. Check `STRIPE_WEBHOOK_SECRET` value
3. Verify it matches the webhook secret from Stripe Dashboard
4. If mismatch, update Vercel environment variable

**Verification:**
- [ ] Webhook endpoint exists in Stripe Dashboard
- [ ] Webhook secret matches Vercel `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook is in LIVE mode (not test mode)

---

## ✅ Database Connection Verification

### Step 1: Check Environment Variable

1. Go to Vercel Dashboard → Environment Variables
2. Verify `DATABASE_URL` is set
3. Verify it's a valid Supabase connection string

### Step 2: Test Connection

1. Go to Supabase Dashboard → Database → Connection Pooling
2. Verify database is accessible
3. Check connection pool status

**Verification:**
- [ ] `DATABASE_URL` is set in Vercel
- [ ] Database is accessible from Supabase Dashboard
- [ ] Connection pool is healthy

---

## ✅ $1 Live Transaction Test

### Step 1: Visit Production URL

1. Go to: `https://hookahplus.net/preorder/T-001`
   - Or: `https://app.hookahplus.net/preorder/T-001`

### Step 2: Complete Test Transaction

1. Fill out the preorder form
2. Use Stripe test card: `4242 4242 4242 4242`
3. Complete payment
4. Verify payment processes successfully

### Step 3: Verify Webhook Received

1. Go to Stripe Dashboard → Webhooks
2. Check webhook events for the transaction
3. Verify webhook was received and processed

**Verification:**
- [ ] Production URL is accessible
- [ ] Test transaction completes successfully
- [ ] Webhook receives payment event
- [ ] No errors in Stripe Dashboard

---

## ✅ Production Deployment Health

### Step 1: Check Vercel Deployment

1. Go to Vercel Dashboard → Deployments
2. Verify latest deployment status is "Ready"
3. Check for any build errors or warnings

### Step 2: Test API Endpoints

1. Test health endpoint: `https://hookahplus.net/api/health`
2. Test API endpoints are responding
3. Check for any 500 errors

### Step 3: Check Sentry (If Enabled)

1. Go to Sentry Dashboard
2. Check for any production errors
3. Verify error tracking is working

**Verification:**
- [ ] Latest deployment is "Ready"
- [ ] No build errors or warnings
- [ ] API endpoints respond correctly
- [ ] No critical errors in Sentry (if enabled)

---

## 📊 Verification Summary

### Environment Variables
- [ ] All required variables set
- [ ] Variables are for Production environment
- [ ] No placeholder values

### Stripe Integration
- [ ] Webhook endpoint exists
- [ ] Webhook secret matches
- [ ] Test transaction works

### Database
- [ ] Connection string configured
- [ ] Database is accessible
- [ ] Connection pool healthy

### Deployment
- [ ] Deployment is healthy
- [ ] API endpoints work
- [ ] No critical errors

---

## 🚨 If Issues Found

### Missing Environment Variables
1. Add missing variables in Vercel Dashboard
2. Redeploy application
3. Re-run verification

### Stripe Webhook Issues
1. Verify webhook URL is correct
2. Check webhook secret matches
3. Test webhook with Stripe CLI if needed

### Database Connection Issues
1. Verify `DATABASE_URL` is correct
2. Check Supabase database status
3. Verify connection pool settings

### Deployment Issues
1. Check Vercel build logs
2. Review error messages
3. Fix issues and redeploy

---

## ✅ Sign-Off

**Verified By:** _________________  
**Date:** _________________  
**Status:** [ ] Complete | [ ] Issues Found (see notes above)

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

---

**Reference:** `tasks/production-environment-verification-task-brief.md`
