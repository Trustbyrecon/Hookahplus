# 🔧 Environment Setup Guide - Launch Checklist

## 📋 **Environment Configuration Status**

### ✅ **Phase 1: Environment Files Created**
- [x] `.env.local` template (for local development)
- [x] `.env.production` template (for production deployment)
- [x] `.env.staging` template (for staging deployment)

### 🎯 **Next Steps Required**

## **1. Local Development Setup**

Create `.env.local` file in project root with these values:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe Configuration (TEST MODE - Safe for development)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Trust-Lock Security
TRUSTLOCK_SECRET=your_super_long_random_string_here_minimum_32_chars

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## **2. Production Environment Setup**

### **Netlify Environment Variables**
Go to Netlify Dashboard → Site Settings → Build & Deploy → Environment Variables

Add these variables for **Production**:
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hookahplus.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
TRUSTLOCK_SECRET=your_production_secret
```

### **Vercel Environment Variables**
Go to Vercel Dashboard → Project Settings → Environment Variables

Add these variables for **Production**:
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hookahplus.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
TRUSTLOCK_SECRET=your_production_secret
```

## **3. Staging Environment Setup**

### **Staging Environment Variables**
```
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.hookahplus.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
TRUSTLOCK_SECRET=your_staging_secret
```

## **4. Stripe Keys Required**

### **Test Mode Keys (for development/staging)**
- `pk_test_...` - Publishable key
- `sk_test_...` - Secret key
- `whsec_...` - Webhook secret

### **Live Mode Keys (for production)**
- `pk_live_...` - Publishable key
- `sk_live_...` - Secret key
- `whsec_...` - Webhook secret

## **5. Security Configuration**

### **Trust-Lock Secret**
Generate a secure 32+ character random string:
```bash
# Generate secure secret
openssl rand -base64 32
```

### **JWT Secret** (if using authentication)
```bash
# Generate JWT secret
openssl rand -base64 64
```

## **6. Analytics Configuration**

### **Google Analytics 4**
1. Create GA4 property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to all environment variables

## **7. Database Configuration** (if applicable)

### **Production Database**
- Set up production database
- Add `DATABASE_URL` to environment variables

### **Staging Database**
- Set up staging database
- Add `DATABASE_URL` to environment variables

## **8. Monitoring Configuration**

### **Sentry DSN** (optional)
- Set up Sentry project
- Add `SENTRY_DSN` to environment variables

## **9. Verification Steps**

### **Local Development**
1. Copy `.env.local` template
2. Fill in test Stripe keys
3. Run `npm run dev`
4. Test payment flow

### **Staging Deployment**
1. Set staging environment variables
2. Deploy to staging
3. Test with test Stripe keys
4. Verify webhook delivery

### **Production Deployment**
1. Set production environment variables
2. Deploy to production
3. Test with live Stripe keys
4. Verify webhook delivery

## **10. Security Checklist**

- [ ] All secrets are 32+ characters
- [ ] No secrets in version control
- [ ] Different secrets per environment
- [ ] HTTPS endpoints only
- [ ] Webhook signatures verified
- [ ] Rate limiting enabled

## **11. Testing Checklist**

- [ ] Local development works
- [ ] Staging deployment works
- [ ] Production deployment works
- [ ] Payment flow works
- [ ] Webhook delivery works
- [ ] Analytics tracking works

---

**🎯 Goal: Complete environment configuration for all deployment targets**

**📅 Timeline: 1 day to complete setup**

**✅ Success Criteria: All environments configured, secrets secure, deployments working**
