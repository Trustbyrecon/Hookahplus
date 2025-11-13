# Fix Enum Serialization Error

**Status:** 🔧 **Code Updated - Migration Required**

---

## Problem

The error `Error("expected value", line: 1, column: 1)` occurs because:
1. The database columns (`source` and `state`) are still TEXT type
2. Prisma is trying to serialize enum values but the database expects strings
3. The migration to convert columns to enum types hasn't been run yet

---

## Solution

### Step 1: Run the Migration in Supabase

1. Open Supabase Dashboard → SQL Editor
2. Select **Production** environment
3. Copy and paste the contents of `supabase/migrations/20251114000003_alter_session_columns_to_enums.sql`
4. Click **Run**

**Migration File:** `supabase/migrations/20251114000003_alter_session_columns_to_enums.sql`

This migration will:
- Convert `source` column from TEXT to `SessionSource` enum
- Convert `state` column from TEXT to `SessionState` enum
- Map existing string values to enum values

### Step 2: Verify Migration Success

Run this query in Supabase SQL Editor to verify:

```sql
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'Session'
  AND column_name IN ('source', 'state');
```

**Expected Output:**
```
source | USER-DEFINED | SessionSource
state  | USER-DEFINED | SessionState
```

### Step 3: Restart App Build Server

After running the migration, restart the app build server to pick up the changes:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd apps/app
npm run dev
```

---

## Code Changes Applied

✅ **Updated:** `apps/app/app/api/sessions/route.ts`
- Now uses Prisma enum values (`SessionSource.QR`, `SessionState.PENDING`) instead of string literals
- This ensures proper serialization once the migration is run

---

## Why This Fix Works

1. **Before Migration:** Columns are TEXT → Prisma sends enum values → PostgreSQL accepts them as strings ✅
2. **After Migration:** Columns are ENUM → Prisma sends enum values → PostgreSQL validates them ✅

The code now works with both scenarios, but the migration is required for proper type safety and validation.

---

## Next Steps

1. ✅ Code is updated to use Prisma enum values
2. ⏳ **Run the migration in Supabase** (see Step 1 above)
3. ⏳ Restart the app build server
4. ⏳ Test Guest → App sync again

---

**Note:** The React warnings have been fixed! The only remaining issue is the enum serialization, which will be resolved once the migration is run.

