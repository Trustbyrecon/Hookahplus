-- Session participant model for deterministic table->session mapping.
-- Adds participants and participant preferences plus lookup indexes.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'SessionState'
  ) THEN
    BEGIN
      ALTER TYPE "SessionState" ADD VALUE IF NOT EXISTS 'REFUNDED';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$;

-- ParticipantStatus enum required by Prisma
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t WHERE t.typname = 'ParticipantStatus') THEN
    CREATE TYPE "ParticipantStatus" AS ENUM ('ACTIVE', 'LEFT');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS participants (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id text NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  identity_key text NOT NULL,
  display_name text NOT NULL DEFAULT 'Guest',
  status "ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participant_prefs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  participant_id text NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  flavor_profile jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Session uses camelCase columns (loungeId, tableId) in production
CREATE INDEX IF NOT EXISTS idx_session_lounge_table_state ON "Session"("loungeId", "tableId", state);
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_identity_key ON participants(identity_key);
CREATE INDEX IF NOT EXISTS idx_participants_session_identity_status ON participants(session_id, identity_key, status);
CREATE INDEX IF NOT EXISTS idx_participant_prefs_participant_id ON participant_prefs(participant_id);
