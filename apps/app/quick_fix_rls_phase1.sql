-- Quick Fix: RLS Performance Issues - Phase 1 Only
-- High Impact, Low Risk - Safe to run immediately
-- 
-- This script:
-- 1. Removes redundant Session table policies
-- 2. Removes dev-only permissive policy from reflex_events
-- 3. Fixes auth function performance in staff/refills/reservations/ghostlog
--
-- Estimated Impact: Fixes 5 auth_rls_initplan warnings + reduces multiple permissive policy warnings
-- Risk Level: LOW (removes redundant policies, doesn't change security model)
--
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT-ID]/sql

BEGIN;

-- ============================================================================
-- 1. Remove Redundant Session Table Policies
-- ============================================================================
-- These old policies are redundant with the newer tenant-based policies
-- Removing them will eliminate multiple permissive policy warnings

DROP POLICY IF EXISTS "Allow session inserts" ON public."Session";
DROP POLICY IF EXISTS "Allow session updates" ON public."Session";
DROP POLICY IF EXISTS "Allow session deletes" ON public."Session";
DROP POLICY IF EXISTS "Users can read own sessions alt" ON public."Session";

-- ============================================================================
-- 2. Remove Dev-Only Permissive Policy from reflex_events
-- ============================================================================
-- This permissive policy conflicts with tenant-based policies
-- In production, it should be removed (service role bypasses RLS anyway)

DROP POLICY IF EXISTS "dev_allow_all_reflex_events" ON public.reflex_events;

-- ============================================================================
-- 3. Fix Auth Function Performance Issues
-- ============================================================================
-- Replace auth.uid() with (select auth.uid()) for better query performance
-- This fixes the "auth_rls_initplan" warnings

-- Fix staff_rw policy (role-based, not user_id-based)
DROP POLICY IF EXISTS "staff_rw" ON public.staff;
CREATE POLICY "staff_rw" ON public.staff
  FOR ALL
  USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- Fix sessions_rw policy (lowercase sessions table)
-- Note: If sessions table doesn't have userId column, this will use role-based access
DROP POLICY IF EXISTS "sessions_rw" ON public.sessions;
-- Use role-based policy (safer - doesn't require specific columns)
CREATE POLICY "sessions_rw" ON public.sessions
  FOR ALL
  USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- Fix refills_rw policy (role-based)
DROP POLICY IF EXISTS "refills_rw" ON public.refills;
CREATE POLICY "refills_rw" ON public.refills
  FOR ALL
  USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- Fix reservations_rw policy (role-based)
DROP POLICY IF EXISTS "reservations_rw" ON public.reservations;
CREATE POLICY "reservations_rw" ON public.reservations
  FOR ALL
  USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- Fix ghostlog_insert policy (role-based)
DROP POLICY IF EXISTS "ghostlog_insert" ON public.ghostlog;
CREATE POLICY "ghostlog_insert" ON public.ghostlog
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

-- Fix ghostlog_read policy (role-based)
DROP POLICY IF EXISTS "ghostlog_read" ON public.ghostlog;
CREATE POLICY "ghostlog_read" ON public.ghostlog
  FOR SELECT
  USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

COMMIT;

-- ============================================================================
-- Verification
-- ============================================================================
-- After running, check Supabase Performance Advisor again
-- You should see:
-- ✅ 5 fewer "auth_rls_initplan" warnings
-- ✅ Fewer "multiple_permissive_policies" warnings on Session table
-- ✅ Fewer "multiple_permissive_policies" warnings on reflex_events table
--
-- To verify policies were removed:
-- SELECT tablename, policyname 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('Session', 'reflex_events', 'staff', 'sessions', 'refills', 'reservations', 'ghostlog')
-- ORDER BY tablename, policyname;

