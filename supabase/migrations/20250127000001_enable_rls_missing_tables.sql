-- Migration: Enable RLS on Missing Public Tables
-- Fixes Supabase Security Advisor warnings for tables without RLS enabled
-- Date: 2025-01-27
-- 
-- This migration enables Row Level Security (RLS) on all public tables
-- that were flagged by Supabase Security Advisor as missing RLS protection.
--
-- Tables covered:
-- - stations, flavors, mix_templates, pricing_rules, lounge_configs
-- - sync_backlog, audit_logs, preorders, seats, zones
-- - orders, order_items, order_events, deliveries
-- - session_notes, loyalty_profiles, loyalty_note_bindings

BEGIN;

-- ============================================================================
-- Helper function to safely enable RLS on a table (idempotent)
-- ============================================================================
DO $$
DECLARE
  tbl_name TEXT;
  tables_to_enable TEXT[] := ARRAY[
    'stations',
    'flavors',
    'mix_templates',
    'pricing_rules',
    'lounge_configs',
    'sync_backlog',
    'audit_logs',
    'preorders',
    'seats',
    'zones',
    'orders',
    'order_items',
    'order_events',
    'deliveries',
    'session_notes',
    'loyalty_profiles',
    'loyalty_note_bindings'
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
-- Create Policies for Each Table
-- ============================================================================
-- Policy pattern: Service role has full access, authenticated users have read access
-- This is a safe default that can be refined based on specific business requirements

-- ============================================================================
-- 1. Stations
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stations') THEN
    -- Service role can manage stations
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'stations' AND policyname = 'service_role_manage_stations'
    ) THEN
      CREATE POLICY "service_role_manage_stations"
      ON public.stations
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    -- Authenticated users can read stations
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'stations' AND policyname = 'authenticated_read_stations'
    ) THEN
      CREATE POLICY "authenticated_read_stations"
      ON public.stations
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. Flavors
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flavors') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'flavors' AND policyname = 'service_role_manage_flavors'
    ) THEN
      CREATE POLICY "service_role_manage_flavors"
      ON public.flavors
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'flavors' AND policyname = 'authenticated_read_flavors'
    ) THEN
      CREATE POLICY "authenticated_read_flavors"
      ON public.flavors
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3. Mix Templates
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mix_templates') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'mix_templates' AND policyname = 'service_role_manage_mix_templates'
    ) THEN
      CREATE POLICY "service_role_manage_mix_templates"
      ON public.mix_templates
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'mix_templates' AND policyname = 'authenticated_read_mix_templates'
    ) THEN
      CREATE POLICY "authenticated_read_mix_templates"
      ON public.mix_templates
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 4. Pricing Rules
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pricing_rules') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'pricing_rules' AND policyname = 'service_role_manage_pricing_rules'
    ) THEN
      CREATE POLICY "service_role_manage_pricing_rules"
      ON public.pricing_rules
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'pricing_rules' AND policyname = 'authenticated_read_pricing_rules'
    ) THEN
      CREATE POLICY "authenticated_read_pricing_rules"
      ON public.pricing_rules
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 5. Lounge Configs
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lounge_configs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'lounge_configs' AND policyname = 'service_role_manage_lounge_configs'
    ) THEN
      CREATE POLICY "service_role_manage_lounge_configs"
      ON public.lounge_configs
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'lounge_configs' AND policyname = 'authenticated_read_lounge_configs'
    ) THEN
      CREATE POLICY "authenticated_read_lounge_configs"
      ON public.lounge_configs
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 6. Sync Backlog
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sync_backlog') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'sync_backlog' AND policyname = 'service_role_manage_sync_backlog'
    ) THEN
      CREATE POLICY "service_role_manage_sync_backlog"
      ON public.sync_backlog
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'sync_backlog' AND policyname = 'authenticated_read_sync_backlog'
    ) THEN
      CREATE POLICY "authenticated_read_sync_backlog"
      ON public.sync_backlog
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 7. Audit Logs
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'service_role_manage_audit_logs'
    ) THEN
      CREATE POLICY "service_role_manage_audit_logs"
      ON public.audit_logs
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    -- Audit logs: Only service role can read (more restrictive)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'service_role_read_audit_logs'
    ) THEN
      CREATE POLICY "service_role_read_audit_logs"
      ON public.audit_logs
      FOR SELECT
      USING (auth.role() = 'service_role');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 8. Preorders
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'preorders') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'preorders' AND policyname = 'service_role_manage_preorders'
    ) THEN
      CREATE POLICY "service_role_manage_preorders"
      ON public.preorders
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'preorders' AND policyname = 'authenticated_read_preorders'
    ) THEN
      CREATE POLICY "authenticated_read_preorders"
      ON public.preorders
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 9. Seats
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'seats') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'seats' AND policyname = 'service_role_manage_seats'
    ) THEN
      CREATE POLICY "service_role_manage_seats"
      ON public.seats
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'seats' AND policyname = 'authenticated_read_seats'
    ) THEN
      CREATE POLICY "authenticated_read_seats"
      ON public.seats
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 10. Zones
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'zones') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'zones' AND policyname = 'service_role_manage_zones'
    ) THEN
      CREATE POLICY "service_role_manage_zones"
      ON public.zones
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'zones' AND policyname = 'authenticated_read_zones'
    ) THEN
      CREATE POLICY "authenticated_read_zones"
      ON public.zones
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 11. Orders
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'service_role_manage_orders'
    ) THEN
      CREATE POLICY "service_role_manage_orders"
      ON public.orders
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'authenticated_read_orders'
    ) THEN
      CREATE POLICY "authenticated_read_orders"
      ON public.orders
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 12. Order Items
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'service_role_manage_order_items'
    ) THEN
      CREATE POLICY "service_role_manage_order_items"
      ON public.order_items
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'authenticated_read_order_items'
    ) THEN
      CREATE POLICY "authenticated_read_order_items"
      ON public.order_items
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 13. Order Events
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'order_events' AND policyname = 'service_role_manage_order_events'
    ) THEN
      CREATE POLICY "service_role_manage_order_events"
      ON public.order_events
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'order_events' AND policyname = 'authenticated_read_order_events'
    ) THEN
      CREATE POLICY "authenticated_read_order_events"
      ON public.order_events
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 14. Deliveries
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deliveries') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'deliveries' AND policyname = 'service_role_manage_deliveries'
    ) THEN
      CREATE POLICY "service_role_manage_deliveries"
      ON public.deliveries
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'deliveries' AND policyname = 'authenticated_read_deliveries'
    ) THEN
      CREATE POLICY "authenticated_read_deliveries"
      ON public.deliveries
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 15. Session Notes
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'session_notes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'session_notes' AND policyname = 'service_role_manage_session_notes'
    ) THEN
      CREATE POLICY "service_role_manage_session_notes"
      ON public.session_notes
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'session_notes' AND policyname = 'authenticated_read_session_notes'
    ) THEN
      CREATE POLICY "authenticated_read_session_notes"
      ON public.session_notes
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 16. Loyalty Profiles
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loyalty_profiles') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'loyalty_profiles' AND policyname = 'service_role_manage_loyalty_profiles'
    ) THEN
      CREATE POLICY "service_role_manage_loyalty_profiles"
      ON public.loyalty_profiles
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'loyalty_profiles' AND policyname = 'authenticated_read_loyalty_profiles'
    ) THEN
      CREATE POLICY "authenticated_read_loyalty_profiles"
      ON public.loyalty_profiles
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 17. Loyalty Note Bindings
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loyalty_note_bindings') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'loyalty_note_bindings' AND policyname = 'service_role_manage_loyalty_note_bindings'
    ) THEN
      CREATE POLICY "service_role_manage_loyalty_note_bindings"
      ON public.loyalty_note_bindings
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'loyalty_note_bindings' AND policyname = 'authenticated_read_loyalty_note_bindings'
    ) THEN
      CREATE POLICY "authenticated_read_loyalty_note_bindings"
      ON public.loyalty_note_bindings
      FOR SELECT
      USING (auth.role() = 'authenticated');
    END IF;
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
--     'stations', 'flavors', 'mix_templates', 'pricing_rules', 'lounge_configs',
--     'sync_backlog', 'audit_logs', 'preorders', 'seats', 'zones',
--     'orders', 'order_items', 'order_events', 'deliveries',
--     'session_notes', 'loyalty_profiles', 'loyalty_note_bindings'
--   )
-- ORDER BY tablename;

