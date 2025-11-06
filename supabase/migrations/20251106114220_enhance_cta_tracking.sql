-- Enhance CTA Tracking for ReflexEvent table
-- Adds fields to support tracking CTAs from multiple sources (website, social media, email)

-- Add new columns to reflex_events table
ALTER TABLE reflex_events 
ADD COLUMN IF NOT EXISTS cta_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS cta_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS metadata TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reflex_events_cta_source ON reflex_events(cta_source);
CREATE INDEX IF NOT EXISTS idx_reflex_events_cta_type ON reflex_events(cta_type);
CREATE INDEX IF NOT EXISTS idx_reflex_events_campaign_id ON reflex_events(campaign_id);

-- Add composite index for common CTA queries
CREATE INDEX IF NOT EXISTS idx_reflex_events_cta_source_type ON reflex_events(cta_source, cta_type, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN reflex_events.cta_source IS 'CTA source: website, instagram, linkedin, email, calendly';
COMMENT ON COLUMN reflex_events.cta_type IS 'CTA type: demo_request, onboarding_signup, contact_form, social_click';
COMMENT ON COLUMN reflex_events.referrer IS 'HTTP referrer or social media referrer URL';
COMMENT ON COLUMN reflex_events.campaign_id IS 'Marketing campaign identifier for attribution';
COMMENT ON COLUMN reflex_events.metadata IS 'Additional JSON metadata for source-specific data';

