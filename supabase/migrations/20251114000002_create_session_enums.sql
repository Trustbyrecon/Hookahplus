-- Create SessionSource and SessionState enum types if they don't exist
-- These enums are required by Prisma schema

-- Create SessionSource enum
DO $$ BEGIN
    CREATE TYPE "SessionSource" AS ENUM ('QR', 'RESERVE', 'WALK_IN', 'LEGACY_POS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create SessionState enum
DO $$ BEGIN
    CREATE TYPE "SessionState" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verify enums exist
SELECT typname FROM pg_type WHERE typname IN ('SessionSource', 'SessionState');

