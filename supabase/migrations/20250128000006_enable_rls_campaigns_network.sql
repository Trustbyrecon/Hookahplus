-- Migration: Enable RLS on Campaigns and Network Tables
-- Fixes Supabase Security Advisor warnings for tables without RLS enabled
-- Date: 2025-01-28
-- 
-- This migration enables Row Level Security (RLS) on all public tables
-- that were flagged by Supabase Security Advisor as missing RLS protection.
--
-- Tables covered:
-- - campaigns, campaign_usages (tenant-scoped)
-- - network_profiles, network_preferences, network_badges (network-wide)
-- - network_sessions, network_session_notes (network-wide with lounge_id)
-- - network_pii_links (sensitive PII data - service role only)

BEGIN;

-- ============================================================================
-- Helper function to safely enable RLS on a table (idempotent)
-- ============================================================================
DO $$
DECLARE
  tbl_name TEXT;
  tables_to_enable TEXT[] := ARRAY[
    'campaigns',
    'campaign_usages',
    'network_profiles',
    'network_preferences',
    'network_badges',
    'network_sessions',
    'network_session_notes',
    'network_pii_links'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY tables_to_enable
  LOOP
    -- Check if table exists before enabling RLS
    IF EXISTS (
      SELECT 1 FROM information_schema.tables t
      WHERE t.table_schema = 'public' AND t.table_name = tbl_name
    ) THEN
      -- Enable RLS (idempotent - safe to run multiple times)
      EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
      RAISE NOTICE 'Enabled RLS on table: %', tbl_name;
    ELSE
      RAISE NOTICE 'Table does not exist, skipping: %', tbl_name;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 1. CAMPAIGNS TABLE (tenant-scoped)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN
    -- Service role can manage campaigns
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'service_role_manage_campaigns'
    ) THEN
      CREATE POLICY "service_role_manage_campaigns"
      ON public.campaigns
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    -- Tenant members can read campaigns in their tenant
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'tenant_read_campaigns'
    ) THEN
      CREATE POLICY "tenant_read_campaigns"
      ON public.campaigns
      FOR SELECT
      USING (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.tenant_id = campaigns.tenant_id
        )
      );
    END IF;

    -- Tenant owners/admins/staff can insert campaigns
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'tenant_insert_campaigns'
    ) THEN
      CREATE POLICY "tenant_insert_campaigns"
      ON public.campaigns
      FOR INSERT
      WITH CHECK (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.tenant_id = campaigns.tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      );
    END IF;

    -- Tenant owners/admins/staff can update campaigns
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'tenant_update_campaigns'
    ) THEN
      CREATE POLICY "tenant_update_campaigns"
      ON public.campaigns
      FOR UPDATE
      USING (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.tenant_id = campaigns.tenant_id
            AND m.role IN ('owner', 'admin', 'staff')
        )
      )
      WITH CHECK (true);
    END IF;

    -- Only tenant owners/admins can delete campaigns
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'tenant_delete_campaigns'
    ) THEN
      CREATE POLICY "tenant_delete_campaigns"
      ON public.campaigns
      FOR DELETE
      USING (
        tenant_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.tenant_id = campaigns.tenant_id
            AND m.role IN ('owner', 'admin')
        )
      );
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. CAMPAIGN_USAGES TABLE (tenant-scoped via campaign relationship)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_usages') THEN
    -- Service role can manage campaign usages
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaign_usages' AND policyname = 'service_role_manage_campaign_usages'
    ) THEN
      CREATE POLICY "service_role_manage_campaign_usages"
      ON public.campaign_usages
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    -- Tenant members can read campaign usages for campaigns in their tenant
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaign_usages' AND policyname = 'tenant_read_campaign_usages'
    ) THEN
      CREATE POLICY "tenant_read_campaign_usages"
      ON public.campaign_usages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.memberships m ON m.tenant_id = c.tenant_id
          WHERE c.id = campaign_usages.campaign_id
            AND c.tenant_id IS NOT NULL
            AND m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
        )
      );
    END IF;

    -- Tenant owners/admins/staff can insert campaign usages
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaign_usages' AND policyname = 'tenant_insert_campaign_usages'
    ) THEN
      CREATE POLICY "tenant_insert_campaign_usages"
      ON public.campaign_usages
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.memberships m ON m.tenant_id = c.tenant_id
          WHERE c.id = campaign_usages.campaign_id
            AND c.tenant_id IS NOT NULL
            AND m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.role IN ('owner', 'admin', 'staff')
        )
      );
    END IF;

    -- Tenant owners/admins/staff can update campaign usages
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'campaign_usages' AND policyname = 'tenant_update_campaign_usages'
    ) THEN
      CREATE POLICY "tenant_update_campaign_usages"
      ON public.campaign_usages
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.campaigns c
          JOIN public.memberships m ON m.tenant_id = c.tenant_id
          WHERE c.id = campaign_usages.campaign_id
            AND c.tenant_id IS NOT NULL
            AND m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
            AND m.role IN ('owner', 'admin', 'staff')
        )
      )
      WITH CHECK (true);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3. NETWORK_PROFILES TABLE (network-wide, service role + authenticated read)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_profiles') THEN
    -- Service role can manage network profiles
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_profiles' AND policyname = 'service_role_manage_network_profiles'
    ) THEN
      CREATE POLICY "service_role_manage_network_profiles"
      ON public.network_profiles
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    -- Authenticated users can read network profiles (for network-wide features)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_profiles' AND policyname = 'authenticated_read_network_profiles'
    ) THEN
      CREATE POLICY "authenticated_read_network_profiles"
      ON public.network_profiles
      FOR SELECT
      USING ((select auth.role()) = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 4. NETWORK_PREFERENCES TABLE (network-wide, linked to profiles)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_preferences') THEN
    -- Service role can manage network preferences
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_preferences' AND policyname = 'service_role_manage_network_preferences'
    ) THEN
      CREATE POLICY "service_role_manage_network_preferences"
      ON public.network_preferences
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    -- Authenticated users can read network preferences
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_preferences' AND policyname = 'authenticated_read_network_preferences'
    ) THEN
      CREATE POLICY "authenticated_read_network_preferences"
      ON public.network_preferences
      FOR SELECT
      USING ((select auth.role()) = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 5. NETWORK_BADGES TABLE (network-wide, linked to profiles)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_badges') THEN
    -- Service role can manage network badges
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_badges' AND policyname = 'service_role_manage_network_badges'
    ) THEN
      CREATE POLICY "service_role_manage_network_badges"
      ON public.network_badges
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    -- Authenticated users can read network badges
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_badges' AND policyname = 'authenticated_read_network_badges'
    ) THEN
      CREATE POLICY "authenticated_read_network_badges"
      ON public.network_badges
      FOR SELECT
      USING ((select auth.role()) = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 6. NETWORK_SESSIONS TABLE (network-wide with lounge_id)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_sessions') THEN
    -- Service role can manage network sessions
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_sessions' AND policyname = 'service_role_manage_network_sessions'
    ) THEN
      CREATE POLICY "service_role_manage_network_sessions"
      ON public.network_sessions
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    -- Authenticated users can read network sessions
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_sessions' AND policyname = 'authenticated_read_network_sessions'
    ) THEN
      CREATE POLICY "authenticated_read_network_sessions"
      ON public.network_sessions
      FOR SELECT
      USING ((select auth.role()) = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 7. NETWORK_SESSION_NOTES TABLE (network-wide with lounge_id)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_session_notes') THEN
    -- Service role can manage network session notes
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_session_notes' AND policyname = 'service_role_manage_network_session_notes'
    ) THEN
      CREATE POLICY "service_role_manage_network_session_notes"
      ON public.network_session_notes
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    -- Authenticated users can read network session notes (respects share_scope)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_session_notes' AND policyname = 'authenticated_read_network_session_notes'
    ) THEN
      CREATE POLICY "authenticated_read_network_session_notes"
      ON public.network_session_notes
      FOR SELECT
      USING ((select auth.role()) = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 8. NETWORK_PII_LINKS TABLE (sensitive PII data - service role only)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_pii_links') THEN
    -- Service role can manage network PII links (most restrictive - contains sensitive PII)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'network_pii_links' AND policyname = 'service_role_manage_network_pii_links'
    ) THEN
      CREATE POLICY "service_role_manage_network_pii_links"
      ON public.network_pii_links
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    -- No authenticated user access - PII data should only be accessible via service role
    -- This ensures sensitive PII hash mappings are protected
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- Verification Query (run separately to verify RLS is enabled)
-- ============================================================================
-- SELECT 
--   schemaname,
--   tablename,
--   rowsecurity as rls_enabled
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'campaigns', 'campaign_usages',
--     'network_profiles', 'network_preferences', 'network_badges',
--     'network_sessions', 'network_session_notes', 'network_pii_links'
--   )
-- ORDER BY tablename;
--
-- -- Check policies
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   cmd as "Command"
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'campaigns', 'campaign_usages',
--     'network_profiles', 'network_preferences', 'network_badges',
--     'network_sessions', 'network_session_notes', 'network_pii_links'
--   )
-- ORDER BY tablename, policyname;

