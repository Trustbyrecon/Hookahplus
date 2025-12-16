-- Migration: Add reconciliation_runs table for nightly reconciliation tracking
-- Tracks reconciliation results and findings for data integrity monitoring

CREATE TABLE IF NOT EXISTS public.reconciliation_runs (
  id TEXT PRIMARY KEY,
  lounge_id TEXT NOT NULL,
  run_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  reconciliation_rate DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
  pricing_parity DECIMAL(5,4) NOT NULL,
  matched INTEGER NOT NULL DEFAULT 0,
  orphaned_stripe_charges INTEGER NOT NULL DEFAULT 0,
  orphaned_pos_tickets INTEGER NOT NULL DEFAULT 0,
  findings JSONB, -- Array of findings
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS reconciliation_runs_lounge_id_run_at_idx 
  ON public.reconciliation_runs(lounge_id, run_at DESC);
  
CREATE INDEX IF NOT EXISTS reconciliation_runs_status_idx 
  ON public.reconciliation_runs(status);

-- Add comment
COMMENT ON TABLE public.reconciliation_runs IS 'Nightly reconciliation job runs with findings and integrity metrics';

