-- Migration: Fix Function Search Path Security Issue
-- Fixes Supabase Security Advisor warning for mutable search_path
-- Date: 2025-01-28
-- 
-- This migration fixes the security vulnerability in update_updated_at_column()
-- by setting a fixed search_path to prevent search_path injection attacks.
--
-- Security Issue: Functions without SEaT search_path are vulnerable to
-- search_path injection attacks where malicious users can manipulate
-- the search_path to execute unintended code.

BEGIN;

-- ============================================================================
-- Fix update_updated_at_column() function
-- ============================================================================
-- Replace the function with a secure version that sets search_path = ''
-- This prevents search_path injection attacks by forcing fully qualified names
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

COMMIT;

-- ============================================================================
-- Verification Query (run separately to verify the fix)
-- ============================================================================
-- Check that the function has search_path set:
-- SELECT 
--   p.proname as function_name,
--   pg_get_functiondef(p.oid) as function_definition
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--   AND p.proname = 'update_updated_at_column';
--
-- The function definition should include: SET search_path = ''
--
-- Or check using:
-- SELECT 
--   p.proname,
--   pg_get_function_identity_arguments(p.oid) as args,
--   CASE 
--     WHEN p.proconfig IS NULL THEN 'No search_path set'
--     ELSE array_to_string(p.proconfig, ', ')
--   END as config
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--   AND p.proname = 'update_updated_at_column';

