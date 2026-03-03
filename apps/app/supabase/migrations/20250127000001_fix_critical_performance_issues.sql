-- Migration: Fix Critical Database Performance Issues
-- Date: 2025-01-27
-- Priority: High
-- 
-- Fixes:
-- 1. Remove duplicate index on reflex_events
-- 2. Add missing foreign key indexes
-- 3. Template for RLS auth function optimization (manual review required)
--
-- NOTE: Supabase SQL Editor may auto-wrap in transactions
-- This version removes CONCURRENTLY to work in SQL Editor
-- For production via psql, you can use CONCURRENTLY to avoid locks

-- ============================================================================
-- 1. Remove Duplicate Index (Priority 1.2)
-- ============================================================================
-- reflex_events has duplicate indexes: idx_reflex_events_session and idx_reflex_events_sessionid
-- Keep idx_reflex_events_sessionid, drop idx_reflex_events_session

DROP INDEX IF EXISTS public.idx_reflex_events_session;

-- ============================================================================
-- 2. Add Missing Foreign Key Indexes (Priority 2.1)
-- ============================================================================
-- These indexes improve JOIN performance and foreign key constraint checks
-- NOTE: Without CONCURRENTLY, these will briefly lock tables during creation
-- Run during low-traffic periods if possible

-- loyalty_note_bindings.session_note_id
CREATE INDEX IF NOT EXISTS idx_loyalty_note_bindings_session_note_id 
  ON public.loyalty_note_bindings(session_note_id);

-- refills.session_id
CREATE INDEX IF NOT EXISTS idx_refills_session_id 
  ON public.refills(session_id);

-- refills.venue_id
CREATE INDEX IF NOT EXISTS idx_refills_venue_id 
  ON public.refills(venue_id);

-- seats.zone_id
CREATE INDEX IF NOT EXISTS idx_seats_zone_id 
  ON public.seats(zone_id);

-- sessions.venue_id
CREATE INDEX IF NOT EXISTS idx_sessions_venue_id 
  ON public.sessions(venue_id);

-- staff.venue_id
CREATE INDEX IF NOT EXISTS idx_staff_venue_id 
  ON public.staff(venue_id);

-- ============================================================================
-- 3. RLS Auth Function Optimization (Priority 1.1)
-- ============================================================================
-- NOTE: This requires manual review of each policy
-- The pattern is to replace:
--   auth.uid()  -> (select auth.uid())
--   auth.role() -> (select auth.role())
--   auth.jwt()  -> (select auth.jwt())
--
-- See DATABASE_OPTIMIZATION_PLAN.md for detailed instructions
--
-- Example fix for a policy:
-- DROP POLICY IF EXISTS "policy_name" ON public.table_name;
-- CREATE POLICY "policy_name" ON public.table_name
--   FOR SELECT
--   USING ((select auth.uid()) = user_id);
--
-- Run the query below to see all policies that need fixing:
-- ============================================================================

-- Query to find all policies needing optimization:
/*
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual LIKE '%auth.uid()%' 
    OR qual LIKE '%auth.role()%'
    OR qual LIKE '%auth.jwt()%'
    OR with_check LIKE '%auth.uid()%'
    OR with_check LIKE '%auth.role()%'
    OR with_check LIKE '%auth.jwt()%'
  )
  AND (
    qual NOT LIKE '%(select auth.%'
    AND with_check NOT LIKE '%(select auth.%'
  )
ORDER BY tablename, policyname;
*/

