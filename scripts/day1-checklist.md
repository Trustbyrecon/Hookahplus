# 📋 Day 1 Launch Checklist: Database & Environment Setup

## 🎯 **Morning Tasks (4 hours)**

### **Task 1: Supabase Database Setup (1.5 hours)**

#### **1.1 Create Supabase Project**
- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Project Name: `hookahplus-mvp`
- [ ] Generate strong database password
- [ ] Choose region closest to users
- [ ] Wait for project creation (2-3 minutes)

#### **1.2 Deploy Database Schema**
- [ ] Open SQL Editor in Supabase Dashboard
- [ ] Copy contents from `scripts/migrations/supabase-schema.sql`
- [ ] Paste and execute in SQL Editor
- [ ] Verify tables created: venues, staff, sessions, refills, reservations, ghostlog
- [ ] Check sample data inserted

#### **1.3 Get API Keys**
- [ ] Go to Settings > API
- [ ] Copy Project URL
- [ ] Copy anon/public key
- [ ] Copy service_role key
- [ ] Test database connection

### **Task 2: Environment Configuration (1.5 hours)**

#### **2.1 Configure Vercel Environment Variables**
- [ ] Go to Vercel Dashboard
- [ ] Select hookahplus-site project
- [ ] Add environment variables:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `DATABASE_URL`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXT_PUBLIC_GUEST_URL`
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `SESSION_DEFAULT_MINUTES=90`

#### **2.2 Configure App Environment Variables**
- [ ] Select hookahplus-app project
- [ ] Add Stripe variables:
  - [ ] `STRIPE_SECRET_KEY` (test mode)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode)
  - [ ] `STRIPE_WEBHOOK_SECRET_APP`
  - [ ] `DATABASE_URL`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`

#### **2.3 Configure Guest Environment Variables**
- [ ] Select hookahplus-guest project
- [ ] Add Stripe variables:
  - [ ] `STRIPE_SECRET_KEY` (test mode)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode)
  - [ ] `STRIPE_WEBHOOK_SECRET_GUEST`
  - [ ] `DATABASE_URL`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`

### **Task 3: Redeploy Applications (1 hour)**

#### **3.1 Redeploy All Apps**
- [ ] Redeploy site: `cd apps/site && vercel --prod`
- [ ] Redeploy app: `cd apps/app && vercel --prod`
- [ ] Redeploy guest: `cd apps/guest && vercel --prod`

#### **3.2 Verify Deployments**
- [ ] Check all apps are accessible
- [ ] Verify environment variables loaded
- [ ] Test basic functionality

## 🎯 **Afternoon Tasks (4 hours)**

### **Task 4: Stripe Catalog Sync (1 hour)**

#### **4.1 Install Dependencies**
- [ ] Install Stripe CLI if not already installed
- [ ] Install Node.js dependencies

#### **4.2 Sync Product Catalog**
- [ ] Run: `node scripts/sync-stripe-catalog.js`
- [ ] Verify products created in Stripe Dashboard
- [ ] Copy price IDs to environment variables
- [ ] Test catalog sync API endpoint

### **Task 5: Stripe Webhook Configuration (1.5 hours)**

#### **5.1 Configure App Webhook**
- [ ] Go to Stripe Dashboard > Webhooks
- [ ] Add endpoint: `https://app-ndnxzy6jl-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook`
- [ ] Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy webhook secret to Vercel environment

#### **5.2 Configure Guest Webhook**
- [ ] Add endpoint: `https://guest-98640stzs-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook`
- [ ] Select events: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Copy webhook secret to Vercel environment

#### **5.3 Test Webhook Delivery**
- [ ] Send test webhook from Stripe Dashboard
- [ ] Verify webhook received and processed
- [ ] Check logs for any errors

### **Task 6: API Endpoint Testing (1.5 hours)**

#### **6.1 Run Comprehensive Tests**
- [ ] Run: `node scripts/test-api-endpoints.js`
- [ ] Review test results
- [ ] Fix any failing tests
- [ ] Verify all endpoints responding correctly

#### **6.2 Test Database Integration**
- [ ] Test session creation with database
- [ ] Test refill workflow
- [ ] Test reservation system
- [ ] Verify audit logging

## 🎯 **Evening Tasks (2 hours)**

### **Task 7: Final Validation (1 hour)**

#### **7.1 End-to-End Testing**
- [ ] Test complete session workflow
- [ ] Test payment processing
- [ ] Test refill and reservation flows
- [ ] Verify webhook automation

#### **7.2 Performance Check**
- [ ] Check API response times
- [ ] Verify database query performance
- [ ] Test mobile responsiveness
- [ ] Check error handling

### **Task 8: Documentation & Preparation (1 hour)**

#### **8.1 Update Documentation**
- [ ] Update README with new URLs
- [ ] Document environment setup
- [ ] Create troubleshooting guide

#### **8.2 Prepare for Day 2**
- [ ] Review Day 2 tasks
- [ ] Prepare domain configuration
- [ ] Set up monitoring

## 🎯 **Success Criteria**

### **Technical Requirements**
- [ ] All apps deployed and accessible
- [ ] Database connected and functional
- [ ] Stripe integration working
- [ ] All API endpoints responding
- [ ] Webhooks configured and tested

### **Quality Assurance**
- [ ] No critical errors in logs
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Security measures in place

## 🚨 **Troubleshooting**

### **Common Issues**
- **Database connection failed**: Check Supabase URL and keys
- **Stripe API errors**: Verify API keys and permissions
- **Webhook not receiving**: Check endpoint URL and events
- **Environment variables not loading**: Redeploy applications

### **Support Resources**
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Vercel Docs: https://vercel.com/docs

## 📞 **Next Steps**

After completing Day 1:
1. **Day 2**: Domain configuration and production setup
2. **Day 3**: Final testing and launch
3. **Post-Launch**: Monitoring and optimization

---

**Status**: Ready to begin Day 1 setup
**Estimated Time**: 8 hours
**Priority**: Critical for MVP launch
