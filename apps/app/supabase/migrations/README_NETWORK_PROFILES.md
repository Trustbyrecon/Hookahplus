# Network Profiles Migration SQL

## Quick Start

1. Open your Supabase SQL Editor (or your database admin tool)
2. Copy the contents of `20250125000002_add_network_profiles_and_hid.sql`
3. Paste and run the SQL script
4. Verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'network_%';
   ```

## What This Migration Creates

### Tables
- **network_profiles** - Core network customer profiles with HID
- **network_preferences** - Customer flavor and device preferences
- **network_badges** - Network and lounge-scoped badges
- **network_sessions** - Cross-lounge session history
- **network_session_notes** - Shareable session notes
- **network_pii_links** - PII hash mappings for HID resolution

### Columns Added
- **Session.hid** - Optional link to network profile
- **session_notes.share_scope** - 'lounge' or 'network' scope

### Indexes
- All tables have appropriate indexes for performance
- Foreign key indexes for joins

## Verification

After running the migration, verify with:

```sql
-- Check tables exist
SELECT COUNT(*) FROM network_profiles;
SELECT COUNT(*) FROM network_preferences;
SELECT COUNT(*) FROM network_badges;
SELECT COUNT(*) FROM network_sessions;
SELECT COUNT(*) FROM network_session_notes;
SELECT COUNT(*) FROM network_pii_links;

-- Check columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Session' AND column_name = 'hid';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'session_notes' AND column_name = 'share_scope';
```

## Rollback (if needed)

If you need to rollback, run:

```sql
-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS "network_pii_links" CASCADE;
DROP TABLE IF EXISTS "network_session_notes" CASCADE;
DROP TABLE IF EXISTS "network_sessions" CASCADE;
DROP TABLE IF EXISTS "network_badges" CASCADE;
DROP TABLE IF EXISTS "network_preferences" CASCADE;
DROP TABLE IF EXISTS "network_profiles" CASCADE;

-- Remove columns
ALTER TABLE "Session" DROP COLUMN IF EXISTS "hid";
ALTER TABLE "session_notes" DROP COLUMN IF EXISTS "share_scope";

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Next Steps

1. Set `HID_SALT` environment variable in your `.env.local`
2. Regenerate Prisma Client: `npx prisma generate`
3. (Optional) Run data migration: `npx tsx scripts/migrate-to-network-profiles.ts`
4. Test the APIs:
   - `POST /api/hid/resolve`
   - `GET /api/profiles/{hid}`

