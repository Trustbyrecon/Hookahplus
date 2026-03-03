-- Add ParticipantStatus enum required by Prisma for participants.status.
-- The original migration used status text; Prisma expects the enum type.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t WHERE t.typname = 'ParticipantStatus') THEN
    CREATE TYPE "ParticipantStatus" AS ENUM ('ACTIVE', 'LEFT');
  END IF;
END
$$;

-- Alter participants.status from text to ParticipantStatus (if column exists)
-- Must drop default first; PostgreSQL cannot auto-cast text default to enum.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'participants' AND column_name = 'status'
  ) THEN
    ALTER TABLE participants ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE participants
      ALTER COLUMN status TYPE "ParticipantStatus" USING status::"ParticipantStatus";
    ALTER TABLE participants ALTER COLUMN status SET DEFAULT 'ACTIVE'::"ParticipantStatus";
  END IF;
END
$$;
