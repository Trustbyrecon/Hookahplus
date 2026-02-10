-- Add payment_gateway for GMV reporting (Hookah-only Contract v1)
-- Matches apps/app/prisma/add_payment_gateway.sql
ALTER TABLE public."Session" ADD COLUMN IF NOT EXISTS "payment_gateway" TEXT;
