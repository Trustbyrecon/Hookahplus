-- Migration: Add session_adjustments table for discounts, comps, and surcharges
-- Requires manager approval for comps and large adjustments

CREATE TABLE IF NOT EXISTS public.session_adjustments (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  adjustment_type TEXT NOT NULL, -- 'DISCOUNT', 'COMP', 'SURCHARGE', 'REFUND'
  amount_cents INTEGER NOT NULL, -- Positive for surcharge, negative for discount/comp
  reason TEXT NOT NULL,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL, -- Staff who created adjustment
  
  CONSTRAINT session_adjustments_session_id_fkey 
    FOREIGN KEY (session_id) 
    REFERENCES public."Session"(id) 
    ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS session_adjustments_session_id_idx 
  ON public.session_adjustments(session_id);
  
CREATE INDEX IF NOT EXISTS session_adjustments_adjustment_type_created_at_idx 
  ON public.session_adjustments(adjustment_type, created_at);

-- Add comment
COMMENT ON TABLE public.session_adjustments IS 'Session adjustments (discounts, comps, surcharges) with manager approval workflow';

