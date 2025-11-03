# 🚀 Production Environment Configuration - Complete Guide

**Status:** Ready for Production Setup  
**Priority:** CRITICAL - Required for Go-Live  
**Estimated Time:** 1-2 hours

---

## 📋 Overview

This guide walks you through configuring production environment variables for **live Stripe integration** and **Vercel deployment**.

---

## 🎯 What You Need

### **1. Stripe Live Keys** (Required)
- [ ] `pk_live_...` - Publishable key (public, safe for client-side)
- [ ] `sk_live_...` - Secret key (private, server-side only)
- [ ] `whsec_...` - Webhook signing secret (from Stripe Dashboard)

### **2. Vercel Account** (Required)
- [ ] Vercel project connected to GitHub repo
- [ ] Access to project settings

### **3. Production Domain** (Optional but Recommended)
- [ ] `hookahplus.net` configured in Vercel
- [ ] DNS records pointing to Vercel

### **4. Database** (Required)
- [ ] Production database URL (PostgreSQL or SQLite)
- [ ] Database migrations run

---

## 🔧 Step-by-Step Setup

### **Step 1: Get Stripe Live Keys**

1. **Go to Stripe Dashboard:**
   - Visit: https://dashboard.stripe.com/apikeys
   - **CRITICAL:** Toggle to **"Live mode"** (top right, switch from "Test mode")
   - Look for **"LIVE"** indicator in top-right corner

2. **Get Publishable Key:**
   - Copy **Publishable key** (starts with `pk_live_`)
   - This is safe for client-side use

3. **Get Secret Key:**
   - Click **"Reveal test key"** → Switch to **"Reveal live key"**
   - Copy **Secret key** (starts with `sk_live_`)
   - ⚠️ **KEEP THIS SECRET** - Never commit to git or expose publicly

4. **Verify Keys:**
   - Publishable key: `pk_live_...` (starts with `pk_live`)
   - Secret key: `sk_live_...` (starts with `sk_live`)
   - Test keys start with `pk_test_` and `sk_test_` - **DO NOT USE THESE IN PRODUCTION**

---

### **Step 2: Set Up Stripe Webhook (Production)**

1. **Go to Stripe Dashboard → Webhooks:**
   - Visit: https://dashboard.stripe.com/webhooks
   - **Make sure you're in LIVE mode**

2. **Create Webhook Endpoint:**
   - Click **"Add endpoint"**
   - **Endpoint URL:** `https://hookahplus.net/api/webhooks/stripe`
     - (Or your production domain if different)
   - **Description:** "Hookah+ Production Webhook"

3. **Select Events:**
   - ✅ `checkout.session.completed` - Payment success
   - ✅ `payment_intent.succeeded` - Payment confirmation
   - ✅ `payment_intent.payment_failed` - Payment failures
   - ✅ `charge.succeeded` - Charge completed
   - ✅ `charge.refunded` - Refunds

4. **Get Webhook Secret:**
   - After creating, click on the webhook
   - Click **"Reveal"** next to "Signing secret"
   - Copy the `whsec_...` secret
   - ⚠️ **Save this securely** - You'll need it for environment variables

---

### **Step 3: Configure Vercel Environment Variables**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: `hookahplus-app` (or your project name)

2. **Navigate to Environment Variables:**
   - Go to: **Settings** → **Environment Variables**

3. **Add Required Variables (Production):**

   For each variable below, click **"Add"** and set:
   - **Name:** (variable name)
   - **Value:** (your actual value)
   - **Environment:** Select **"Production"** ✅

   ```bash
   # ===========================================
   # STRIPE CONFIGURATION (LIVE MODE) - REQUIRED
   # ===========================================
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
   
   # ===========================================
   # APPLICATION CONFIGURATION - REQUIRED
   # ===========================================
   NEXT_PUBLIC_APP_URL=https://hookahplus.net
   NODE_ENV=production
   
   # ===========================================
   # DATABASE CONFIGURATION - REQUIRED
   # ===========================================
   DATABASE_URL=your_production_database_url_here
   
   # ===========================================
   # LOYALTY SYSTEM CONFIGURATION (Optional)
   # ===========================================
   LOYALTY_RATE_PERCENT=1.0
   
   # ===========================================
   # ANALYTICS (Optional)
   # ===========================================
   NEXT_PUBLIC_GA_ID=G-YOUR_GA_ID_HERE
   ```

4. **Add Variables for Preview/Development (Optional):**
   - Repeat above steps but select **"Preview"** or **"Development"**
   - Use **test keys** (`sk_test_...`, `pk_test_...`) for preview environments

5. **Save Changes:**
   - After adding all variables, click **"Save"**
   - ⚠️ **Important:** Redeploy your application for changes to take effect

---

### **Step 4: Verify Environment Variables**

Run this verification script to check if all variables are set:

```bash
cd apps/app
npx tsx scripts/verify-production-env.ts
```

**Expected Output:**
```
✅ STRIPE_SECRET_KEY: Set (sk_live_...)
✅ STRIPE_WEBHOOK_SECRET: Set (whsec_...)
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Set (pk_live_...)
✅ NEXT_PUBLIC_APP_URL: Set (https://hookahplus.net)
✅ DATABASE_URL: Set
❌ NEXT_PUBLIC_GA_ID: Not set (optional)
```

