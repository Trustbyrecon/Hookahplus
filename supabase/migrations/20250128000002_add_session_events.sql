-- Migration: Add session_events table for append-only session lifecycle ledger
-- Provides complete audit trail and replay capability

CREATE TABLE IF NOT EXISTS public.session_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  actor_id TEXT,
  actor_role TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT session_events_session_id_fkey 
    FOREIGN KEY (session_id) 
    REFERENCES public."Session"(id) 
    ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS session_events_session_id_timestamp_idx 
  ON public.session_events(session_id, timestamp);
  
CREATE INDEX IF NOT EXISTS session_events_event_type_timestamp_idx 
  ON public.session_events(event_type, timestamp);

-- Add comment
COMMENT ON TABLE public.session_events IS 'Append-only ledger of session lifecycle events for audit trail and state replay';

