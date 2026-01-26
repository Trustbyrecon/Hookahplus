-- Migration: Network memory bundle RPC
-- Date: 2026-01-26
--
-- Purpose:
-- - Return profile + notes + sessions + summary in one call
-- - Preserve the same access checks as other RPCs

BEGIN;

CREATE OR REPLACE FUNCTION public.get_network_memory_bundle(
  p_hid TEXT,
  p_lounge_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed BOOLEAN;
  v_bundle JSONB;
BEGIN
  v_allowed := public.user_has_lounge_access(p_lounge_id);
  IF NOT v_allowed THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT jsonb_build_object(
           'hid', p_hid,
           'lounge_id', p_lounge_id,
           'profile', public.get_network_profile_safe(p_hid, p_lounge_id),
           'notes', COALESCE((
             SELECT jsonb_agg(to_jsonb(n))
             FROM public.get_network_session_notes_safe(p_hid, p_lounge_id) n
           ), '[]'::jsonb),
           'sessions', COALESCE((
             SELECT jsonb_agg(to_jsonb(s))
             FROM public.get_network_sessions_safe(p_hid, p_lounge_id) s
           ), '[]'::jsonb),
           'summary', public.get_network_memory_summary(p_hid, p_lounge_id)
         )
    INTO v_bundle;

  RETURN v_bundle;
END;
$$;

REVOKE ALL ON FUNCTION public.get_network_memory_bundle(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_network_memory_bundle(TEXT, TEXT) TO authenticated;

COMMIT;

