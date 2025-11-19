-- Migration: Add Tenant & Membership Tables for Multi-Tenant RBAC
-- Creates tenants table, role enum, and memberships table
-- Agent: Noor (session_agent)
-- Date: 2025-11-18

BEGIN;

-- ============================================================================
-- 1. Create Role Enum (idempotent)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    CREATE TYPE public.role AS ENUM ('owner', 'admin', 'staff', 'viewer');
    COMMENT ON TYPE public.role IS 'User roles: owner (full control), admin (management), staff (operations), viewer (read-only)';
  END IF;
END $$;

-- ============================================================================
-- 2. Create Tenants Table (idempotent)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_tenants_name ON public.tenants(name);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants(created_at);

-- Add comments (idempotent - will update if exists)
COMMENT ON TABLE public.tenants IS 'Multi-tenant organizations (lounges)';
COMMENT ON COLUMN public.tenants.id IS 'Unique tenant identifier (UUID)';
COMMENT ON COLUMN public.tenants.name IS 'Tenant/lounge name';

-- ============================================================================
-- 3. Create Memberships Table (RBAC) (idempotent)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.memberships (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role public.role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, tenant_id)
);

-- Add indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant_id ON public.memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON public.memberships(role);
CREATE INDEX IF NOT EXISTS idx_memberships_user_tenant ON public.memberships(user_id, tenant_id);

-- Add comments (idempotent - will update if exists)
COMMENT ON TABLE public.memberships IS 'User-tenant relationships with role-based access control';
COMMENT ON COLUMN public.memberships.user_id IS 'References auth.users(id)';
COMMENT ON COLUMN public.memberships.tenant_id IS 'References public.tenants(id)';
COMMENT ON COLUMN public.memberships.role IS 'User role within this tenant';

-- ============================================================================
-- 4. Enable RLS on Memberships (idempotent)
-- ============================================================================

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own memberships (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'memberships' AND policyname = 'Users can read own memberships'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Users can read own memberships"
        ON public.memberships
        FOR SELECT
        USING (auth.uid() = user_id);
    $q$;
  END IF;
END $$;

-- Policy: Service role can manage all memberships (for migrations/admin) (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'memberships' AND policyname = 'Service role can manage memberships'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Service role can manage memberships"
        ON public.memberships
        FOR ALL
        USING (auth.jwt()->>'role' = 'service_role');
    $q$;
  END IF;
END $$;

COMMIT;

