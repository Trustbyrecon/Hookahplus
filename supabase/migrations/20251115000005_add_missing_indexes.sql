-- Migration: Add Missing Indexes for Performance
-- Addresses P0 performance issues: slow analytics and revenue queries
-- Agent: Noor (session_agent)
-- Date: 2025-11-15

BEGIN;

-- ============================================================================
-- Session Table Indexes
-- ============================================================================

-- Index for started_at queries (timer, duration calculations)
CREATE INDEX IF NOT EXISTS idx_session_started_at 
  ON public."Session"("startedAt")
  WHERE "startedAt" IS NOT NULL;

-- Index for lounge_id filtering (already exists, but ensure it's there)
CREATE INDEX IF NOT EXISTS idx_session_lounge_id 
  ON public."Session"("loungeId");

-- Index for state filtering (already exists, but ensure it's there)
CREATE INDEX IF NOT EXISTS idx_session_state 
  ON public."Session"("state");

-- ============================================================================
-- ReflexEvent/Events Table Indexes
-- ============================================================================

-- Index for session_id lookups (if events table exists)
-- Note: Adjust table name if your events table is named differently
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);
  END IF;
END $$;

-- ============================================================================
-- Payments/Revenue Table Indexes (if payments table exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);
    CREATE INDEX IF NOT EXISTS idx_payments_lounge_id ON public.payments(lounge_id);
  END IF;
END $$;

COMMIT;

-- Verification
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('Session', 'events', 'payments')
--   AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

