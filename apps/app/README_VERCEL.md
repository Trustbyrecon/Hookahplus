# Hookah+ App - Vercel Deployment Guide

> **Quick Start:** For immediate reference, see `VERCEL_QUICK_REFERENCE.md`

## Overview

This directory contains the Hookah+ app, configured for deployment on Vercel within a monorepo structure.

## 📂 Deployment Configuration Files

- **`vercel.json`** - Main Vercel configuration (build, functions, redirects)
- **`.vercelignore`** - Files to exclude from deployment
- **`package.json`** - Build scripts and dependencies

## 📖 Documentation

### Essential Guides
1. **`VERCEL_QUICK_REFERENCE.md`** ⭐ - Quick reference card (start here!)
2. **`VERCEL_PRODUCTION_SETUP.md`** - Complete production setup guide
3. **`VERCEL_ENV_CHECKLIST.md`** - Environment variables checklist
4. **`VERCEL_HYGIENE_REPORT.md`** - Latest alignment report

### Specialized Guides
- **`VERCEL_STRIPE_SOLUTION.md`** - Stripe integration troubleshooting
- **`USER_TESTING_GUIDE.md`** - User testing procedures
- **`RWO_STRIPE_PRODUCTION_FIX.md`** - Production Stripe fixes

## 🚀 Deployment Quick Start

### 1. Vercel Project Settings
```
Project Name: hookahplus-app
Root Directory: apps/app
Framework: Next.js
```

### 2. Build Configuration
```bash
Install: pnpm install --filter @hookahplus/app...
Build: pnpm --filter @hookahplus/app build
Output: .next
```

### 3. Environment Variables
See `VERCEL_ENV_CHECKLIST.md` for complete list (13 required variables).

Key variables:
- `STRIPE_SECRET_KEY` (live for production, test for preview)
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`

### 4. Branch Protection
```bash
# In Vercel: Settings → Git → Ignored Build Step
if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi
```

## 🔗 Production URLs

### Stable Alias (Recommended)
```
https://hookahplus-app-prod.vercel.app
```

### Current Deployment
- `app-rho-neon.vercel.app` (or latest from dashboard)

## 🧪 Testing

### Primary Smoke Test
```
https://hookahplus-app-prod.vercel.app/preorder/T-001
```

### Health Check
```
https://hookahplus-app-prod.vercel.app/api/stripe-health
```

### Key Routes to Test
- `/` - Homepage
- `/preorder/T-001` - Preorder page with cart
- `/fire-session-dashboard` - Fire dashboard
- `/staff-dashboard` - Staff panel
- `/checkout` - Checkout flow

## 📋 Post-Deployment Checklist

- [ ] Production deployment promoted
- [ ] Stable alias configured and pointing to production
- [ ] Old preview deployments deleted
- [ ] Environment variables set (production & preview)
- [ ] Branch protection configured
- [ ] Smoke test passes at `/preorder/T-001`
- [ ] Health check passes at `/api/stripe-health`
- [ ] No console errors in browser
- [ ] Cart functionality works
- [ ] Stripe integration functional

## 🔧 Common Tasks

### Promote Deployment to Production
1. Go to Vercel Dashboard → Deployments
2. Find successful deployment
3. Click "..." menu → "Promote to Production"

### Add Environment Variable
1. Go to Settings → Environment Variables
2. Click "Add New"
3. Enter key and value
4. Select environments (Production/Preview)
5. Save and redeploy

### Delete Preview Deployment
1. Go to Deployments
2. Find preview deployment
3. Click "..." menu → "Delete"

### Update Alias
1. Go to Settings → Domains
2. Add domain: `hookahplus-app-prod.vercel.app`
3. Point to production deployment

## 🐛 Troubleshooting

### Build Fails
- Check Vercel logs for errors
- Verify all environment variables are set
- Ensure `pnpm install` works locally
- Check Prisma schema generates correctly

### Stripe Errors
- Verify correct keys for environment (test vs live)
- Check webhook secret matches Stripe dashboard
- Test with `/api/stripe-health` endpoint

### Environment Variables Not Loading
- Verify variables are set in Vercel dashboard
- Check variable names (case-sensitive)
- Redeploy after adding/changing variables

### Redirect Not Working
- Clear browser cache
- Test in incognito mode
- Verify `vercel.json` is deployed

## 📚 Additional Resources

### External Links
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)

### Internal Documentation
- Project Root: `../../README.md`
- Deployment Success: `../../DEPLOYMENT_SUCCESS_SUMMARY.md`
- Launch Checklist: `../../LAUNCH_CHECKLIST.md`

## 🔐 Security

### Best Practices
- ✅ Never commit `.env` files
- ✅ Use test keys in preview environments
- ✅ Rotate production keys every 90 days
- ✅ Enable webhook signature verification
- ✅ Monitor Stripe dashboard for unusual activity

### Environment Isolation
- **Production:** Live Stripe keys, production database
- **Preview:** Test Stripe keys, preview database
- **Development:** Local `.env.local`, test keys

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review relevant documentation in this directory
3. Check Vercel deployment logs
4. Consult the monorepo root documentation

---

**Last Updated:** October 6, 2025  
**Maintained By:** Hookah+ Development Team

