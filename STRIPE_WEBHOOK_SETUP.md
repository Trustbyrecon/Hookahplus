# 🔗 Stripe Webhook Configuration

## 📋 **Webhook Endpoints to Configure**

### **1. App Project Webhook**
- **URL**: `https://app-8cm83m8ky-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook`
- **Environment Variable**: `STRIPE_WEBHOOK_SECRET_APP`
- **Events to Listen For**:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `invoice.payment_succeeded`
  - `customer.subscription.updated`

### **2. Guest Project Webhook**
- **URL**: `https://guest-ebnp6ncy9-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook`
- **Environment Variable**: `STRIPE_WEBHOOK_SECRET_GUEST`
- **Events to Listen For**:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

## 🛠️ **Setup Steps**

### **Step 1: Create Webhook Endpoints in Stripe Dashboard**
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. **For App Webhook**:
   - Endpoint URL: `https://app-8cm83m8ky-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `invoice.payment_succeeded`, `customer.subscription.updated`
   - Click **"Add endpoint"**
   - Copy the **Signing secret** (starts with `whsec_...`)

4. **For Guest Webhook**:
   - Endpoint URL: `https://guest-ebnp6ncy9-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Click **"Add endpoint"**
   - Copy the **Signing secret** (starts with `whsec_...`)

### **Step 2: Add Webhook Secrets to Vercel**
1. Go to Vercel Dashboard → App project → Settings → Environment Variables
2. Add `STRIPE_WEBHOOK_SECRET_APP` with the app webhook secret
3. Go to Vercel Dashboard → Guest project → Settings → Environment Variables  
4. Add `STRIPE_WEBHOOK_SECRET_GUEST` with the guest webhook secret

### **Step 3: Test Webhooks**
1. In Stripe Dashboard → Webhooks → Select each endpoint
2. Click **"Send test webhook"**
3. Select `checkout.session.completed` event
4. Check Vercel Function Logs for successful receipt

## 🧪 **Testing Commands**

### **Test App Webhook**
```bash
curl -X POST https://app-8cm83m8ky-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### **Test Guest Webhook**
```bash
curl -X POST https://guest-ebnp6ncy9-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

## 📊 **Expected Response**
```json
{
  "received": true
}
```

## 🔍 **Troubleshooting**

### **If webhooks fail:**
1. Check Vercel Function Logs
2. Verify environment variables are set
3. Ensure webhook URLs are accessible
4. Check Stripe webhook endpoint status

### **Common Issues:**
- **404 Error**: Webhook endpoint not found (check URL)
- **400 Error**: Invalid signature (check webhook secret)
- **500 Error**: Server error (check function logs)

## ✅ **Success Indicators**
- Webhook endpoints return `{"received": true}`
- Stripe shows successful webhook deliveries
- Vercel logs show webhook processing
- Supabase `stripe_webhook_events` table gets populated
