# 🔗 Stripe Webhook Setup Guide - Production

## 🎯 **Objective**
Configure Stripe webhook for production to handle live payment confirmations.

## 📋 **Prerequisites**
- ✅ Live Stripe account (not test mode)
- ✅ Production domain: hookahplus.net
- ✅ Production environment variables configured

## 🚀 **Step-by-Step Setup**

### **1. Access Stripe Dashboard**
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **IMPORTANT**: Ensure you're in **LIVE** mode (not test mode)
3. Look for "LIVE" indicator in top-right corner

### **2. Navigate to Webhooks**
1. In left sidebar, click **Developers** → **Webhooks**
2. Click **Add endpoint**

### **3. Configure Webhook Endpoint**
```
Endpoint URL: https://hookahplus.net/api/webhooks/stripe
```

### **4. Select Events**
Select these events:
- ✅ `checkout.session.completed` - When payment succeeds
- ✅ `payment_intent.succeeded` - Alternative payment confirmation
- ✅ `payment_intent.payment_failed` - When payment fails

### **5. Set Webhook Secret**
1. After creating, click on the webhook
2. Click **Reveal** next to "Signing secret"
3. Copy the `whsec_` secret
4. Add to your environment: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

## 🔒 **Security Verification**

### **Verify Webhook is Secure**
- ✅ HTTPS endpoint (required)
- ✅ Webhook signing secret configured
- ✅ Only necessary events selected
- ✅ Production domain (hookahplus.net)

### **Test Webhook Delivery**
1. In Stripe Dashboard → Webhooks
2. Click on your webhook
3. Click **Send test webhook**
4. Select `checkout.session.completed`
5. Verify delivery status shows "Succeeded"

## 🧪 **Testing the Webhook**

### **Manual Test Flow**
1. Visit: `https://hookahplus.net/preorder/T-001`
2. Select a flavor and duration
3. Complete Stripe checkout with test card
4. Check webhook delivery in Stripe Dashboard
5. Verify order appears as "paid" in your dashboard

### **Test Cards for Live Mode**
```
✅ Success: 4242 4242 4242 4242
❌ Decline: 4000 0000 0000 0002
🔐 3D Secure: 4000 0025 0000 3155
```

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Webhook not delivering**
   - Check endpoint URL is correct
   - Verify SSL certificate is valid
   - Check firewall/security settings

2. **Signature verification failed**
   - Ensure `STRIPE_WEBHOOK_SECRET` is correct
   - Check for extra spaces or characters
   - Verify webhook secret matches dashboard

3. **Events not triggering**
   - Confirm correct events are selected
   - Check if webhook is active
   - Verify endpoint responds with 200 OK

### **Debug Steps**
1. Check Stripe Dashboard → Webhooks → Delivery attempts
2. Review your application logs for webhook errors
3. Test endpoint manually with curl/Postman
4. Verify environment variables are loaded

## 📊 **Monitoring**

### **Webhook Health Checks**
- Monitor delivery success rate
- Check response times
- Review failed deliveries
- Set up alerts for webhook failures

### **Production Metrics**
- Payment success rate
- Webhook delivery rate
- Order processing time
- Error rates by event type

## ✅ **Verification Checklist**

- [ ] Webhook endpoint created: `https://hookahplus.net/api/webhooks/stripe`
- [ ] Live mode (not test mode) selected
- [ ] Required events selected: `checkout.session.completed`
- [ ] Webhook signing secret copied to environment
- [ ] Test webhook delivery successful
- [ ] Manual payment flow tested
- [ ] Orders appearing as paid in dashboard
- [ ] Webhook security verified

## 🎉 **Success Criteria**

Your webhook is ready when:
1. ✅ Webhook shows "Active" status in Stripe
2. ✅ Test webhook delivery succeeds
3. ✅ Live payment creates order in your system
4. ✅ Webhook signature verification passes
5. ✅ Orders transition from "pending" to "paid"

## 🚀 **Next Steps**

After webhook setup:
1. Deploy to production domain
2. Run live mode verification tests
3. Complete $1 transaction test
4. Monitor webhook delivery
5. Launch MVP to customers
