-- Migration: Companion RPCs for network memory access
-- Date: 2026-01-26
--
-- Purpose:
-- - Provide authenticated, tenant-scoped access to network memory
-- - Avoid reopening raw network tables to public/authenticated roles

BEGIN;

-- ============================================================================
-- 1) Helper: user has access to a lounge_id via tenant membership
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_has_lounge_access(p_lounge_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    JOIN public."Session" s ON s.tenant_id = m.tenant_id
    WHERE m.user_id = auth.uid()
      AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
      AND s."loungeId" = p_lounge_id
  );
$$;

REVOKE ALL ON FUNCTION public.user_has_lounge_access(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.user_has_lounge_access(TEXT) TO authenticated;

-- ============================================================================
-- 2) RPC: fetch network profile (no PII)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_network_profile_safe(
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
  v_profile JSONB;
BEGIN
  v_allowed := public.user_has_lounge_access(p_lounge_id);
  IF NOT v_allowed THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT jsonb_build_object(
           'hid', np.hid,
           'consent_level', np.consent_level,
           'tier', np.tier,
           'preferences', jsonb_build_object(
             'top_flavors', pref.top_flavors,
             'device_prefs', pref.device_prefs
           ),
           'badges', COALESCE((
             SELECT jsonb_agg(
                      jsonb_build_object(
                        'badge_code', b.badge_code,
                        'awarded_at', b.awarded_at,
                        'meta', b.meta
                      )
                    )
             FROM public.network_badges b
             WHERE b.hid = np.hid
           ), '[]'::jsonb)
         )
    INTO v_profile
  FROM public.network_profiles np
  LEFT JOIN public.network_preferences pref ON pref.hid = np.hid
  WHERE np.hid = p_hid;

  RETURN v_profile;
END;
$$;

REVOKE ALL ON FUNCTION public.get_network_profile_safe(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_network_profile_safe(TEXT, TEXT) TO authenticated;

-- ============================================================================
-- 3) RPC: fetch network session notes with scope filtering
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_network_session_notes_safe(
  p_hid TEXT,
  p_lounge_id TEXT
)
RETURNS TABLE (
  note_id TEXT,
  lounge_id TEXT,
  staff_id TEXT,
  note_text TEXT,
  share_scope TEXT,
  tags JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed BOOLEAN;
BEGIN
  v_allowed := public.user_has_lounge_access(p_lounge_id);
  IF NOT v_allowed THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    n.note_id,
    n.lounge_id,
    n.staff_id,
    n.note_text,
    n.share_scope,
    n.tags,
    n.created_at
  FROM public.network_session_notes n
  WHERE n.hid = p_hid
    AND (
      n.share_scope = 'network'
      OR n.lounge_id = p_lounge_id
    )
  ORDER BY n.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_network_session_notes_safe(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_network_session_notes_safe(TEXT, TEXT) TO authenticated;

COMMIT;

