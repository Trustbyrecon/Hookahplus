-- Add payment_gateway for GMV reporting (Hookah-only Contract v1)
-- Same change: supabase/migrations/20260201000001_add_payment_gateway.sql (for Supabase/production)
-- Run: psql $DATABASE_URL -f prisma/add_payment_gateway.sql
-- Or: npx prisma db execute --file prisma/add_payment_gateway.sql (Prisma 5+)
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "payment_gateway" TEXT;
