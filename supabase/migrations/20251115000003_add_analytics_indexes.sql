-- Migration: Add Composite Indexes for Analytics Queries
-- Optimizes common query patterns used by analytics endpoints
-- Agent: Noor (session_agent)
-- Date: 2025-11-15

BEGIN;

-- ============================================================================
-- Composite Indexes for Analytics Queries
-- ============================================================================

-- Index for: WHERE createdAt >= ? AND paymentStatus = 'succeeded'
-- Used by: /api/analytics/conversion, /api/revenue
CREATE INDEX IF NOT EXISTS idx_session_created_at_payment_status
  ON public."Session"("createdAt", "paymentStatus")
  WHERE "paymentStatus" = 'succeeded';

-- Index for: WHERE createdAt >= ? AND state = ?
-- Used by: /api/analytics/sessions (groupBy state, count by state)
CREATE INDEX IF NOT EXISTS idx_session_created_at_state
  ON public."Session"("createdAt", "state");

-- Index for: WHERE createdAt >= ? AND source = ?
-- Used by: /api/analytics/conversion (QR scans), groupBy source
CREATE INDEX IF NOT EXISTS idx_session_created_at_source
  ON public."Session"("createdAt", "source");

-- Index for: WHERE createdAt >= ? AND loungeId = ? AND paymentStatus = 'succeeded'
-- Used by: /api/revenue (with loungeId filter)
CREATE INDEX IF NOT EXISTS idx_session_created_at_lounge_payment
  ON public."Session"("createdAt", "loungeId", "paymentStatus")
  WHERE "paymentStatus" = 'succeeded';

-- Index for: WHERE createdAt >= ? AND state = 'CLOSED' AND durationSecs IS NOT NULL
-- Used by: /api/analytics/sessions (avg duration calculation)
CREATE INDEX IF NOT EXISTS idx_session_created_at_state_duration
  ON public."Session"("createdAt", "state", "durationSecs")
  WHERE "state" = 'CLOSED' AND "durationSecs" IS NOT NULL;

-- Index for reflex_events analytics queries
-- WHERE createdAt >= ? AND type = ?
-- Note: Table name is reflex_events (lowercase, not ReflexEvent)
CREATE INDEX IF NOT EXISTS idx_reflex_event_created_at_type
  ON public.reflex_events("createdAt", "type");

-- Index for: WHERE createdAt >= ? AND type IN ('session.refill_requested', 'session.refill_completed')
CREATE INDEX IF NOT EXISTS idx_reflex_event_created_at_refill_types
  ON public.reflex_events("createdAt", "type")
  WHERE "type" IN ('session.refill_requested', 'session.refill_completed');

COMMIT;

-- Verification queries
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND (indexname LIKE '%analytics%' OR indexname LIKE '%created_at%')
--   AND tablename IN ('Session', 'reflex_events');

