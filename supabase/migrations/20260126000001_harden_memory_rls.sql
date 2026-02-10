-- Migration: Harden RLS for memory-layer tables
-- Date: 2026-01-26
--
-- Goals:
-- 1) Ensure memory tables have RLS enabled
-- 2) Remove overly-permissive policies
-- 3) Restrict memory access to tenant members or service role

BEGIN;

-- ============================================================================
-- 0) Drop permissive policies (idempotent, safe if tables missing)
-- ============================================================================
DO $$
BEGIN
  BEGIN
    DROP POLICY IF EXISTS "Allow all operations on reflex_events" ON public.reflex_events;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DROP POLICY IF EXISTS "Allow session inserts" ON public."Session";
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DROP POLICY IF EXISTS "Allow session updates" ON public."Session";
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DROP POLICY IF EXISTS "Allow session deletes" ON public."Session";
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
END $$;

-- ============================================================================
-- 1) Enable RLS on memory tables (idempotent)
-- ============================================================================
ALTER TABLE IF EXISTS public.session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.session_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loyalty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loyalty_note_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.network_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.network_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.network_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.network_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.network_session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.network_pii_links ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2) Session Events: tenant-scoped reads + service role write
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'session_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'session_events' AND policyname = 'service_role_manage_session_events'
    ) THEN
      CREATE POLICY "service_role_manage_session_events"
      ON public.session_events
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'session_events' AND policyname = 'tenant_read_session_events'
    ) THEN
      CREATE POLICY "tenant_read_session_events"
      ON public.session_events
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public."Session" s
          JOIN public.memberships m ON m.tenant_id = s.tenant_id
          WHERE s.id = session_events.session_id
            AND m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
        )
      );
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3) Session Adjustments: tenant-scoped reads + service role write
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'session_adjustments') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'session_adjustments' AND policyname = 'service_role_manage_session_adjustments'
    ) THEN
      CREATE POLICY "service_role_manage_session_adjustments"
      ON public.session_adjustments
      FOR ALL
      USING ((select auth.role()) = 'service_role')
      WITH CHECK ((select auth.role()) = 'service_role');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'session_adjustments' AND policyname = 'tenant_read_session_adjustments'
    ) THEN
      CREATE POLICY "tenant_read_session_adjustments"
      ON public.session_adjustments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public."Session" s
          JOIN public.memberships m ON m.tenant_id = s.tenant_id
          WHERE s.id = session_adjustments.session_id
            AND m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
        )
      );
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 4) Session Notes: tenant-scoped reads + service role write
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'session_notes') THEN
    -- Remove overly-broad authenticated read policy if present
    BEGIN
      DROP POLICY IF EXISTS "authenticated_read_session_notes" ON public.session_notes;
    EXCEPTION WHEN undefined_table THEN NULL;
    END;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'session_notes' AND policyname = 'tenant_read_session_notes'
    ) THEN
      CREATE POLICY "tenant_read_session_notes"
      ON public.session_notes
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public."Session" s
          JOIN public.memberships m ON m.tenant_id = s.tenant_id
          WHERE s.id = session_notes.session_id
            AND m.user_id = (SELECT auth.uid())
            AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
        )
      );
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 5) Loyalty Tables: service-role only (no safe tenant join available)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loyalty_profiles') THEN
    BEGIN
      DROP POLICY IF EXISTS "authenticated_read_loyalty_profiles" ON public.loyalty_profiles;
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loyalty_note_bindings') THEN
    BEGIN
      DROP POLICY IF EXISTS "authenticated_read_loyalty_note_bindings" ON public.loyalty_note_bindings;
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- 6) Network Tables: service-role only (sensitive memory layer)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_profiles') THEN
    BEGIN
      DROP POLICY IF EXISTS "authenticated_read_network_profiles" ON public.network_profiles;
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_preferences') THEN
    BEGIN
      DROP POLICY IF EXISTS "authenticated_read_network_preferences" ON public.network_preferences;
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_badges') THEN
    BEGIN
      DROP POLICY IF EXISTS "authenticated_read_network_badges" ON public.network_badges;
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_sessions') THEN
    BEGIN
      DROP POLICY IF EXISTS "authenticated_read_network_sessions" ON public.network_sessions;
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_session_notes') THEN
    BEGIN
      DROP POLICY IF EXISTS "authenticated_read_network_session_notes" ON public.network_session_notes;
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END IF;
END $$;

COMMIT;

