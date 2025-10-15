# 🚀 Production Environment Setup Guide

## **Priority 1: Production Environment Configuration**

### **Step 1: Configure .env.production with live Stripe keys**

Create a `.env.production` file in the `apps/app/` directory with the following configuration:

```bash
# Production Environment Configuration
# Hookah+ MVP Live Launch
# ⚠️  CRITICAL: Replace all placeholder values with your actual production keys

# ===========================================
# STRIPE CONFIGURATION (LIVE MODE)
# ===========================================
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE

# Public keys for client-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=https://hookahplus.net
NODE_ENV=production

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# Production database URL (PostgreSQL recommended)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# ===========================================
# STRIPE PRICE IDs (LIVE MODE)
# ===========================================
# Run 'npm run seed:stripe' in production to get these IDs
PRICE_SESSION_30=price_YOUR_LIVE_SESSION_30_PRICE_ID
PRICE_FLAVOR_150=price_YOUR_LIVE_FLAVOR_150_PRICE_ID
PRICE_TIER_STARTER=price_YOUR_LIVE_STARTER_99_PRICE_ID
PRICE_TIER_PRO=price_YOUR_LIVE_PRO_249_PRICE_ID
PRICE_TIER_TRUST_PLUS=price_YOUR_LIVE_TRUST_PLUS_499_PRICE_ID

# HookahPlus Reservation System (Live)
PRICE_ID_DEPOSIT_10=price_YOUR_LIVE_DEPOSIT_10_PRICE_ID
PRICE_ID_BRONZE_200=price_YOUR_LIVE_BRONZE_200_PRICE_ID
PRICE_ID_EXTRA_HOOKAH_30=price_YOUR_LIVE_EXTRA_HOOKAH_30_PRICE_ID

# ===========================================
# SECURITY & AUTHENTICATION
# ===========================================
# Generate a secure random string (minimum 32 characters)
TRUSTLOCK_SECRET=YOUR_PRODUCTION_TRUSTLOCK_SECRET_32_CHARS_MIN

# ===========================================
# POS INTEGRATION (PRODUCTION)
# ===========================================
SQUARE_ENV=production
SQUARE_ACCESS_TOKEN=YOUR_SQUARE_PRODUCTION_ACCESS_TOKEN
SQUARE_LOCATION_ID=YOUR_SQUARE_PRODUCTION_LOCATION_ID
SQUARE_WEBHOOK_SIGNATURE_KEY=YOUR_SQUARE_WEBHOOK_SIGNATURE_KEY

# ===========================================
# ANALYTICS & MONITORING
# ===========================================
NEXT_PUBLIC_GA_ID=G-YOUR_PRODUCTION_GA_ID
LOG_LEVEL=info

# ===========================================
# WEBHOOK ENDPOINTS (PRODUCTION)
# ===========================================
# Stripe webhook endpoint
STRIPE_WEBHOOK_URL=https://hookahplus.net/api/stripe/webhook

# Square webhook endpoint  
SQUARE_WEBHOOK_URL=https://hookahplus.net/api/square/webhook

# ===========================================
# VERCEL CONFIGURATION
# ===========================================
NODE_VERSION=20
VERCEL_ENV=production

# ===========================================
# FEATURE FLAGS (PRODUCTION)
# ===========================================
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_ENABLE_SQUARE=true
NEXT_PUBLIC_ENABLE_REFLEX_TRACKING=true
```

### **Step 2: Set up production webhook endpoints**

#### **2.1 Stripe Webhook Setup**
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://hookahplus.net/api/stripe/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### **2.2 Square Webhook Setup**
1. Go to [Square Developer Dashboard → Webhooks](https://developer.squareup.com/apps)
2. Create new webhook endpoint: `https://hookahplus.net/api/square/webhook`
3. Select events:
   - `payment.created`
   - `payment.updated`
   - `refund.created`
   - `refund.updated`
4. Copy the webhook signature key to `SQUARE_WEBHOOK_SIGNATURE_KEY`

### **Step 3: Configure domain DNS (hookahplus.net)**

#### **3.1 Domain Configuration**
1. **A Record**: Point `hookahplus.net` to Vercel's IP
   - Type: A
   - Name: @
   - Value: `76.76.19.61` (Vercel's IP)
   - TTL: 3600

2. **CNAME Record**: Point `www.hookahplus.net` to Vercel
   - Type: CNAME
   - Name: www
   - Value: `cname.vercel-dns.com`
   - TTL: 3600

3. **Subdomain Records** (for monorepo):
   - `app.hookahplus.net` → Vercel App Build
   - `guest.hookahplus.net` → Vercel Guest Build
   - `site.hookahplus.net` → Vercel Site Build

### **Step 4: Set up SSL certificates**

SSL certificates are automatically handled by Vercel when you:
1. Connect your domain to Vercel
2. Vercel automatically provisions Let's Encrypt SSL certificates
3. Force HTTPS redirect is enabled by default

### **Step 5: Configure production database**

#### **5.1 Database Options**
**Recommended: Vercel Postgres**
1. Go to Vercel Dashboard → Storage
2. Create new Postgres database
3. Copy connection string to `DATABASE_URL`

**Alternative: Supabase**
1. Go to [Supabase Dashboard](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string to `DATABASE_URL`

#### **5.2 Database Migration**
```bash
# Run in production
npm run db:migrate
npm run db:seed
```

### **Step 6: Vercel Environment Variables**

Add all environment variables to Vercel:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable from `.env.production`
3. Set environment to "Production"
4. Redeploy the application

### **Step 7: Stripe Live Mode Setup**

#### **7.1 Create Live Products**
```bash
# Run this in production environment
npm run seed:stripe:live
```

#### **7.2 Update Price IDs**
After seeding, update the price IDs in your environment variables.

### **Step 8: Testing Production Setup**

#### **8.1 Health Checks**
```bash
# Test API endpoints
curl https://hookahplus.net/api/health
curl https://hookahplus.net/api/stripe-health
```

#### **8.2 Stripe Test**
```bash
# Test Stripe integration
curl https://hookahplus.net/api/test-stripe-connection
```

### **Step 9: Security Checklist**

- [ ] All API keys are live/production keys
- [ ] Webhook secrets are properly configured
- [ ] Database connection is secure
- [ ] SSL certificates are active
- [ ] Environment variables are not exposed in client code
- [ ] TrustLock secret is generated securely

### **Step 10: Monitoring Setup**

- [ ] Google Analytics configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured

---

## **🚨 Critical Notes**

1. **Never commit `.env.production` to version control**
2. **Test all webhooks before going live**
3. **Verify all API keys are production keys**
4. **Monitor first few transactions closely**
5. **Have rollback plan ready**

---

## **📞 Support**

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test webhook endpoints manually
4. Check Stripe/Square dashboard for errors