---

### **Step 5: Test Production Configuration**

1. **Deploy to Production:**
   - Push to `main` branch (auto-deploys)
   - Or manually trigger deployment in Vercel Dashboard

2. **Verify Deployment:**
   - Check deployment logs in Vercel Dashboard
   - Ensure build succeeds without errors

3. **Test Stripe Connection:**
   ```bash
   curl https://hookahplus.net/api/stripe-health
   ```
   **Expected:** `{"status": "ok", "mode": "live"}`

4. **Test $1 Transaction:**
   - Visit: `https://hookahplus.net/preorder/T-001`
   - Complete checkout with **real card**
   - Verify payment succeeds
   - Check Stripe Dashboard for charge

---

## 🔒 Security Checklist

Before going live, verify:

- [ ] ✅ All keys are **live keys** (`pk_live_`, `sk_live_`)
- [ ] ✅ No test keys in production environment
- [ ] ✅ Webhook secret matches Stripe Dashboard
- [ ] ✅ Environment variables are **not** committed to git
- [ ] ✅ Production database is secure
- [ ] ✅ HTTPS is enabled (Vercel auto-enables)
- [ ] ✅ Webhook endpoint uses HTTPS

---

## 📊 Environment Variables Reference

### **Required Variables:**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key (live) | `sk_live_51ABC...` | ✅ Yes |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_ABC123...` | ✅ Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (client-side) | `pk_live_51ABC...` | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Production domain | `https://hookahplus.net` | ✅ Yes |
| `DATABASE_URL` | Production database URL | `postgresql://...` | ✅ Yes |
| `NODE_ENV` | Environment mode | `production` | ✅ Yes |

### **Optional Variables:**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `LOYALTY_RATE_PERCENT` | Loyalty credit rate | `1.0` (1%) | ❌ No |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` | ❌ No |
| `LOG_LEVEL` | Logging level | `info` | ❌ No |

---

## 🔒 Security Best Practices

### **Never Commit Secrets to Git**

**Protected Files:**
- ✅ `.env.production.local` - Already in `.gitignore`
- ✅ All `.env*` files - Already in `.gitignore`
- ✅ Files containing `sk_live_`, `pk_live_`, `whsec_` - Protected

**How to Store Keys Securely:**
1. ✅ Use Vercel Environment Variables (recommended)
2. ✅ Use password manager for backup
3. ✅ Never commit to git repository
4. ✅ Never share in chat, email, or documentation

### **If Keys Are Accidentally Committed:**

1. **Immediately revoke keys** in Stripe Dashboard
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch apps/app/.env.production.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Generate new keys** from Stripe Dashboard
4. **Update Vercel** environment variables
5. **Force push** (coordinate with team first!)

---

## 🚨 Common Issues & Solutions

### **Issue 1: "Stripe not configured" Error**
**Solution:**
- Verify `STRIPE_SECRET_KEY` is set in Vercel
- Ensure it's a **live key** (`sk_live_...`)
- Redeploy application after setting variables

### **Issue 2: Webhook Not Receiving Events**
**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check webhook endpoint URL is correct
- Ensure webhook is enabled in Stripe Dashboard

### **Issue 3: "Invalid API Key" Error**
**Solution:**
- Verify you're using **live keys** in production
- Ensure keys start with `sk_live_` and `pk_live_`
- Check you're in **Live mode** in Stripe Dashboard

### **Issue 4: Environment Variables Not Loading**
**Solution:**
- Redeploy application after adding variables
- Verify variables are set for **Production** environment
- Check variable names match exactly (case-sensitive)

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] ✅ Stripe live keys obtained
- [ ] ✅ Webhook endpoint created in Stripe
- [ ] ✅ Webhook secret copied
- [ ] ✅ All environment variables set in Vercel
- [ ] ✅ Variables set for **Production** environment
- [ ] ✅ Application redeployed with new variables
- [ ] ✅ Stripe connection test passes
- [ ] ✅ Webhook test successful
- [ ] ✅ $1 transaction test completes

---

## 📞 Support Resources

### **Stripe Support:**
- Dashboard: https://dashboard.stripe.com
- API Docs: https://stripe.com/docs/api
- Support: Available 24/7 in dashboard

### **Vercel Support:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Support: Available in dashboard

### **Verification Script:**
```bash
cd apps/app
npx tsx scripts/verify-production-env.ts
```

---

## 🎯 Quick Reference

### **Get Stripe Keys:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Toggle to **Live mode**
3. Copy keys

### **Set Up Webhook:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. URL: `https://hookahplus.net/api/webhooks/stripe`
4. Copy webhook secret

### **Configure Vercel:**
1. Go to: Vercel Dashboard → Project → Settings → Environment Variables
2. Add all required variables
3. Set environment to **Production**
4. Redeploy

---

**Status:** ✅ Guide Complete - Ready to Configure Production Environment

**Next Steps:** Follow steps 1-5 above to configure production environment

