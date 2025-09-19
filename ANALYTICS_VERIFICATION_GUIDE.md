# 📊 Analytics Verification Guide - Launch Checklist

## 📋 **Current Analytics Implementation Status**

### ✅ **Analytics Integration Found**
- **Google Analytics 4**: Implemented across the application
- **Event Tracking**: Multiple events configured
- **Trust-Lock Events**: Security events tracked
- **Conversion Tracking**: Funnel analysis available

### 🎯 **Phase 4: Analytics Wiring Verification**

## **1. Google Analytics 4 Setup**

### **Current GA4 Configuration**
```typescript
// Environment Variables Required
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_APP_URL=https://hookahplus.net
```

### **GA4 Events Currently Tracked**
1. **Hero_StartPreorders** - Landing page CTA clicks
2. **Hero_ViewDemo** - Demo video views
3. **Preorder_Submit** - Preorder form submissions
4. **Checkout_Pay** - Stripe checkout initiation
5. **Order_Confirmed** - Successful payment completion
6. **Dashboard_View** - Dashboard page views
7. **Trust_Lock_Verified** - Security verification events

## **2. Event Tracking Verification**

### **Step 1: Verify GA4 Configuration**
```bash
# Check if GA4 is properly configured
# Look for these elements in the page source:
# - gtag('config', 'G-XXXXXXXXXX')
# - gtag('event', 'page_view')
# - gtag('event', 'custom_event')
```

### **Step 2: Test Event Firing**
1. **Open Browser DevTools** → Console
2. **Navigate to landing page**
3. **Click "Start Preorders"** button
4. **Check console for**: `gtag('event', 'Hero_StartPreorders')`
5. **Repeat for all tracked events**

### **Step 3: Verify in GA4 Dashboard**
1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Go to **Reports** → **Realtime**
4. Perform actions on the site
5. Verify events appear in real-time

## **3. Conversion Funnel Tracking**

### **Funnel Steps to Verify**
1. **Landing Page** → `Hero_StartPreorders`
2. **Preorder Page** → `Preorder_Submit`
3. **Checkout Page** → `Checkout_Pay`
4. **Success Page** → `Order_Confirmed`
5. **Dashboard** → `Dashboard_View`

### **Conversion Rate Calculation**
```
Conversion Rate = (Order_Confirmed / Hero_StartPreorders) * 100
```

## **4. Trust-Lock Event Tracking**

### **Security Events to Verify**
- [ ] **Trust_Lock_Verified** - Order security verification
- [ ] **Trust_Lock_Failed** - Security verification failures
- [ ] **Audit_Order_Created** - Order creation audit
- [ ] **Audit_Order_Paid** - Payment completion audit

### **Trust-Lock Event Structure**
```typescript
gtag('event', 'Trust_Lock_Verified', {
  event_category: 'Security',
  event_label: orderId,
  value: amount,
  custom_parameters: {
    trust_signature: trustSig,
    table_id: tableId,
    session_tier: sessionTier
  }
});
```

## **5. Mobile Analytics Testing**

### **Mobile-Specific Events**
- [ ] **Mobile_Checkout_Start** - Mobile checkout initiation
- [ ] **Mobile_Payment_Success** - Mobile payment completion
- [ ] **Mobile_Form_Error** - Mobile form validation errors
- [ ] **Mobile_Performance_Issue** - Mobile performance problems

### **Mobile Testing Steps**
1. **Test on mobile device**
2. **Open browser dev tools**
3. **Perform checkout flow**
4. **Verify mobile events fire**
5. **Check GA4 real-time reports**

## **6. Error Tracking & Debugging**

### **Error Events to Track**
- [ ] **Payment_Error** - Stripe payment failures
- [ ] **Form_Validation_Error** - Form validation failures
- [ ] **Network_Error** - Network connectivity issues
- [ ] **Webhook_Error** - Webhook processing failures

### **Debug Mode Setup**
```typescript
// Enable GA4 debug mode
gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true
});
```

## **7. Performance Analytics**

### **Core Web Vitals Tracking**
- [ ] **LCP** (Largest Contentful Paint) < 2.5s
- [ ] **FID** (First Input Delay) < 100ms
- [ ] **CLS** (Cumulative Layout Shift) < 0.1

### **Performance Events**
- [ ] **Page_Load_Time** - Page load performance
- [ ] **Checkout_Load_Time** - Checkout page performance
- [ ] **Payment_Processing_Time** - Payment processing time
- [ ] **Dashboard_Load_Time** - Dashboard performance

