# RLS Performance Fix - Comprehensive Migration

**Agent:** Noor (session_agent)  
**Date:** 2025-01-14

---

## Problem

Supabase Database Linter identified **50+ RLS performance warnings**:

1. **auth_rls_initplan** (17 warnings): Policies re-evaluate `auth.role()` and `auth.uid()` for each row
2. **multiple_permissive_policies** (33 warnings): Multiple permissive policies for same role/action

These issues cause:
- Suboptimal query performance at scale
- Unnecessary per-row function calls
- Slower session creation/updates

---

## Solution

Created comprehensive migration: `supabase/migrations/20251114000004_fix_all_rls_performance_issues.sql`

### Fixes Applied

1. **Wrapped all `auth.<function>()` calls in `(select ...)`**
   - Prevents per-row re-evaluation
   - Caches function result for entire query
   - Example: `auth.role()` → `(select auth.role())`

2. **Consolidated duplicate policies**
   - Merged multiple permissive policies into single policies
   - Reduced policy count per table
   - Maintained same security level

### Tables Fixed

- ✅ `Award` (2 policies consolidated)
- ✅ `Badge` (2 policies consolidated)
- ✅ `Event` (2 policies consolidated)
- ✅ `Session` (optimized)
- ✅ `SessionEvent` (2 policies consolidated)
- ✅ `ghostlog` (2 policies optimized)
- ✅ `refills` (1 policy optimized)
- ✅ `reservations` (1 policy optimized)
- ✅ `sessions` (3 policies consolidated to 2)
- ✅ `staff` (1 policy optimized)
- ✅ `stripe_webhook_events` (1 policy optimized)
- ✅ `venues` (2 policies consolidated to 1)

---

## How to Apply

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/[PROJECT-ID]/sql

2. **Run the migration:**
   ```sql
   -- Copy contents from: supabase/migrations/20251114000004_fix_all_rls_performance_issues.sql
   ```

3. **Verify the fix:**
   - Run verification queries at the end of the migration
   - Check Supabase Database Linter (should show 0 warnings)

---

## Expected Results

### Before
- 50+ RLS warnings
- `auth.role()` called per row
- Multiple policies per table
- Slower query performance

### After
- 0 RLS warnings
- `(select auth.role())` cached per query
- Consolidated policies
- Improved query performance

---

## Impact on Session Management

**Critical tables for session operations:**
- `Session` - ✅ Optimized
- `SessionEvent` - ✅ Optimized
- `sessions` - ✅ Consolidated

**Expected improvements:**
- Faster session creation (POST `/api/sessions`)
- Faster session updates (PATCH `/api/sessions`)
- Faster session queries (GET `/api/sessions`)
- Better scalability for high-volume operations

---

## Verification

After running the migration, verify:

1. **Check policy count:**
   ```sql
   SELECT tablename, COUNT(*) as policy_count
   FROM pg_policies 
   WHERE schemaname = 'public' 
     AND tablename IN ('Session', 'SessionEvent', 'sessions')
   GROUP BY tablename;
   ```

2. **Check for (select auth.role()) usage:**
   ```sql
   SELECT policyname, qual
   FROM pg_policies 
   WHERE schemaname = 'public' 
     AND tablename = 'Session'
     AND qual LIKE '%auth.role()%';
   ```
   Should show `(select auth.role())` not `auth.role()`

3. **Run Supabase Database Linter:**
   - Should show 0 RLS warnings

---

**Status:** ✅ **Migration ready - Run in Supabase SQL Editor**

