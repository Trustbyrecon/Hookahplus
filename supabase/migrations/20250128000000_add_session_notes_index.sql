-- Migration: Add index on session_notes(note_type) for staff-only filtering
-- This index improves performance when filtering staff-only notes

-- Check if index already exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'session_notes' 
    AND indexname = 'session_notes_note_type_idx'
  ) THEN
    CREATE INDEX session_notes_note_type_idx ON public.session_notes(note_type);
    RAISE NOTICE 'Created index: session_notes_note_type_idx';
  ELSE
    RAISE NOTICE 'Index session_notes_note_type_idx already exists, skipping';
  END IF;
END $$;

