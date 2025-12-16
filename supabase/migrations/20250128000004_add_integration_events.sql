-- Migration: Add integration_events table for webhook idempotency and retry logic
-- Provides idempotency, retry, and DLQ for POS webhook processing

CREATE TABLE IF NOT EXISTS public.integration_events (
  id TEXT PRIMARY KEY,
  integration_type TEXT NOT NULL, -- 'square', 'toast', 'clover'
  external_event_id TEXT NOT NULL, -- Event ID from POS system
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed', 'dlq'
  retry_count INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT integration_events_integration_type_external_event_id_unique 
    UNIQUE (integration_type, external_event_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS integration_events_status_created_at_idx 
  ON public.integration_events(status, created_at);
  
CREATE INDEX IF NOT EXISTS integration_events_integration_type_status_idx 
  ON public.integration_events(integration_type, status);

-- Add comment
COMMENT ON TABLE public.integration_events IS 'Webhook events from POS integrations with idempotency, retry, and DLQ support';

