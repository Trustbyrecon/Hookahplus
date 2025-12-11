-- Migration: Add Night After Night Engine Models
-- Phase 1: Database Models for complete session lifecycle
-- Adds: Orders, PreOrders, Deliveries, SessionNotes, LoyaltyProfiles, Zones, Seats, Stations, Flavors, MixTemplates, PricingRules, LoungeConfigs, SyncBacklog, AuditLogs
-- Agent: Auto (session_agent)
-- Date: 2025-01-25

BEGIN;

-- ============================================================================
-- 1. Add New Columns to Session Table
-- ============================================================================

ALTER TABLE public."Session" 
  ADD COLUMN IF NOT EXISTS "preorder_id" TEXT,
  ADD COLUMN IF NOT EXISTS "lounge_config_version" INTEGER,
  ADD COLUMN IF NOT EXISTS "seat_id" TEXT,
  ADD COLUMN IF NOT EXISTS "zone_id" TEXT;

-- ============================================================================
-- 2. Create Order Models
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."orders" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price_snapshot" TEXT,
    "special_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "served_at" TIMESTAMP(3),
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" TEXT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_cents" INTEGER NOT NULL,
    "metadata" TEXT,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."order_events" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "staff_id" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 3. Create PreOrder Model
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."preorders" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "guest_handle" TEXT,
    "qr_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduled_time" TIMESTAMP(3),
    "party_size" INTEGER NOT NULL,
    "flavor_mix_json" TEXT,
    "base_price" INTEGER NOT NULL,
    "locked_price" INTEGER,
    "metadata" TEXT,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    CONSTRAINT "preorders_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 4. Create Delivery Model
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."deliveries" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "delivered_by" TEXT NOT NULL,
    "delivered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 5. Create SessionNotes & Memory Layer
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."session_notes" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "note_type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sentiment" TEXT,
    "loyalty_impact" INTEGER,
    "behavioral_tags" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."loyalty_profiles" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "guest_key" TEXT NOT NULL,
    "cumulative_spend" INTEGER NOT NULL DEFAULT 0,
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "last_visit_at" TIMESTAMP(3),
    "preference_summary" TEXT,
    "trust_score" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "loyalty_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."loyalty_note_bindings" (
    "id" TEXT NOT NULL,
    "loyalty_profile_id" TEXT NOT NULL,
    "session_note_id" TEXT NOT NULL,
    CONSTRAINT "loyalty_note_bindings_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 6. Create Lounge Layout Models
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."zones" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zone_type" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."seats" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "name" TEXT,
    "capacity" INTEGER NOT NULL,
    "coordinates" TEXT,
    "qr_enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "price_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."stations" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "station_type" TEXT NOT NULL,
    "zone_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 7. Create Menu & Catalog Models
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."flavors" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "flavors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."mix_templates" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flavor_ids" TEXT NOT NULL,
    "price_cents" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mix_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."pricing_rules" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "rule_config" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 8. Create Config & Reliability Models
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."lounge_configs" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "config_data" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lounge_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."sync_backlog" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_attempt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),
    CONSTRAINT "sync_backlog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."audit_logs" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "changes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 9. Create Indexes
-- ============================================================================

-- Session table indexes
CREATE INDEX IF NOT EXISTS "Session_preorder_id_idx" ON public."Session"("preorder_id");
CREATE INDEX IF NOT EXISTS "Session_seat_id_idx" ON public."Session"("seat_id");
CREATE INDEX IF NOT EXISTS "Session_zone_id_idx" ON public."Session"("zone_id");
CREATE INDEX IF NOT EXISTS "Session_lounge_config_version_idx" ON public."Session"("lounge_config_version");

-- Order indexes
CREATE INDEX IF NOT EXISTS "orders_session_id_idx" ON public."orders"("session_id");
CREATE INDEX IF NOT EXISTS "orders_status_created_at_idx" ON public."orders"("status", "created_at");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON public."order_items"("order_id");
CREATE INDEX IF NOT EXISTS "order_events_order_id_created_at_idx" ON public."order_events"("order_id", "created_at");

-- PreOrder indexes
CREATE UNIQUE INDEX IF NOT EXISTS "preorders_qr_code_key" ON public."preorders"("qr_code") WHERE "qr_code" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "preorders_session_id_key" ON public."preorders"("session_id") WHERE "session_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "preorders_lounge_id_status_idx" ON public."preorders"("lounge_id", "status");

-- Delivery indexes
CREATE UNIQUE INDEX IF NOT EXISTS "deliveries_order_id_key" ON public."deliveries"("order_id");
CREATE INDEX IF NOT EXISTS "deliveries_session_id_idx" ON public."deliveries"("session_id");
CREATE INDEX IF NOT EXISTS "deliveries_delivered_by_delivered_at_idx" ON public."deliveries"("delivered_by", "delivered_at");

-- SessionNotes indexes
CREATE INDEX IF NOT EXISTS "session_notes_session_id_idx" ON public."session_notes"("session_id");
CREATE INDEX IF NOT EXISTS "session_notes_note_type_created_at_idx" ON public."session_notes"("note_type", "created_at");

-- LoyaltyProfile indexes
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_profiles_lounge_id_guest_key_key" ON public."loyalty_profiles"("lounge_id", "guest_key");
CREATE INDEX IF NOT EXISTS "loyalty_profiles_lounge_id_idx" ON public."loyalty_profiles"("lounge_id");

-- LoyaltyNoteBinding indexes
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_note_bindings_loyalty_profile_id_session_note_id_key" ON public."loyalty_note_bindings"("loyalty_profile_id", "session_note_id");

