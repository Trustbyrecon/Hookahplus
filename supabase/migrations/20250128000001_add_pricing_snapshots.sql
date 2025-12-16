-- Migration: Add pricing_snapshots table for immutable pricing records
-- Ensures every session has a complete pricing breakdown tied to config version

CREATE TABLE IF NOT EXISTS public.pricing_snapshots (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  config_version INTEGER NOT NULL,
  base_price_cents INTEGER NOT NULL,
  add_ons_price_cents INTEGER NOT NULL DEFAULT 0,
  adjustments_cents INTEGER NOT NULL DEFAULT 0,
  final_price_cents INTEGER NOT NULL,
  breakdown JSONB NOT NULL,
  mix_items JSONB,
  premium_detected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT pricing_snapshots_session_id_fkey 
    FOREIGN KEY (session_id) 
    REFERENCES public."Session"(id) 
    ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS pricing_snapshots_session_id_idx 
  ON public.pricing_snapshots(session_id);
  
CREATE INDEX IF NOT EXISTS pricing_snapshots_config_version_idx 
  ON public.pricing_snapshots(config_version);

-- Add comment
COMMENT ON TABLE public.pricing_snapshots IS 'Immutable pricing snapshots tied to config versions for dispute resolution and receipts';

