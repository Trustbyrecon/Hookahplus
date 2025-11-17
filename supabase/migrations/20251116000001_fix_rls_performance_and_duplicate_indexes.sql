-- Migration: Fix RLS Performance Issues and Duplicate Indexes
-- Addresses Supabase Security Advisor warnings
-- Agent: Noor (session_agent)
-- Date: 2025-11-16

BEGIN;

-- ============================================================================
-- 1. Fix duplicate indexes on reflex_events table
-- ============================================================================

-- Drop ALL potential duplicate indexes (both snake_case and camelCase variants)
-- We'll recreate only the correct camelCase versions
DROP INDEX IF EXISTS public.idx_reflex_events_campaignid;
DROP INDEX IF EXISTS public.idx_reflex_events_campaign_id;
DROP INDEX IF EXISTS public.idx_reflex_events_ctasource;
DROP INDEX IF EXISTS public.idx_reflex_events_cta_source;
DROP INDEX IF EXISTS public.idx_reflex_events_ctatype;
DROP INDEX IF EXISTS public.idx_reflex_events_cta_type;
DROP INDEX IF EXISTS public.idx_reflex_events_type_createdat;
DROP INDEX IF EXISTS public.idx_reflex_events_type_created_at;

-- Recreate indexes with correct camelCase column names (matching Prisma schema)
-- These use partial indexes (WHERE ... IS NOT NULL) for better performance
CREATE INDEX IF NOT EXISTS idx_reflex_events_type_createdAt 
  ON public.reflex_events(type, "createdAt");

CREATE INDEX IF NOT EXISTS idx_reflex_events_ctaSource 
  ON public.reflex_events("ctaSource")
  WHERE "ctaSource" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reflex_events_ctaType 
  ON public.reflex_events("ctaType")
  WHERE "ctaType" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reflex_events_campaignId 
  ON public.reflex_events("campaignId")
  WHERE "campaignId" IS NOT NULL;

-- ============================================================================
-- 2. Fix duplicate permissive policies on reflex_events
-- ============================================================================

-- Drop the old permissive policy (keep the newer one with better naming)
DROP POLICY IF EXISTS "Allow all operations on reflex_events" ON public.reflex_events;

-- Ensure the dev policy exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reflex_events'
      AND policyname = 'dev_allow_all_reflex_events'
  ) THEN
    CREATE POLICY "dev_allow_all_reflex_events"
      ON public.reflex_events
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- 3. Fix RLS performance: Use (select auth.uid()) pattern for better performance
-- ============================================================================
-- Note: This is a template for fixing RLS policies. Since we're using
-- service_role for Prisma, these optimizations may not be critical, but
-- they're good practice for when we add user-based auth.

-- Example fix for a typical RLS policy (commented out as we're using service_role):
/*
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
*/

-- For reflex_events, since we're using service_role, the current permissive
-- policy is fine. But if we add user-based policies later, use the pattern above.

COMMENT ON POLICY "dev_allow_all_reflex_events" ON public.reflex_events IS 
  'Development policy: permissive for service_role (Prisma). For user-based auth, use (select auth.uid()) pattern in policies.';

COMMIT;

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Verify duplicate indexes are removed:
-- SELECT 
--   indexname,
--   indexdef
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND tablename = 'reflex_events'
--   AND indexname LIKE 'idx_reflex_events%'
-- ORDER BY indexname;

-- Verify only one policy exists:
-- SELECT 
--   policyname,
--   cmd,
--   roles
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename = 'reflex_events';

