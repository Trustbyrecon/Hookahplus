-- Enable RLS for participants and participant_prefs (Supabase Security Advisor).
-- Restricts table access to service_role; anon/authenticated cannot access via PostgREST.
-- Prisma uses direct postgres connection and continues to work.

ALTER TABLE IF EXISTS public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.participant_prefs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'participants'
      AND policyname = 'service_role_manage_participants'
  ) THEN
    CREATE POLICY service_role_manage_participants
      ON public.participants
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'participant_prefs'
      AND policyname = 'service_role_manage_participant_prefs'
  ) THEN
    CREATE POLICY service_role_manage_participant_prefs
      ON public.participant_prefs
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
