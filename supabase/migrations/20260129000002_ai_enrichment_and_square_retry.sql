-- AI enrichment + alerts + Square raw retry semantics
-- Date: 2026-01-29
--
-- Goals:
-- - Add durable enrichment + alert tables for Hookah+ "AI Enrich" pipeline step
-- - Add claim/retry fields to square_events_raw so cron processing can be:
--   - overlap-safe (SKIP LOCKED style claiming)
--   - retryable (do not permanently mark failed events as processed)

BEGIN;

-- ============================================================================
-- 1) Extend Square raw inbox with claim/retry fields (idempotent)
-- ============================================================================
ALTER TABLE IF EXISTS public.square_events_raw
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS attempt_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ NULL;

-- Ensure legacy rows align with new semantics:
-- If processed_at is null, treat as new (eligible).
UPDATE public.square_events_raw
SET status = 'new'
WHERE processed_at IS NULL
  AND status IS DISTINCT FROM 'new';

CREATE INDEX IF NOT EXISTS idx_square_events_raw_status ON public.square_events_raw(status);
CREATE INDEX IF NOT EXISTS idx_square_events_raw_next_retry_at ON public.square_events_raw(next_retry_at);

-- ============================================================================
-- 2) AI enrichment results (structured JSON)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_enrichment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'square',
  kind TEXT NOT NULL, -- pricing_anomaly | session_note_suggestions | ...
  raw_event_id UUID NULL REFERENCES public.square_events_raw(id) ON DELETE SET NULL,
  lounge_id TEXT NULL,
  session_id TEXT NULL,
  model TEXT NOT NULL,
  output JSONB NOT NULL,
  latency_ms INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ai_enrichment_raw_kind_uq
ON public.ai_enrichment(raw_event_id, kind)
WHERE raw_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ai_enrichment_lounge_kind_created_idx
ON public.ai_enrichment(lounge_id, kind, created_at DESC);

-- ============================================================================
-- 3) Operator alerts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'square',
  type TEXT NOT NULL,     -- pricing_anomaly | refund_spike | ...
  severity TEXT NOT NULL, -- low | med | high
  message TEXT NOT NULL,
  raw_event_id UUID NULL REFERENCES public.square_events_raw(id) ON DELETE SET NULL,
  lounge_id TEXT NULL,
  session_id TEXT NULL,
  meta JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS alerts_created_at_idx
ON public.alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS alerts_lounge_created_at_idx
ON public.alerts(lounge_id, created_at DESC);

-- ============================================================================
-- 4) RLS hardening (optional but consistent with existing posture)
-- ============================================================================
DO $$
DECLARE
  tbl_name text;
  tables_to_enable text[] := ARRAY[
    'ai_enrichment',
    'alerts'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY tables_to_enable
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
        AND t.table_name = tbl_name
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl_name);

      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = tbl_name
          AND p.policyname = format('service_role_manage_%s', tbl_name)
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR ALL USING ((select auth.role()) = ''service_role'') WITH CHECK ((select auth.role()) = ''service_role'')',
          format('service_role_manage_%s', tbl_name),
          tbl_name
        );
      END IF;
    END IF;
  END LOOP;
END $$;

COMMIT;

