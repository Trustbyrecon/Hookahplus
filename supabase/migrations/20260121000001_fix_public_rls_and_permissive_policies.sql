-- Fix Supabase security linter findings:
-- 1) Enable RLS on public tables exposed to PostgREST
-- 2) Revoke anon/authenticated privileges on sensitive tables (defense in depth)
-- 3) Fix overly-permissive UPDATE policies that use WITH CHECK (true)
--
-- Date: 2026-01-21

BEGIN;

-- ============================================================================
-- 1) Enable RLS on flagged public tables (idempotent)
-- ============================================================================
DO $$
DECLARE
  tbl_name text;
  tables_to_enable text[] := ARRAY[
    'setup_sessions',
    '_prisma_migrations',
    'square_merchants',
    'loyalty_accounts',
    'loyalty_wallets',
    'loyalty_transactions',
    'loyalty_redemptions',
    'loyalty_tiers',
    'loyalty_rewards',
    'org_settings',
    'settlement_reconciliation',
    'pos_tickets',
    'categories',
    'items'
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
-- 2) Defense-in-depth: revoke PostgREST roles from sensitive tables
--    (RLS should already block access, this removes table-level grants too.)
-- ============================================================================
DO $$
DECLARE
  tbl_name text;
  sensitive_tables text[] := ARRAY[
    'setup_sessions',
    '_prisma_migrations',
    'square_merchants',
    'org_settings',
    'settlement_reconciliation',
    'pos_tickets',
    'loyalty_accounts',
    'loyalty_wallets',
    'loyalty_transactions',
    'loyalty_redemptions',
    'loyalty_tiers',
    'loyalty_rewards'
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
-- 3) Fix permissive UPDATE policies (WITH CHECK (true)) flagged by linter
--    We align WITH CHECK to the same tenant/role guard as USING.
-- ============================================================================

-- 3.1 public."Session" :: tenant_update_sessions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Session' AND policyname = 'tenant_update_sessions'
  ) THEN
    EXECUTE $q$
      ALTER POLICY "tenant_update_sessions"
      ON public."Session"
      USING (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = (((SELECT auth.jwt()) ->> 'tenant_id')::uuid)
            AND m.tenant_id = "Session".tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      )
      WITH CHECK (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = (((SELECT auth.jwt()) ->> 'tenant_id')::uuid)
            AND m.tenant_id = "Session".tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      );
    $q$;
  END IF;
END $$;

-- 3.2 public.reflex_events :: tenant_update_events
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reflex_events' AND policyname = 'tenant_update_events'
  ) THEN
    EXECUTE $q$
      ALTER POLICY "tenant_update_events"
      ON public.reflex_events
      USING (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = (((SELECT auth.jwt()) ->> 'tenant_id')::uuid)
            AND m.tenant_id = reflex_events.tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      )
      WITH CHECK (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = (((SELECT auth.jwt()) ->> 'tenant_id')::uuid)
            AND m.tenant_id = reflex_events.tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      );
    $q$;
  END IF;
END $$;

-- 3.3 public.payments :: tenant_update_payments
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'tenant_update_payments'
  ) THEN
    EXECUTE $q$
      ALTER POLICY "tenant_update_payments"
      ON public.payments
      USING (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = (((SELECT auth.jwt()) ->> 'tenant_id')::uuid)
            AND m.tenant_id = payments.tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      )
      WITH CHECK (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = (((SELECT auth.jwt()) ->> 'tenant_id')::uuid)
            AND m.tenant_id = payments.tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      );
    $q$;
  END IF;
END $$;

-- 3.4 public.tenants :: tenant_update_own
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants' AND policyname = 'tenant_update_own'
  ) THEN
    EXECUTE $q$
      ALTER POLICY "tenant_update_own"
      ON public.tenants
      USING (
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = tenants.id
            AND m.role IN ('owner', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = tenants.id
            AND m.role IN ('owner', 'admin')
        )
      );
    $q$;
  END IF;
END $$;

-- 3.5 public.campaigns :: tenant_update_campaigns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'tenant_update_campaigns'
  ) THEN
    EXECUTE $q$
      ALTER POLICY "tenant_update_campaigns"
      ON public.campaigns
      USING (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.tenant_id = campaigns.tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      )
      WITH CHECK (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1
          FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.tenant_id = campaigns.tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      );
    $q$;
  END IF;
END $$;

-- 3.6 public.campaign_usages :: tenant_update_campaign_usages
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaign_usages' AND policyname = 'tenant_update_campaign_usages'
  ) THEN
    EXECUTE $q$
      ALTER POLICY "tenant_update_campaign_usages"
      ON public.campaign_usages
      USING (
        EXISTS (
          SELECT 1
          FROM public.campaigns c
          JOIN public.memberships m ON m.tenant_id = c.tenant_id
          WHERE c.id = campaign_usages.campaign_id
            AND c.tenant_id IS NOT NULL
            AND m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.role IN ('owner', 'admin', 'staff')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.campaigns c
          JOIN public.memberships m ON m.tenant_id = c.tenant_id
          WHERE c.id = campaign_usages.campaign_id
            AND c.tenant_id IS NOT NULL
            AND m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.role IN ('owner', 'admin', 'staff')
        )
      );
    $q$;
  END IF;
END $$;

COMMIT;

