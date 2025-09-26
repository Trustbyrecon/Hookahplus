# Vercel Environment Variables Setup

This document outlines the required environment variables for each HookahPlus app in Vercel.

## Apps/App (hookahplus-app)

### Required Variables
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app
ADMIN_TEST_TOKEN=test-admin-token-123
```

### Optional Variables
```
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Apps/Guest (hookahplus-guests)

### Required Variables
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app
ADMIN_TEST_TOKEN=test-admin-token-123
NEXT_PUBLIC_SITE_URL=https://guest-dwaynes-projects-1c5c280a.vercel.app
```

### Optional Variables
```
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Apps/Site (hookahplus-site)

### Required Variables
```
NEXT_PUBLIC_SITE_URL=https://hookahplus-site-v2.vercel.app
```

### Optional Variables
```
HPLUS_PRETTY_THEME=1
```

## Setting Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select the project (hookahplus-app, hookahplus-guests, or hookahplus-site)
3. Go to Settings > Environment Variables
4. Add each variable for the appropriate environments (Production, Preview, Development)
5. Redeploy the project

## Testing Environment Variables

After setting the variables, test each app:

### App
```bash
curl https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/api/health
```

### Guests
```bash
curl https://guest-dwaynes-projects-1c5c280a.vercel.app/api/health
```

### Site
```bash
curl https://hookahplus-site-v2.vercel.app/api/health
```

## Stripe Test

Test the $1 Stripe functionality:

```bash
curl -X POST https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/api/payments/live-test \
  -H "Content-Type: application/json" \
  -H "x-admin-token: test-admin-token-123" \
  -d '{"source": "vercel-test"}'
```
