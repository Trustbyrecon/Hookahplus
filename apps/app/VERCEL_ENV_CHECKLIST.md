# Vercel Environment Variables Checklist

## Required Environment Variables for hookahplus-app

This checklist ensures all necessary environment variables are configured in Vercel for both **Production** and **Preview** environments.

---

## ✅ Stripe Configuration

### Production Environment
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (live mode: `sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (live mode: `whsec_...`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key (live mode: `pk_live_...`)

### Preview Environment
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (test mode: `sk_test_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (test mode: `whsec_...`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key (test mode: `pk_test_...`)

---

## ✅ Database Configuration

### All Environments
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SUPABASE_URL` - Supabase project URL (`https://xxx.supabase.co`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (starts with `eyJhbG...`)
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key (starts with `eyJhbG...`)

---

## ✅ Public URLs

### Production Environment
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL (`https://hookahplus-app-prod.vercel.app`)
- [ ] `NEXT_PUBLIC_SITE_URL` - Marketing site URL (`https://hookahplus.com`)
- [ ] `NEXT_PUBLIC_GUEST_URL` - Guest portal URL (`https://guest.hookahplus.com`)

### Preview Environment
- [ ] `NEXT_PUBLIC_APP_URL` - Preview app URL (`https://hookahplus-app-prod.vercel.app`)
- [ ] `NEXT_PUBLIC_SITE_URL` - Preview site URL (can be same as production)
- [ ] `NEXT_PUBLIC_GUEST_URL` - Preview guest URL (can be same as production)

---

## ✅ Optional Configuration

### All Environments
- [ ] `NODE_ENV` - Set to `production` (usually automatic)
- [ ] `NEXT_PUBLIC_ADMIN_TEST_TOKEN` - Admin test token (optional, for development features)
- [ ] `FORCE_REBUILD` - Force rebuild flag (set to `true` if needed)

---

## Environment Variable Summary

### Total Count
- **Production:** 13 required variables
- **Preview:** 13 required variables
- **Optional:** 3 variables

### Key Public Variables (Exposed to Browser)
All variables starting with `NEXT_PUBLIC_` are exposed to the browser:
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GUEST_URL`
- `NEXT_PUBLIC_ADMIN_TEST_TOKEN` (optional)

### Secret Variables (Server-Side Only)
These should NEVER be exposed to the browser:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

---

## How to Verify

### 1. Check in Vercel Dashboard
1. Navigate to: https://vercel.com/dashboard
2. Select project: `hookahplus-app`
3. Go to: Settings → Environment Variables
4. Verify each variable exists for both Production and Preview

### 2. Test in Deployment
After deploying, check these routes:
- `/api/stripe-health` - Should return Stripe configuration status
- `/preorder/T-001` - Should load without environment variable errors

### 3. Check Browser Console
Open browser DevTools on any deployed page:
- No errors about missing `NEXT_PUBLIC_*` variables
- Stripe elements load correctly
- No CORS errors related to URLs

---

## Setting Variables in Vercel

### Via Dashboard
1. Go to Settings → Environment Variables
2. Click "Add New"
3. Enter **Key** (variable name)
4. Enter **Value** (variable value)
5. Select environments:
   - ✅ **Production** (for live keys)
   - ✅ **Preview** (for test keys)
   - ❌ **Development** (use `.env.local` instead)
6. Click "Save"

### Via Vercel CLI
```bash
# Add production variable
vercel env add STRIPE_SECRET_KEY production

# Add preview variable
vercel env add STRIPE_SECRET_KEY preview

# Pull variables to local (for reference only)
vercel env pull
```

---

## Common Mistakes to Avoid

1. ❌ Using test keys in production
2. ❌ Using live keys in preview
3. ❌ Forgetting to set `NEXT_PUBLIC_` prefix for client-side variables
4. ❌ Setting server-only keys with `NEXT_PUBLIC_` prefix
5. ❌ Not redeploying after adding/changing variables
6. ❌ Using wrong Supabase project URL
7. ❌ Mixing up webhook secrets between environments

---

## Security Best Practices

1. ✅ **Never commit** `.env` files to git
2. ✅ **Rotate keys** regularly (every 90 days)
3. ✅ **Use test mode** for all preview deployments
4. ✅ **Restrict API keys** to specific domains when possible
5. ✅ **Monitor usage** in Stripe dashboard
6. ✅ **Enable webhook signature verification** always
7. ✅ **Use environment-specific** webhook endpoints

---

## Troubleshooting

### Variables Not Loading
- **Symptom:** App shows errors about missing environment variables
- **Solution:** 
  1. Verify variables are set in Vercel dashboard
  2. Redeploy the application
  3. Check variable names are exact (case-sensitive)
  4. Ensure `NEXT_PUBLIC_` prefix for client-side variables

### Stripe Errors
- **Symptom:** Stripe operations fail or show wrong mode
- **Solution:**
  1. Verify correct keys for environment (test vs live)
  2. Check webhook secret matches Stripe dashboard
  3. Ensure public key matches secret key environment
  4. Test with Stripe CLI: `stripe listen --forward-to <webhook-url>`

### URL Mismatches
- **Symptom:** CORS errors or redirect issues
- **Solution:**
  1. Verify all URL variables end with no trailing slash
  2. Check protocol is `https://` not `http://`
  3. Ensure URLs match exactly in Stripe dashboard
  4. Update redirect URLs in Stripe product settings

---

## After Changes

After updating environment variables:
1. ✅ Redeploy the application
2. ✅ Test all critical routes
3. ✅ Run smoke test at `/preorder/T-001`
4. ✅ Verify Stripe health at `/api/stripe-health`
5. ✅ Check deployment logs for errors

---

**Last Updated:** October 6, 2025
**Version:** 1.0

