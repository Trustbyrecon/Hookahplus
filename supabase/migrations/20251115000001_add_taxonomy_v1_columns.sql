-- Migration: Add Taxonomy v1 columns
-- Adds new TEXT columns with CHECK constraints for SessionState, TrustEventType, and DriftReason
-- Implements dual-write pattern: legacy columns remain, v1 columns added alongside
-- Agent: Noor (session_agent)
-- Date: 2025-11-15

-- Begin transaction
BEGIN;

-- ============================================================================
-- 1. Session Table: Add session_state_v1 and paused flag
-- ============================================================================

ALTER TABLE public."Session"
  ADD COLUMN IF NOT EXISTS session_state_v1 TEXT,
  ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT false;

-- Add CHECK constraint (idempotent using DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'Session'
      AND c.conname = 'session_state_v1_chk'
  ) THEN
    ALTER TABLE public."Session"
      ADD CONSTRAINT session_state_v1_chk
      CHECK (
        session_state_v1 IS NULL OR
        session_state_v1 = ANY(ARRAY[
          'queued','prep','handoff','delivering','delivered','checkout','closed','canceled'
        ]::text[])
      );
  END IF;
END $$;

-- Indexes: use partial index for non-null values (reduces index size)
CREATE INDEX IF NOT EXISTS idx_session_state_v1_notnull
  ON public."Session"(session_state_v1)
  WHERE session_state_v1 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_session_paused
  ON public."Session"(paused);

COMMENT ON COLUMN public."Session".session_state_v1 IS 'Taxonomy v1: queued | prep | handoff | delivering | delivered | checkout | closed | canceled';
COMMENT ON COLUMN public."Session".paused IS 'PAUSED is a modifier flag, not a state. True when session is paused.';

-- ============================================================================
-- 2. ReflexEvent Table: Add trust_event_type_v1
-- ============================================================================

ALTER TABLE public."reflex_events"
  ADD COLUMN IF NOT EXISTS trust_event_type_v1 TEXT;

-- Add CHECK constraint (idempotent using DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'reflex_events'
      AND c.conname = 'trust_event_type_v1_chk'
  ) THEN
    ALTER TABLE public."reflex_events"
      ADD CONSTRAINT trust_event_type_v1_chk
      CHECK (
        trust_event_type_v1 IS NULL OR
        trust_event_type_v1 = ANY(ARRAY[
          'on_time_delivery','fav_used','fast_checkout','corrected_issue','staff_greeting','loyalty_redeemed'
        ]::text[])
      );
  END IF;
END $$;

-- Index: partial index for non-null values
CREATE INDEX IF NOT EXISTS idx_reflex_event_trust_type_v1_notnull
  ON public."reflex_events"(trust_event_type_v1)
  WHERE trust_event_type_v1 IS NOT NULL;

COMMENT ON COLUMN public."reflex_events".trust_event_type_v1 IS 'Taxonomy v1: on_time_delivery | fav_used | fast_checkout | corrected_issue | staff_greeting | loyalty_redeemed';

-- ============================================================================
-- 3. DriftEvent Table: Create if needed, add drift_reason_v1
-- ============================================================================

-- Create table if not exists (idempotent)
CREATE TABLE IF NOT EXISTS public."DriftEvent" (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  drift_reason_v1 TEXT,
  severity TEXT CHECK (severity IS NULL OR severity = ANY(ARRAY['low','medium','high']::text[])),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add CHECK constraint for drift_reason_v1 (idempotent using DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'DriftEvent'
      AND c.conname = 'drift_reason_v1_chk'
  ) THEN
    ALTER TABLE public."DriftEvent"
      ADD CONSTRAINT drift_reason_v1_chk
      CHECK (
        drift_reason_v1 IS NULL OR
        drift_reason_v1 = ANY(ARRAY[
          'slow_handoff','long_dwell','payment_retry','missing_notes','queue_backlog','no_show'
        ]::text[])
      );
  END IF;
END $$;

-- Indexes: partial indexes for non-null values, plus common lookups
CREATE INDEX IF NOT EXISTS idx_drift_event_reason_v1_notnull
  ON public."DriftEvent"(drift_reason_v1)
  WHERE drift_reason_v1 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_drift_event_session
  ON public."DriftEvent"(session_id);

CREATE INDEX IF NOT EXISTS idx_drift_event_created
  ON public."DriftEvent"(created_at);

COMMENT ON COLUMN public."DriftEvent".drift_reason_v1 IS 'Taxonomy v1: slow_handoff | long_dwell | payment_retry | missing_notes | queue_backlog | no_show';

-- ============================================================================
-- 4. TaxonomyUnknown Table: Create if needed
-- ============================================================================

-- Ensure pgcrypto extension is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table if not exists (idempotent)
CREATE TABLE IF NOT EXISTS public."TaxonomyUnknown" (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  enum_type TEXT NOT NULL CHECK (enum_type = ANY(ARRAY['SessionState','TrustEventType','DriftReason']::text[])),
  raw_label TEXT NOT NULL,
  suggested_mapping TEXT,
  count INTEGER DEFAULT 1 NOT NULL,
  example_event_id TEXT,
  example_payload JSONB,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enum_type, raw_label)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_taxonomy_unknown_type
  ON public."TaxonomyUnknown"(enum_type);

CREATE INDEX IF NOT EXISTS idx_taxonomy_unknown_count
  ON public."TaxonomyUnknown"(count);

CREATE INDEX IF NOT EXISTS idx_taxonomy_unknown_last_seen
  ON public."TaxonomyUnknown"(last_seen);

COMMENT ON TABLE public."TaxonomyUnknown" IS 'Tracks unknown enum values for taxonomy review and promotion';

-- ============================================================================
-- 5. Optional: UPSERT helper function for TaxonomyUnknown
-- ============================================================================

-- Helper function to upsert unknown taxonomy values
-- SECURITY: Set search_path to prevent search_path injection attacks
CREATE OR REPLACE FUNCTION public.taxonomy_unknown_upsert(
  p_enum_type TEXT,
  p_raw_label TEXT,
  p_example_event_id TEXT DEFAULT NULL,
  p_example_payload JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public."TaxonomyUnknown" (enum_type, raw_label, example_event_id, example_payload)
  VALUES (p_enum_type, p_raw_label, p_example_event_id, p_example_payload)
  ON CONFLICT (enum_type, raw_label) DO UPDATE
  SET
    count = public."TaxonomyUnknown".count + 1,
    last_seen = NOW(),
    updated_at = NOW(),
    example_event_id = COALESCE(public."TaxonomyUnknown".example_event_id, EXCLUDED.example_event_id),
    example_payload = COALESCE(public."TaxonomyUnknown".example_payload, EXCLUDED.example_payload);
END;
$$;

-- ============================================================================
-- 6. Verification Queries
-- ============================================================================

-- Verify columns exist
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'Session' AND column_name IN ('session_state_v1','paused'))
    OR (table_name = 'reflex_events' AND column_name = 'trust_event_type_v1')
    OR (table_name = 'DriftEvent' AND column_name = 'drift_reason_v1')
  )
ORDER BY table_name, column_name;

-- Verify constraints exist
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.constraint_name IN (
    'session_state_v1_chk',
    'trust_event_type_v1_chk',
    'drift_reason_v1_chk'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- Verify TaxonomyUnknown table exists
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'TaxonomyUnknown'
ORDER BY ordinal_position;

-- Commit transaction
COMMIT;
