-- Migration: Enable RLS on DriftEvent and TaxonomyUnknown tables
-- Fixes Supabase Security Advisor warnings
-- Agent: database_agent (security alignment)
-- Date: 2025-11-15

-- Begin transaction
BEGIN;

-- ============================================================================
-- DriftEvent Table: Enable RLS and add policies
-- ============================================================================

-- Enable RLS on DriftEvent table
ALTER TABLE public."DriftEvent" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'DriftEvent'
      AND policyname = 'Service role can manage drift events'
  ) THEN
    CREATE POLICY "Service role can manage drift events"
    ON public."DriftEvent"
    FOR ALL
    USING ((select auth.role()) = 'service_role')
    WITH CHECK ((select auth.role()) = 'service_role');
  END IF;
END $$;

-- Policy: Authenticated users can read drift events (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'DriftEvent'
      AND policyname = 'Authenticated users can read drift events'
  ) THEN
    CREATE POLICY "Authenticated users can read drift events"
    ON public."DriftEvent"
    FOR SELECT
    USING ((select auth.role()) = 'authenticated');
  END IF;
END $$;

-- Policy: Authenticated users can insert drift events (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'DriftEvent'
      AND policyname = 'Authenticated users can insert drift events'
  ) THEN
    CREATE POLICY "Authenticated users can insert drift events"
    ON public."DriftEvent"
    FOR INSERT
    WITH CHECK ((select auth.role()) = 'authenticated');
  END IF;
END $$;

-- ============================================================================
-- TaxonomyUnknown Table: Enable RLS and add policies
-- ============================================================================

-- Enable RLS on TaxonomyUnknown table
ALTER TABLE public."TaxonomyUnknown" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'TaxonomyUnknown'
      AND policyname = 'Service role can manage taxonomy unknowns'
  ) THEN
    CREATE POLICY "Service role can manage taxonomy unknowns"
    ON public."TaxonomyUnknown"
    FOR ALL
    USING ((select auth.role()) = 'service_role')
    WITH CHECK ((select auth.role()) = 'service_role');
  END IF;
END $$;

-- Policy: Authenticated users can read taxonomy unknowns (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'TaxonomyUnknown'
      AND policyname = 'Authenticated users can read taxonomy unknowns'
  ) THEN
    CREATE POLICY "Authenticated users can read taxonomy unknowns"
    ON public."TaxonomyUnknown"
    FOR SELECT
    USING ((select auth.role()) = 'authenticated');
  END IF;
END $$;

-- Policy: Authenticated users can insert taxonomy unknowns (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'TaxonomyUnknown'
      AND policyname = 'Authenticated users can insert taxonomy unknowns'
  ) THEN
    CREATE POLICY "Authenticated users can insert taxonomy unknowns"
    ON public."TaxonomyUnknown"
    FOR INSERT
    WITH CHECK ((select auth.role()) = 'authenticated');
  END IF;
END $$;

-- Policy: Authenticated users can update taxonomy unknowns (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'TaxonomyUnknown'
      AND policyname = 'Authenticated users can update taxonomy unknowns'
  ) THEN
    CREATE POLICY "Authenticated users can update taxonomy unknowns"
    ON public."TaxonomyUnknown"
    FOR UPDATE
    USING ((select auth.role()) = 'authenticated')
    WITH CHECK ((select auth.role()) = 'authenticated');
  END IF;
END $$;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('DriftEvent', 'TaxonomyUnknown')
ORDER BY tablename;

-- Verify policies were created
SELECT
  tablename,
  policyname,
  cmd as "Command",
  qual as "Using Expression",
  with_check as "With Check Expression"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('DriftEvent', 'TaxonomyUnknown')
ORDER BY tablename, policyname;

-- Expected output:
-- DriftEvent: 3 policies (service role, authenticated read, authenticated insert)
-- TaxonomyUnknown: 4 policies (service role, authenticated read, authenticated insert, authenticated update)

-- Commit transaction
COMMIT;
