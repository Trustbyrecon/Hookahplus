-- Migration: Add Taxonomy v1 columns
-- Adds new TEXT columns with CHECK constraints for SessionState, TrustEventType, and DriftReason
-- Implements dual-write pattern: legacy columns remain, v1 columns added alongside
-- Agent: Noor (session_agent)
-- Date: 2025-11-15

-- ============================================================================
-- Session Table: Add session_state_v1 and paused flag
-- ============================================================================

-- Add session_state_v1 column
ALTER TABLE public."Session"
ADD COLUMN IF NOT EXISTS session_state_v1 TEXT;

-- Add CHECK constraint for session_state_v1
ALTER TABLE public."Session"
ADD CONSTRAINT IF NOT EXISTS session_state_v1_chk
CHECK (session_state_v1 IS NULL OR session_state_v1 IN (
  'queued',
  'prep',
  'handoff',
  'delivering',
  'delivered',
  'checkout',
  'closed',
  'canceled'
));

-- Add paused flag (PAUSED is a modifier, not a state)
ALTER TABLE public."Session"
ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT false;

-- Add index for session_state_v1 queries
CREATE INDEX IF NOT EXISTS idx_session_state_v1 ON public."Session"(session_state_v1);
CREATE INDEX IF NOT EXISTS idx_session_paused ON public."Session"(paused);

-- Add comment
COMMENT ON COLUMN public."Session".session_state_v1 IS 'Taxonomy v1: queued | prep | handoff | delivering | delivered | checkout | closed | canceled';
COMMENT ON COLUMN public."Session".paused IS 'PAUSED is a modifier flag, not a state. True when session is paused.';

-- ============================================================================
-- ReflexEvent Table: Add trust_event_type_v1
-- ============================================================================

-- Add trust_event_type_v1 column
ALTER TABLE public."reflex_events"
ADD COLUMN IF NOT EXISTS trust_event_type_v1 TEXT;

-- Add CHECK constraint for trust_event_type_v1
ALTER TABLE public."reflex_events"
ADD CONSTRAINT IF NOT EXISTS trust_event_type_v1_chk
CHECK (trust_event_type_v1 IS NULL OR trust_event_type_v1 IN (
  'on_time_delivery',
  'fav_used',
  'fast_checkout',
  'corrected_issue',
  'staff_greeting',
  'loyalty_redeemed'
));

-- Add index for trust_event_type_v1 queries
CREATE INDEX IF NOT EXISTS idx_reflex_event_trust_type_v1 ON public."reflex_events"(trust_event_type_v1);

-- Add comment
COMMENT ON COLUMN public."reflex_events".trust_event_type_v1 IS 'Taxonomy v1: on_time_delivery | fav_used | fast_checkout | corrected_issue | staff_greeting | loyalty_redeemed';

-- ============================================================================
-- DriftEvent Table: Create if needed, add drift_reason_v1
-- ============================================================================

-- Check if DriftEvent table exists, create if not
CREATE TABLE IF NOT EXISTS public."DriftEvent" (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  drift_reason_v1 TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT drift_reason_v1_chk CHECK (drift_reason_v1 IS NULL OR drift_reason_v1 IN (
    'slow_handoff',
    'long_dwell',
    'payment_retry',
    'missing_notes',
    'queue_backlog',
    'no_show'
  ))
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_drift_event_reason_v1 ON public."DriftEvent"(drift_reason_v1);
CREATE INDEX IF NOT EXISTS idx_drift_event_session ON public."DriftEvent"(session_id);
CREATE INDEX IF NOT EXISTS idx_drift_event_created ON public."DriftEvent"(created_at);

-- Add comment
COMMENT ON COLUMN public."DriftEvent".drift_reason_v1 IS 'Taxonomy v1: slow_handoff | long_dwell | payment_retry | missing_notes | queue_backlog | no_show';

-- ============================================================================
-- Unknown Events Tracking Table
-- ============================================================================

-- Create table to track unknown enum values for taxonomy review
CREATE TABLE IF NOT EXISTS public."TaxonomyUnknown" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  enum_type TEXT NOT NULL CHECK (enum_type IN ('SessionState', 'TrustEventType', 'DriftReason')),
  raw_label TEXT NOT NULL,
  suggested_mapping TEXT,
  count INTEGER DEFAULT 1,
  example_event_id TEXT,
  example_payload JSONB,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enum_type, raw_label)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_taxonomy_unknown_type ON public."TaxonomyUnknown"(enum_type);
CREATE INDEX IF NOT EXISTS idx_taxonomy_unknown_count ON public."TaxonomyUnknown"(count DESC);
CREATE INDEX IF NOT EXISTS idx_taxonomy_unknown_last_seen ON public."TaxonomyUnknown"(last_seen DESC);

-- Add comment
COMMENT ON TABLE public."TaxonomyUnknown" IS 'Tracks unknown enum values for taxonomy review and promotion';

-- ============================================================================
-- Verify columns exist
-- ============================================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'Session'
  AND column_name IN ('session_state_v1', 'paused');

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reflex_events'
  AND column_name = 'trust_event_type_v1';

