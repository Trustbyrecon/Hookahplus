# Fix: RLS Blocking Session Inserts

## Problem
- Prisma Studio shows 0 sessions
- Dashboard shows "1 Active Sessions" (from demo data)
- Session creation API succeeds but data doesn't persist
- **Root Cause**: RLS policies on `Session` table only allow SELECT for authenticated users, but Prisma uses direct database connection (not service_role)

## Solution

### Option 1: Add INSERT Policy (Recommended)
Run the migration file in Supabase SQL Editor:
```sql
-- File: supabase/migrations/20251106000001_fix_session_insert_policy.sql
```

This adds INSERT, UPDATE, and DELETE policies that allow Prisma's direct database connection to work.

### Option 2: Use Service Role Connection String
Update `apps/app/.env.local` to use service_role:
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[SERVICE_ROLE_KEY]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

**Note**: Service role bypasses RLS, so this is less secure but works immediately.

### Option 3: Disable RLS (Not Recommended)
Only for development/testing:
```sql
ALTER TABLE public."Session" DISABLE ROW LEVEL SECURITY;
```

## Verification

After applying the fix:

1. **Create a session** via the UI
2. **Check Prisma Studio**: Should show 1 session
3. **Check dashboard**: Should show the session in the list

## Why This Happened

The RLS migration (`20251105000001_enable_rls_security.sql`) only created:
- Service role policy (FOR ALL) - but Prisma wasn't using service_role
- Authenticated user policy (FOR SELECT) - read-only

Prisma uses direct database connection (not Supabase auth), so it needs explicit INSERT/UPDATE/DELETE policies.

