-- Create reflex_events table for CTA tracking and operator onboarding
CREATE TABLE IF NOT EXISTS public.reflex_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ui',
  session_id TEXT,
  payment_intent TEXT,
  payload TEXT,
  payload_hash TEXT,
  user_agent TEXT,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- CTA Tracking Fields
  cta_source TEXT,
  cta_type TEXT,
  referrer TEXT,
  campaign_id TEXT,
  metadata TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reflex_events_type_created_at ON public.reflex_events(type, created_at);
CREATE INDEX IF NOT EXISTS idx_reflex_events_cta_source ON public.reflex_events(cta_source);
CREATE INDEX IF NOT EXISTS idx_reflex_events_cta_type ON public.reflex_events(cta_type);
CREATE INDEX IF NOT EXISTS idx_reflex_events_campaign_id ON public.reflex_events(campaign_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reflex_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (adjust as needed for your auth setup)
-- For now, we'll allow all operations since Prisma needs to write
CREATE POLICY "Allow all operations on reflex_events"
ON public.reflex_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.reflex_events IS 'Tracks Reflex events including CTA clicks, onboarding signups, and other system events';

