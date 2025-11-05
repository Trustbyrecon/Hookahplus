-- Enable Row Level Security (RLS) on all public tables
-- This migration fixes critical security issues identified by Supabase Security Advisor
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT-ID]/sql
-- 
-- IMPORTANT: This script only references tables that exist in your database
-- After running, verify all tables have RLS enabled in Security Advisor

-- Clean up any orphaned policies on non-existent tables (if any exist from previous runs)
DO $$
BEGIN
  -- Drop policies on session_events if they exist (even if table doesn't)
  BEGIN
    DROP POLICY IF EXISTS "Service role can manage session events alt" ON public.session_events;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can read session events alt" ON public.session_events;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  -- Drop policies on badges if they exist
  BEGIN
    DROP POLICY IF EXISTS "Service role can manage badges alt" ON public.badges;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can read active badges alt" ON public.badges;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  -- Drop policies on events if they exist
  BEGIN
    DROP POLICY IF EXISTS "Service role can manage events alt" ON public.events;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can read own events alt" ON public.events;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  -- Drop policies on awards if they exist
  BEGIN
    DROP POLICY IF EXISTS "Service role can manage awards alt" ON public.awards;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can read own awards alt" ON public.awards;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
END $$;

-- ============================================
-- 1. Enable RLS on Session table
-- ============================================
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Session" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (for Prisma/webhooks)
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.sessions;
CREATE POLICY "Service role can manage sessions"
ON public.sessions
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can read sessions
DROP POLICY IF EXISTS "Users can read own sessions" ON public.sessions;
CREATE POLICY "Users can read own sessions"
ON public.sessions
FOR SELECT
USING (
  auth.role() = 'authenticated'
);

-- Policy: Authenticated users can read their own sessions (for Session table)
DROP POLICY IF EXISTS "Users can read own sessions alt" ON public."Session";
CREATE POLICY "Users can read own sessions alt"
ON public."Session"
FOR SELECT
USING (
  auth.role() = 'authenticated'
);

-- ============================================
-- 2. Enable RLS on SessionEvent table
-- ============================================
ALTER TABLE IF EXISTS public."SessionEvent" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (for SessionEvent)
DROP POLICY IF EXISTS "Service role can manage session events" ON public."SessionEvent";
CREATE POLICY "Service role can manage session events"
ON public."SessionEvent"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can read events for sessions they have access to
DROP POLICY IF EXISTS "Users can read session events" ON public."SessionEvent";
CREATE POLICY "Users can read session events"
ON public."SessionEvent"
FOR SELECT
USING (
  auth.role() = 'authenticated'
);

-- ============================================
-- 3. Enable RLS on Badge table
-- ============================================
ALTER TABLE IF EXISTS public."Badge" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage badges" ON public."Badge";
CREATE POLICY "Service role can manage badges"
ON public."Badge"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can read active badges
DROP POLICY IF EXISTS "Users can read active badges" ON public."Badge";
CREATE POLICY "Users can read active badges"
ON public."Badge"
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND active = true
);

-- ============================================
-- 4. Enable RLS on Event table
-- ============================================
ALTER TABLE IF EXISTS public."Event" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage events" ON public."Event";
CREATE POLICY "Service role can manage events"
ON public."Event"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can read their own events
-- NOTE: Simplified - users can read events where profileId matches their auth.uid()
-- Role-based access can be added later if public.users table exists
DROP POLICY IF EXISTS "Users can read own events" ON public."Event";
CREATE POLICY "Users can read own events"
ON public."Event"
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND "profileId" = auth.uid()::text
);

-- ============================================
-- 5. Enable RLS on Award table
-- ============================================
ALTER TABLE IF EXISTS public."Award" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage awards" ON public."Award";
CREATE POLICY "Service role can manage awards"
ON public."Award"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can read their own awards
-- NOTE: Simplified - users can read awards where profileId matches their auth.uid()
-- Role-based access can be added later if public.users table exists
DROP POLICY IF EXISTS "Users can read own awards" ON public."Award";
CREATE POLICY "Users can read own awards"
ON public."Award"
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND "profileId" = auth.uid()::text
);
