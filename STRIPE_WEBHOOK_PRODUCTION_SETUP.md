# 🔗 Stripe Webhook Production Setup Guide

## 📋 **Current Webhook Implementation Status**

### ✅ **Webhook Endpoint Found**
- **Location**: `apps/web/app/api/webhooks/stripe/route.ts`
- **URL**: `https://hookahplus.net/api/webhooks/stripe`
- **Events Handled**: `checkout.session.completed`
- **Database**: Prisma integration with session storage

### 🎯 **Production Setup Required**

## **1. Stripe Dashboard Configuration**

### **Step 1: Access Stripe Dashboard**
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **IMPORTANT**: Ensure you're in **LIVE** mode (not test mode)
3. Look for "LIVE" indicator in top-right corner

### **Step 2: Create Production Webhook**
1. Navigate to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://hookahplus.net/api/webhooks/stripe`
4. **Description**: "Hookah+ Production Webhook"

### **Step 3: Select Required Events**
Select these events for production:
- ✅ `checkout.session.completed` - Payment success
- ✅ `payment_intent.succeeded` - Alternative payment confirmation
- ✅ `payment_intent.payment_failed` - Payment failure
- ✅ `invoice.payment_succeeded` - Subscription payments
- ✅ `customer.subscription.updated` - Subscription changes

### **Step 4: Get Webhook Secret**
1. After creating, click on the webhook
2. Click **"Reveal"** next to "Signing secret"
3. Copy the `whsec_` secret
4. **Save this securely** - you'll need it for environment variables

## **2. Environment Variables Setup**

### **Production Environment Variables**
Add these to your production deployment platform:

#### **Vercel Environment Variables**
Go to Vercel Dashboard → Project Settings → Environment Variables

```bash
# Stripe Configuration (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://hookahplus.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here

# Database
DATABASE_URL=your_production_database_url_here

# Security
TRUSTLOCK_SECRET=your_production_trustlock_secret_32_chars_min
```

#### **Netlify Environment Variables**
Go to Netlify Dashboard → Site Settings → Environment Variables

```bash
# Stripe Configuration (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://hookahplus.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here

# Database
DATABASE_URL=your_production_database_url_here

# Security
TRUSTLOCK_SECRET=your_production_trustlock_secret_32_chars_min
```

## **3. Webhook Testing**

### **Step 1: Test Webhook Endpoint**
```bash
# Test webhook endpoint accessibility
curl -X POST https://hookahplus.net/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

**Expected Response**: `{"error": "Missing stripe-signature header"}` (This is correct - means endpoint is accessible)

### **Step 2: Test with Stripe CLI**
```bash
# Install Stripe CLI if not already installed
# https://stripe.com/docs/stripe-cli

# Forward webhooks to production
stripe listen --forward-to https://hookahplus.net/api/webhooks/stripe
```

### **Step 3: Test Payment Flow**
1. Visit: `https://hookahplus.net/preorder/T-001`
2. Select a flavor and duration
3. Complete Stripe checkout with test card
4. Check webhook delivery in Stripe Dashboard
5. Verify order appears in your database

## **4. Webhook Security Verification**

### **Security Checklist**
- [ ] HTTPS endpoint (required by Stripe)
- [ ] Webhook signing secret configured
- [ ] Only necessary events selected
- [ ] Production domain (hookahplus.net)
- [ ] Rate limiting implemented
- [ ] Error handling in place

### **Verify Webhook Security**
1. Check webhook endpoint uses HTTPS
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Confirm webhook signature validation is working
4. Test with invalid signature (should reject)

## **5. Monitoring & Debugging**

### **Webhook Delivery Monitoring**
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Check **"Recent deliveries"** tab
4. Look for successful deliveries (green checkmarks)

### **Common Issues & Solutions**

#### **Webhook Not Receiving Events**
- Check webhook URL is correct
- Verify environment variables are set
- Check server logs for errors
- Ensure webhook is enabled

#### **Signature Verification Failed**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook secret matches Stripe dashboard
- Ensure raw body is being read correctly

#### **Database Connection Issues**
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Ensure Prisma schema is up to date

## **6. Production Deployment Checklist**

### **Pre-Deployment**
- [ ] Webhook endpoint created in Stripe
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Webhook signature validation working

### **Post-Deployment**
- [ ] Webhook endpoint accessible
- [ ] Test payment flow works
- [ ] Webhook events are received
- [ ] Database records are created
- [ ] Error handling works

### **Monitoring**
- [ ] Webhook delivery success rate > 95%
- [ ] Payment success rate > 95%
- [ ] Database connection stable
- [ ] No critical errors in logs

## **7. Rollback Plan**

### **If Webhook Issues Occur**
1. **Immediate**: Disable webhook in Stripe Dashboard
2. **Short-term**: Use manual payment verification
3. **Long-term**: Fix webhook issues and re-enable

### **Emergency Contacts**
- **Stripe Support**: For webhook issues
- **Database Support**: For connection issues
- **Development Team**: For code fixes

## **8. Success Criteria**

### **Webhook Setup Complete When**
- [ ] Webhook endpoint created in Stripe
- [ ] Environment variables configured
- [ ] Webhook signature validation working
- [ ] Test payments process successfully
- [ ] Database records are created
- [ ] No critical errors in logs

---

**🎯 Goal: Configure production Stripe webhooks for live payment processing**

**📅 Timeline: 2-4 hours to complete setup**

**✅ Success Criteria: Webhooks receiving events, payments processing, database updated**
