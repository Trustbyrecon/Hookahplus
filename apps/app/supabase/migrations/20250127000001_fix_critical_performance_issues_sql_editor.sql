-- Migration: Fix Critical Database Performance Issues
-- Date: 2025-01-27
-- Priority: High
-- 
-- VERSION FOR SUPABASE SQL EDITOR
-- This version removes CONCURRENTLY to work in SQL Editor
-- For production, use the version with CONCURRENTLY via psql
--
-- Fixes:
-- 1. Remove duplicate index on reflex_events
-- 2. Add missing foreign key indexes

-- ============================================================================
-- 1. Remove Duplicate Index (Priority 1.2)
-- ============================================================================
-- reflex_events has duplicate indexes: idx_reflex_events_session and idx_reflex_events_sessionid
-- Keep idx_reflex_events_sessionid, drop idx_reflex_events_session

DROP INDEX IF EXISTS public.idx_reflex_events_session;

-- ============================================================================
-- 2. Add Missing Foreign Key Indexes (Priority 2.1)
-- ============================================================================
-- These indexes improve JOIN performance and foreign key constraint checks
-- NOTE: Without CONCURRENTLY, these will briefly lock tables
-- Run during low-traffic periods if possible

-- loyalty_note_bindings.session_note_id
CREATE INDEX IF NOT EXISTS idx_loyalty_note_bindings_session_note_id 
  ON public.loyalty_note_bindings(session_note_id);

-- refills.session_id
CREATE INDEX IF NOT EXISTS idx_refills_session_id 
  ON public.refills(session_id);

-- refills.venue_id
CREATE INDEX IF NOT EXISTS idx_refills_venue_id 
  ON public.refills(venue_id);

-- seats.zone_id
CREATE INDEX IF NOT EXISTS idx_seats_zone_id 
  ON public.seats(zone_id);

-- sessions.venue_id
CREATE INDEX IF NOT EXISTS idx_sessions_venue_id 
  ON public.sessions(venue_id);

-- staff.venue_id
CREATE INDEX IF NOT EXISTS idx_staff_venue_id 
  ON public.staff(venue_id);

