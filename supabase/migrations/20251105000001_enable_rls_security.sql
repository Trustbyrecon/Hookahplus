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

-- Policy: Authenticated users can read sessions
-- NOTE: Simplified policy - adjust based on your actual column names and access requirements
-- If you have user assignment columns, update this policy accordingly
DROP POLICY IF EXISTS "Users can read own sessions" ON public.sessions;
CREATE POLICY "Users can read own sessions"
ON public.sessions
FOR SELECT
USING (
  auth.role() = 'authenticated'
  -- Allow all authenticated users to read sessions
  -- TODO: Add column-specific restrictions based on your schema
  -- Example: AND ("fohUserId" = auth.uid()::text OR EXISTS (...))
);

-- Policy: Authenticated users can read their own sessions (for Session table)
DROP POLICY IF EXISTS "Users can read own sessions alt" ON public."Session";
CREATE POLICY "Users can read own sessions alt"
ON public."Session"
FOR SELECT
USING (
  auth.role() = 'authenticated'
  -- Allow all authenticated users to read sessions
);

-- ============================================
-- 2. Enable RLS on SessionEvent table
-- Table name: SessionEvent (PascalCase from original migration)
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
  -- Allow authenticated users to read session events
  -- Adjust based on your access requirements
);

-- ============================================
-- 3. Enable RLS on Badge table
-- Table name: Badge (PascalCase from original migration)
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
-- Table name: Event (PascalCase from original migration)
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

-- ============================================
-- 5. Enable RLS on Award table
-- Table name: Award (PascalCase from original migration)
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

