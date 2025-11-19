# Supabase Auth Multi-Tenant RLS Setup Guide

**Status:** ✅ Implementation Complete - Ready for Configuration

---

## Overview

This guide covers the complete Supabase Auth integration with multi-tenant Row-Level Security (RLS) and role-based access control (RBAC) for Hookah+.

---

## What Was Implemented

### Phase 1: Database Schema & RLS ✅
- ✅ Created `tenants` table
- ✅ Created `memberships` table with RBAC (owner, admin, staff, viewer roles)
- ✅ Added `tenant_id` to `Session`, `ReflexEvent` tables
- ✅ Created `payments` table
- ✅ Created JWT helper functions (`auth.current_user_id()`, `auth.current_tenant()`, `auth.current_role()`)
- ✅ Enabled RLS with tenant-scoped policies

### Phase 2: Data Migration ✅
- ✅ Created migration script: `migrate-loungeid-to-tenant.ts`
- ✅ Created backfill script: `backfill-payments-table.ts`

### Phase 3: Prisma Schema ✅
- ✅ Updated Prisma schema with `Tenant`, `Membership`, `Payment` models
- ✅ Added `tenantId` to `Session` and `ReflexEvent` models
- ✅ Added relations and indexes

### Phase 4: Supabase Integration ✅
- ✅ Installed `@supabase/ssr` and `@supabase/supabase-js`
- ✅ Created `lib/supabase.ts` with server/client/admin clients
- ✅ Created `lib/auth.ts` with auth helper functions

### Phase 5: Middleware ✅
- ✅ Updated middleware to use Supabase Auth
- ✅ Protects admin routes and app routes
- ✅ Allows public routes (QR codes, webhooks)

### Phase 6: API Routes ✅
- ✅ Updated admin routes with `requireRole()` checks
- ✅ Updated sessions route with tenant filtering
- ✅ Added tenant_id to session/event creation

### Phase 7: Login/Signup ✅
- ✅ Created `/login` page
- ✅ Created `/signup` page
- ✅ Created `/auth/callback` route handler

### Phase 8: Webhooks ✅
- ✅ Updated Stripe webhook to create Payment records
- ✅ Uses admin client for privileged writes

---

## Environment Variables Required

Add to `apps/app/.env.local`:

```bash
# ===========================================
# SUPABASE AUTH
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Server-only, never expose

# ===========================================
# DATABASE (Already configured)
# ===========================================
DATABASE_URL=postgresql://...  # Your existing Supabase connection string

# ===========================================
# APP URL
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## Getting Supabase Credentials

### 1. Get Supabase Project URL and Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

---

## Running Migrations

### Step 1: Apply Database Migrations

Run these migrations in order via Supabase SQL Editor:

1. `20251118000001_add_tenant_rbac.sql` - Creates tenants and memberships tables
2. `20251118000002_add_tenant_id_to_tables.sql` - Adds tenant_id columns
3. `20251118000003_add_jwt_helpers.sql` - Creates JWT helper functions
4. `20251118000004_enable_rls_policies.sql` - Enables RLS and creates policies

**Or use Supabase CLI:**
```bash
supabase db push
```

### Step 2: Generate Prisma Client

```bash
cd apps/app
npx prisma generate
```

### Step 3: Run Data Migration

```bash
# Map existing loungeId → tenant_id
npx tsx scripts/migrate-loungeid-to-tenant.ts

# Backfill payments table
npx tsx scripts/backfill-payments-table.ts
```

---

## Testing the Implementation

### 1. Test Signup Flow

1. Navigate to `http://localhost:3002/signup`
2. Enter business name, email, password
3. Verify:
   - User created in Supabase Auth
   - Tenant created
   - Membership created with 'owner' role
   - Redirect to login

### 2. Test Login Flow

1. Navigate to `http://localhost:3002/login`
2. Sign in with created account
3. Verify:
   - Redirect to admin dashboard
   - Can access `/admin/operator-onboarding`
   - Can see only your tenant's data

### 3. Test RLS Isolation

