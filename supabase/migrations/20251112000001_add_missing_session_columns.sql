-- Migration: Add missing columns to Session table
-- This migration adds all columns that are defined in Prisma schema but missing from the database

-- Add missing columns to Session table
ALTER TABLE public."Session" 
ADD COLUMN IF NOT EXISTS "externalRef" TEXT,
ADD COLUMN IF NOT EXISTS "tableId" TEXT,
ADD COLUMN IF NOT EXISTS "customerRef" TEXT,
ADD COLUMN IF NOT EXISTS "flavor" TEXT,
ADD COLUMN IF NOT EXISTS "priceCents" INTEGER DEFAULT 3000,
ADD COLUMN IF NOT EXISTS "edgeCase" TEXT,
ADD COLUMN IF NOT EXISTS "edgeNote" TEXT,
ADD COLUMN IF NOT EXISTS "assignedBOHId" TEXT,
ADD COLUMN IF NOT EXISTS "assignedFOHId" TEXT,
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "durationSecs" INTEGER,
ADD COLUMN IF NOT EXISTS "paymentIntent" TEXT,
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT,
ADD COLUMN IF NOT EXISTS "orderItems" TEXT,
ADD COLUMN IF NOT EXISTS "posMode" TEXT,
ADD COLUMN IF NOT EXISTS "timerDuration" INTEGER,
ADD COLUMN IF NOT EXISTS "timerStartedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "timerPausedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "timerPausedDuration" INTEGER,
ADD COLUMN IF NOT EXISTS "timerStatus" TEXT,
ADD COLUMN IF NOT EXISTS "zone" TEXT,
ADD COLUMN IF NOT EXISTS "fohUserId" TEXT,
ADD COLUMN IF NOT EXISTS "specialRequests" TEXT,
ADD COLUMN IF NOT EXISTS "tableNotes" TEXT,
ADD COLUMN IF NOT EXISTS "qrCodeUrl" TEXT;

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_session_table_id ON public."Session"("tableId");
CREATE INDEX IF NOT EXISTS idx_session_customer_ref ON public."Session"("customerRef");
CREATE INDEX IF NOT EXISTS idx_session_state ON public."Session"("state");
CREATE INDEX IF NOT EXISTS idx_session_lounge_id ON public."Session"("loungeId");
CREATE INDEX IF NOT EXISTS idx_session_created_at ON public."Session"("createdAt");
CREATE INDEX IF NOT EXISTS idx_session_external_ref ON public."Session"("externalRef");

-- Add comment
COMMENT ON TABLE public."Session" IS 'Session table with all required columns for Fire Session Dashboard';