## **8. A/B Testing Setup**

### **Test Variations**
- [ ] **Landing Page CTA** - Different button text/colors
- [ ] **Preorder Form** - Different form layouts
- [ ] **Checkout Flow** - Different checkout steps
- [ ] **Success Page** - Different confirmation messages

### **A/B Testing Events**
- [ ] **AB_Test_Started** - A/B test initiation
- [ ] **AB_Test_Variant_A** - Variant A selection
- [ ] **AB_Test_Variant_B** - Variant B selection
- [ ] **AB_Test_Conversion** - A/B test conversion

## **9. E-commerce Tracking**

### **Enhanced E-commerce Events**
- [ ] **purchase** - Complete purchase
- [ ] **add_to_cart** - Add item to cart
- [ ] **remove_from_cart** - Remove item from cart
- [ ] **view_item** - View product details
- [ ] **begin_checkout** - Start checkout process

### **E-commerce Event Structure**
```typescript
gtag('event', 'purchase', {
  transaction_id: orderId,
  value: totalAmount,
  currency: 'USD',
  items: [{
    item_id: 'hookah_session',
    item_name: 'Hookah Session',
    category: 'hookah',
    quantity: 1,
    price: sessionPrice
  }]
});
```

## **10. Custom Dimensions & Metrics**

### **Custom Dimensions**
- [ ] **Table ID** - Which table the order came from
- [ ] **Session Tier** - Base, Premium, or VIP
- [ ] **Customer Type** - New or returning
- [ ] **Payment Method** - Card type used
- [ ] **Device Type** - Mobile, tablet, desktop

### **Custom Metrics**
- [ ] **Order Value** - Total order amount
- [ ] **Session Duration** - Time spent on site
- [ ] **Checkout Steps** - Number of checkout steps
- [ ] **Error Count** - Number of errors encountered

## **11. Real-time Monitoring**

### **Real-time Dashboard Setup**
1. **GA4 Real-time Reports**
2. **Custom Real-time Dashboard**
3. **Error Monitoring Dashboard**
4. **Performance Monitoring Dashboard**

### **Alerts Configuration**
- [ ] **High Error Rate** - >5% error rate
- [ ] **Low Conversion Rate** - <10% conversion
- [ ] **Performance Issues** - >3s load time
- [ ] **Payment Failures** - >2% failure rate

## **12. Data Quality Verification**

### **Data Accuracy Checks**
- [ ] **Event Counts** - Events firing correctly
- [ ] **Conversion Rates** - Realistic conversion rates
- [ ] **Revenue Tracking** - Accurate revenue data
- [ ] **User Behavior** - Logical user flows

### **Data Validation**
- [ ] **Duplicate Events** - No duplicate event firing
- [ ] **Missing Events** - All expected events present
- [ ] **Event Parameters** - Correct parameter values
- [ ] **Timing Accuracy** - Events fire at correct times

## **13. Privacy & Compliance**

### **GDPR Compliance**
- [ ] **Cookie Consent** - Proper consent management
- [ ] **Data Retention** - Appropriate retention periods
- [ ] **User Rights** - Data deletion capabilities
- [ ] **Privacy Policy** - Clear privacy information

### **CCPA Compliance**
- [ ] **Opt-out Options** - User opt-out capabilities
- [ ] **Data Disclosure** - Clear data usage disclosure
- [ ] **Third-party Sharing** - Limited data sharing
- [ ] **User Control** - User data control options

## **14. Testing Checklist**

### **Pre-Launch Testing**
- [ ] All events fire correctly
- [ ] Conversion tracking works
- [ ] Error tracking functions
- [ ] Performance monitoring active
- [ ] Real-time reports working

### **Post-Launch Monitoring**
- [ ] Daily event monitoring
- [ ] Weekly conversion analysis
- [ ] Monthly performance review
- [ ] Quarterly optimization review

## **15. Success Criteria**

### **Analytics Setup Complete When**
- [ ] GA4 properly configured
- [ ] All events firing correctly
- [ ] Conversion tracking working
- [ ] Error tracking functional
- [ ] Performance monitoring active
- [ ] Real-time reports accessible
- [ ] Data quality verified
- [ ] Privacy compliance met

---

**🎯 Goal: Complete analytics verification for production launch**

**📅 Timeline: 1-2 days to complete verification**

**✅ Success Criteria: All analytics working, data accurate, monitoring active**
