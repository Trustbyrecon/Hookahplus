-- Fix Session table INSERT policy for Prisma
-- This allows Prisma to insert sessions when using direct database connection
-- Run this in Supabase SQL Editor

-- ============================================
-- Fix: Add INSERT policy for Session table
-- ============================================

-- Policy: Allow INSERT for direct database connections (Prisma)
-- This allows Prisma to create sessions when using DATABASE_URL directly
DROP POLICY IF EXISTS "Allow session inserts" ON public."Session";
CREATE POLICY "Allow session inserts"
ON public."Session"
FOR INSERT
WITH CHECK (true); -- Allow all inserts (Prisma uses direct connection, not auth)

-- Policy: Allow UPDATE for direct database connections (Prisma)
DROP POLICY IF EXISTS "Allow session updates" ON public."Session";
CREATE POLICY "Allow session updates"
ON public."Session"
FOR UPDATE
USING (true) -- Allow all updates
WITH CHECK (true);

-- Policy: Allow DELETE for direct database connections (Prisma)
DROP POLICY IF EXISTS "Allow session deletes" ON public."Session";
CREATE POLICY "Allow session deletes"
ON public."Session"
FOR DELETE
USING (true); -- Allow all deletes

-- Verify policies were created
SELECT 
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'Session'
ORDER BY policyname;

-- Expected output should show:
-- - "Service role can manage sessions" (FOR ALL)
-- - "Users can read own sessions alt" (FOR SELECT)
-- - "Allow session inserts" (FOR INSERT)
-- - "Allow session updates" (FOR UPDATE)
-- - "Allow session deletes" (FOR DELETE)

