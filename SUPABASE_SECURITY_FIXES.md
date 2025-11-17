# Supabase Security Advisor Fixes

## Summary
This document addresses the warnings from Supabase Security Advisor report dated 2025-11-16.

## Issues Fixed

### 1. ✅ Duplicate Indexes on `reflex_events` Table
**Problem:** Table had duplicate indexes with snake_case and camelCase naming:
- `idx_reflex_events_campaign_id` vs `idx_reflex_events_campaignid`
- `idx_reflex_events_cta_source` vs `idx_reflex_events_ctasource`
- `idx_reflex_events_cta_type` vs `idx_reflex_events_ctatype`
- `idx_reflex_events_type_created_at` vs `idx_reflex_events_type_createdat`

**Solution:** Migration `20251116000001_fix_rls_performance_and_duplicate_indexes.sql`:
- Drops all duplicate indexes
- Recreates only camelCase versions to match Prisma schema
- Uses partial indexes (WHERE ... IS NOT NULL) for better performance

### 2. ✅ Duplicate Permissive Policies on `reflex_events`
**Problem:** Two permissive policies existed:
- `"Allow all operations on reflex_events"`
- `dev_allow_all_reflex_events`

**Solution:** 
- Drops the older policy
- Keeps `dev_allow_all_reflex_events` (better naming, more explicit)

### 3. ⚠️ RLS Performance Issues (Auth Function Re-evaluation)
**Problem:** Multiple tables have RLS policies that re-evaluate `auth.<function>()` for each row, causing performance issues at scale.

**Affected Tables:**
- `Badge`, `Award`, `SessionEvent`, `Event`, `Session`, `sessions`, `staff`, `refills`, `reservations`, `ghostlog`, `stripe_webhook_events`, `reflex_events`

**Solution Pattern:**
Replace `auth.uid()` with `(select auth.uid())` in RLS policies to evaluate once per query instead of per row.

**Example:**
```sql
-- Before (inefficient):
CREATE POLICY "Users can read own sessions"
  ON public.sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- After (efficient):
CREATE POLICY "Users can read own sessions"
  ON public.sessions
  FOR SELECT
  USING ((select auth.uid()) = user_id);
```

**Note:** Since we're currently using `service_role` for Prisma (which bypasses RLS), these optimizations are not critical now but should be applied when we add user-based authentication.

### 4. ⚠️ Multiple Permissive Policies
**Problem:** Many tables have multiple permissive policies for the same role/action, causing each policy to be evaluated for every query.

**Affected Tables:**
- `Award`, `Badge`, `DriftEvent`, `Event`, `SessionEvent`, `TaxonomyUnknown`, `reflex_events`, `sessions`, `venues`

**Solution:** Consolidate policies by:
1. Merging overlapping policies into single, more specific policies
2. Using role-specific policies instead of permissive "allow all" policies
3. Removing redundant policies

**Note:** This is a larger refactoring that should be done when implementing proper authentication. For now, the duplicate policy on `reflex_events` has been fixed.

## Migration Applied

**File:** `supabase/migrations/20251116000001_fix_rls_performance_and_duplicate_indexes.sql`

**What it does:**
1. ✅ Removes duplicate indexes on `reflex_events`
2. ✅ Removes duplicate permissive policy on `reflex_events`
3. 📝 Documents the pattern for fixing RLS performance issues (for future implementation)

## Next Steps

1. **Immediate:** Run the migration in Supabase SQL Editor
2. **Short-term:** Monitor query performance improvements
3. **Long-term:** When implementing user authentication:
   - Apply `(select auth.uid())` pattern to all RLS policies
   - Consolidate multiple permissive policies
   - Add role-based access control

## Running the Migration

```sql
-- Copy and paste the contents of:
-- supabase/migrations/20251116000001_fix_rls_performance_and_duplicate_indexes.sql
-- into Supabase SQL Editor and execute
```

## Verification

After running the migration, verify:

```sql
-- Check indexes (should only see camelCase versions):
SELECT indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'reflex_events'
  AND indexname LIKE 'idx_reflex_events%'
ORDER BY indexname;

-- Check policies (should only see one):
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'reflex_events';
```

