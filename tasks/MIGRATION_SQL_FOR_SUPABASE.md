# Migration SQL for Supabase SQL Editor

**File:** `supabase/migrations/20251114000001_add_external_ref_column.sql`  
**Purpose:** Add `externalRef` column to Session table  
**Status:** Ready to execute

---

## Copy This SQL Into Supabase SQL Editor

```sql
-- Migration: Add externalRef column to Session table
-- This column was missing from the previous migration but is required by Prisma schema

-- Add externalRef column if it doesn't exist
ALTER TABLE public."Session" 
ADD COLUMN IF NOT EXISTS "externalRef" TEXT;

-- Add index for externalRef (if index doesn't exist)
CREATE INDEX IF NOT EXISTS idx_session_external_ref ON public."Session"("externalRef");

-- Add comment
COMMENT ON COLUMN public."Session"."externalRef" IS 'External reference: qrToken | reservationId | stripeCheckoutId';
```

---

## Steps to Execute

1. **Open Supabase SQL Editor:**
   - Go to https://supabase.com/dashboard
   - Select your project (HookahPlus)
   - Click "SQL Editor" → "New query"

2. **Clear the editor** (remove any existing content)

3. **Copy and paste the SQL above** into the editor

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify Success:**
   - Should see "Success. No rows returned" or similar
   - No error messages

---

## Verification Queries

After running the migration, verify it worked:

### Check Column Exists
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Session' AND column_name = 'externalRef';
```

**Expected Result:** Should return 1 row showing the `externalRef` column

### Check Index Exists
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'Session' AND indexname = 'idx_session_external_ref';
```

**Expected Result:** Should return 1 row showing the index definition

### Test Query
```sql
SELECT "externalRef" FROM "Session" LIMIT 1;
```

**Expected Result:** Should execute without errors (may return NULL values)

---

## Troubleshooting

### If Column Already Exists
- The migration uses `IF NOT EXISTS`, so it's safe to run again
- You'll see a notice but no error

### If Index Already Exists
- The migration uses `IF NOT EXISTS`, so it's safe to run again
- You'll see a notice but no error

### If You Get Permission Errors
- Make sure you're using the correct database role
- Check that you have ALTER TABLE permissions

---

**Next Steps After Migration:**
1. Regenerate Prisma client: `npx prisma generate`
2. Restart app build server
3. Test Guest → App sync
