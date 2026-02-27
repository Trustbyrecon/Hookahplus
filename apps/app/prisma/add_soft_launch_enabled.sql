-- Add soft_launch_enabled for CODIGO Soft Launch mode (per-lounge)
-- Run: npx prisma db execute --file prisma/add_soft_launch_enabled.sql
-- Or: psql $DATABASE_URL -f prisma/add_soft_launch_enabled.sql
ALTER TABLE "lounge_configs" ADD COLUMN IF NOT EXISTS "soft_launch_enabled" BOOLEAN NOT NULL DEFAULT false;
