# Production Verification Execution Guide

**Date:** 2025-01-27  
**Priority:** 5 - Production Environment Verification  
**Status:** Ready for Execution  
**Time Estimate:** 15 minutes

---

## 🚀 Quick Start

### Step 1: Run Automated Checks

```bash
cd apps/app
npx tsx ../../scripts/verify-production-env.ts
```

This will check:
- Environment variable formats (local reference)
- URL formats
- Key formats (Stripe, Supabase)
- Database URL format

**Note:** This checks local `.env` files as reference. Actual production values are in Vercel.

---

## 📋 Manual Verification Steps

### 1. Environment Variables in Vercel (5 minutes)

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Verify these are set for "Production" environment:**

- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `STRIPE_SECRET_KEY` - Live key (starts with `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret (starts with `whsec_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Live key (starts with `pk_live_`)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (e.g., `https://app.hookahplus.net`)
- [ ] `NEXT_PUBLIC_GUEST_URL` - Guest app URL
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] Supabase service role key (environment variable)
- [ ] `SUPABASE_ANON_KEY` - Anonymous key
- [ ] `RESEND_API_KEY` - Email API key (if enabled)
- [ ] `SENTRY_DSN` - Sentry DSN (if enabled)

**Action if missing:**
1. Add missing variables
2. Set environment to "Production"
3. Redeploy application

---

### 2. Stripe Webhook Configuration (3 minutes)

**Go to:** https://dashboard.stripe.com/webhooks

**Important:** Make sure you're in **LIVE mode** (not test mode)

**Check:**
- [ ] Webhook endpoint exists: `https://hookahplus.net/api/webhooks/stripe`
- [ ] Events selected:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- [ ] Webhook secret copied (starts with `whsec_`)

**Verify Secret Matches:**
1. Copy webhook secret from Stripe
2. Go to Vercel → Environment Variables
3. Check `STRIPE_WEBHOOK_SECRET` value
4. Verify they match

**Action if missing:**
1. Click "Add endpoint"
2. URL: `https://hookahplus.net/api/webhooks/stripe`
3. Select events (see above)
4. Copy webhook secret
5. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

---

### 3. Database Connection (2 minutes)

**Go to:** https://supabase.com/dashboard → Your Project → Database → Connection Pooling

**Check:**
- [ ] Database is accessible
- [ ] Connection pool is healthy
- [ ] No connection errors

**Verify in Vercel:**
- [ ] `DATABASE_URL` is set correctly
- [ ] Connection string format is valid

**Action if issues:**
1. Check Supabase database status
2. Verify connection string in Vercel
3. Test connection from Supabase dashboard

---

### 4. $1 Transaction Test (3 minutes)

**Go to:** https://hookahplus.net/preorder/T-001

**Steps:**
1. Fill out preorder form
2. Use Stripe test card: `4242 4242 4242 4242`
3. Complete payment
4. Verify payment processes successfully

**Verify Webhook:**
1. Go to Stripe Dashboard → Webhooks
2. Check webhook events for the transaction
3. Verify webhook was received and processed

**Expected:**
- [ ] Payment completes successfully
- [ ] Webhook event appears in Stripe
- [ ] No errors in Stripe Dashboard

---

### 5. Production Deployment Health (2 minutes)

**Go to:** https://vercel.com/dashboard → Your Project → Deployments

**Check:**
- [ ] Latest deployment status is "Ready"
- [ ] No build errors or warnings
- [ ] Deployment is recent (within last day)

**Test API Endpoints:**
```bash
# Health check
curl https://hookahplus.net/api/health

# Sessions endpoint
curl https://hookahplus.net/api/sessions
```

**Check Sentry (if enabled):**
- [ ] Go to Sentry Dashboard
- [ ] Check for production errors
- [ ] Verify error tracking is working

---

## ✅ Verification Checklist

### Environment Variables
- [ ] All required variables set in Vercel
- [ ] Variables are for "Production" environment
- [ ] No placeholder values
- [ ] Stripe keys are LIVE (not test)

### Stripe Integration
- [ ] Webhook endpoint exists in LIVE mode
- [ ] Webhook secret matches Vercel
- [ ] Test transaction works
- [ ] Webhook receives events

### Database
- [ ] Connection string configured
- [ ] Database is accessible
- [ ] Connection pool healthy

### Deployment
- [ ] Latest deployment is "Ready"
- [ ] No build errors
- [ ] API endpoints respond
- [ ] No critical errors in Sentry

---

## 📝 Verification Results

**Date:** _________________  
**Verified By:** _________________  
**Status:** [ ] Complete | [ ] Issues Found

### Issues Found:
_________________________________________________
_________________________________________________
_________________________________________________

### Notes:
_________________________________________________
_________________________________________________
_________________________________________________

---

## 🔗 Reference Documents

- Full Checklist: `tasks/PRODUCTION_VERIFICATION_CHECKLIST.md`
- Task Brief: `tasks/production-environment-verification-task-brief.md`
- Verification Script: `scripts/verify-production-env.ts`

---

**Next Action:** Complete manual verification steps above
