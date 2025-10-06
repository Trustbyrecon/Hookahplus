# Hookah+ App - Vercel Quick Reference Card

## 🚀 Quick Links

### Vercel Dashboard
- **Project:** `hookahplus-app`
- **URL:** https://vercel.com/dashboard → `hookahplus-app`

### Production URLs
- **Stable Alias:** `https://hookahplus-app-prod.vercel.app`
- **Current Deploy:** `app-rho-neon.vercel.app` (or latest)

### Smoke Test
```
https://hookahplus-app-prod.vercel.app/preorder/T-001
```

---

## ⚙️ Build Configuration

```bash
# Root Directory
apps/app

# Install Command
pnpm install --filter @hookahplus/app...

# Build Command
pnpm --filter @hookahplus/app build

# Output Directory
.next
```

---

## 🔒 Branch Protection

**Ignored Build Step:**
```bash
if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi
```

Set in: **Settings → Git → Ignored Build Step**

---

## 🔑 Critical Environment Variables

### Production (Live Stripe)
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://hookahplus-app-prod.vercel.app
```

### Preview (Test Stripe)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=https://hookahplus-app-prod.vercel.app
```

### Database (All Environments)
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
SUPABASE_ANON_KEY=eyJhbG...
```

---

## 📋 Quick Actions Checklist

### First-Time Setup
- [ ] Set root directory to `apps/app`
- [ ] Configure build commands (see above)
- [ ] Add stable alias: `hookahplus-app-prod.vercel.app`
- [ ] Set branch protection (ignore non-main)
- [ ] Add all environment variables
- [ ] Protect production deployment

### After Each Deployment
- [ ] Test: `/preorder/T-001`
- [ ] Check: `/api/stripe-health`
- [ ] Verify: No console errors
- [ ] Test: Cart functionality

### Troubleshooting
1. Check Vercel logs
2. Verify environment variables
3. Redeploy if needed
4. Test in incognito mode

---

## 🧪 Test Routes

```
/                           # Homepage
/preorder/T-001            # Primary smoke test ⭐
/fire-session-dashboard    # Fire dashboard
/staff-dashboard           # Staff panel
/api/stripe-health         # API health check
/checkout                  # Checkout flow
```

---

## 📚 Full Documentation

- `VERCEL_PRODUCTION_SETUP.md` - Complete setup guide
- `VERCEL_ENV_CHECKLIST.md` - All environment variables
- `VERCEL_HYGIENE_REPORT.md` - Full alignment report
- `VERCEL_STRIPE_SOLUTION.md` - Stripe troubleshooting

---

**Last Updated:** October 6, 2025

