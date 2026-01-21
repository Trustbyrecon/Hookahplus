-- Add minimal RLS policies to clear "RLS enabled, no policy" linter INFOs.
-- Strategy: keep these tables locked down; only service_role may access.
--
-- Date: 2026-01-21

BEGIN;

DO $$
DECLARE
  tbl_name text;
  policy_name text;
  tables_to_lock text[] := ARRAY[
    '_prisma_migrations',
    'categories',
    'items',
    'loyalty_accounts',
    'loyalty_wallets',
    'loyalty_transactions',
    'loyalty_redemptions',
    'loyalty_tiers',
    'loyalty_rewards',
    'org_settings',
    'pos_tickets',
    'settlement_reconciliation',
    'setup_sessions',
    'square_merchants'
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

