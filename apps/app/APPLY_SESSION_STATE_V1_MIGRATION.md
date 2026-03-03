# Apply sessionStateV1 Migration

## Quick Fix for Load Testing

The `sessionStateV1` column is missing from the database. Apply the migration to add it.

## Option 1: Supabase SQL Editor (Recommended - 2 minutes)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy Migration SQL:**
   - Open: `supabase/migrations/20251115000001_add_taxonomy_v1_columns.sql`
   - Copy the entire file contents (lines 1-250)

4. **Paste and Run:**
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for completion (~5 seconds)

5. **Verify:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
     AND table_name = 'Session' 
     AND column_name IN ('session_state_v1', 'paused');
   ```
   - Should return 2 rows

## Option 2: Quick Workaround (Temporary)

If you need to test load testing immediately without applying the migration, you can temporarily comment out `sessionStateV1` in the Prisma schema:

1. **Edit `apps/app/prisma/schema.prisma`:**
   - Find line with `sessionStateV1  String?`
   - Comment it out: `// sessionStateV1  String?`

2. **Regenerate Prisma Client:**
   ```bash
   cd apps/app
   npx prisma generate
   ```

3. **Restart server and test**

**Note:** This is temporary. Apply the migration for production.

## After Migration Applied

1. **Restart the dev server** (if running)
2. **Test session creation:**
   ```bash
   curl -s -i -X POST http://localhost:3002/api/sessions \
     -H "Content-Type: application/json" \
     -d '{"tableId":"BENCH-001","customerName":"Load","flavor":["Mint"],"source":"QR"}'
   ```

3. **Run load tests:**
   ```bash
   npx tsx scripts/performance/run-all.ts --base http://localhost:3002 --concurrency 10,50,100
   ```

## Expected Results

- ✅ Session creation succeeds (200 OK)
- ✅ 10 concurrent: ≥95% success
- ✅ 50 concurrent: ≥90% success  
- ✅ 100 concurrent: ≥80% success

