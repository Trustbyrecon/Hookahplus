-- ============================================================================
-- Combined Migration: Apply All Analytics Indexes
-- 
-- This script combines:
-- 1. Analytics indexes for Session and reflex_events tables
-- 2. Reflex events table improvements (fix column names, add missing indexes)
--
-- Run this in Supabase SQL Editor for easy one-step application.
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: Analytics Indexes for Session Table
-- ============================================================================

-- Index for: WHERE createdAt >= ? AND paymentStatus = 'succeeded'
CREATE INDEX IF NOT EXISTS idx_session_created_at_payment_status
  ON public."Session"("createdAt", "paymentStatus")
  WHERE "paymentStatus" = 'succeeded';

-- Index for: WHERE createdAt >= ? AND state = ?
CREATE INDEX IF NOT EXISTS idx_session_created_at_state
  ON public."Session"("createdAt", "state");

-- Index for: WHERE createdAt >= ? AND source = ?
CREATE INDEX IF NOT EXISTS idx_session_created_at_source
  ON public."Session"("createdAt", "source");

-- Index for: WHERE createdAt >= ? AND loungeId = ? AND paymentStatus = 'succeeded'
CREATE INDEX IF NOT EXISTS idx_session_created_at_lounge_payment
  ON public."Session"("createdAt", "loungeId", "paymentStatus")
  WHERE "paymentStatus" = 'succeeded';

-- Index for: WHERE createdAt >= ? AND state = 'CLOSED' AND durationSecs IS NOT NULL
CREATE INDEX IF NOT EXISTS idx_session_created_at_state_duration
  ON public."Session"("createdAt", "state", "durationSecs")
  WHERE "state" = 'CLOSED' AND "durationSecs" IS NOT NULL;

-- ============================================================================
-- PART 2: Analytics Indexes for reflex_events Table
-- ============================================================================

-- Index for: WHERE createdAt >= ? AND type = ?
CREATE INDEX IF NOT EXISTS idx_reflex_event_created_at_type
  ON public.reflex_events("createdAt", "type");

-- Index for: WHERE createdAt >= ? AND type IN ('session.refill_requested', 'session.refill_completed')
CREATE INDEX IF NOT EXISTS idx_reflex_event_created_at_refill_types
  ON public.reflex_events("createdAt", "type")
  WHERE "type" IN ('session.refill_requested', 'session.refill_completed');

-- ============================================================================
-- PART 3: Fix reflex_events Table Indexes (Column Name Corrections)
-- ============================================================================

-- Drop old indexes with incorrect column names (snake_case)
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
-- PART 4: Add Missing Indexes for reflex_events
-- ============================================================================

-- Index for payloadHash lookups (deduplication)
CREATE INDEX IF NOT EXISTS idx_reflex_events_payloadHash 
  ON public.reflex_events("payloadHash")
  WHERE "payloadHash" IS NOT NULL;

-- Index for sessionId lookups
CREATE INDEX IF NOT EXISTS idx_reflex_events_sessionId 
  ON public.reflex_events("sessionId")
  WHERE "sessionId" IS NOT NULL;

-- ============================================================================
-- PART 5: Add CHECK Constraint for source field
-- ============================================================================

-- First, fix any existing invalid source values
-- Update any source values that don't match allowed values to 'ui' (default)
UPDATE public.reflex_events
SET source = 'ui'
WHERE source IS NULL 
   OR source NOT IN ('ui', 'server', 'cron', 'webhook', 'backend', 'agent');

-- Now add the CHECK constraint (idempotent)
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
-- PART 6: Update RLS Policy (if needed)
-- ============================================================================

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Allow all operations on reflex_events" ON public.reflex_events;

-- Create new policy with explicit dev-only naming (idempotent using DO block)
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

COMMIT;

-- ============================================================================
-- VERIFICATION (Run these separately to verify)
-- ============================================================================

-- Check Session table indexes
-- SELECT 
--   indexname,
--   indexdef
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND tablename = 'Session'
--   AND indexname LIKE 'idx_session_created_at%'
-- ORDER BY indexname;

-- Check reflex_events table indexes
-- SELECT 
--   indexname,
--   indexdef
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND tablename = 'reflex_events'
--   AND indexname LIKE 'idx_reflex_events%'
-- ORDER BY indexname;

-- Expected counts:
-- Session indexes: 5
-- reflex_events indexes: 8 (6 base + 2 analytics)

