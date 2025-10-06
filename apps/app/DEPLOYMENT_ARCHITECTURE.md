# Hookah+ App - Deployment Architecture

## Overview

This document visualizes the deployment architecture for the Hookah+ app on Vercel.

---

## 🏗️ Monorepo Structure

```
hookahplus/                          (monorepo root)
├── apps/
│   ├── app/                        ⭐ THIS PROJECT
│   │   ├── vercel.json            (Vercel configuration)
│   │   ├── .vercelignore          (Build ignore rules)
│   │   ├── package.json           (Build scripts)
│   │   ├── next.config.js         (Next.js config)
│   │   ├── app/                   (Next.js app directory)
│   │   │   ├── preorder/[tableId]/
│   │   │   ├── api/
│   │   │   └── ...
│   │   └── docs/
│   ├── site/                      (Separate project - NOT MODIFIED)
│   ├── guest/                     (Separate project - NOT MODIFIED)
│   └── ...
├── packages/
├── vercel.json                    (Generic monorepo config)
└── pnpm-workspace.yaml
```

---

## 🚀 Vercel Project Configuration

### Project: `hookahplus-app`

```
┌─────────────────────────────────────────┐
│         Vercel Project Settings         │
├─────────────────────────────────────────┤
│ Name:           hookahplus-app          │
│ Framework:      Next.js                 │
│ Root Directory: apps/app                │
│ Install:        pnpm install --filter   │
│                 @hookahplus/app...      │
│ Build:          pnpm --filter           │
│                 @hookahplus/app build   │
│ Output:         .next                   │
└─────────────────────────────────────────┘
```

---

## 🌐 URL Architecture

### Production Flow

```
                                    ┌──────────────────────────┐
                                    │   Current Deployment     │
                                    │  app-rho-neon.vercel.app │
                                    │  (or latest production)  │
                                    └────────────┬─────────────┘
                                                 │
                                                 │ Promoted to
                                                 ↓
                                    ┌──────────────────────────┐
                                    │   Production Deployment  │
                                    │     (Protected)          │
                                    └────────────┬─────────────┘
                                                 │
                                                 │ Aliased via
                                                 ↓
                        ┌─────────────────────────────────────────┐
                        │         Stable Production Alias         │
                        │  hookahplus-app-prod.vercel.app        │
                        │         (Public-Facing URL)             │
                        └─────────────────────────────────────────┘
                                         │
                        ┌────────────────┼────────────────┐
                        │                │                │
                        ↓                ↓                ↓
                   Homepage        Preorder (T-001)   Staff Panel
                      /              /preorder/T-001   /staff-dashboard
```

### Preview Flow (Old → Redirected)

```
┌─────────────────────────────────────────────┐
│      Old Preview Deployments (Deleted)      │
│  hookahplus-app-git-feat-guests-cart-...   │
└────────────────┬────────────────────────────┘
                 │
                 │ Redirect Rule (302)
                 │ Source: /feat-guests-cart/*
                 ↓
┌─────────────────────────────────────────────┐
│       Stable Production Alias (Target)      │
│     hookahplus-app-prod.vercel.app/*       │
└─────────────────────────────────────────────┘
```

---

## 🔀 Branch Strategy

### Main Branch (Production)

```
main branch
    │
    │ Push/PR Merge
    ↓
┌─────────────────┐
│  Vercel Build   │
│   Triggered     │
└────────┬────────┘
         │
         │ Build Success
         ↓
┌─────────────────┐
│   Production    │
│   Deployment    │
└────────┬────────┘
         │
         │ Auto-Promote
         ↓
┌─────────────────┐
│  Live at:       │
│  hookahplus-    │
│  app-prod       │
│  .vercel.app    │
└─────────────────┘
```

### Feature Branches (Ignored)

```
feat/* branch
    │
    │ Push
    ↓
┌─────────────────┐
│  Vercel Check   │
│  (Ignored)      │
└────────┬────────┘
         │
         │ Ignored Build Step:
         │ if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi
         ↓
┌─────────────────┐
│   Build         │
│   Skipped ✓     │
└─────────────────┘
```

---

## 🔐 Environment Configuration

### Production Environment

