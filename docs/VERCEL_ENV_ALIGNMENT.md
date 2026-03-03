# Vercel Environment Alignment (Monorepo)

This repo deploys **three separate Next.js apps** to Vercel:
- `apps/site` (marketing + operators/resources)
- `apps/guest` (guest UI + lightweight APIs that proxy to app)
- `apps/app` (core app + APIs + Square/Stripe integrations)

Goal: keep **Production / Preview / Development** environments in Vercel using the **same variable names** the code actually reads (`process.env.*`), so preview builds don’t fail while prod works.

## Global guidance
- **Set env vars in Vercel UI for each project** (Environment Variables → select Production + Preview + Development unless noted).
- **Do not rely on `vercel.json` at repo root** for these three projects if your Vercel “Root Directory” is set to `apps/site`, `apps/guest`, `apps/app` (Vercel uses the `vercel.json` in that directory).
- Variables prefixed `NEXT_PUBLIC_` are exposed to the browser by Next.js — **never put secrets** in `NEXT_PUBLIC_*`.

## `apps/app` (core app)
These are the variables referenced throughout `apps/app/**` (not an exhaustive list of feature flags, but the ones that commonly break builds/runtime).

### Required (runtime)
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for admin/storage operations)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (or `STRIPE_WEBHOOK_SIGNING_SECRET`)
- `NEXTAUTH_URL` (used by `apps/app/lib/recon/client.ts`)

### Recommended / common
- `NEXT_PUBLIC_APP_URL` (otherwise falls back to `VERCEL_URL` or `http://localhost:3002`)
- `NEXT_PUBLIC_SITE_URL` (used in some API responses and scripts)
- `NEXT_PUBLIC_SENTRY_DSN` (optional; Sentry only enabled in production when set)
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (only needed if you want Sentry webpack uploads)
- `HID_SALT` (defaults exist for non-prod; set in prod to prevent identity fragmentation)

### Integration-specific (enable only if used)
- Square:
  - `SQUARE_APPLICATION_ID`
  - `SQUARE_APPLICATION_SECRET`
  - `SQUARE_ENV` (`sandbox` / `production`)
  - `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID` (varies by flow)
- Internal/admin:
  - `INTERNAL_ADMIN_TOKEN`

## `apps/guest` (guest UI)

### Required (runtime)
- `NEXT_PUBLIC_APP_URL` (guest proxies most API actions to the app deployment)
- `NEXT_PUBLIC_SITE_URL` (metadata + sitemap base URL)
- `STRIPE_SECRET_KEY` (used server-side for a few routes/utilities)

### Recommended / common
- `NEXT_PUBLIC_SENTRY_DSN` (optional; production-only)
- `NEXT_PUBLIC_APP_VERSION` (optional; release tagging)
- `NEXT_PUBLIC_GA_ID` (optional analytics)
- `GHOSTLOG_SECRET` (used for ghostlog hashing; defaults exist but don’t use defaults in prod)

### Optional sync / admin/test endpoints
- `APP_BUILD_URL`
- `APP_BUILD_API_KEY`
- `ADMIN_TEST_TOKEN`

### Feature flags (public)
There are multiple `NEXT_PUBLIC_*` “ritual/feature” flags under `apps/guest/lib/aliethia/*` (e.g. `NEXT_PUBLIC_QR_RITUAL_MODE`). Only set the ones you actively use.

## `apps/site` (marketing + resources)

### Required (runtime)
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL` (for rewrites/proxies to app APIs)
- `NEXT_PUBLIC_GUEST_URL` (used for cross-app links/health checks)
- `DATABASE_URL` (Prisma in `apps/site/lib/db.ts`)
- Stripe:
  - `STRIPE_SECRET_KEY` (or `STRIPE_TEST_SECRET_KEY`)
  - `NEXT_PUBLIC_STRIPE_TEST_MODE` (optional override)

### Email (Resend)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (optional; defaults exist)
- `ADMIN_NOTIFICATION_EMAIL` (optional; defaults exist)

### Pricing / subscriptions
Used by `apps/site/app/api/subscribe/route.ts`:
- `PRICE_TIER_STARTER`, `PRICE_TIER_STARTER_ANNUAL`
- `PRICE_TIER_PRO`, `PRICE_TIER_PRO_ANNUAL`
- `PRICE_TIER_TRUST_PLUS`, `PRICE_TIER_TRUST_PLUS_ANNUAL`
- `PRICE_ADDON_FLAVOR_INTELLIGENCE`, `PRICE_ADDON_FLAVOR_INTELLIGENCE_ANNUAL`
- `PRICE_ADDON_ADVANCED_ANALYTICS`, `PRICE_ADDON_ADVANCED_ANALYTICS_ANNUAL`
- `PRICE_ADDON_STAFF_PERFORMANCE`, `PRICE_ADDON_STAFF_PERFORMANCE_ANNUAL`
- `PRICE_ADDON_CUSTOM_INTEGRATIONS`, `PRICE_ADDON_CUSTOM_INTEGRATIONS_ANNUAL`
- `PRICE_ADDON_AGENTIC_COMMERCE`, `PRICE_ADDON_AGENTIC_COMMERCE_ANNUAL`
- `PRICE_ADDON_AGENTIC_COMMERCE_USAGE`, `PRICE_ADDON_AGENTIC_COMMERCE_USAGE_ANNUAL`
- `PRICE_ADDON_PRIORITY_SUPPORT`, `PRICE_ADDON_PRIORITY_SUPPORT_ANNUAL`

### Webhooks (site intake → app)
- `WEBHOOK_API_KEY` (used by `apps/site/app/api/demo-requests/route.ts`)

### Analytics/marketing (public)
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_LINKEDIN_INSIGHT_TAG_ID`
- `NEXT_PUBLIC_CALENDLY_URL`

## Quick parity checklist (per Vercel project)
- **Preview builds**: make sure every “Required (runtime)” variable above is set for Preview too.
- **If prod works but preview fails**: it’s almost always missing `DATABASE_URL`, Supabase keys, or Stripe keys in Preview.

