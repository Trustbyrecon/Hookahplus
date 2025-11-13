-- Migration: Alter Session table columns to use enum types
-- This updates the source and state columns to use SessionSource and SessionState enums

-- Alter source column to use SessionSource enum
-- First, convert existing string values to enum, then change column type
ALTER TABLE public."Session" 
  ALTER COLUMN "source" TYPE "SessionSource" 
  USING CASE 
    WHEN "source"::text = 'QR' THEN 'QR'::"SessionSource"
    WHEN "source"::text = 'RESERVE' THEN 'RESERVE'::"SessionSource"
    WHEN "source"::text = 'WALK_IN' THEN 'WALK_IN'::"SessionSource"
    WHEN "source"::text = 'LEGACY_POS' THEN 'LEGACY_POS'::"SessionSource"
    ELSE 'WALK_IN'::"SessionSource" -- Default for any unknown values
  END;

-- Alter state column to use SessionState enum
-- Map existing string values to enum values
ALTER TABLE public."Session" 
  ALTER COLUMN "state" TYPE "SessionState" 
  USING CASE 
    WHEN "state"::text = 'PENDING' THEN 'PENDING'::"SessionState"
    WHEN "state"::text = 'ACTIVE' THEN 'ACTIVE'::"SessionState"
    WHEN "state"::text = 'PAUSED' THEN 'PAUSED'::"SessionState"
    WHEN "state"::text = 'CLOSED' THEN 'CLOSED'::"SessionState"
    WHEN "state"::text = 'CANCELED' THEN 'CANCELED'::"SessionState"
    -- Map legacy values
    WHEN "state"::text = 'NEW' THEN 'PENDING'::"SessionState"
    WHEN "state"::text = 'COMPLETED' THEN 'CLOSED'::"SessionState"
    WHEN "state"::text = 'CANCELLED' THEN 'CANCELED'::"SessionState"
    ELSE 'PENDING'::"SessionState" -- Default for any unknown values
  END;

-- Verify column types
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'Session'
  AND column_name IN ('source', 'state');

-- Expected output:
-- source | USER-DEFINED | SessionSource
-- state  | USER-DEFINED | SessionState

