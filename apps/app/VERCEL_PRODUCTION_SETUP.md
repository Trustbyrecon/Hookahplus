# Hookah+ App - Vercel Production Setup Guide

## Overview
This guide documents the Vercel deployment configuration for the Hookah+ app within the monorepo structure.

## Project Configuration

### Vercel Project Settings
**Project Name:** `hookahplus-app`

### Root Directory
```
apps/app
```

### Build & Output Settings
- **Framework Preset:** Next.js
- **Build Command:** `pnpm --filter @hookahplus/app build`
- **Install Command:** `pnpm install --filter @hookahplus/app...`
- **Output Directory:** `.next`

### Ignored Build Step (Branch Protection)
To prevent building on non-main branches, configure in Vercel Dashboard:
```bash
# Settings → Git → Ignored Build Step
if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi
```

This ensures only the `main` branch triggers production builds.

## Deployment URLs

### Production Deployment
- **Current Production:** `app-rho-neon.vercel.app` (or latest from `hookahplus-6j60x0faj-...`)
- **Stable Alias:** `hookahplus-app-prod.vercel.app`

### Domain Aliases
To set up the stable alias:
1. Go to Vercel Dashboard → Project: `hookahplus-app` → Settings → Domains
2. Add domain: `hookahplus-app-prod.vercel.app`
3. Point it to the current production deployment
4. Enable "Protect" to prevent accidental deletions

## Environment Variables

### Required Environment Variables

#### Stripe Configuration (Production)
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```

#### Stripe Configuration (Preview)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

#### Database (Supabase)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
SUPABASE_ANON_KEY=eyJhbG...
DATABASE_URL=postgresql://...
```

#### Public URLs
```env
NEXT_PUBLIC_APP_URL=https://hookahplus-app-prod.vercel.app
NEXT_PUBLIC_SITE_URL=https://hookahplus.com
NEXT_PUBLIC_GUEST_URL=https://guest.hookahplus.com
```

#### Optional Configuration
```env
NODE_ENV=production
NEXT_PUBLIC_ADMIN_TEST_TOKEN=your-admin-token
FORCE_REBUILD=true
```

### Setting Environment Variables
1. Go to Vercel Dashboard → Project: `hookahplus-app` → Settings → Environment Variables
2. Add each variable with appropriate scope:
   - **Production:** Live Stripe keys, production URLs
   - **Preview:** Test Stripe keys, preview URLs
   - **Development:** Local development values

## Redirect Rules

### Feature Branch Redirects
The `apps/app/vercel.json` includes redirects from old preview URLs:

```json
{
  "redirects": [
    {
      "source": "/feat-guests-cart/:path*",
      "destination": "https://hookahplus-app-prod.vercel.app/:path*",
      "permanent": false
    }
  ]
}
```

This ensures old `feat-guests-cart` preview URLs redirect to the stable production alias.

## Function Configuration

### API Route Timeouts
```json
{
  "functions": {
    "app/api/payments/live-test/route.ts": {
      "maxDuration": 30
    },
    "app/api/stripe-health/route.ts": {
      "maxDuration": 15
    },
    "app/api/**/route.ts": {
      "maxDuration": 10
    }
  }
}
```

## Deployment Workflow

### 1. Promote to Production
If a preview deployment (e.g., `app-rho-neon.vercel.app`) is working correctly:
1. Go to Vercel Dashboard → Deployments
2. Find the successful deployment
3. Click "Promote to Production"
4. Verify at `hookahplus-app-prod.vercel.app`

### 2. Protect Production Deployment
1. Go to the production deployment
2. Click "..." menu → "Protect"
3. This prevents accidental deletion

### 3. Delete Stray Previews
To remove old preview deployments:
1. Go to Vercel Dashboard → Deployments
2. Filter by branch: `feat/guests-cart`
3. Select unwanted deployments
4. Click "Delete"

**Example deployments to remove:**
- `hookahplus-app-git-feat-guests-cart-...`

### 4. Configure Branch Protection
Ensure only `main` branch deploys:
1. Settings → Git → Ignored Build Step
2. Enter: `if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi`
3. Save changes

## Verification Steps

### 1. Test Production Deployment
Visit: `https://hookahplus-app-prod.vercel.app`

### 2. Verify Key Routes
- **Homepage:** `/`
- **Preorder (Smoke Test):** `/preorder/T-001`
- **Fire Dashboard:** `/fire-session-dashboard`
- **Stripe Health Check:** `/api/stripe-health`

### 3. Test $1 Smoke Test
1. Navigate to `/preorder/T-001`
2. Look for the yellow "Test Mode" banner (in development)
3. Click "Run $1 Stripe test"
4. Verify success response

### 4. Environment Variable Check
```bash
# In Vercel Dashboard, verify all required variables exist
# Check both Production and Preview environments
```

## Smoke Test Route

The primary smoke test route is:
```
/preorder/T-001
```

This route:
- Displays the preorder page with menu items
- Includes cart functionality
- Has integrated Stripe test components
- Provides $1 smoke test button
- Shows Stripe diagnostic panel

### Expected Behavior
1. Page loads successfully (200 status)
2. Global navigation is visible
3. Menu items are displayed
4. Cart is functional
5. Stripe components render correctly
6. No console errors related to environment variables

## Troubleshooting

### Build Fails
- Check that `pnpm install --filter @hookahplus/app...` runs successfully
- Verify all environment variables are set
- Ensure Prisma schema generates correctly

### Stripe Errors
- Verify STRIPE_SECRET_KEY is set correctly
- Check STRIPE_WEBHOOK_SECRET matches webhook configuration
- Ensure NEXT_PUBLIC_STRIPE_PUBLIC_KEY is the correct environment (test vs live)

### Redirect Not Working
- Check `apps/app/vercel.json` is deployed
- Verify redirect rules are properly formatted
- Clear browser cache and test in incognito

### Environment Variables Not Loading
- Check variable names match exactly (case-sensitive)
- Ensure variables are set for correct environment (Production/Preview)
- Redeploy to pick up new environment variables

## Maintenance

### Regular Tasks
1. **Monitor Deployments:** Check Vercel dashboard for failed deployments
2. **Review Logs:** Monitor function logs for errors
3. **Update Dependencies:** Keep packages up to date
4. **Rotate Secrets:** Periodically update API keys and secrets

### When to Redeploy
- After environment variable changes
- After updating Stripe keys
- After modifying vercel.json
- After critical bug fixes in main branch

## Security Considerations

1. **Never commit secrets** to the repository
2. **Use test keys** in preview environments
3. **Rotate production keys** regularly
4. **Enable Vercel authentication** for sensitive routes
5. **Monitor webhook signatures** for security

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Review this documentation
3. Check `apps/app/VERCEL_STRIPE_SOLUTION.md` for Stripe-specific issues
4. Consult the monorepo root documentation

---

**Last Updated:** October 6, 2025
**Maintained By:** Hookah+ Development Team