-- Zone indexes
CREATE INDEX IF NOT EXISTS "zones_lounge_id_idx" ON public."zones"("lounge_id");

-- Seat indexes
CREATE UNIQUE INDEX IF NOT EXISTS "seats_table_id_key" ON public."seats"("table_id");
CREATE INDEX IF NOT EXISTS "seats_lounge_id_zone_id_idx" ON public."seats"("lounge_id", "zone_id");

-- Station indexes
CREATE INDEX IF NOT EXISTS "stations_lounge_id_idx" ON public."stations"("lounge_id");

-- Flavor indexes
CREATE INDEX IF NOT EXISTS "flavors_lounge_id_idx" ON public."flavors"("lounge_id");

-- MixTemplate indexes
CREATE INDEX IF NOT EXISTS "mix_templates_lounge_id_idx" ON public."mix_templates"("lounge_id");

-- PricingRule indexes
CREATE INDEX IF NOT EXISTS "pricing_rules_lounge_id_is_active_effective_at_idx" ON public."pricing_rules"("lounge_id", "is_active", "effective_at");

-- LoungeConfig indexes
CREATE UNIQUE INDEX IF NOT EXISTS "lounge_configs_lounge_id_key" ON public."lounge_configs"("lounge_id");
CREATE INDEX IF NOT EXISTS "lounge_configs_lounge_id_version_idx" ON public."lounge_configs"("lounge_id", "version");

-- SyncBacklog indexes
CREATE INDEX IF NOT EXISTS "sync_backlog_device_id_status_idx" ON public."sync_backlog"("device_id", "status");
CREATE INDEX IF NOT EXISTS "sync_backlog_lounge_id_status_created_at_idx" ON public."sync_backlog"("lounge_id", "status", "created_at");

-- AuditLog indexes
CREATE INDEX IF NOT EXISTS "audit_logs_lounge_id_created_at_idx" ON public."audit_logs"("lounge_id", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_created_at_idx" ON public."audit_logs"("user_id", "created_at");

-- ============================================================================
-- 10. Add Foreign Key Constraints
-- ============================================================================

-- Session foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Session_preorder_id_fkey'
  ) THEN
    ALTER TABLE public."Session" 
      ADD CONSTRAINT "Session_preorder_id_fkey" 
      FOREIGN KEY ("preorder_id") 
      REFERENCES public."preorders"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Session_seat_id_fkey'
  ) THEN
    ALTER TABLE public."Session" 
      ADD CONSTRAINT "Session_seat_id_fkey" 
      FOREIGN KEY ("seat_id") 
      REFERENCES public."seats"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Session_zone_id_fkey'
  ) THEN
    ALTER TABLE public."Session" 
      ADD CONSTRAINT "Session_zone_id_fkey" 
      FOREIGN KEY ("zone_id") 
      REFERENCES public."zones"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Order foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_session_id_fkey'
  ) THEN
    ALTER TABLE public."orders" 
      ADD CONSTRAINT "orders_session_id_fkey" 
      FOREIGN KEY ("session_id") 
      REFERENCES public."Session"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey'
  ) THEN
    ALTER TABLE public."order_items" 
      ADD CONSTRAINT "order_items_order_id_fkey" 
      FOREIGN KEY ("order_id") 
      REFERENCES public."orders"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_events_order_id_fkey'
  ) THEN
    ALTER TABLE public."order_events" 
      ADD CONSTRAINT "order_events_order_id_fkey" 
      FOREIGN KEY ("order_id") 
      REFERENCES public."orders"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Delivery foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deliveries_session_id_fkey'
  ) THEN
    ALTER TABLE public."deliveries" 
      ADD CONSTRAINT "deliveries_session_id_fkey" 
      FOREIGN KEY ("session_id") 
      REFERENCES public."Session"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deliveries_order_id_fkey'
  ) THEN
    ALTER TABLE public."deliveries" 
      ADD CONSTRAINT "deliveries_order_id_fkey" 
      FOREIGN KEY ("order_id") 
      REFERENCES public."orders"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- SessionNote foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'session_notes_session_id_fkey'
  ) THEN
    ALTER TABLE public."session_notes" 
      ADD CONSTRAINT "session_notes_session_id_fkey" 
      FOREIGN KEY ("session_id") 
      REFERENCES public."Session"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- LoyaltyNoteBinding foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loyalty_note_bindings_loyalty_profile_id_fkey'
  ) THEN
    ALTER TABLE public."loyalty_note_bindings" 
      ADD CONSTRAINT "loyalty_note_bindings_loyalty_profile_id_fkey" 
      FOREIGN KEY ("loyalty_profile_id") 
      REFERENCES public."loyalty_profiles"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loyalty_note_bindings_session_note_id_fkey'
  ) THEN
    ALTER TABLE public."loyalty_note_bindings" 
      ADD CONSTRAINT "loyalty_note_bindings_session_note_id_fkey" 
      FOREIGN KEY ("session_note_id") 
      REFERENCES public."session_notes"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Seat foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seats_zone_id_fkey'
  ) THEN
    ALTER TABLE public."seats" 
      ADD CONSTRAINT "seats_zone_id_fkey" 
      FOREIGN KEY ("zone_id") 
      REFERENCES public."zones"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- Verification
-- ============================================================================
-- After running, verify tables were created:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('orders', 'preorders', 'deliveries', 'session_notes', 'loyalty_profiles', 'zones', 'seats', 'stations', 'flavors', 'mix_templates', 'pricing_rules', 'lounge_configs', 'sync_backlog', 'audit_logs') ORDER BY tablename;

