# RLS Security Fix - Campaigns and Network Tables

**Date:** 2025-01-28  
**Status:** ✅ Migration Created - Ready to Apply

---

## Problem

Supabase Security Advisor identified **8 tables** with Row Level Security (RLS) disabled:

1. `campaigns` - Marketing campaign management
2. `campaign_usages` - Campaign application tracking
3. `network_profiles` - Network-wide customer profiles
4. `network_preferences` - Customer preferences
5. `network_badges` - Network-wide badges
6. `network_sessions` - Cross-lounge session history
7. `network_session_notes` - Shareable session notes
8. `network_pii_links` - Sensitive PII hash mappings

All these tables are in the `public` schema and exposed to PostgREST, making them vulnerable without RLS protection.

---

## Solution

Created migration: `supabase/migrations/20250128000006_enable_rls_campaigns_network.sql`

### Security Policies Applied

#### **Campaigns Tables (Tenant-Scoped)**

**`campaigns` table:**
- ✅ Service role: Full access (for Prisma/webhooks)
- ✅ Tenant members: Read access to campaigns in their tenant
- ✅ Tenant owners/admins/staff: Insert/update campaigns
- ✅ Tenant owners/admins only: Delete campaigns

**`campaign_usages` table:**
- ✅ Service role: Full access
- ✅ Tenant members: Read access via campaign relationship
- ✅ Tenant owners/admins/staff: Insert/update campaign usages

#### **Network Tables (Network-Wide)**

**`network_profiles`, `network_preferences`, `network_badges`:**
- ✅ Service role: Full access
- ✅ Authenticated users: Read access (for network-wide features)

**`network_sessions`, `network_session_notes`:**
- ✅ Service role: Full access
- ✅ Authenticated users: Read access (respects `share_scope` for notes)

**`network_pii_links` (Most Restrictive):**
- ✅ Service role: Full access only
- ❌ No authenticated user access (sensitive PII data)

### Performance Optimizations

- All policies use `(select auth.role())` pattern to prevent per-row re-evaluation
- Policies are idempotent (safe to run multiple times)
- Table existence checks before enabling RLS

---

## How to Apply

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste Migration:**
   - Open `supabase/migrations/20250128000006_enable_rls_campaigns_network.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration:**
   - Click "Run" (or press Ctrl+Enter)
   - Wait for completion (should take < 10 seconds)

5. **Verify RLS is Enabled:**
   - Run the verification query at the end of the migration file
   - Or check Supabase Security Advisor (should show 0 warnings for these tables)

### Option 2: Supabase CLI

```bash
# From project root
supabase db push
```

This will apply all pending migrations, including the RLS migration.

---

## Verification

After applying the migration, verify with these queries:

### 1. Check RLS is Enabled

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'campaigns', 'campaign_usages',
    'network_profiles', 'network_preferences', 'network_badges',
    'network_sessions', 'network_session_notes', 'network_pii_links'
  )
ORDER BY tablename;
```

**Expected:** All tables should show `rls_enabled = true`

### 2. Check Policies Exist

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'campaigns', 'campaign_usages',
    'network_profiles', 'network_preferences', 'network_badges',
    'network_sessions', 'network_session_notes', 'network_pii_links'
  )
ORDER BY tablename, policyname;
```

**Expected:** Each table should have at least 1 policy (service role), and most should have 2+ policies.

### 3. Verify Supabase Security Advisor

- Go to Supabase Dashboard → Database → Security Advisor
- Check that all 8 tables no longer show RLS warnings
- Should see 0 errors for `rls_disabled_in_public` on these tables

---

## Security Model

### Tenant Isolation (Campaigns)

Campaigns are scoped to tenants using the `memberships` table:
- Users can only access campaigns in tenants where they have membership
- Role-based access: owners/admins can manage, staff can read/write, members can read

### Network-Wide Access (Network Tables)

Network tables are designed for cross-lounge features:
- Authenticated users can read network profiles, preferences, badges, sessions, and notes
- Service role has full access for system operations
- `network_pii_links` is most restrictive (service role only) due to sensitive PII data

### PII Protection

`network_pii_links` contains sensitive PII hash mappings:
- **No authenticated user access** - only service role
- This ensures PII resolution is controlled and auditable
- Access should be via secure API endpoints, not direct database queries

---

## Impact on Application

### Campaign Management

- ✅ Campaign APIs will continue to work (via service role)
- ✅ Tenant isolation is enforced at database level
- ✅ Users can only see/manage campaigns in their tenant

### Network Features

- ✅ Network profile lookups will work for authenticated users
- ✅ Cross-lounge session history accessible to authenticated users
- ✅ PII resolution requires service role (secure API endpoints)

### No Breaking Changes

- All existing service role operations (Prisma, webhooks) continue to work
- Authenticated user access is properly scoped
- Tenant isolation is enforced for campaigns

---

## Rollback (if needed)

If you need to rollback (not recommended for security reasons):

```sql
-- Disable RLS (NOT RECOMMENDED - security risk)
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_usages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_session_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_pii_links DISABLE ROW LEVEL SECURITY;

-- Drop policies (optional)
DROP POLICY IF EXISTS "service_role_manage_campaigns" ON public.campaigns;
-- ... (repeat for all policies)
```

**⚠️ Warning:** Disabling RLS exposes these tables to unauthorized access. Only rollback if absolutely necessary and in a controlled environment.

---

## Next Steps

1. ✅ Migration created
2. ⏳ Apply migration in Supabase SQL Editor
3. ⏳ Verify RLS is enabled (run verification queries)
4. ⏳ Check Supabase Security Advisor (should show 0 warnings)
5. ⏳ Test campaign management flows
6. ⏳ Test network profile lookups

---

**Status:** ✅ **Migration ready - Apply in Supabase SQL Editor**

