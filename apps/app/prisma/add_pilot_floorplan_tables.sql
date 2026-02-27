-- CODIGO pilot config + floorplan tables
-- Run: npx prisma db execute --file prisma/add_pilot_floorplan_tables.sql

CREATE TABLE IF NOT EXISTS "pilot_configs" (
  "id" TEXT NOT NULL,
  "lounge_id" TEXT NOT NULL,
  "config_data" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pilot_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pilot_configs_lounge_id_key" ON "pilot_configs"("lounge_id");
CREATE INDEX IF NOT EXISTS "pilot_configs_lounge_id_idx" ON "pilot_configs"("lounge_id");

CREATE TABLE IF NOT EXISTS "floorplan_layouts" (
  "id" TEXT NOT NULL,
  "lounge_id" TEXT NOT NULL,
  "floor_id" TEXT NOT NULL,
  "nodes" JSONB NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "floorplan_layouts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "floorplan_layouts_lounge_id_floor_id_key" ON "floorplan_layouts"("lounge_id", "floor_id");
CREATE INDEX IF NOT EXISTS "floorplan_layouts_lounge_id_idx" ON "floorplan_layouts"("lounge_id");
