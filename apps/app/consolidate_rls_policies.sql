-- RLS Policy Consolidation Script
-- Consolidates multiple permissive policies to improve query performance
-- Run this in Supabase SQL Editor after reviewing RLS_POLICY_CONSOLIDATION_ANALYSIS.md
--
-- IMPORTANT: Test in staging first! Review each section before running.

BEGIN;

-- ============================================================================
-- PHASE 1: High Impact, Low Risk - Remove Redundant Policies
-- ============================================================================

-- 1.1 Remove old Session table policies (replaced by tenant-based policies)
-- These are redundant with tenant_*_sessions policies
DROP POLICY IF EXISTS "Allow session inserts" ON public."Session";
DROP POLICY IF EXISTS "Allow session updates" ON public."Session";
DROP POLICY IF EXISTS "Allow session deletes" ON public."Session";
DROP POLICY IF EXISTS "Users can read own sessions alt" ON public."Session";

-- 1.2 Remove/Update dev_allow_all_reflex_events (production should not have this)
-- Option A: Remove entirely (recommended for production)
DROP POLICY IF EXISTS "dev_allow_all_reflex_events" ON public.reflex_events;

-- Option B: Make it environment-specific (uncomment if you need dev mode)
-- DROP POLICY IF EXISTS "dev_allow_all_reflex_events" ON public.reflex_events;
-- CREATE POLICY "dev_allow_all_reflex_events"
--   ON public.reflex_events
--   FOR ALL
--   USING (
--     current_setting('app.environment', true) = 'development'
--     OR (select auth.role()) = 'service_role'
--   )
--   WITH CHECK (
--     current_setting('app.environment', true) = 'development'
--     OR (select auth.role()) = 'service_role'
--   );

-- 1.3 Fix auth function calls in staff/refills/reservations/ghostlog tables
-- These need (select auth.uid()) pattern for performance

-- Fix staff_rw policy
DROP POLICY IF EXISTS "staff_rw" ON public.staff;
CREATE POLICY "staff_rw" ON public.staff
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix sessions_rw policy (lowercase sessions table)
DROP POLICY IF EXISTS "sessions_rw" ON public.sessions;
-- Note: Recreate based on your actual requirements
-- This is a placeholder - review your actual sessions_rw policy first
-- CREATE POLICY "sessions_rw" ON public.sessions
--   FOR ALL
--   USING (
--     (select auth.role()) = 'service_role'
--     OR (
--       (select auth.uid()) IS NOT NULL
--       AND EXISTS (
--         SELECT 1 FROM public.memberships m
--         WHERE m.user_id = (select auth.uid())
--           AND m.tenant_id = sessions.tenant_id
--       )
--     )
--   )
--   WITH CHECK (
--     (select auth.role()) = 'service_role'
--     OR (
--       (select auth.uid()) IS NOT NULL
--       AND EXISTS (
--         SELECT 1 FROM public.memberships m
--         WHERE m.user_id = (select auth.uid())
--           AND m.tenant_id = sessions.tenant_id
--       )
--     )
--   );

-- Fix refills_rw policy
DROP POLICY IF EXISTS "refills_rw" ON public.refills;
CREATE POLICY "refills_rw" ON public.refills
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix reservations_rw policy
DROP POLICY IF EXISTS "reservations_rw" ON public.reservations;
CREATE POLICY "reservations_rw" ON public.reservations
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix ghostlog_insert policy
DROP POLICY IF EXISTS "ghostlog_insert" ON public.ghostlog;
CREATE POLICY "ghostlog_insert" ON public.ghostlog
  FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Fix ghostlog_read policy
DROP POLICY IF EXISTS "ghostlog_read" ON public.ghostlog;
CREATE POLICY "ghostlog_read" ON public.ghostlog
  FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

-- ============================================================================
-- PHASE 2: Medium Impact - Consolidate Multiple Policies
-- ============================================================================

-- 2.1 Consolidate Session table policies (if "Users can read own sessions" exists)
-- Remove redundant role-based policy, keep tenant-based one
DROP POLICY IF EXISTS "Users can read own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.sessions;
-- Note: Service role bypasses RLS anyway, but keeping for documentation is fine
-- If you want to keep it for clarity, recreate with optimized auth function:
CREATE POLICY "Service role can manage sessions"
  ON public.sessions
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- 2.2 Consolidate SessionEvent policies
DROP POLICY IF EXISTS "Service role can manage session events" ON public."SessionEvent";
DROP POLICY IF EXISTS "Users can read session events" ON public."SessionEvent";

