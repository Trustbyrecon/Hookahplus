# 🚀 Stripe MVP Deployment Guide

## **Complete Deployment Process**

### **Step 1: Deploy to Vercel** ✅
```bash
vercel --prod
```

### **Step 2: Configure Stripe Dashboard** 🔗
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Webhooks** section
3. Click **"Add endpoint"**
4. Enter endpoint URL: `https://your-app.vercel.app/api/stripe-webhook`
5. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.created`
   - `product.created`
6. Copy webhook secret: `whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI`

### **Step 3: Add Vercel Environment Variables** ⚙️
In Vercel Dashboard → Project Settings → Environment Variables:
- `STRIPE_WEBHOOK_SECRET_TEST`: `whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI`
- `STRIPE_SECRET_KEY_TEST`: Your test secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST`: Your test publishable key
- `STRIPE_LIVE_MODE`: `false`

### **Step 4: Sync Product Catalog** 📦
```bash
curl -X POST https://your-app.vercel.app/api/stripe-sync
```

### **Step 5: Test $1 Transactions** 💳
1. Go to your deployed app
2. Create a session with $1 test mode
3. Complete payment flow
4. Verify webhook events in Stripe Dashboard

## **Deployment Commands**

### **Build and Deploy**
```bash
# Install dependencies
npm install

# Build application
npm run build

# Deploy to Vercel
vercel --prod
```

### **Test Webhook Configuration**
```bash
# Test webhook endpoint
curl -X POST https://your-app.vercel.app/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{"type":"test","data":{"object":{"id":"test"}}}'
```

### **Sync Product Catalog**
```bash
# Sync all products to Stripe
curl -X POST https://your-app.vercel.app/api/stripe-sync
```

## **Environment Variables Required**

### **Vercel Environment Variables**
```
STRIPE_WEBHOOK_SECRET_TEST=whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI
STRIPE_SECRET_KEY_TEST=sk_test_your_test_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your_test_publishable_key
STRIPE_LIVE_MODE=false
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### **Stripe Dashboard Configuration**
- **Webhook Endpoint**: `https://your-app.vercel.app/api/stripe-webhook`
- **Webhook Secret**: `whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`

## **Testing Checklist**

### **Pre-Launch Testing**
- [ ] Deploy to Vercel successfully
- [ ] Configure Stripe webhook endpoint
- [ ] Add environment variables to Vercel
- [ ] Sync product catalog to Stripe
- [ ] Test webhook endpoint accessibility
- [ ] Test $1 payment transactions
- [ ] Verify webhook events in Stripe Dashboard

### **Post-Launch Monitoring**
- [ ] Monitor payment success rates
- [ ] Track webhook event processing
- [ ] Monitor error rates and flags
- [ ] Track revenue metrics
- [ ] Monitor system performance

## **Troubleshooting**

### **Common Issues**
1. **Webhook not receiving events**: Check endpoint URL and secret
2. **Payment failures**: Verify Stripe keys are correct
3. **Product sync errors**: Check Stripe permissions
4. **Environment variables**: Ensure all are set in Vercel

### **Debug Commands**
```bash
# Check webhook configuration
node scripts/test-webhook-config.js

# Test Stripe integration
node scripts/test-stripe-integration.js

# Deploy with webhook configuration
node scripts/deploy-with-webhook.js
```

## **Success Metrics**

### **Technical KPIs**
- Payment Success Rate: >99.5%
- Webhook Reliability: >99.9%
- Response Time: <2 seconds
- Error Rate: <0.1%

### **Business KPIs**
- Revenue per Session
- Upsell Conversion Rate
- Customer Retention
- Staff Efficiency

---

**Status**: Ready for MVP Launch! 🚀
