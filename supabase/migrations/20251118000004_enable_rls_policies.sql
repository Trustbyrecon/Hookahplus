-- Migration: Enable RLS & Create Policies for Multi-Tenant Security
-- Enables RLS on Session, ReflexEvent, and payments tables
-- Creates tenant-scoped policies with role-based access control
-- Uses Supabase built-in functions: auth.uid() and auth.jwt()
-- Agent: Noor (session_agent)
-- Date: 2025-11-18

BEGIN;

-- ============================================================================
-- 1. Enable RLS on Session Table
-- ============================================================================

ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read sessions in their tenant (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Session' AND policyname = 'tenant_read_sessions'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_read_sessions"
        ON public."Session"
        FOR SELECT
        USING (
          tenant_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = "Session".tenant_id
          )
        );
    $q$;
  END IF;
END $$;

-- Policy: Users with owner/admin/staff role can insert sessions (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Session' AND policyname = 'tenant_write_sessions'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_write_sessions"
        ON public."Session"
        FOR INSERT
        WITH CHECK (
          tenant_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = "Session".tenant_id
              AND m.role IN ('owner', 'admin', 'staff')
          )
        );
    $q$;
  END IF;
END $$;

-- Policy: Users with owner/admin/staff role can update sessions (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Session' AND policyname = 'tenant_update_sessions'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_update_sessions"
        ON public."Session"
        FOR UPDATE
        USING (
          tenant_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = "Session".tenant_id
              AND m.role IN ('owner', 'admin', 'staff')
          )
        )
        WITH CHECK (true);
    $q$;
  END IF;
END $$;

-- Policy: Only owner/admin can delete sessions (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Session' AND policyname = 'tenant_delete_sessions'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_delete_sessions"
        ON public."Session"
        FOR DELETE
        USING (
          tenant_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = "Session".tenant_id
              AND m.role IN ('owner', 'admin')
          )
        );
    $q$;
  END IF;
END $$;

-- ============================================================================
-- 2. Enable RLS on ReflexEvent Table
-- ============================================================================

ALTER TABLE public.reflex_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read events in their tenant (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reflex_events' AND policyname = 'tenant_read_events'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_read_events"
        ON public.reflex_events
        FOR SELECT
        USING (
          tenant_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = reflex_events.tenant_id
          )
        );
    $q$;
  END IF;
END $$;

-- Policy: Users with owner/admin/staff role can insert events (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reflex_events' AND policyname = 'tenant_write_events'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_write_events"
        ON public.reflex_events
        FOR INSERT
        WITH CHECK (
          tenant_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = reflex_events.tenant_id
              AND m.role IN ('owner', 'admin', 'staff')
          )
        );
    $q$;
  END IF;
END $$;

-- Policy: Users with owner/admin/staff role can update events (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reflex_events' AND policyname = 'tenant_update_events'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_update_events"
        ON public.reflex_events
        FOR UPDATE
        USING (
          tenant_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = reflex_events.tenant_id
              AND m.role IN ('owner', 'admin', 'staff')
          )
        )
        WITH CHECK (true);
    $q$;
  END IF;
END $$;

-- Policy: Only owner/admin can delete events (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reflex_events' AND policyname = 'tenant_delete_events'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_delete_events"
        ON public.reflex_events
        FOR DELETE
        USING (
          tenant_id IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = reflex_events.tenant_id
              AND m.role IN ('owner', 'admin')
          )
        );
    $q$;
  END IF;
END $$;

-- ============================================================================
-- 3. Enable RLS on Payments Table
-- ============================================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read payments in their tenant (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'tenant_read_payments'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_read_payments"
        ON public.payments
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = payments.tenant_id
          )
        );
    $q$;
  END IF;
END $$;

-- Policy: Users with owner/admin/staff role can insert payments (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'tenant_write_payments'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_write_payments"
        ON public.payments
        FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = payments.tenant_id
              AND m.role IN ('owner', 'admin', 'staff')
          )
        );
    $q$;
  END IF;
END $$;

-- Policy: Users with owner/admin/staff role can update payments (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'tenant_update_payments'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_update_payments"
        ON public.payments
        FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = payments.tenant_id
              AND m.role IN ('owner', 'admin', 'staff')
          )
        )
        WITH CHECK (true);
    $q$;
  END IF;
END $$;

-- Policy: Only owner/admin can delete payments (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'tenant_delete_payments'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_delete_payments"
        ON public.payments
        FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
              AND m.tenant_id = payments.tenant_id
              AND m.role IN ('owner', 'admin')
          )
        );
    $q$;
  END IF;
END $$;

-- ============================================================================
-- 4. Enable RLS on Tenants Table
-- ============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read tenants they are members of (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants' AND policyname = 'tenant_read_own_tenants'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_read_own_tenants"
        ON public.tenants
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = tenants.id
          )
        );
    $q$;
  END IF;
END $$;

-- Policy: Users cannot insert tenants directly (use signup flow) (idempotent)
-- Only service role can create tenants (via signup API)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants' AND policyname = 'tenant_no_insert'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_no_insert"
        ON public.tenants
        FOR INSERT
        WITH CHECK (false); -- Block all inserts except via service role
    $q$;
  END IF;
END $$;

-- Policy: Only owner/admin can update their tenant (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants' AND policyname = 'tenant_update_own'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_update_own"
        ON public.tenants
        FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = tenants.id
              AND m.role IN ('owner', 'admin')
          )
        )
        WITH CHECK (true);
    $q$;
  END IF;
END $$;

-- Policy: Only owner can delete their tenant (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants' AND policyname = 'tenant_delete_own'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "tenant_delete_own"
        ON public.tenants
        FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = (SELECT auth.uid())
              AND m.tenant_id = tenants.id
              AND m.role = 'owner'
          )
        );
    $q$;
  END IF;
END $$;

-- ============================================================================
-- 5. Service Role Bypass (for webhooks/migrations)
-- ============================================================================

-- Allow service role to bypass RLS (for webhooks, migrations, admin operations)
-- This is safe because service role is only used server-side with SUPABASE_SERVICE_ROLE_KEY

-- Note: Service role automatically bypasses RLS, so no explicit policy needed
-- But we document it here for clarity

COMMENT ON POLICY "tenant_read_sessions" ON public."Session" IS 'RLS policy: Users can read sessions in their tenant. Service role bypasses RLS.';
COMMENT ON POLICY "tenant_read_events" ON public.reflex_events IS 'RLS policy: Users can read events in their tenant. Service role bypasses RLS.';
COMMENT ON POLICY "tenant_read_payments" ON public.payments IS 'RLS policy: Users can read payments in their tenant. Service role bypasses RLS.';
COMMENT ON POLICY "tenant_read_own_tenants" ON public.tenants IS 'RLS policy: Users can read tenants they are members of. Service role bypasses RLS.';

COMMIT;

