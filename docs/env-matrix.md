# Hookah+ Environment Variables Matrix

## Overview
This document tracks required environment variables across all Hookah+ projects and their deployment environments.

## Environment Status Legend
- ✅ **Set** - Variable is configured in Vercel
- ⚠️ **Missing** - Variable not found in Vercel
- ❌ **Invalid** - Variable has invalid value
- 🔄 **Pending** - Variable needs verification

## Apps/App Environment Variables

| Variable | Dev | Preview | Production | Purpose |
|----------|-----|---------|------------|---------|
| `STRIPE_SECRET_KEY` | ⚠️ | ⚠️ | ⚠️ | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | ⚠️ | ⚠️ | Stripe webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | ⚠️ | ⚠️ | ⚠️ | Stripe public key for client |
| `NEXT_PUBLIC_APP_URL` | ⚠️ | ⚠️ | ⚠️ | App deployment URL |
| `NEXT_PUBLIC_GUEST_URL` | ⚠️ | ⚠️ | ⚠️ | Guest app URL for cross-app links |
| `SUPABASE_URL` | ⚠️ | ⚠️ | ⚠️ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | ⚠️ | ⚠️ | Supabase service role key |
| `SUPABASE_ANON_KEY` | ⚠️ | ⚠️ | ⚠️ | Supabase anonymous key |
| `NODE_ENV` | ✅ | ✅ | ✅ | Node environment (auto-set) |
| `VERCEL` | ✅ | ✅ | ✅ | Vercel deployment flag (auto-set) |

## Apps/Guest Environment Variables

| Variable | Dev | Preview | Production | Purpose |
|----------|-----|---------|------------|---------|
| `STRIPE_SECRET_KEY` | ⚠️ | ⚠️ | ⚠️ | Stripe API secret key (fallback) |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | ⚠️ | ⚠️ | ⚠️ | Stripe public key for client |
| `NEXT_PUBLIC_SITE_URL` | ⚠️ | ⚠️ | ⚠️ | Guest app deployment URL |
| `NEXT_PUBLIC_APP_URL` | ⚠️ | ⚠️ | ⚠️ | App URL for proxy requests |
| `ADMIN_TEST_TOKEN` | ❌ | ❌ | ❌ | **MISSING** - Admin token for proxy auth |
| `NODE_ENV` | ✅ | ✅ | ✅ | Node environment (auto-set) |
| `VERCEL` | ✅ | ✅ | ✅ | Vercel deployment flag (auto-set) |

## Apps/Site Environment Variables

| Variable | Dev | Preview | Production | Purpose |
|----------|-----|---------|------------|---------|
| `NEXT_PUBLIC_SITE_URL` | ⚠️ | ⚠️ | ⚠️ | Site deployment URL |
| `NEXT_PUBLIC_APP_URL` | ❌ | ❌ | ❌ | **MISSING** - App URL for navigation |
| `NEXT_PUBLIC_GUEST_URL` | ❌ | ❌ | ❌ | **MISSING** - Guest URL for navigation |
| `NODE_ENV` | ✅ | ✅ | ✅ | Node environment (auto-set) |
| `VERCEL` | ✅ | ✅ | ✅ | Vercel deployment flag (auto-set) |

## Critical Issues

### 🚨 **High Priority**
1. **Missing `ADMIN_TEST_TOKEN`** in Guest app - Required for proxy authentication
2. **Missing cross-app URLs** in Site app - Required for navigation
3. **All Stripe keys** need verification in Vercel

### ⚠️ **Medium Priority**
1. **Supabase keys** need verification in Vercel
2. **Public URLs** need to be set correctly for each environment

## Verification Commands

### Check Vercel Environment Variables
```bash
# For each project, verify variables are set
vercel env ls --project=hookahplus-app
vercel env ls --project=hookahplus-guests  
vercel env ls --project=hookahplus-site
```

### Test Environment Variables in Code
```bash
# Test Stripe connectivity
curl https://your-app.vercel.app/api/stripe-health

# Test cross-app navigation
curl https://your-site.vercel.app/api/health
```

## Required Actions

### 1. **Immediate (This Week)**
- [ ] Set `ADMIN_TEST_TOKEN` in Guest app Vercel settings
- [ ] Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_GUEST_URL` in Site app
- [ ] Verify all Stripe keys are set in App and Guest

### 2. **Short Term (Next Week)**
- [ ] Verify Supabase keys are set in App
- [ ] Test cross-app navigation works
- [ ] Validate all public URLs are correct

### 3. **Long Term (Ongoing)**
- [ ] Implement environment variable validation in CI
- [ ] Add health checks for all required variables
- [ ] Document environment setup process

## Environment Templates

### Apps/App (.env.local)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_GUEST_URL=https://your-guest.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### Apps/Guest (.env.local)
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=https://your-guest.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ADMIN_TEST_TOKEN=your-admin-token
```

### Apps/Site (.env.local)
```bash
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_GUEST_URL=https://your-guest.vercel.app
```

## Last Updated
- **Date**: October 6, 2025
- **Status**: Initial audit complete, verification pending
- **Next Review**: After Vercel environment verification
