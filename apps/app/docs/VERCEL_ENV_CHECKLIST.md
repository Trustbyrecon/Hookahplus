# 📋 Vercel Production Environment Variables Checklist

**Project:** `hookahplus-app`  
**Environment:** Production  
**Status:** Ready to Configure

---

## ✅ Step-by-Step Vercel Configuration

### **Step 1: Access Vercel Dashboard**

1. Go to: https://vercel.com/dashboard
2. Select project: `hookahplus-app` (or your project name)
3. Navigate to: **Settings** → **Environment Variables**

---

## 🔧 Required Environment Variables

Copy and paste these into Vercel, replacing `YOUR_VALUE_HERE` with your actual values:

### **1. Stripe Configuration (LIVE MODE)**

```bash
# Stripe Secret Key (LIVE MODE)
Name: STRIPE_SECRET_KEY
Value: sk_live_YOUR_LIVE_SECRET_KEY_HERE
Environment: Production ✅

# Stripe Webhook Secret (LIVE MODE)
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
Environment: Production ✅

# Stripe Publishable Key (LIVE MODE) - Client-side
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
Environment: Production ✅
```

**How to Get:**
- Stripe Keys: https://dashboard.stripe.com/apikeys (Toggle to **Live mode**)
- Webhook Secret: https://dashboard.stripe.com/webhooks → Your webhook → Reveal secret

---

### **2. Application Configuration**

```bash
# Production App URL
Name: NEXT_PUBLIC_APP_URL
Value: https://hookahplus.net
Environment: Production ✅

# Node Environment
Name: NODE_ENV
Value: production
Environment: Production ✅
```

---

### **3. Database Configuration**

```bash
# Production Database URL
Name: DATABASE_URL
Value: YOUR_PRODUCTION_DATABASE_URL_HERE
Environment: Production ✅
```

**Options:**
- Vercel Postgres: Go to Vercel Dashboard → Storage → Create Postgres
- Supabase: Go to Supabase Dashboard → Settings → Database → Connection string
- Other: Your PostgreSQL connection string

---

### **4. Optional Configuration**

```bash
# Loyalty Rate (Optional - defaults to 1%)
Name: LOYALTY_RATE_PERCENT
Value: 1.0
Environment: Production ✅

# Google Analytics (Optional)
Name: NEXT_PUBLIC_GA_ID
Value: G-YOUR_GA_ID_HERE
Environment: Production ✅
```

---

## 📝 Configuration Steps

### **For Each Variable:**

1. Click **"Add New"** button
2. Enter **Variable Name** (exact name from above)
3. Enter **Value** (your actual value)
4. Select **Environment:**
   - ✅ **Production** - For live site
   - ✅ **Preview** - For preview deployments (use test keys)
   - ✅ **Development** - For local dev (use test keys)

5. Click **"Save"**

---

## 🔒 Security Checklist

Before saving, verify:

- [ ] ✅ All Stripe keys start with `pk_live_` and `sk_live_` (NOT `pk_test_` or `sk_test_`)
- [ ] ✅ Webhook secret starts with `whsec_`
- [ ] ✅ Production URL uses HTTPS (`https://`)
- [ ] ✅ Database URL is secure and not exposed
- [ ] ✅ No test keys in production environment

---

## ✅ Verification

After adding all variables:

1. **Redeploy Application:**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on latest deployment
   - Or push a new commit to trigger deployment

2. **Verify Variables Are Loaded:**
   ```bash
   # Run verification script (after deployment)
   curl https://hookahplus.net/api/stripe-health
   ```
   **Expected:** `{"status": "ok", "mode": "live"}`

3. **Test Stripe Connection:**
   - Visit: `https://hookahplus.net/preorder/T-001`
   - Complete checkout with real card
   - Verify payment succeeds

---

## 🚨 Common Mistakes

### **❌ Using Test Keys in Production**
- **Wrong:** `pk_test_...` or `sk_test_...`
- **Correct:** `pk_live_...` or `sk_live_...`

### **❌ Wrong Environment Selected**
- **Wrong:** Setting Production variables in Preview environment
- **Correct:** Set Production variables with **Production** environment selected

### **❌ Not Redeploying**
- **Wrong:** Adding variables but not redeploying
- **Correct:** After adding variables, redeploy application

---

## 📊 Variable Reference Table

| Variable Name | Required | Starts With | Example |
|---------------|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | ✅ Yes | `sk_live_` | `sk_live_51ABC...` |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | `whsec_` | `whsec_ABC123...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | `pk_live_` | `pk_live_51ABC...` |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | `https://` | `https://hookahplus.net` |
| `DATABASE_URL` | ✅ Yes | `postgresql://` or `file:` | `postgresql://...` |
| `NODE_ENV` | ✅ Yes | `production` | `production` |
| `LOYALTY_RATE_PERCENT` | ❌ No | `1.0` | `1.0` (1%) |
| `NEXT_PUBLIC_GA_ID` | ❌ No | `G-` | `G-XXXXXXXXXX` |

---

## 🎯 Quick Copy-Paste Template

For Vercel Dashboard, copy this format:

```
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
NEXT_PUBLIC_APP_URL=https://hookahplus.net
DATABASE_URL=YOUR_DATABASE_URL_HERE
NODE_ENV=production
```

---

**Status:** ✅ Checklist Complete - Ready to Configure in Vercel

**Next:** Follow steps above to add variables to Vercel Dashboard

