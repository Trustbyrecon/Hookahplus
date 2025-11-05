-- Enable Row Level Security (RLS) on all public tables
-- This migration fixes critical security issues identified by Supabase Security Advisor
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT-ID]/sql
-- 
-- IMPORTANT: This script uses IF EXISTS to handle table name variations
-- After running, verify all 5 tables have RLS enabled in Security Advisor

-- ============================================
-- 1. Enable RLS on Session table
-- Table name: sessions (lowercase, plural from Prisma @@map)
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

-- Policy: Authenticated users can read their own sessions (for sessions table)
DROP POLICY IF EXISTS "Users can read own sessions" ON public.sessions;
CREATE POLICY "Users can read own sessions"
ON public.sessions
FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND (
    -- Users can read sessions where they are assigned
    "assignedFOHId" = auth.uid()::text 
    OR "assignedBOHId" = auth.uid()::text
    -- Or if they are managers/admins
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND (roles LIKE '%MANAGER%' OR roles LIKE '%ADMIN%')
    )
  )
);

-- Policy: Authenticated users can read their own sessions (for Session table)
DROP POLICY IF EXISTS "Users can read own sessions alt" ON public."Session";
CREATE POLICY "Users can read own sessions alt"
ON public."Session"
FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND (
    "assignedFOHId" = auth.uid()::text 
    OR "assignedBOHId" = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND (roles LIKE '%MANAGER%' OR roles LIKE '%ADMIN%')
    )
  )
);

-- ============================================
-- 2. Enable RLS on SessionEvent table
-- Note: Table name may vary - check actual table name in Supabase
-- ============================================
ALTER TABLE IF EXISTS public."SessionEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.session_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (for SessionEvent)
DROP POLICY IF EXISTS "Service role can manage session events" ON public."SessionEvent";
CREATE POLICY "Service role can manage session events"
ON public."SessionEvent"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role has full access (for session_events)
DROP POLICY IF EXISTS "Service role can manage session events alt" ON public.session_events;
CREATE POLICY "Service role can manage session events alt"
ON public.session_events
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
  AND EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = "SessionEvent"."sessionId"
    AND (
      s."assignedFOHId" = auth.uid()::text 
      OR s."assignedBOHId" = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid()::text 
        AND (roles LIKE '%MANAGER%' OR roles LIKE '%ADMIN%')
      )
    )
  )
);

-- ============================================
-- 3. Enable RLS on Badge table
-- Table name: Badge (PascalCase from Prisma model)
-- ============================================
ALTER TABLE IF EXISTS public."Badge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.badges ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage badges" ON public."Badge";
CREATE POLICY "Service role can manage badges"
ON public."Badge"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can read active badges (for Badge table)
DROP POLICY IF EXISTS "Users can read active badges" ON public."Badge";
CREATE POLICY "Users can read active badges"
ON public."Badge"
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND active = true
);

-- Policy: Authenticated users can read active badges (for badges table)
DROP POLICY IF EXISTS "Users can read active badges alt" ON public.badges;
CREATE POLICY "Users can read active badges alt"
ON public.badges
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND active = true
);

-- ============================================
-- 4. Enable RLS on Event table
-- Table name: Event (PascalCase from Prisma model)
-- ============================================
ALTER TABLE IF EXISTS public."Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage events" ON public."Event";
CREATE POLICY "Service role can manage events"
ON public."Event"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can read their own events (for Event table)
DROP POLICY IF EXISTS "Users can read own events" ON public."Event";
CREATE POLICY "Users can read own events"
ON public."Event"
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND (
    "profileId" = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND (roles LIKE '%MANAGER%' OR roles LIKE '%ADMIN%')
    )
  )
);

-- Policy: Users can read their own events (for events table)
DROP POLICY IF EXISTS "Users can read own events alt" ON public.events;
CREATE POLICY "Users can read own events alt"
ON public.events
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND (
    "profileId" = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND (roles LIKE '%MANAGER%' OR roles LIKE '%ADMIN%')
    )
  )
);

-- ============================================
-- 5. Enable RLS on Award table
-- Table name: Award (PascalCase from Prisma model)
-- ============================================
ALTER TABLE IF EXISTS public."Award" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.awards ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
DROP POLICY IF EXISTS "Service role can manage awards" ON public."Award";
CREATE POLICY "Service role can manage awards"
ON public."Award"
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can read their own awards (for Award table)
DROP POLICY IF EXISTS "Users can read own awards" ON public."Award";
CREATE POLICY "Users can read own awards"
ON public."Award"
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND (
    "profileId" = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND (roles LIKE '%MANAGER%' OR roles LIKE '%ADMIN%')
    )
  )
);

-- Policy: Users can read their own awards (for awards table)
DROP POLICY IF EXISTS "Users can read own awards alt" ON public.awards;
CREATE POLICY "Users can read own awards alt"
ON public.awards
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND (
    "profileId" = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND (roles LIKE '%MANAGER%' OR roles LIKE '%ADMIN%')
    )
  )
);

-- ============================================
-- Verification Queries (run these to verify)
-- ============================================
-- Check RLS is enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('sessions', 'SessionEvent', 'Badge', 'Event', 'Award');

-- Check policies exist:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('sessions', 'SessionEvent', 'Badge', 'Event', 'Award');

