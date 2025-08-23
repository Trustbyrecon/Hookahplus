# 🚀 Hookah+ Launch Checklist

**Status: MVP Launch Execution**  
**Priority: HIGH - Production Ready**  
**Last Updated: ${new Date().toLocaleDateString()}**

## 📋 **Launch Checklist Overview**

### **⏳ Environment Configuration (HIGH Priority)**
- [ ] Configure `.env.production` with live Stripe keys
- [ ] Configure `.env.staging` with test Stripe keys  
- [ ] Set up Netlify environment variables
- [ ] Verify Trust-Lock secrets are unique per environment

### **⏳ Stripe Integration (HIGH Priority)**
- [ ] Set up production webhooks in Stripe Dashboard
- [ ] Test mode transactions verified
- [ ] Payment flow end-to-end tested
- [ ] Webhook signature verification working

### **⏳ Checkout Flow QA (HIGH Priority)**
- [ ] Full payment flow tested
- [ ] Mobile validation working
- [ ] Responsiveness verified
- [ ] Error handling tested

### **⏳ Analytics Wiring (MEDIUM Priority)**
- [ ] Configure GA ID in production
- [ ] Trust-Lock events firing on CTAs
- [ ] Conversion tracking verified
- [ ] Event debugging completed

---

## 🔧 **1. Environment Configuration (HIGH Priority)**

### **Production Environment Setup**
```bash
# 1. Create production environment file
cp env.production.example .env.production

# 2. Fill in LIVE Stripe keys (NOT test keys!)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# 3. Set production URLs and IDs
NEXT_PUBLIC_APP_URL=https://hookahplus.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
TRUSTLOCK_SECRET=your_unique_production_secret_32_chars_min
```

### **Staging Environment Setup**
```bash
# 1. Create staging environment file
cp env.staging.example .env.staging

# 2. Fill in TEST Stripe keys (safe for testing)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# 3. Set staging URLs and IDs
NEXT_PUBLIC_APP_URL=https://staging.hookahplus.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
TRUSTLOCK_SECRET=your_unique_staging_secret_32_chars_min
```

### **Netlify Environment Variables**
1. Go to Netlify Dashboard → Site Settings → Build & Deploy → Environment
2. Add these variables for **Production**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://hookahplus.net
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   TRUSTLOCK_SECRET=your_production_secret
   ```

3. Add these variables for **Staging**:
   ```
   NODE_ENV=staging
   NEXT_PUBLIC_APP_URL=https://staging.hookahplus.net
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   TRUSTLOCK_SECRET=your_staging_secret
   ```

---

## 💳 **2. Stripe Integration (HIGH Priority)**

### **Production Webhook Setup**
1. **Go to Stripe Dashboard** → Webhooks
2. **Add endpoint**: `https://hookahplus.net/api/webhooks/stripe`
3. **Select events**:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
4. **Copy webhook secret** → Add to `STRIPE_WEBHOOK_SECRET`

### **Test Mode Verification**
```bash
# Test cards for development
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Authentication: 4000 0025 0000 3155
```

### **Payment Flow Testing**
1. **Preorder Flow**: `/preorder/T-001` → Select flavor → Submit
2. **Checkout Flow**: Redirect to Stripe → Test payment → Return
3. **Webhook Flow**: Verify order marked as paid in dashboard
4. **Error Flow**: Test declined cards and error handling

---

## 🧪 **3. Checkout Flow QA (HIGH Priority)**

### **Desktop Testing**
- [ ] Chrome, Firefox, Safari
- [ ] All screen resolutions (1920x1080, 1366x768, etc.)
- [ ] Form validation working
- [ ] Stripe Elements loading properly

### **Mobile Testing**
- [ ] iOS Safari (iPhone 12, 13, 14)
- [ ] Android Chrome (Samsung, Pixel)
- [ ] Mobile responsiveness
- [ ] Touch interactions working

### **Payment Flow Validation**
- [ ] Preorder form submission
- [ ] Stripe checkout redirect
- [ ] Payment processing
- [ ] Success/failure handling
- [ ] Return to dashboard
- [ ] Order status updates

