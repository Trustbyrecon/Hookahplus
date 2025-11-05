-- Verification Queries for RLS Migration
-- Run these in Supabase SQL Editor to verify RLS is properly enabled

-- ============================================
-- 1. Check which tables have RLS enabled
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('sessions', 'Session', 'SessionEvent', 'Badge', 'Event', 'Award')
ORDER BY tablename;

-- Expected: All should show "RLS Enabled" = true

-- ============================================
-- 2. Check which policies exist on each table
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command",
  qual as "Using Expression"
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('sessions', 'Session', 'SessionEvent', 'Badge', 'Event', 'Award')
ORDER BY tablename, policyname;

-- Expected: Each table should have at least 2 policies:
-- - One service role policy (FOR ALL)
-- - One authenticated user policy (FOR SELECT)

-- ============================================
-- 3. Count policies per table
-- ============================================
SELECT 
  tablename,
  COUNT(*) as "Policy Count"
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('sessions', 'Session', 'SessionEvent', 'Badge', 'Event', 'Award')
GROUP BY tablename
ORDER BY tablename;

-- Expected: Each table should have 2+ policies

-- ============================================
-- 4. Verify service role policies exist
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('sessions', 'Session', 'SessionEvent', 'Badge', 'Event', 'Award')
  AND policyname LIKE '%service role%'
ORDER BY tablename;

-- Expected: One service role policy per table (allows Prisma/webhooks to work)

