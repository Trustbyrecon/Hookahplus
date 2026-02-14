# 🔧 Fix Database Schema - Missing Columns

## Root Cause
The database connection works, but the `Session` table is **missing critical columns** required by the Prisma schema. This causes:
- ❌ Session creation fails (500 error)
- ❌ "Unable to connect to database" error (actually schema mismatch)
- ❌ Guest build sessions can't sync to FSD

## Missing Columns
The `Session` table is missing these required columns:
- `tableId` ⚠️ **CRITICAL** - Required for all sessions
- `customerRef` - Customer name
- `flavor` - Flavor selection
- `priceCents` - Session price
- `assignedBOHId` - BOH staff
- `assignedFOHId` - FOH staff
- `startedAt`, `endedAt` - Timestamps
- `durationSecs` - Session duration
- Timer fields, zone, notes, etc.

## ✅ Solution: Run Migration

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `hsypmyqtlxjwpnkkacmo`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration
Copy and paste the entire contents of:
```
supabase/migrations/20251112000001_add_missing_session_columns.sql
```

Then click **Run** (or press Ctrl+Enter)

### Step 3: Verify Migration Success
After running, verify the columns were added:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Session' 
AND table_schema = 'public'
AND column_name IN ('tableId', 'customerRef', 'flavor', 'priceCents')
ORDER BY column_name;
```

You should see all 4 columns listed.

### Step 4: Test Connection
Run the comprehensive test:
```bash
cd apps/app
node test-db-connection-comprehensive.js
```

All tests should now pass, including:
- ✅ Database connection
- ✅ Database query
- ✅ Table structure check
- ✅ Write operation test

### Step 5: Restart Dev Server
If the dev server is running:
1. Stop it (Ctrl+C)
2. Restart: `npm run dev`

## Expected Results After Fix

### FSD Session Creation
- ✅ "New Session" button works
- ✅ Sessions save to database
- ✅ Sessions appear in dashboard
- ✅ No more 500 errors

### Guest Build → FSD Sync
- ✅ Guest sessions create entries in FSD
- ✅ Sessions visible in Fire Session Dashboard
- ✅ Real-time updates work

### Error Messages
- ✅ No more "Unable to connect to database"
- ✅ No more "Using demo data" errors
- ✅ Real data displays correctly

## Current Test Results
```
✅ DATABASE_URL is set
✅ Prisma connection successful
✅ Database query successful (0 sessions)
❌ Table structure check failed (missing tableId)
❌ Write operation failed (missing tableId)
```

After migration:
```
✅ All tests pass
✅ Session creation works
✅ Database fully functional
```

