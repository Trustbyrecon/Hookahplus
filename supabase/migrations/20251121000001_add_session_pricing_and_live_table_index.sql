-- Migration: Add session pricing metadata and unique live table index
-- This supports:
-- 1) Per-session pricing metadata for MOAT (time-based vs flat, refills)
-- 2) Guarantee of at most one live session per table (no duplicate/ghost sessions)

-- Add pricing / refill metadata columns if they don't exist
ALTER TABLE public."Session"
ADD COLUMN IF NOT EXISTS "session_type" TEXT,
ADD COLUMN IF NOT EXISTS "had_refill" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "refill_count" INTEGER DEFAULT 0;

-- Add a unique index to prevent multiple live sessions on the same table.
-- "Live" is defined as any session that is not CLOSED or CANCELED.
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_live_table_unique
ON public."Session"("tableId")
WHERE "state" NOT IN ('CLOSED', 'CANCELED');

-- Comments for documentation
COMMENT ON COLUMN public."Session"."session_type" IS 'Pricing type for this session: TIME_BASED | FLAT';
COMMENT ON COLUMN public."Session"."had_refill" IS 'True if this session has ever had a refill completed';
COMMENT ON COLUMN public."Session"."refill_count" IS 'Number of completed refills for this session';


