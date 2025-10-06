# Vercel Manual Steps Checklist

> **Project:** hookahplus-app  
> **Date:** October 6, 2025  
> **Completion Status:** 🔧 Pending

---

## Overview

All configuration files have been created. Complete these manual steps in the Vercel Dashboard to activate the configuration.

---

## 📋 Manual Steps Checklist

### 1. Update Project Settings

#### Set Root Directory
- [ ] Go to: [Vercel Dashboard](https://vercel.com/dashboard) → `hookahplus-app` → **Settings** → **General**
- [ ] Find: "Root Directory"
- [ ] Set to: `apps/app`
- [ ] Click: **Save**

#### Set Install Command
- [ ] In same settings page
- [ ] Find: "Install Command"
- [ ] Set to: `pnpm install --filter @hookahplus/app...`
- [ ] Click: **Save**

#### Set Build Command
- [ ] In same settings page
- [ ] Find: "Build Command"
- [ ] Set to: `pnpm --filter @hookahplus/app build`
- [ ] Click: **Save**

#### Verify Output Directory
- [ ] In same settings page
- [ ] Find: "Output Directory"
- [ ] Verify it's: `.next` (should be automatic for Next.js)
- [ ] Click: **Save** if changed

---

### 2. Configure Branch Protection

- [ ] Go to: **Settings** → **Git**
- [ ] Find: "Ignored Build Step"
- [ ] Enter command:
  ```bash
  if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi
  ```
- [ ] Click: **Save**
- [ ] Verify: Only `main` branch will trigger builds

---

### 3. Configure Stable Production Alias

#### Add Domain
- [ ] Go to: **Settings** → **Domains**
- [ ] Click: **Add Domain**
- [ ] Enter: `hookahplus-app-prod.vercel.app`
- [ ] Click: **Add**

#### Point to Production
- [ ] Find your current production deployment
  - Should be: `app-rho-neon.vercel.app` or similar
  - Or pattern: `hookahplus-6j60x0faj-...`
- [ ] Go to: **Deployments**
- [ ] Find the deployment you want to promote
- [ ] Click: **"..."** menu → **"Promote to Production"**

#### Protect Production Deployment
- [ ] After promoting, go to the deployment
- [ ] Click: **"..."** menu
- [ ] Click: **"Protect"**
- [ ] Confirm protection

#### Verify Alias
- [ ] Visit: `https://hookahplus-app-prod.vercel.app`
- [ ] Should show your app homepage
- [ ] Verify no errors

---

### 4. Environment Variables Setup

#### Check Current Variables
- [ ] Go to: **Settings** → **Environment Variables**
- [ ] Verify the following exist for **Production**:

#### Production Environment Variables
- [ ] `STRIPE_SECRET_KEY` (starts with `sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` (starts with `whsec_...`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (starts with `pk_live_...`)
- [ ] `DATABASE_URL`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://hookahplus-app-prod.vercel.app`
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_GUEST_URL`

#### Preview Environment Variables
- [ ] Verify same variables exist for **Preview**
- [ ] Ensure Stripe keys are **test** keys:
  - `STRIPE_SECRET_KEY` (starts with `sk_test_...`)
  - `STRIPE_WEBHOOK_SECRET` (test mode)
  - `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (starts with `pk_test_...`)

#### Add Missing Variables
For any missing variable:
- [ ] Click: **Add New**
- [ ] Enter: Key name
- [ ] Enter: Value
- [ ] Select: Environment (Production/Preview)
- [ ] Click: **Save**

---

### 5. Delete Stray Preview Deployments

#### Find Preview Deployments
- [ ] Go to: **Deployments**
- [ ] Filter by branch: `feat/guests-cart`
- [ ] Look for deployments like: `hookahplus-app-git-feat-guests-cart-...`

#### Delete Each Preview
For each unwanted preview deployment:
- [ ] Click: **"..."** menu
- [ ] Click: **"Delete"**
- [ ] Confirm deletion
- [ ] Repeat for all stray previews

#### Verify Cleanup
- [ ] Check: Only production deployments remain
- [ ] Verify: No `feat/guests-cart` previews exist

---

### 6. Trigger New Deployment

#### From Main Branch
- [ ] Go to: **Deployments**
- [ ] Click: **"Redeploy"** on latest main branch deployment
- [ ] Or: Push a new commit to `main` branch
- [ ] Wait: For deployment to complete

#### Monitor Build
- [ ] Watch: Build logs for errors
- [ ] Verify: Build completes successfully
- [ ] Check: New deployment uses `apps/app/vercel.json` config

---

### 7. Verification Testing

#### Test Production URL
- [ ] Visit: `https://hookahplus-app-prod.vercel.app`
- [ ] Verify: Homepage loads correctly
- [ ] Check: No console errors

#### Test Smoke Route
- [ ] Visit: `https://hookahplus-app-prod.vercel.app/preorder/T-001`
- [ ] Verify: Page loads with menu items
- [ ] Check: Cart functionality works
- [ ] Verify: No Stripe errors

#### Test Health Check
- [ ] Visit: `https://hookahplus-app-prod.vercel.app/api/stripe-health`
- [ ] Verify: Returns successful health check
- [ ] Check: Correct Stripe mode (live/test)

#### Test Additional Routes
- [ ] `/fire-session-dashboard` - Fire dashboard
- [ ] `/staff-dashboard` - Staff panel
- [ ] `/checkout` - Checkout flow
- [ ] All routes load without errors

#### Test Redirects
- [ ] Try accessing old preview URL pattern (if you know it)
- [ ] Verify: Redirects to `hookahplus-app-prod.vercel.app`
- [ ] Check: Redirect preserves path

---

### 8. Browser Console Check

- [ ] Open: Browser DevTools (F12)
- [ ] Navigate: To each test route
- [ ] Verify: No errors about missing environment variables
- [ ] Check: No CORS errors
- [ ] Confirm: Stripe elements load correctly

---

### 9. Cart & Stripe Testing

#### Test Cart Functionality
- [ ] Navigate to: `/preorder/T-001`
- [ ] Click: "Quick Add" on any item
- [ ] Verify: Item appears in cart
- [ ] Check: Price displays correctly
- [ ] Verify: Quantity can be adjusted

#### Test Stripe Integration
- [ ] Look for: Stripe diagnostic panel (right side)
- [ ] Verify: Shows correct Stripe mode
- [ ] Check: No connection errors
- [ ] If in test mode: Run $1 smoke test

---

### 10. Final Verification

- [ ] All environment variables set correctly
- [ ] Production uses live Stripe keys
- [ ] Preview uses test Stripe keys
- [ ] Stable alias points to production
- [ ] Production deployment is protected
- [ ] Branch protection is active
- [ ] Stray previews are deleted
- [ ] All test routes pass
- [ ] No console errors
- [ ] Stripe integration works

---

## ✅ Completion Criteria

Mark complete when ALL checkboxes above are checked.

### Quick Test Summary
- ✅ Homepage loads: `https://hookahplus-app-prod.vercel.app/`
- ✅ Smoke test works: `/preorder/T-001`
- ✅ Health check passes: `/api/stripe-health`
- ✅ Cart functional
- ✅ No console errors
- ✅ Stripe integration working

---

## 🆘 Troubleshooting

### Build Fails
1. Check Vercel deployment logs
2. Verify root directory is `apps/app`
3. Verify install command is correct
4. Check all environment variables are set
5. Try redeploying

### Environment Variables Not Loading
1. Verify variables are set in dashboard
2. Check spelling (case-sensitive)
3. Redeploy after adding variables
4. Clear browser cache

### Alias Not Working
1. Verify domain is added in settings
2. Check it points to production deployment
3. Wait a few minutes for DNS propagation
4. Try in incognito mode

### Redirect Not Working
1. Verify `apps/app/vercel.json` exists
2. Check redirect rules are correct
3. Redeploy to pick up changes
4. Clear browser cache

---

## 📚 Documentation References

- **Setup Guide:** `apps/app/VERCEL_PRODUCTION_SETUP.md`
- **Quick Reference:** `apps/app/VERCEL_QUICK_REFERENCE.md`
- **Environment Checklist:** `apps/app/VERCEL_ENV_CHECKLIST.md`
- **Full Report:** `VERCEL_HYGIENE_REPORT.md`
- **Summary:** `VERCEL_APP_ALIGNMENT_SUMMARY.md`

---

## 🎯 Next Steps After Completion

1. ✅ Mark this checklist as complete
2. ✅ Document completion date
3. ✅ Test all routes thoroughly
4. ✅ Monitor deployment logs
5. ✅ Set up monitoring/alerts
6. ✅ Schedule regular health checks

---

**Checklist Version:** 1.0  
**Created:** October 6, 2025  
**Last Updated:** October 6, 2025  
**Status:** 🔧 Awaiting Completion