1. Create two tenants (sign up two accounts)
2. Create sessions in each tenant
3. Verify:
   - Tenant A cannot see Tenant B's sessions
   - Tenant A cannot see Tenant B's events
   - Tenant A cannot see Tenant B's payments

### 4. Test Role-Based Access

1. Create a user with 'viewer' role
2. Verify:
   - Can read data (GET requests work)
   - Cannot create/update/delete (POST/PATCH/DELETE return 403)

### 5. Test Public Routes

1. Test QR code session creation (POST `/api/sessions`) without auth
2. Verify:
   - Session created successfully
   - tenant_id set from QR code or loungeId lookup

---

## Setting Active Tenant in JWT

After login, the app needs to set `tenant_id` and `role` in the user's JWT claims. This is handled by:

1. **Login page** - Fetches user's first membership and sets in metadata
2. **Auth callback** - Sets tenant_id and role after OAuth/magic link
3. **`setActiveTenant()` function** - Can be called to switch tenants

The JWT claims are then read by RLS policies via `auth.current_tenant()` and `auth.current_role()`.

---

## Multi-Tenant Data Flow

### Session Creation (Public QR Code)
1. QR code contains `tenantId` or `loungeId`
2. POST `/api/sessions` (public route)
3. Lookup tenant by `loungeId` if `tenantId` not provided
4. Create session with `tenant_id`
5. RLS ensures only tenant members can read it

### Admin Dashboard Access
1. User logs in → JWT contains `tenant_id` and `role`
2. GET `/api/admin/operator-onboarding`
3. Middleware checks authentication
4. API route checks role (`requireRole(['owner', 'admin'])`)
5. Query filters by `tenant_id` (RLS also enforces)
6. Returns only current tenant's data

---

## Service Role Usage

The `adminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` which **bypasses RLS**. Use ONLY for:

- ✅ Webhook handlers (Stripe, etc.)
- ✅ Migration scripts
- ✅ Admin operations that need to access all tenants

**NEVER** use service role in:
- ❌ Client-side code
- ❌ Regular API routes (use `serverClient()` instead)
- ❌ User-facing operations

---

## Troubleshooting

### "No active tenant" error
- User logged in but no membership found
- Solution: Run signup flow or manually create membership

### RLS blocking queries
- Check JWT contains `tenant_id` claim
- Verify user has membership for that tenant
- Check role has required permissions

### Prisma errors about missing columns
- Run migrations first
- Then run `npx prisma generate`
- Restart dev server

### Webhook failing to create payments
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check session has `tenantId` set
- Verify payments table exists

---

## Next Steps

1. **Configure Supabase Auth:**
   - Enable email/password auth in Supabase Dashboard
   - Configure email templates (optional)
   - Set up OAuth providers (optional)

2. **Run Migrations:**
   - Apply all 4 migration files
   - Run data migration scripts

3. **Test:**
   - Signup flow
   - Login flow
   - RLS isolation
   - Role-based access

4. **Production:**
   - Add environment variables to Vercel
   - Test in staging environment
   - Monitor RLS performance

---

## Files Created/Modified

### New Files:
- `supabase/migrations/20251118000001_add_tenant_rbac.sql`
- `supabase/migrations/20251118000002_add_tenant_id_to_tables.sql`
- `supabase/migrations/20251118000003_add_jwt_helpers.sql`
- `supabase/migrations/20251118000004_enable_rls_policies.sql`
- `apps/app/scripts/migrate-loungeid-to-tenant.ts`
- `apps/app/scripts/backfill-payments-table.ts`
- `apps/app/lib/supabase.ts`
- `apps/app/lib/auth.ts`
- `apps/app/app/login/page.tsx`
- `apps/app/app/signup/page.tsx`
- `apps/app/app/auth/callback/route.ts`
- `apps/app/SUPABASE_AUTH_SETUP.md`

### Modified Files:
- `apps/app/prisma/schema.prisma`
- `apps/app/middleware.ts`
- `apps/app/app/api/admin/operator-onboarding/route.ts`
- `apps/app/app/api/sessions/route.ts`
- `apps/app/app/api/webhooks/stripe/route.ts`
- `apps/app/package.json`

---

**Status:** ✅ Ready for Configuration and Testing

