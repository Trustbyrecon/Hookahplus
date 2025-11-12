-- Migration: Add externalRef column to Session table
-- This column was missing from the previous migration but is required by Prisma schema

-- Add externalRef column if it doesn't exist
ALTER TABLE public."Session" 
ADD COLUMN IF NOT EXISTS "externalRef" TEXT;

-- Add index for externalRef (if index doesn't exist)
CREATE INDEX IF NOT EXISTS idx_session_external_ref ON public."Session"("externalRef");

-- Add comment
COMMENT ON COLUMN public."Session"."externalRef" IS 'External reference: qrToken | reservationId | stripeCheckoutId';

