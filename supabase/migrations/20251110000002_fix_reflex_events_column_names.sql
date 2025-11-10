-- Fix column names in reflex_events table to match Prisma schema (camelCase)
-- Drop and recreate table with correct column names

DROP TABLE IF EXISTS public.reflex_events CASCADE;

CREATE TABLE public.reflex_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ui',
  "sessionId" TEXT,
  "paymentIntent" TEXT,
  payload TEXT,
  "payloadHash" TEXT,
  "userAgent" TEXT,
  ip TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- CTA Tracking Fields
  "ctaSource" TEXT,
  "ctaType" TEXT,
  referrer TEXT,
  "campaignId" TEXT,
  metadata TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_reflex_events_type_created_at ON public.reflex_events(type, "createdAt");
CREATE INDEX idx_reflex_events_cta_source ON public.reflex_events("ctaSource");
CREATE INDEX idx_reflex_events_cta_type ON public.reflex_events("ctaType");
CREATE INDEX idx_reflex_events_campaign_id ON public.reflex_events("campaignId");

-- Enable Row Level Security (RLS)
ALTER TABLE public.reflex_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (adjust as needed for your auth setup)
CREATE POLICY "Allow all operations on reflex_events"
ON public.reflex_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.reflex_events IS 'Tracks Reflex events including CTA clicks, onboarding signups, and other system events';

