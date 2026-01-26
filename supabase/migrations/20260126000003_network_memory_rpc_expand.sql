-- Migration: Expand network memory RPCs + access check
-- Date: 2026-01-26
--
-- Adds:
-- - Stronger lounge access check (sessions OR square_merchants)
-- - Network sessions RPC
-- - Network memory summary RPC

BEGIN;

-- ============================================================================
-- 1) Helper: user has access to a lounge_id via tenant membership
--    - Allows service_role calls
--    - Accepts lounge access via existing sessions OR square_merchants mapping
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_has_lounge_access(p_lounge_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (auth.role() = 'service_role')
    OR EXISTS (
      SELECT 1
      FROM public.memberships m
      WHERE m.user_id = auth.uid()
        AND m.tenant_id = ((auth.jwt() ->> 'tenant_id')::uuid)
        AND (
          EXISTS (
            SELECT 1
            FROM public."Session" s
            WHERE s.tenant_id = m.tenant_id
              AND s."loungeId" = p_lounge_id
          )
          OR EXISTS (
            SELECT 1
            FROM public.square_merchants sm
            WHERE sm.tenant_id = m.tenant_id
              AND sm.lounge_id = p_lounge_id
          )
        )
    );
$$;

REVOKE ALL ON FUNCTION public.user_has_lounge_access(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.user_has_lounge_access(TEXT) TO authenticated;

-- ============================================================================
-- 2) RPC: fetch network sessions with scope filtering
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_network_sessions_safe(
  p_hid TEXT,
  p_lounge_id TEXT
)
RETURNS TABLE (
  session_id TEXT,
  lounge_id TEXT,
  start_ts TIMESTAMPTZ,
  end_ts TIMESTAMPTZ,
  items JSONB,
  spend_cents INTEGER,
  pos_ref TEXT,
  rating INTEGER
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
    n.session_id,
    n.lounge_id,
    n.start_ts,
    n.end_ts,
    n.items,
    n.spend_cents,
    n.pos_ref,
    n.rating
  FROM public.network_sessions n
  WHERE n.hid = p_hid
    AND (
      n.lounge_id = p_lounge_id
      OR p_lounge_id IS NULL
    )
  ORDER BY n.start_ts DESC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.get_network_sessions_safe(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_network_sessions_safe(TEXT, TEXT) TO authenticated;

-- ============================================================================
-- 3) RPC: network memory summary
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_network_memory_summary(
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
  v_summary JSONB;
BEGIN
  v_allowed := public.user_has_lounge_access(p_lounge_id);
  IF NOT v_allowed THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT jsonb_build_object(
           'hid', np.hid,
           'consent_level', np.consent_level,
           'tier', np.tier,
           'notes_count', COALESCE(nc.notes_count, 0),
           'last_note_at', nc.last_note_at,
           'sessions_count', COALESCE(sc.sessions_count, 0),
           'last_session_at', sc.last_session_at,
           'total_spend_cents', COALESCE(sc.total_spend_cents, 0)
         )
    INTO v_summary
  FROM public.network_profiles np
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS notes_count,
      MAX(n.created_at) AS last_note_at
    FROM public.network_session_notes n
    WHERE n.hid = np.hid
      AND (
        n.share_scope = 'network'
        OR n.lounge_id = p_lounge_id
      )
  ) nc ON true
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS sessions_count,
      MAX(s.end_ts) AS last_session_at,
      SUM(COALESCE(s.spend_cents, 0)) AS total_spend_cents
    FROM public.network_sessions s
    WHERE s.hid = np.hid
      AND (s.lounge_id = p_lounge_id OR p_lounge_id IS NULL)
  ) sc ON true
  WHERE np.hid = p_hid;

  RETURN v_summary;
END;
$$;

REVOKE ALL ON FUNCTION public.get_network_memory_summary(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_network_memory_summary(TEXT, TEXT) TO authenticated;

COMMIT;

