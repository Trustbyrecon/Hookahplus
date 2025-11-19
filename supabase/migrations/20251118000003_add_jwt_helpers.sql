-- Migration: Add JWT Helper Functions for RLS (OPTIONAL)
-- Creates helper functions in public schema (auth schema is protected in Supabase)
-- NOTE: Migration 4 uses Supabase built-ins (auth.uid(), auth.jwt()) so these are optional
-- These functions are provided for convenience but are not required
-- Agent: Noor (session_agent)
-- Date: 2025-11-18

BEGIN;

-- ============================================================================
-- 1. Helper to Read JWT Claims Safely (in public schema)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_jwt_claims() RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  )
$$;

COMMENT ON FUNCTION public.get_jwt_claims() IS 'Safely read JWT claims from request context (wrapper for auth.jwt())';

-- ============================================================================
-- 2. Get Current User ID from JWT (in public schema)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_id() RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid())
$$;

COMMENT ON FUNCTION public.get_current_user_id() IS 'Get current authenticated user ID (wrapper for auth.uid())';

-- ============================================================================
-- 3. Get Current Tenant ID from JWT (in public schema)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_tenant_id() RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT ((auth.jwt() ->> 'tenant_id')::uuid)
$$;

COMMENT ON FUNCTION public.get_current_tenant_id() IS 'Get current active tenant ID from JWT claims';

-- ============================================================================
-- 4. Get Current Role from JWT (in public schema)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_role() RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.jwt() ->> 'role'
$$;

COMMENT ON FUNCTION public.get_current_role() IS 'Get current user role for active tenant from JWT claims';

COMMIT;

