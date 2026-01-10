-- Migration: Add state machine fields to SetupSession
-- Run: npx prisma migrate dev --name add_setup_session_state_machine

-- Add new columns
ALTER TABLE setup_sessions
  ADD COLUMN IF NOT EXISTS setup_link TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'activated', 'expired', 'abandoned')),
  ADD COLUMN IF NOT EXISTS lead_id TEXT,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_setup_session_status ON setup_sessions(status);
CREATE INDEX IF NOT EXISTS idx_setup_session_last_activity ON setup_sessions(last_activity_at);

-- Update existing sessions to have status based on their state
UPDATE setup_sessions
SET status = CASE
  WHEN lounge_id IS NOT NULL THEN 'activated'
  WHEN progress->>'currentStep' = '6' THEN 'completed'
  WHEN progress->>'currentStep' > '1' THEN 'in_progress'
  ELSE 'draft'
END
WHERE status IS NULL;

-- Set last_activity_at to updated_at for existing sessions
UPDATE setup_sessions
SET last_activity_at = updated_at
WHERE last_activity_at IS NULL;
