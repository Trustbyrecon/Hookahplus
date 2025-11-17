# ✅ Production Verification Complete

## 🎯 Status: Ready for Stripe Webhook Setup

### ✅ Database Verification

**Status:** Production database configuration verified and ready.

**Verified:**
- ✅ DATABASE_URL configured with connection pooler
- ✅ Database connection successful
- ✅ Session table accessible
- ✅ Connection pooling parameters configured

**Connection Details:**
- Using connection pooler (recommended for Vercel serverless)
- Pooler host: `aws-0-us-east-2.pooler.supabase.com:6543`
- Connection limits configured for optimal performance

---

## 🔗 Next: Stripe Webhook Verification

### Step 1: Run Webhook Verification Script

```bash
cd apps/app
npx tsx scripts/verify-stripe-webhook.ts
```

This will check:
- ✅ Stripe live keys configured
- ✅ Webhook secret configured
- ✅ Webhook endpoint URL
- ✅ Database configured for webhook processing

### Step 2: Configure Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - Visit: https://dashboard.stripe.com/webhooks
   - **IMPORTANT:** Ensure you're in **LIVE mode** (not test mode)
   - Look for "LIVE" indicator in top-right corner

2. **Create Production Webhook:**
   - Click **"Add endpoint"**
   - **Endpoint URL:** `https://app.hookahplus.net/api/webhooks/stripe`
   - **Description:** "Hookah+ Production Webhook"

3. **Select Required Events:**
   - ✅ `checkout.session.completed` - Payment success
   - ✅ `payment_intent.succeeded` - Payment confirmation
   - ✅ `payment_intent.payment_failed` - Payment failures
   - ✅ `invoice.payment_succeeded` - Subscription payments
   - ✅ `customer.subscription.updated` - Subscription changes

4. **Get Webhook Secret:**
   - After creating, click on the webhook
   - Click **"Reveal"** next to "Signing secret"
   - Copy the `whsec_...` secret

### Step 3: Add Webhook Secret to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select project: **hookahplus-app**
   - Navigate to: **Settings** → **Environment Variables**

2. **Add/Update STRIPE_WEBHOOK_SECRET:**
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (from Stripe Dashboard)
   - **Environment:** Select **Production** ✅
   - Click **"Save"**

3. **Verify Other Stripe Variables:**
   - `STRIPE_SECRET_KEY` = `sk_live_...` (live key, not test)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (live key, not test)

### Step 4: Redeploy App

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"..."** menu on latest deployment
3. Select **"Redeploy"**
4. Wait for build to complete (~2-3 minutes)

### Step 5: Test Webhook

#### Option A: Test Mode (Sandbox) - Recommended for Initial Testing

1. **Set Up Test Mode Webhook:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Create webhook endpoint: `https://app.hookahplus.net/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy test webhook secret (`whsec_...`)
   - Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...` (test mode)

2. **Test Using Pre-Order Page:**
   - Navigate to: `https://app.hookahplus.net/preorder/T-001`
   - **Enable "$1 Test Mode" toggle** (yellow banner)
   - Select flavors and click "Checkout"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete payment

3. **Verify Webhook Delivery:**
   - Go to Stripe Dashboard → **Test Webhooks** → Your endpoint
   - Click **"Events"** tab
   - Look for `checkout.session.completed` event
   - Check status: Should be **"Succeeded"** ✅

4. **Check Server Logs:**
   - Vercel Dashboard → **Deployments** → Latest → **Functions** → View logs
   - Look for: `[Stripe Webhook] Verified event: evt_...`
   - Should NOT see: `Webhook Error` or `Invalid signature`

#### Option B: Live Mode (Production)

1. **Use Live Webhook:**
   - Endpoint: `https://app.hookahplus.net/api/webhooks/stripe`
   - Created in: https://dashboard.stripe.com/webhooks (LIVE mode)
   - Use live webhook secret in Vercel Production environment

2. **Test with Real Transaction:**
   - Use Pre-Order page with $1 test mode enabled
   - Use a real card (small amount recommended)
   - Monitor webhook delivery in Stripe Dashboard

**📖 See [WEBHOOK_TEST_GUIDE.md](./WEBHOOK_TEST_GUIDE.md) for detailed testing instructions.**

---

## 📋 Verification Checklist

### Database ✅
- [x] DATABASE_URL configured
- [x] Connection pooler enabled
- [x] Database connection successful
- [x] Session table accessible

### Stripe Webhook ⏳
- [ ] STRIPE_SECRET_KEY configured (live mode)
- [ ] STRIPE_WEBHOOK_SECRET configured
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Events selected in Stripe Dashboard
- [ ] Webhook tested and verified

### Environment Variables
- [ ] `STRIPE_SECRET_KEY` = `sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
- [ ] `DATABASE_URL` = (connection pooler URL)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://app.hookahplus.net`

---

## 🚀 Quick Commands

### Verify Database
```bash
cd apps/app
npx tsx scripts/verify-production-database.ts
```

### Verify Stripe Webhook
```bash
cd apps/app
npx tsx scripts/verify-stripe-webhook.ts
```

### Full Production Verification
```bash
cd apps/app
npx tsx scripts/verify-production-ready.ts
```

---

## 📞 Support

If webhook verification fails:
1. Check Vercel logs for error messages
2. Verify webhook secret matches Stripe Dashboard
3. Ensure you're using LIVE keys (not test keys)
4. Check that webhook endpoint URL is correct
5. Verify events are selected in Stripe Dashboard

---

**Last Updated:** 2025-01-16  
**Status:** Database ✅ | Webhook ⏳ (In Progress)