```
┌───────────────────────────────────────────┐
│         Production Environment            │
├───────────────────────────────────────────┤
│ STRIPE_SECRET_KEY         sk_live_...    │
│ STRIPE_WEBHOOK_SECRET     whsec_...      │
│ NEXT_PUBLIC_STRIPE_...    pk_live_...    │
│                                           │
│ DATABASE_URL              postgresql://  │
│ SUPABASE_URL              https://...    │
│ SUPABASE_SERVICE_...      eyJhbG...      │
│                                           │
│ NEXT_PUBLIC_APP_URL                       │
│   → https://hookahplus-app-prod...       │
│                                           │
│ Mode: LIVE ⚡                             │
└───────────────────────────────────────────┘
```

### Preview Environment

```
┌───────────────────────────────────────────┐
│          Preview Environment              │
├───────────────────────────────────────────┤
│ STRIPE_SECRET_KEY         sk_test_...    │
│ STRIPE_WEBHOOK_SECRET     whsec_...      │
│ NEXT_PUBLIC_STRIPE_...    pk_test_...    │
│                                           │
│ DATABASE_URL              postgresql://  │
│ SUPABASE_URL              https://...    │
│ SUPABASE_SERVICE_...      eyJhbG...      │
│                                           │
│ NEXT_PUBLIC_APP_URL                       │
│   → https://hookahplus-app-prod...       │
│                                           │
│ Mode: TEST 🧪                             │
└───────────────────────────────────────────┘
```

---

## 🔌 API Routes & Functions

### Function Timeout Configuration

```
┌──────────────────────────────────────────────┐
│            API Route Timeouts                │
├──────────────────────────────────────────────┤
│ /api/payments/live-test      30 seconds     │
│ /api/stripe-health            15 seconds     │
│ /api/**/*                     10 seconds     │
└──────────────────────────────────────────────┘
```

### Key API Endpoints

```
app/api/
├── payments/
│   ├── live-test/route.ts         (30s timeout) ⭐ $1 smoke test
│   └── create-session/route.ts    (10s timeout)
├── stripe-health/route.ts          (15s timeout) ⭐ Health check
├── sessions/route.ts               (10s timeout)
└── ...
```

---

## 🧪 Testing Flow

### Smoke Test Route: `/preorder/T-001`

```
User Request
    ↓
https://hookahplus-app-prod.vercel.app/preorder/T-001
    │
    │ Next.js App Router
    ↓
app/preorder/[tableId]/page.tsx
    │
    ├─→ CartProvider (React Context)
    ├─→ GlobalNavigation
    ├─→ Menu Items Display
    ├─→ CartDisplay
    ├─→ StripeDiagnostic
    └─→ NewSmokeTest ($1 test button)
         │
         │ User clicks "$1 Stripe test"
         ↓
    POST /api/payments/live-test
         │
         │ Creates Stripe PaymentIntent
         ↓
    Stripe API (test/live mode)
         │
         │ Success/Failure
         ↓
    Response to client
         │
         ↓
    Display: ✅ or ❌ with message
```

---

## 🛡️ Security Architecture

### Environment Isolation

```
┌──────────────────────────────────────────────────┐
│                   Production                      │
│  ┌──────────────────────────────────────────┐   │
│  │  Live Stripe Keys (sk_live_*, pk_live_*) │   │
│  │  Production Database                      │   │
│  │  Production URLs                          │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                    Preview                        │
│  ┌──────────────────────────────────────────┐   │
│  │  Test Stripe Keys (sk_test_*, pk_test_*) │   │
│  │  Preview Database                         │   │
│  │  Preview URLs                             │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                  Development                      │
│  ┌──────────────────────────────────────────┐   │
│  │  Local .env.local                         │   │
│  │  Test Stripe Keys                         │   │
│  │  Local Database                           │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Protected Variables (Server-Side Only)

```
┌─────────────────────────────────────────┐
│      Server-Side Environment Vars       │
│         (Never exposed to browser)      │
├─────────────────────────────────────────┤
│ • STRIPE_SECRET_KEY                     │
│ • STRIPE_WEBHOOK_SECRET                 │
│ • DATABASE_URL                          │
│ • SUPABASE_SERVICE_ROLE_KEY            │
└─────────────────────────────────────────┘
```

### Public Variables (Client-Side)

```
┌─────────────────────────────────────────┐
│      Public Environment Vars            │
│      (Exposed to browser with prefix)   │
├─────────────────────────────────────────┤
│ • NEXT_PUBLIC_STRIPE_PUBLIC_KEY        │
│ • NEXT_PUBLIC_APP_URL                  │
│ • NEXT_PUBLIC_SITE_URL                 │
│ • NEXT_PUBLIC_GUEST_URL                │
└─────────────────────────────────────────┘
```

---

## 📦 Build Process

### Monorepo Build Flow

```
1. Git Push to main
        ↓
