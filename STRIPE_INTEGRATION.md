# 🚀 Hookah+ Stripe Integration Guide

## Overview
This guide covers the complete Stripe integration for Hookah+ MVP, including payment processing, product catalog management, and dynamic pricing.

## 🏗️ Architecture

### Core Components
- **Stripe Configuration** (`lib/stripe-config.ts`) - Environment-based key management
- **Product Catalog** (`lib/stripe-catalog.ts`) - Dynamic product sync and pricing
- **Payment Processing** (`app/api/stripe-payment/route.ts`) - Payment intent creation
- **Checkout Integration** (`app/api/stripe-checkout/route.ts`) - Stripe Checkout sessions
- **Webhook Handler** (`app/api/stripe-webhook/route.ts`) - Event processing
- **Product Sync** (`app/api/stripe-sync/route.ts`) - Catalog synchronization

## 🔧 Setup

### 1. Environment Configuration
```bash
# Copy the example environment file
cp stripe.env.example .env.local

# Edit .env.local with your Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
```

### 2. Install Dependencies
```bash
npm install stripe @stripe/stripe-js
```

### 3. Deploy and Configure
```bash
# Run the deployment script
node scripts/deploy-stripe-mvp.js

# Or manually deploy
npm run build
vercel --prod
```

## 💳 Payment Flow

### 1. Payment Intent Creation
```typescript
// Create payment intent with dynamic pricing
const response = await fetch('/api/stripe-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_123',
    tableId: 'T-001',
    customerName: 'John Doe',
    totalAmount: 2500, // $25.00 in cents
    isTestMode: true, // $1.00 for testing
    membershipTier: 'gold',
    isBundle: false
  })
});
```

### 2. Checkout Session
```typescript
// Create Stripe Checkout session
const response = await fetch('/api/stripe-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_123',
    tableId: 'T-001',
    customerName: 'John Doe',
    totalAmount: 2500,
    isTestMode: true
  })
});

const { checkoutUrl } = await response.json();
// Redirect to checkoutUrl
```

### 3. Webhook Processing
```typescript
// Webhook events are automatically processed
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - customer.created
// - product.created
```

## 📦 Product Catalog

### Product Types
- **Hookah Sessions** - Base session products
- **Flavor Add-ons** - Additional flavors
- **Bundles** - Package deals
- **Memberships** - Recurring subscriptions

### Dynamic Pricing
- **Peak Hours** - 20% increase (Fri-Sun 7-11 PM)
- **Quiet Hours** - 40% discount (Mon-Thu 2-5 PM)
- **Membership Discounts** - 10-30% based on tier
- **Bundle Discounts** - 10% for packages

### Sync Products
```bash
# Sync all products to Stripe
curl -X POST https://your-app.vercel.app/api/stripe-sync
```

## 🧪 Testing

### Test Scripts
```bash
# Run comprehensive Stripe tests
node scripts/test-stripe-integration.js

# Test specific components
node scripts/test-stripe-payment.js
node scripts/test-stripe-checkout.js
```

### Test Mode
- Set `isTestMode: true` for $1.00 transactions
- Use test Stripe keys for development
- Monitor webhook events in Stripe Dashboard

## 🔗 Webhook Configuration

### Required Events
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.created`
- `product.created`
- `price.created`

### Webhook Endpoint
```
https://your-app.vercel.app/api/stripe-webhook
```

### Verification
```bash
# Test webhook endpoint
curl -X POST https://your-app.vercel.app/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{"type":"test","data":{"object":{"id":"test"}}}'
```

## 📊 Monitoring

### Stripe Dashboard
- Monitor payments in real-time
- Track webhook events
- View customer data
- Analyze revenue metrics

### Application Logs
- Payment processing logs
- Webhook event logs
- Error tracking
- Performance metrics

## 🚀 Production Launch

### Pre-Launch Checklist
- [ ] Live Stripe keys configured
- [ ] Webhook endpoints set up
- [ ] Product catalog synced
- [ ] Payment flows tested
- [ ] Error handling verified
- [ ] Monitoring configured

### Launch Steps
1. **Switch to Live Keys**
   ```bash
   STRIPE_LIVE_MODE=true
   ```

2. **Configure Production Webhooks**
   - Add webhook endpoint in Stripe Dashboard
   - Select required events
   - Copy webhook secret

3. **Sync Product Catalog**
   ```bash
   curl -X POST https://your-app.vercel.app/api/stripe-sync
   ```

4. **Test Live Payments**
   - Use real payment methods
   - Verify webhook events
   - Monitor transaction success

## 🔒 Security

### Best Practices
- Never expose secret keys in client-side code
- Validate webhook signatures
- Use HTTPS for all endpoints
- Implement rate limiting
- Monitor for suspicious activity

### Key Management
- Use environment variables for keys
- Rotate keys regularly
- Monitor key usage
- Implement key versioning

## 📈 Scaling

### Performance Optimization
- Cache product data
- Optimize webhook processing
- Implement retry logic
- Monitor response times

### Multi-Location Support
- Use Stripe Connect
- Implement location-based pricing
- Manage multiple webhook endpoints
- Centralize customer data

## 🆘 Troubleshooting

### Common Issues
1. **Webhook Signature Verification Failed**
   - Check webhook secret
   - Verify endpoint URL
   - Ensure proper headers

2. **Payment Intent Creation Failed**
   - Verify Stripe keys
   - Check amount format
   - Validate required fields

3. **Product Sync Errors**
   - Check product data format
   - Verify Stripe permissions
   - Monitor API rate limits

### Debug Commands
```bash
# Check Stripe configuration
node -e "console.log(process.env.STRIPE_SECRET_KEY_TEST)"

# Test webhook endpoint
curl -X GET https://your-app.vercel.app/api/stripe-webhook

# Verify product sync
curl -X GET https://your-app.vercel.app/api/stripe-sync
```

## 📞 Support

### Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

### Contact
- Technical Issues: Check application logs
- Stripe Issues: Contact Stripe Support
- Integration Questions: Review this guide

---

**Status**: Ready for MVP Launch! 🎉