### **Error Handling**
- [ ] Network failures
- [ ] Invalid card numbers
- [ ] Declined payments
- [ ] Webhook failures
- [ ] Rate limiting

---

## 📊 **4. Analytics Wiring (MEDIUM Priority)**

### **Google Analytics Setup**
1. **Verify GA ID**: Check `NEXT_PUBLIC_GA_ID` is set
2. **Test Events**: Verify these events fire:
   - `Hero_StartPreorders`
   - `Preorder_Submit`
   - `Checkout_Pay`
   - `Order_Confirmed`
   - `Dashboard_View`

### **Trust-Lock Event Tracking**
```typescript
// Verify these events fire on CTAs
gtag('event', 'Trust_Lock_Verified', {
  event_category: 'Security',
  event_label: orderId,
  value: amount
});
```

### **Conversion Tracking**
- [ ] Preorder → Checkout conversion
- [ ] Checkout → Payment conversion
- [ ] Payment → Confirmation conversion
- [ ] Overall funnel conversion rate

---

## 🚀 **Launch Execution Steps**

### **Phase 1: Environment Setup (Day 1)**
1. ✅ Create production environment files
2. ✅ Configure Netlify environment variables
3. ✅ Set up Stripe production webhooks
4. ✅ Test environment configuration

### **Phase 2: Integration Testing (Day 2)**
1. ✅ Test Stripe checkout flow
2. ✅ Verify webhook processing
3. ✅ Test error handling
4. ✅ Mobile responsiveness testing

### **Phase 3: Analytics & QA (Day 3)**
1. ✅ Verify GA events firing
2. ✅ Test Trust-Lock events
3. ✅ End-to-end flow validation
4. ✅ Performance testing

### **Phase 4: Production Launch (Day 4)**
1. ✅ Deploy to production
2. ✅ Monitor webhook processing
3. ✅ Verify analytics tracking
4. ✅ Customer feedback collection

---

## 🔍 **Verification Checklist**

### **Pre-Launch Verification**
- [ ] All environment variables set
- [ ] Stripe webhooks configured
- [ ] Test payments working
- [ ] Mobile responsive
- [ ] Analytics tracking
- [ ] Error handling tested

### **Launch Day Verification**
- [ ] Production deployment successful
- [ ] Webhooks processing orders
- [ ] Analytics events firing
- [ ] No critical errors in logs
- [ ] Performance metrics green

### **Post-Launch Monitoring**
- [ ] Order processing success rate
- [ ] Webhook delivery rate
- [ ] Payment success rate
- [ ] Customer feedback
- [ ] Performance metrics

---

## 🚨 **Rollback Plan**

### **Fast Rollback (5 minutes)**
1. Revert to last stable Netlify deploy
2. Disable Stripe webhook temporarily
3. Update environment variables if needed

### **Full Rollback (15 minutes)**
1. Git revert to last stable commit
2. Rebuild and redeploy
3. Verify all systems operational

### **Emergency Contacts**
- **Stripe Support**: Disable webhooks if needed
- **Netlify Support**: Rollback deployment if needed
- **Development Team**: Code fixes and redeployment

---

## 📞 **Support & Resources**

### **Stripe Resources**
- [Stripe Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Stripe Checkout Guide](https://stripe.com/docs/checkout)
- [Stripe Support](https://support.stripe.com/)

### **Netlify Resources**
- [Environment Variables](https://docs.netlify.com/environment-variables/get-started/)
- [Deploy Previews](https://docs.netlify.com/site-deploys/deploy-previews/)
- [Netlify Support](https://docs.netlify.com/)

### **Analytics Resources**
- [Google Analytics 4](https://support.google.com/analytics/answer/10089681)
- [GA4 Events](https://support.google.com/analytics/answer/10091674)
- [GTM Setup](https://support.google.com/tagmanager/)

---

**🎯 Goal: Launch Hookah+ MVP with full Stripe integration, mobile optimization, and analytics tracking**

**📅 Timeline: 4 days to production launch**

**✅ Success Criteria: Live payments processing, mobile responsive, analytics tracking, zero critical errors**