2. Vercel Webhook Trigger
        ↓
3. Check: Ignored Build Step
   if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi
        ↓
4. Build Proceeds (main branch only)
        ↓
5. cd apps/app
        ↓
6. pnpm install --filter @hookahplus/app...
   (installs app + dependencies from monorepo)
        ↓
7. prisma generate
   (generates Prisma client)
        ↓
8. pnpm --filter @hookahplus/app build
   (runs: next build)
        ↓
9. Output: .next/ directory
        ↓
10. Deploy to Vercel Edge Network
        ↓
11. Available at: hookahplus-app-prod.vercel.app
```

---

## 🔄 Redirect Configuration

### Old Preview URLs → Stable Alias

Configured in `apps/app/vercel.json`:

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

**Example:**
```
Old: hookahplus-app-git-feat-guests-cart-abc123.vercel.app/preorder/T-001
      ↓ (302 Redirect)
New: hookahplus-app-prod.vercel.app/preorder/T-001
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```
GET /api/stripe-health
    │
    ├─→ Check Stripe API Key
    ├─→ Verify Connection
    ├─→ Test Mode Detection
    └─→ Return Status
         │
         ↓
    {
      "status": "ok",
      "mode": "test|live",
      "timestamp": "..."
    }
```

### Smoke Test Endpoint

```
POST /api/payments/live-test
    │
    ├─→ Create $1 PaymentIntent
    ├─→ Confirm with test card
    ├─→ Verify success
    └─→ Return Result
         │
         ↓
    {
      "ok": true,
      "message": "Test successful",
      "paymentIntentId": "pi_..."
    }
```

---

## 🎯 Critical Routes

### User-Facing Routes

```
/                           Homepage
/preorder/T-001            Preorder & Smoke Test ⭐
/fire-session-dashboard    Fire Dashboard
/staff-dashboard           Staff Panel
/staff-panel               Staff Management
/checkout                  Checkout Flow
/sessions                  Session Management
```

### API Routes

```
/api/stripe-health         Health Check ⭐
/api/payments/live-test    $1 Smoke Test ⭐
/api/sessions              Session Management
/api/payments              Payment Processing
```

---

## 📝 Configuration Files

### Vercel Configuration

```
apps/app/vercel.json
├── buildCommand           (monorepo-aware)
├── installCommand         (pnpm filter)
├── outputDirectory        (.next)
├── functions
│   └── maxDuration        (API timeouts)
├── redirects
│   └── feat-guests-cart   (to stable alias)
└── env
    └── NEXT_PUBLIC_APP_URL
```

### Build Ignore

```
apps/app/.vercelignore
├── *.log                  (Log files)
├── test-results/          (Test artifacts)
├── playwright-report/     (Test reports)
├── .env.local            (Local env)
└── *.md                  (Docs, except README)
```

---

## 🚦 Deployment States

### Current State

```
✅ Configuration files created
✅ Documentation complete
✅ Build commands defined
✅ Redirect rules configured
✅ Function timeouts set
✅ Environment variables documented

🔧 Pending manual configuration in Vercel:
   - Stable alias setup
   - Production promotion
   - Environment variables verification
   - Branch protection activation
   - Stray preview cleanup
```

---

## 📚 Documentation Map

```
apps/app/
├── README_VERCEL.md               Main deployment guide
├── VERCEL_QUICK_REFERENCE.md      Quick reference card ⭐
├── VERCEL_PRODUCTION_SETUP.md     Complete setup guide
├── VERCEL_ENV_CHECKLIST.md        Environment variables
├── DEPLOYMENT_ARCHITECTURE.md     This file
├── vercel.json                    Actual configuration
└── .vercelignore                  Build ignore rules

(root)/
├── VERCEL_HYGIENE_REPORT.md             Detailed report
├── VERCEL_APP_ALIGNMENT_SUMMARY.md      Executive summary
└── VERCEL_MANUAL_STEPS_CHECKLIST.md     Action items ⭐
```

---

**Last Updated:** October 6, 2025  
**Version:** 1.0  
**Status:** Architecture Defined, Implementation Pending

