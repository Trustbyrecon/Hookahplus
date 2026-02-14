-- Migration: Add Network Profiles and HID Resolver System
-- Date: 2025-01-25
-- Description: Creates network-wide customer identity layer with HID resolver

-- ============================================================================
-- 1. Add share_scope column to session_notes table
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_notes' AND column_name = 'share_scope'
  ) THEN
    ALTER TABLE "session_notes" 
    ADD COLUMN "share_scope" TEXT DEFAULT 'lounge';
    
    -- Add check constraint
    ALTER TABLE "session_notes" 
    ADD CONSTRAINT "session_notes_share_scope_check" 
    CHECK ("share_scope" IN ('lounge', 'network'));
  END IF;
END $$;

-- Add index for share_scope
CREATE INDEX IF NOT EXISTS "idx_session_note_share_scope" 
ON "session_notes"("share_scope");

-- ============================================================================
-- 2. Add hid column to Session table
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Session' AND column_name = 'hid'
  ) THEN
    ALTER TABLE "Session" ADD COLUMN "hid" TEXT;
    
    -- Add index for hid
    CREATE INDEX IF NOT EXISTS "idx_session_hid" ON "Session"("hid");
  END IF;
END $$;

-- ============================================================================
-- 3. Create network_profiles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "network_profiles" (
  "id" TEXT NOT NULL,
  "hid" TEXT NOT NULL UNIQUE,
  "phone_hash" TEXT,
  "email_hash" TEXT,
  "consent_level" TEXT NOT NULL DEFAULT 'shadow',
  "tier" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "network_profiles_pkey" PRIMARY KEY ("id")
);

-- Indexes for network_profiles
CREATE INDEX IF NOT EXISTS "idx_network_profile_hid" ON "network_profiles"("hid");
CREATE INDEX IF NOT EXISTS "idx_network_profile_phone_hash" ON "network_profiles"("phone_hash");
CREATE INDEX IF NOT EXISTS "idx_network_profile_email_hash" ON "network_profiles"("email_hash");
CREATE INDEX IF NOT EXISTS "idx_network_profile_consent" ON "network_profiles"("consent_level");

-- ============================================================================
-- 4. Create network_preferences table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "network_preferences" (
  "id" TEXT NOT NULL,
  "hid" TEXT NOT NULL UNIQUE,
  "top_flavors" JSONB,
  "flavor_vector" TEXT,
  "device_prefs" JSONB,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "network_preferences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "network_preferences_hid_fkey" FOREIGN KEY ("hid") 
    REFERENCES "network_profiles"("hid") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_network_preference_hid" ON "network_preferences"("hid");

-- ============================================================================
-- 5. Create network_badges table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "network_badges" (
  "id" TEXT NOT NULL,
  "hid" TEXT NOT NULL,
  "badge_code" TEXT NOT NULL,
  "awarded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "meta" JSONB,
  CONSTRAINT "network_badges_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "network_badges_hid_fkey" FOREIGN KEY ("hid") 
    REFERENCES "network_profiles"("hid") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "idx_network_badge_unique" UNIQUE ("hid", "badge_code")
);

CREATE INDEX IF NOT EXISTS "idx_network_badge_hid" ON "network_badges"("hid");
CREATE INDEX IF NOT EXISTS "idx_network_badge_code" ON "network_badges"("badge_code");

-- ============================================================================
-- 6. Create network_sessions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "network_sessions" (
  "id" TEXT NOT NULL,
  "hid" TEXT NOT NULL,
  "session_id" TEXT NOT NULL UNIQUE,
  "lounge_id" TEXT NOT NULL,
  "start_ts" TIMESTAMPTZ(6),
  "end_ts" TIMESTAMPTZ(6),
  "items" JSONB,
  "spend_cents" INTEGER,
  "pos_ref" TEXT,
  "rating" INTEGER,
  CONSTRAINT "network_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "network_sessions_hid_fkey" FOREIGN KEY ("hid") 
    REFERENCES "network_profiles"("hid") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_network_session_hid" ON "network_sessions"("hid");
CREATE INDEX IF NOT EXISTS "idx_network_session_session_id" ON "network_sessions"("session_id");
CREATE INDEX IF NOT EXISTS "idx_network_session_lounge_id" ON "network_sessions"("lounge_id");

-- ============================================================================
-- 7. Create network_session_notes table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "network_session_notes" (
  "id" TEXT NOT NULL,
  "hid" TEXT NOT NULL,
  "note_id" TEXT NOT NULL UNIQUE,
  "lounge_id" TEXT NOT NULL,
  "staff_id" TEXT,
  "note_text" TEXT NOT NULL,
  "share_scope" TEXT NOT NULL DEFAULT 'lounge',
  "tags" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "network_session_notes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "network_session_notes_hid_fkey" FOREIGN KEY ("hid") 
    REFERENCES "network_profiles"("hid") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "network_session_notes_share_scope_check" 
    CHECK ("share_scope" IN ('lounge', 'network'))
);

CREATE INDEX IF NOT EXISTS "idx_network_session_note_hid" ON "network_session_notes"("hid");
CREATE INDEX IF NOT EXISTS "idx_network_session_note_lounge_id" ON "network_session_notes"("lounge_id");
CREATE INDEX IF NOT EXISTS "idx_network_session_note_scope" ON "network_session_notes"("share_scope");

-- ============================================================================
-- 8. Create network_pii_links table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "network_pii_links" (
  "id" TEXT NOT NULL,
  "hid" TEXT NOT NULL,
  "pii_type" TEXT NOT NULL,
  "pii_hash" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "verified_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "network_pii_links_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "network_pii_links_hid_fkey" FOREIGN KEY ("hid") 
    REFERENCES "network_profiles"("hid") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "idx_network_pii_unique" UNIQUE ("pii_type", "pii_hash")
);

CREATE INDEX IF NOT EXISTS "idx_network_pii_hid" ON "network_pii_links"("hid");
CREATE INDEX IF NOT EXISTS "idx_network_pii_hash" ON "network_pii_links"("pii_hash");

-- ============================================================================
-- 9. Add foreign key from Session to network_profiles
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Session_hid_fkey'
  ) THEN
    ALTER TABLE "Session" 
    ADD CONSTRAINT "Session_hid_fkey" 
    FOREIGN KEY ("hid") 
    REFERENCES "network_profiles"("hid") 
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 10. Create function to update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for network_profiles
DROP TRIGGER IF EXISTS update_network_profiles_updated_at ON "network_profiles";
CREATE TRIGGER update_network_profiles_updated_at
  BEFORE UPDATE ON "network_profiles"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for network_preferences
DROP TRIGGER IF EXISTS update_network_preferences_updated_at ON "network_preferences";
CREATE TRIGGER update_network_preferences_updated_at
  BEFORE UPDATE ON "network_preferences"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Tables created:
--   - network_profiles (core customer profiles)
--   - network_preferences (flavor and device preferences)
--   - network_badges (network-wide badges)
--   - network_sessions (cross-lounge session history)
--   - network_session_notes (shareable session notes)
--   - network_pii_links (PII hash mappings)
--
-- Columns added:
--   - Session.hid (link to network profile)
--   - session_notes.share_scope (lounge | network)
--
-- Next steps:
--   1. Set HID_SALT environment variable
--   2. Run migration script: npx tsx scripts/migrate-to-network-profiles.ts
--   3. Test HID resolution API: POST /api/hid/resolve
-- ============================================================================

