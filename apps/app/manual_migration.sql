-- Manual Migration: Night After Night Engine Models
-- Only run this if you cannot use `prisma migrate dev`
-- This includes ONLY the new tables and changes

-- Add new columns to Session table
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "preorder_id" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "lounge_config_version" INTEGER;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "seat_id" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "zone_id" TEXT;

-- Create new tables
CREATE TABLE IF NOT EXISTS "orders" (
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

CREATE TABLE IF NOT EXISTS "order_items" (
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

CREATE TABLE IF NOT EXISTS "order_events" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "staff_id" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "preorders" (
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

CREATE TABLE IF NOT EXISTS "deliveries" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "delivered_by" TEXT NOT NULL,
    "delivered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "session_notes" (
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

CREATE TABLE IF NOT EXISTS "loyalty_profiles" (
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

CREATE TABLE IF NOT EXISTS "loyalty_note_bindings" (
    "id" TEXT NOT NULL,
    "loyalty_profile_id" TEXT NOT NULL,
    "session_note_id" TEXT NOT NULL,
    CONSTRAINT "loyalty_note_bindings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "zones" (
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

CREATE TABLE IF NOT EXISTS "seats" (
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

CREATE TABLE IF NOT EXISTS "stations" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "station_type" TEXT NOT NULL,
    "zone_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "flavors" (
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

CREATE TABLE IF NOT EXISTS "mix_templates" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flavor_ids" TEXT NOT NULL,
    "price_cents" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mix_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pricing_rules" (
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

CREATE TABLE IF NOT EXISTS "lounge_configs" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "config_data" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lounge_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sync_backlog" (
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

CREATE TABLE IF NOT EXISTS "audit_logs" (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS "Session_preorder_id_idx" ON "Session"("preorder_id");
CREATE INDEX IF NOT EXISTS "Session_seat_id_idx" ON "Session"("seat_id");
CREATE INDEX IF NOT EXISTS "Session_zone_id_idx" ON "Session"("zone_id");
CREATE INDEX IF NOT EXISTS "Session_lounge_config_version_idx" ON "Session"("lounge_config_version");

CREATE INDEX IF NOT EXISTS "orders_session_id_idx" ON "orders"("session_id");
CREATE INDEX IF NOT EXISTS "orders_status_created_at_idx" ON "orders"("status", "created_at");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX IF NOT EXISTS "order_events_order_id_created_at_idx" ON "order_events"("order_id", "created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "preorders_qr_code_key" ON "preorders"("qr_code");
CREATE UNIQUE INDEX IF NOT EXISTS "preorders_session_id_key" ON "preorders"("session_id");
CREATE INDEX IF NOT EXISTS "preorders_lounge_id_status_idx" ON "preorders"("lounge_id", "status");

CREATE UNIQUE INDEX IF NOT EXISTS "deliveries_order_id_key" ON "deliveries"("order_id");
CREATE INDEX IF NOT EXISTS "deliveries_session_id_idx" ON "deliveries"("session_id");
CREATE INDEX IF NOT EXISTS "deliveries_delivered_by_delivered_at_idx" ON "deliveries"("delivered_by", "delivered_at");

CREATE INDEX IF NOT EXISTS "session_notes_session_id_idx" ON "session_notes"("session_id");
CREATE INDEX IF NOT EXISTS "session_notes_note_type_created_at_idx" ON "session_notes"("note_type", "created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_profiles_lounge_id_guest_key_key" ON "loyalty_profiles"("lounge_id", "guest_key");
CREATE INDEX IF NOT EXISTS "loyalty_profiles_lounge_id_idx" ON "loyalty_profiles"("lounge_id");

CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_note_bindings_loyalty_profile_id_session_note_id_key" ON "loyalty_note_bindings"("loyalty_profile_id", "session_note_id");

CREATE INDEX IF NOT EXISTS "zones_lounge_id_idx" ON "zones"("lounge_id");

CREATE UNIQUE INDEX IF NOT EXISTS "seats_table_id_key" ON "seats"("table_id");
CREATE INDEX IF NOT EXISTS "seats_lounge_id_zone_id_idx" ON "seats"("lounge_id", "zone_id");

CREATE INDEX IF NOT EXISTS "stations_lounge_id_idx" ON "stations"("lounge_id");
CREATE INDEX IF NOT EXISTS "flavors_lounge_id_idx" ON "flavors"("lounge_id");
CREATE INDEX IF NOT EXISTS "mix_templates_lounge_id_idx" ON "mix_templates"("lounge_id");
CREATE INDEX IF NOT EXISTS "pricing_rules_lounge_id_is_active_effective_at_idx" ON "pricing_rules"("lounge_id", "is_active", "effective_at");

CREATE UNIQUE INDEX IF NOT EXISTS "lounge_configs_lounge_id_key" ON "lounge_configs"("lounge_id");
CREATE INDEX IF NOT EXISTS "lounge_configs_lounge_id_version_idx" ON "lounge_configs"("lounge_id", "version");

CREATE INDEX IF NOT EXISTS "sync_backlog_device_id_status_idx" ON "sync_backlog"("device_id", "status");
CREATE INDEX IF NOT EXISTS "sync_backlog_lounge_id_status_created_at_idx" ON "sync_backlog"("lounge_id", "status", "created_at");

CREATE INDEX IF NOT EXISTS "audit_logs_lounge_id_created_at_idx" ON "audit_logs"("lounge_id", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- Add foreign keys
ALTER TABLE "Session" ADD CONSTRAINT "Session_preorder_id_fkey" FOREIGN KEY ("preorder_id") REFERENCES "preorders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_note_bindings" ADD CONSTRAINT "loyalty_note_bindings_loyalty_profile_id_fkey" FOREIGN KEY ("loyalty_profile_id") REFERENCES "loyalty_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_note_bindings" ADD CONSTRAINT "loyalty_note_bindings_session_note_id_fkey" FOREIGN KEY ("session_note_id") REFERENCES "session_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "seats" ADD CONSTRAINT "seats_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

