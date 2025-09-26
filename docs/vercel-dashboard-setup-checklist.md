# Vercel Dashboard Setup Checklist

## 🎯 **Critical Configuration Steps**

### **1. hookahplus-app Project**
**URL:** https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-app/settings

**Settings to Configure:**
- [ ] **Root Directory**: Set to `apps/app`
- [ ] **Build Command**: `pnpm run build`
- [ ] **Output Directory**: `.next`
- [ ] **Install Command**: `pnpm install --no-frozen-lockfile`

**Environment Variables:**
- [ ] `STRIPE_SECRET_KEY` = `sk_test_...` (Production, Preview, Development)
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...` (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app` (Production, Preview, Development)
- [ ] `ADMIN_TEST_TOKEN` = `test-admin-token-123` (Production, Preview, Development)

### **2. hookahplus-guests Project**
**URL:** https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-guests/settings

**Settings to Configure:**
- [ ] **Root Directory**: Set to `apps/guest`
- [ ] **Build Command**: `pnpm run build`
- [ ] **Output Directory**: `.next`
- [ ] **Install Command**: `pnpm install --no-frozen-lockfile`

**Environment Variables:**
- [ ] `STRIPE_SECRET_KEY` = `sk_test_...` (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app` (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://guest-dwaynes-projects-1c5c280a.vercel.app` (Production, Preview, Development)
- [ ] `ADMIN_TEST_TOKEN` = `test-admin-token-123` (Production, Preview, Development)

### **3. hookahplus-site Project**
**URL:** https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-site/settings

**Settings to Configure:**
- [ ] **Root Directory**: Set to `apps/site`
- [ ] **Build Command**: `pnpm run build`
- [ ] **Output Directory**: `.next`
- [ ] **Install Command**: `pnpm install --no-frozen-lockfile`

**Environment Variables:**
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://hookahplus-site-v2.vercel.app` (Production, Preview, Development)
- [ ] `HPLUS_PRETTY_THEME` = `1` (Optional - Production, Preview, Development)

## 🔄 **After Configuration**

1. **Redeploy All Projects**
   - Go to each project's Deployments tab
   - Click "Redeploy" on the latest deployment
   - Wait for deployment to complete

2. **Verify Deployments**
   ```bash
   # Test all apps
   curl -I https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app
   curl -I https://guest-dwaynes-projects-1c5c280a.vercel.app
   curl -I https://hookahplus-site-v2.vercel.app
   ```

3. **Test $1 Stripe Functionality**
   ```bash
   # Test app
   curl -X POST https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/api/payments/live-test \
     -H "Content-Type: application/json" \
     -H "x-admin-token: test-admin-token-123" \
     -d '{"source": "vercel-test"}'
   
   # Test guests
   curl -X POST https://guest-dwaynes-projects-1c5c280a.vercel.app/api/payments/live-test \
     -H "Content-Type: application/json" \
     -H "x-admin-token: test-admin-token-123" \
     -d '{"source": "vercel-test"}'
   ```

## ✅ **Success Criteria**

- [ ] All 3 apps return 200 OK (not 404 Not Found)
- [ ] Health endpoints work: `/api/health`
- [ ] $1 Stripe test returns success (not "Invalid API Key")
- [ ] No DEPLOYMENT_NOT_FOUND errors
- [ ] All environment variables are set correctly

## 🚨 **Common Issues**

1. **DEPLOYMENT_NOT_FOUND**: Root directory not set correctly
2. **Invalid API Key**: Stripe secret key not set or invalid
3. **500 Internal Server Error**: Missing environment variables
4. **Build Failures**: Install command not set to `pnpm install --no-frozen-lockfile`

## 📞 **Support**

If issues persist:
1. Check Vercel build logs
2. Verify environment variables are set for all environments
3. Ensure root directory is set correctly
4. Check that install command includes `--no-frozen-lockfile`
