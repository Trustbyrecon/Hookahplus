-- Enable RLS for Supabase Security Advisor findings.
-- Keeps table access restricted to service_role by policy.

ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.square_recon_cursors ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'service_role_manage_organizations'
  ) THEN
    CREATE POLICY service_role_manage_organizations
      ON public.organizations
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
      AND tablename = 'square_recon_cursors'
      AND policyname = 'service_role_manage_square_recon_cursors'
  ) THEN
    CREATE POLICY service_role_manage_square_recon_cursors
      ON public.square_recon_cursors
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
