-- Migration: Improve reflex_events table structure and indexes
-- Fixes column name inconsistencies, adds missing indexes, improves RLS
-- Based on schema analysis and performance recommendations
-- Agent: Noor (session_agent)
-- Date: 2025-11-15

BEGIN;

-- ============================================================================
-- 1. Fix existing indexes with incorrect column names (snake_case → camelCase)
-- ============================================================================

-- Drop old indexes with incorrect column names
DROP INDEX IF EXISTS public.idx_reflex_events_type_created_at;
DROP INDEX IF EXISTS public.idx_reflex_events_cta_source;
DROP INDEX IF EXISTS public.idx_reflex_events_cta_type;
DROP INDEX IF EXISTS public.idx_reflex_events_campaign_id;

-- Recreate indexes with correct camelCase column names
CREATE INDEX IF NOT EXISTS idx_reflex_events_type_createdAt 
  ON public.reflex_events(type, "createdAt");

CREATE INDEX IF NOT EXISTS idx_reflex_events_ctaSource 
  ON public.reflex_events("ctaSource");

CREATE INDEX IF NOT EXISTS idx_reflex_events_ctaType 
  ON public.reflex_events("ctaType");

CREATE INDEX IF NOT EXISTS idx_reflex_events_campaignId 
  ON public.reflex_events("campaignId");

-- ============================================================================
-- 2. Add missing indexes for common query patterns
-- ============================================================================

-- Index for payloadHash lookups (deduplication)
CREATE INDEX IF NOT EXISTS idx_reflex_events_payloadHash 
  ON public.reflex_events("payloadHash")
  WHERE "payloadHash" IS NOT NULL;

-- Index for sessionId lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_reflex_events_sessionId 
  ON public.reflex_events("sessionId")
  WHERE "sessionId" IS NOT NULL;

-- ============================================================================
-- 3. Add CHECK constraint for source field (optional but recommended)
-- ============================================================================

-- Add CHECK constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'reflex_events'
      AND c.conname = 'reflex_events_source_check'
  ) THEN
    ALTER TABLE public.reflex_events
      ADD CONSTRAINT reflex_events_source_check
      CHECK (source IN ('ui', 'server', 'cron', 'webhook', 'backend', 'agent'));
  END IF;
END $$;

-- ============================================================================
-- 4. Add table and column comments for maintainability
-- ============================================================================

COMMENT ON TABLE public.reflex_events IS 
  'Tracks Reflex events including CTA clicks, onboarding signups, and other system events. Uses camelCase column names to match Prisma schema.';

COMMENT ON COLUMN public.reflex_events.payload IS 
  'Raw event payload stored as JSON string (TEXT) for Prisma compatibility. Consider migrating to jsonb in future for better querying.';

COMMENT ON COLUMN public.reflex_events.metadata IS 
  'Additional JSON metadata for source-specific data. Stored as TEXT for Prisma compatibility.';

COMMENT ON COLUMN public.reflex_events."payloadHash" IS 
  'SHA256 hash of payload for deduplication. Used to prevent duplicate event processing.';

COMMENT ON COLUMN public.reflex_events.source IS 
  'Event source: ui | server | cron | webhook | backend | agent';

-- ============================================================================
-- 5. Update RLS policy with better documentation
-- ============================================================================

-- Drop old permissive policy
DROP POLICY IF EXISTS "Allow all operations on reflex_events" ON public.reflex_events;

-- Create new policy with explicit dev-only naming
CREATE POLICY IF NOT EXISTS "dev_allow_all_reflex_events"
  ON public.reflex_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "dev_allow_all_reflex_events" ON public.reflex_events IS 
  'Development policy: permissive so Prisma can write during dev. DO NOT use this in production. Replace with auth-based policies.';

-- ============================================================================
-- 6. Example secure RLS policies (commented out for production use)
-- ============================================================================

/*
-- Production-ready RLS policies (uncomment and adapt when ready):

-- Allow authenticated users to insert events attributed to themselves
CREATE POLICY "auth_insert_reflex_events" ON public.reflex_events
  FOR INSERT TO authenticated
  WITH CHECK (
    COALESCE(created_by, '') = auth.uid()::text
    OR auth.uid() IS NULL  -- Allow service role
  );

-- Allow users to select their own events
CREATE POLICY "auth_select_reflex_events" ON public.reflex_events
  FOR SELECT TO authenticated
  USING (
    COALESCE(created_by, '') = auth.uid()::text
    OR auth.uid() IS NULL  -- Allow service role
  );

-- Note: service_role bypasses RLS automatically, so Prisma will work
*/

COMMIT;

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Verify indexes exist with correct column names:
-- SELECT 
--   indexname,
--   indexdef
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND tablename = 'reflex_events'
--   AND indexname LIKE 'idx_reflex_events%'
-- ORDER BY indexname;

-- Verify CHECK constraint exists:
-- SELECT 
--   conname,
--   pg_get_constraintdef(oid) as definition
-- FROM pg_constraint
-- WHERE conrelid = 'public.reflex_events'::regclass
--   AND conname = 'reflex_events_source_check';

