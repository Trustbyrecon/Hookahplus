-- Fix All RLS Performance Issues
-- Agent: Noor (session_agent)
-- Date: 2025-01-14
-- 
-- This migration addresses:
-- 1. auth_rls_initplan: Wraps auth.<function>() calls in (select ...) to prevent per-row re-evaluation
-- 2. multiple_permissive_policies: Consolidates duplicate policies where possible
--
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT-ID]/sql

-- ============================================
-- 1. Award Table - Fix auth_rls_initplan and consolidate policies
-- ============================================
DROP POLICY IF EXISTS "Service role can manage awards" ON public."Award";
DROP POLICY IF EXISTS "Users can read own awards" ON public."Award";

-- Consolidated policy: Service role has full access
CREATE POLICY "Service role can manage awards"
ON public."Award"
FOR ALL
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- Consolidated policy: Authenticated users can read
CREATE POLICY "Users can read own awards"
ON public."Award"
FOR SELECT
USING ((select auth.role()) = 'authenticated');

-- ============================================
-- 2. Badge Table - Fix auth_rls_initplan and consolidate policies
-- ============================================
DROP POLICY IF EXISTS "Service role can manage badges" ON public."Badge";
DROP POLICY IF EXISTS "Users can read active badges" ON public."Badge";

-- Consolidated policy: Service role has full access
CREATE POLICY "Service role can manage badges"
ON public."Badge"
FOR ALL
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- Consolidated policy: Authenticated users can read active badges
CREATE POLICY "Users can read active badges"
ON public."Badge"
FOR SELECT
USING ((select auth.role()) = 'authenticated' AND active = true);

-- ============================================
-- 3. Event Table - Fix auth_rls_initplan and consolidate policies
-- ============================================
DROP POLICY IF EXISTS "Service role can manage events" ON public."Event";
DROP POLICY IF EXISTS "Users can read own events" ON public."Event";

-- Consolidated policy: Service role has full access
CREATE POLICY "Service role can manage events"
ON public."Event"
FOR ALL
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- Consolidated policy: Authenticated users can read their own events
CREATE POLICY "Users can read own events"
ON public."Event"
FOR SELECT
USING ((select auth.role()) = 'authenticated' AND (select auth.uid()) = "userId");

-- ============================================
-- 4. Session Table (public."Session") - Fix auth_rls_initplan
-- ============================================
DROP POLICY IF EXISTS "Users can read own sessions alt" ON public."Session";

-- Optimized policy: Authenticated users can read
CREATE POLICY "Users can read own sessions alt"
ON public."Session"
FOR SELECT
USING ((select auth.role()) = 'authenticated');

-- ============================================
-- 5. SessionEvent Table - Fix auth_rls_initplan and consolidate policies
-- ============================================
DROP POLICY IF EXISTS "Service role can manage session events" ON public."SessionEvent";
DROP POLICY IF EXISTS "Users can read session events" ON public."SessionEvent";

-- Consolidated policy: Service role has full access
CREATE POLICY "Service role can manage session events"
ON public."SessionEvent"
FOR ALL
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- Consolidated policy: Authenticated users can read
CREATE POLICY "Users can read session events"
ON public."SessionEvent"
FOR SELECT
USING ((select auth.role()) = 'authenticated');

-- ============================================
-- 6. ghostlog Table - Fix auth_rls_initplan
-- ============================================
DROP POLICY IF EXISTS "ghostlog_insert" ON public.ghostlog;
DROP POLICY IF EXISTS "ghostlog_read" ON public.ghostlog;

-- Optimized insert policy
CREATE POLICY "ghostlog_insert"
ON public.ghostlog
FOR INSERT
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- Optimized read policy
CREATE POLICY "ghostlog_read"
ON public.ghostlog
FOR SELECT
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- ============================================
-- 7. refills Table - Fix auth_rls_initplan
-- ============================================
DROP POLICY IF EXISTS "refills_rw" ON public.refills;

-- Optimized read-write policy
CREATE POLICY "refills_rw"
ON public.refills
FOR ALL
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- ============================================
-- 8. reservations Table - Fix auth_rls_initplan
-- ============================================
DROP POLICY IF EXISTS "reservations_rw" ON public.reservations;

-- Optimized read-write policy
CREATE POLICY "reservations_rw"
ON public.reservations
FOR ALL
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- ============================================
-- 9. sessions Table (lowercase) - Fix auth_rls_initplan and consolidate policies
-- ============================================
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON public.sessions;
DROP POLICY IF EXISTS "sessions_rw" ON public.sessions;

-- Consolidated policy: Service role has full access
CREATE POLICY "Service role can manage sessions"
ON public.sessions
FOR ALL
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- Consolidated policy: Authenticated users can read and write their own sessions
CREATE POLICY "sessions_rw"
ON public.sessions
FOR ALL
USING (
  (select auth.role()) = 'authenticated' AND 
  (select auth.uid()) = "userId"
)
WITH CHECK (
  (select auth.role()) = 'authenticated' AND 
  (select auth.uid()) = "userId"
);

-- ============================================
-- 10. staff Table - Fix auth_rls_initplan
-- ============================================
DROP POLICY IF EXISTS "staff_rw" ON public.staff;

-- Optimized read-write policy
CREATE POLICY "staff_rw"
ON public.staff
FOR ALL
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- ============================================
-- 11. stripe_webhook_events Table - Fix auth_rls_initplan
-- ============================================
DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.stripe_webhook_events;

-- Optimized policy: Service role has full access
CREATE POLICY "Service role can manage webhook events"
ON public.stripe_webhook_events
FOR ALL
USING ((select auth.role()) = 'service_role')
WITH CHECK ((select auth.role()) = 'service_role');

-- ============================================
-- 12. venues Table - Consolidate multiple permissive policies
-- ============================================
DROP POLICY IF EXISTS "venue_read" ON public.venues;
DROP POLICY IF EXISTS "venue_write" ON public.venues;

-- Consolidated policy: Single read-write policy
CREATE POLICY "venue_rw"
ON public.venues
FOR ALL
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify the fixes:

-- Check that policies use (select auth.role()) instead of auth.role()
SELECT 
  tablename,
  policyname,
  qual as "Using Expression",
  with_check as "With Check Expression"
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('Award', 'Badge', 'Event', 'Session', 'SessionEvent', 'ghostlog', 'refills', 'reservations', 'sessions', 'staff', 'stripe_webhook_events', 'venues')
ORDER BY tablename, policyname;

-- Count policies per table (should be reduced)
SELECT 
  tablename,
  COUNT(*) as "Policy Count"
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('Award', 'Badge', 'Event', 'Session', 'SessionEvent', 'ghostlog', 'refills', 'reservations', 'sessions', 'staff', 'stripe_webhook_events', 'venues')
GROUP BY tablename
ORDER BY tablename;

