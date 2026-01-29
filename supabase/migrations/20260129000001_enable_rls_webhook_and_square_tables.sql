-- Enable RLS on webhook + Square ingest tables flagged by Supabase linter.
-- Strategy:
-- - Turn on RLS (blocks PostgREST access unless a policy allows it)
-- - Revoke anon/authenticated table grants (defense in depth)
-- - Add minimal service_role-only policies (so server-side/service key can operate)
--
-- Date: 2026-01-29

BEGIN;

-- ============================================================================
-- 1) Enable RLS on flagged public tables (idempotent)
-- ============================================================================
DO $$
DECLARE
  tbl_name text;
  tables_to_enable text[] := ARRAY[
    'webhook_events',
    'square_orders',
    'square_events_raw',
    'square_payments',
    'square_customers'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY tables_to_enable
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
        AND t.table_name = tbl_name
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
      RAISE NOTICE 'Enabled RLS on public.%', tbl_name;
    ELSE
      RAISE NOTICE 'Table public.% does not exist (skipping)', tbl_name;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 2) Defense-in-depth: revoke PostgREST roles from these tables
-- ============================================================================
DO $$
DECLARE
  tbl_name text;
  sensitive_tables text[] := ARRAY[
    'webhook_events',
    'square_orders',
    'square_events_raw',
    'square_payments',
    'square_customers'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY sensitive_tables
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
        AND t.table_name = tbl_name
    ) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl_name);
      RAISE NOTICE 'Revoked anon/authenticated on public.%', tbl_name;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 3) Minimal policies: only service_role may access
-- ============================================================================
DO $$
DECLARE
  tbl_name text;
  policy_name text;
  tables_to_lock text[] := ARRAY[
    'webhook_events',
    'square_orders',
    'square_events_raw',
    'square_payments',
    'square_customers'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY tables_to_lock
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
        AND t.table_name = tbl_name
    ) THEN
      policy_name := format('service_role_manage_%s', tbl_name);

      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = tbl_name
          AND p.policyname = policy_name
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR ALL USING ((select auth.role()) = ''service_role'') WITH CHECK ((select auth.role()) = ''service_role'')',
          policy_name,
          tbl_name
        );
        RAISE NOTICE 'Created policy % on public.%', policy_name, tbl_name;
      ELSE
        RAISE NOTICE 'Policy % already exists on public.% (skipping)', policy_name, tbl_name;
      END IF;
    ELSE
      RAISE NOTICE 'Table public.% does not exist (skipping)', tbl_name;
    END IF;
  END LOOP;
END $$;

COMMIT;

