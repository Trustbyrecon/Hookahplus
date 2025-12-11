-- Fix Auth RLS Performance Issues
-- Run this in Supabase SQL Editor to optimize RLS policies

-- Fix staff_rw policy
DROP POLICY IF EXISTS "staff_rw" ON "public"."staff";
CREATE POLICY "staff_rw" ON "public"."staff"
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix sessions_rw policy  
DROP POLICY IF EXISTS "sessions_rw" ON "public"."sessions";
CREATE POLICY "sessions_rw" ON "public"."sessions"
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix refills_rw policy
DROP POLICY IF EXISTS "refills_rw" ON "public"."refills";
CREATE POLICY "refills_rw" ON "public"."refills"
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix reservations_rw policy
DROP POLICY IF EXISTS "reservations_rw" ON "public"."reservations";
CREATE POLICY "reservations_rw" ON "public"."reservations"
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix ghostlog_insert policy
DROP POLICY IF EXISTS "ghostlog_insert" ON "public"."ghostlog";
CREATE POLICY "ghostlog_insert" ON "public"."ghostlog"
  FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Fix ghostlog_read policy
DROP POLICY IF EXISTS "ghostlog_read" ON "public"."ghostlog";
CREATE POLICY "ghostlog_read" ON "public"."ghostlog"
  FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

-- Note: Multiple permissive policies require more careful review
-- to consolidate without breaking functionality. Review each table
-- individually to merge policies safely.