-- Consolidated: Service role has full access
CREATE POLICY "Service role can manage session events"
  ON public."SessionEvent"
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- Consolidated: Authenticated users can read
CREATE POLICY "Users can read session events"
  ON public."SessionEvent"
  FOR SELECT
  USING ((select auth.role()) = 'authenticated');

-- 2.3 Consolidate DriftEvent policies
DROP POLICY IF EXISTS "Authenticated users can insert drift events" ON public."DriftEvent";
DROP POLICY IF EXISTS "Authenticated users can read drift events" ON public."DriftEvent";
DROP POLICY IF EXISTS "Authenticated users can update drift events" ON public."DriftEvent";
DROP POLICY IF EXISTS "Service role can manage drift events" ON public."DriftEvent";

-- Consolidated: Service role has full access
CREATE POLICY "Service role can manage drift events"
  ON public."DriftEvent"
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- Consolidated: Authenticated users can insert/read/update
CREATE POLICY "Authenticated users can manage drift events"
  ON public."DriftEvent"
  FOR ALL
  USING ((select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'authenticated');

-- 2.4 Consolidate TaxonomyUnknown policies
DROP POLICY IF EXISTS "Authenticated users can insert taxonomy unknowns" ON public."TaxonomyUnknown";
DROP POLICY IF EXISTS "Authenticated users can read taxonomy unknowns" ON public."TaxonomyUnknown";
DROP POLICY IF EXISTS "Authenticated users can update taxonomy unknowns" ON public."TaxonomyUnknown";
DROP POLICY IF EXISTS "Service role can manage taxonomy unknowns" ON public."TaxonomyUnknown";

-- Consolidated: Service role has full access
CREATE POLICY "Service role can manage taxonomy unknowns"
  ON public."TaxonomyUnknown"
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- Consolidated: Authenticated users can insert/read/update
CREATE POLICY "Authenticated users can manage taxonomy unknowns"
  ON public."TaxonomyUnknown"
  FOR ALL
  USING ((select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'authenticated');

-- ============================================================================
-- PHASE 3: Low Priority - Optimize Auth Functions
-- ============================================================================

-- 3.1 Optimize Award table policies
DROP POLICY IF EXISTS "Service role can manage awards" ON public."Award";
DROP POLICY IF EXISTS "Users can read own awards" ON public."Award";

CREATE POLICY "Service role can manage awards"
  ON public."Award"
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Users can read own awards"
  ON public."Award"
  FOR SELECT
  USING (
    (select auth.role()) = 'authenticated'
    AND "profileId" = (select auth.uid())::text
  );

-- 3.2 Optimize Badge table policies
DROP POLICY IF EXISTS "Service role can manage badges" ON public."Badge";
DROP POLICY IF EXISTS "Users can read active badges" ON public."Badge";

CREATE POLICY "Service role can manage badges"
  ON public."Badge"
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Users can read active badges"
  ON public."Badge"
  FOR SELECT
  USING (
    (select auth.role()) = 'authenticated'
    AND active = true
  );

-- 3.3 Optimize Event table policies
DROP POLICY IF EXISTS "Service role can manage events" ON public."Event";
DROP POLICY IF EXISTS "Users can read own events" ON public."Event";

CREATE POLICY "Service role can manage events"
  ON public."Event"
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Users can read own events"
  ON public."Event"
  FOR SELECT
  USING (
    (select auth.role()) = 'authenticated'
    AND "profileId" = (select auth.uid())::text
  );

-- 3.4 Optimize memberships table policies
DROP POLICY IF EXISTS "Service role can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can read own memberships" ON public.memberships;

CREATE POLICY "Service role can manage memberships"
  ON public.memberships
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Users can read own memberships"
  ON public.memberships
  FOR SELECT
  USING ((select auth.uid()) = user_id);

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check remaining policies per table
-- SELECT 
--   tablename,
--   policyname,
--   cmd,
--   roles
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('Session', 'sessions', 'reflex_events', 'SessionEvent', 'DriftEvent', 'TaxonomyUnknown', 'Award', 'Badge', 'Event', 'memberships')
-- ORDER BY tablename, policyname;

-- Count policies per table (should be reduced)
-- SELECT 
--   tablename,
--   COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY policy_count DESC;

