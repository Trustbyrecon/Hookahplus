-- Migration: Fix taxonomy_unknown_upsert Security Warning
-- Addresses Supabase Security Advisor warning: Function Search Path Mutable
-- Agent: Noor (session_agent)
-- Date: 2025-11-15

BEGIN;

-- ============================================================================
-- Fix: Add SET search_path to prevent search_path injection attacks
-- ============================================================================

-- Drop and recreate function with secure search_path setting
DROP FUNCTION IF EXISTS public.taxonomy_unknown_upsert(TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.taxonomy_unknown_upsert(
  p_enum_type TEXT,
  p_raw_label TEXT,
  p_example_event_id TEXT DEFAULT NULL,
  p_example_payload JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- All table references must be fully qualified (public."TaxonomyUnknown")
  INSERT INTO public."TaxonomyUnknown" (enum_type, raw_label, example_event_id, example_payload)
  VALUES (p_enum_type, p_raw_label, p_example_event_id, p_example_payload)
  ON CONFLICT (enum_type, raw_label) DO UPDATE
  SET
    count = public."TaxonomyUnknown".count + 1,
    last_seen = NOW(),
    updated_at = NOW(),
    example_event_id = COALESCE(public."TaxonomyUnknown".example_event_id, EXCLUDED.example_event_id),
    example_payload = COALESCE(public."TaxonomyUnknown".example_payload, EXCLUDED.example_payload);
END;
$$;

COMMENT ON FUNCTION public.taxonomy_unknown_upsert IS 
'Securely upserts unknown taxonomy values. Uses SET search_path = '' to prevent search_path injection attacks.';

COMMIT;

-- Verification
-- SELECT 
--   proname as function_name,
--   prosecdef as security_definer,
--   proconfig as search_path_config
-- FROM pg_proc
-- WHERE proname = 'taxonomy_unknown_upsert'
--   AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

