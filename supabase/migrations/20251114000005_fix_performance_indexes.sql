-- Fix Performance Advisor Index Issues
-- Agent: Noor (session_agent)
-- Date: 2025-01-14
-- 
-- This migration addresses:
-- 1. Unindexed foreign keys: Adds indexes for foreign key columns
-- 2. Unused indexes: Removes indexes that have never been used (saves space, improves writes)
--
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT-ID]/sql

-- ============================================
-- 1. Add Missing Foreign Key Indexes
-- ============================================

-- Award.badgeId foreign key index
CREATE INDEX IF NOT EXISTS "idx_award_badge_id" 
ON public."Award"("badgeId");

-- sessions.created_by foreign key index
CREATE INDEX IF NOT EXISTS "idx_sessions_created_by" 
ON public.sessions("created_by");

-- ============================================
-- 2. Remove Unused Indexes
-- ============================================
-- Note: Unused indexes consume storage and slow down INSERT/UPDATE operations
-- These indexes have never been used according to Supabase Performance Advisor

-- Award table unused indexes
DROP INDEX IF EXISTS "Award_profileId_badgeId_venueId_revoked_idx";

-- Event table unused indexes
DROP INDEX IF EXISTS "Event_profileId_idx";
DROP INDEX IF EXISTS "Event_profileId_venueId_idx";

-- sessions table unused indexes (lowercase table)
DROP INDEX IF EXISTS "idx_sessions_venue_id";
DROP INDEX IF EXISTS "idx_sessions_status";

-- staff table unused indexes
DROP INDEX IF EXISTS "idx_staff_venue_id";

-- refills table unused indexes
DROP INDEX IF EXISTS "idx_refills_venue_id";
DROP INDEX IF EXISTS "idx_refills_session_id";

-- reservations table unused indexes
DROP INDEX IF EXISTS "idx_reservations_venue_id";

-- ghostlog table unused indexes
DROP INDEX IF EXISTS "idx_ghostlog_venue_id";
DROP INDEX IF EXISTS "idx_ghostlog_session_id";

-- stripe_webhook_events table unused indexes
DROP INDEX IF EXISTS "idx_stripe_webhook_events_received_at";

-- reflex_events table unused indexes
-- Note: Keeping these for now as they might be needed for analytics queries
-- Uncomment if you're sure they're not needed:
-- DROP INDEX IF EXISTS "idx_reflex_events_campaign_id";
-- DROP INDEX IF EXISTS "idx_reflex_events_type_created_at";
-- DROP INDEX IF EXISTS "idx_reflex_events_cta_source";
-- DROP INDEX IF EXISTS "idx_reflex_events_cta_type";

-- Session table unused indexes
-- WARNING: These indexes on Session table might be needed for future queries
-- Review your query patterns before removing:
-- - idx_session_external_ref: Used for guest → app sync lookups
-- - idx_session_customer_ref: Used for customer lookups
-- - idx_session_lounge_id: Used for lounge filtering
-- - Session_loungeId_state_idx: Used for state filtering by lounge
-- - idx_session_state: Used for state filtering
--
-- RECOMMENDATION: Keep these Session indexes for now, they're likely needed for:
--   - GET /api/sessions?loungeId=X&state=Y
--   - Guest sync lookups by externalRef
--   - Customer session queries
--
-- Uncomment to remove if you're certain they're not needed:
-- DROP INDEX IF EXISTS "idx_session_external_ref";
-- DROP INDEX IF EXISTS "idx_session_customer_ref";
-- DROP INDEX IF EXISTS "idx_session_lounge_id";
-- DROP INDEX IF EXISTS "Session_loungeId_state_idx";
-- DROP INDEX IF EXISTS "idx_session_state";

-- ============================================
-- Verification Queries
-- ============================================

-- Check foreign key indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (
    indexname LIKE '%award_badge%' OR
    indexname LIKE '%sessions_created_by%'
  )
ORDER BY tablename, indexname;

-- Check remaining indexes on Session table (should still exist)
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'Session'
ORDER BY indexname;

-- Count indexes per table (should be reduced)
SELECT 
  tablename,
  COUNT(*) as "Index Count"
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('Award', 'Event', 'sessions', 'staff', 'refills', 'reservations', 'ghostlog', 'stripe_webhook_events', 'Session')
GROUP BY tablename
ORDER BY tablename;

