# Database Connection Diagnosis

## Current Situation

### Supabase Status: ✅ HEALTHY
- All services (Database, PostgREST, Auth, Realtime, Storage) are **Healthy**
- Project is **Active** (not paused)
- Recent activity detected (1 REST request, 1 Auth request)

### Application Status: ❌ CONNECTION FAILING
- Error: "Can't reach database server at `hsypmyqtlxjwpnkkacmo.supabase.co:5432`"
- Connection string format: ✅ Correct
- SSL mode: ✅ Configured (`?sslmode=require`)

## Root Cause Analysis

Since Supabase is healthy but the connection fails, the issue is likely:

### 1. Network/Firewall Blocking Port 5432 (Most Likely)
**Symptom:** "Can't reach database server"  
**Cause:** Local network or firewall blocking outbound connections to port 5432  
**Solution:**
- Check if port 5432 is blocked by firewall
- Try connecting from a different network
- Check if VPN is blocking the connection
- Try using Supabase's connection pooler (port 6543)

### 2. Dev Server Not Loading .env.local
**Symptom:** Connection fails even though .env.local exists  
**Cause:** Next.js dev server might not have reloaded environment variables  
**Solution:**
1. Stop the dev server (Ctrl+C)
2. Restart the dev server: `npm run dev`
3. Environment variables should reload automatically

### 3. Prisma Client Not Regenerated
**Symptom:** Connection fails with old connection string  
**Cause:** Prisma client was generated before DATABASE_URL was updated  
**Solution:**
```bash
cd apps/app
npx prisma generate
```

## Immediate Fix Steps

### Step 1: Verify .env.local is Loaded
Check if the dev server is reading the environment variable:
```bash
# In the dev server terminal, you should see logs like:
# [Sessions API] Database connection successful
# OR
# [Sessions API] Database connection failed: ...
```

### Step 2: Restart Dev Server
If environment variables aren't loading:
1. Stop all dev servers (Ctrl+C)
2. Restart: `npm run dev:all`
3. Test connection again

### Step 3: Try Connection Pooler
If direct connection (port 5432) is blocked, try pooler (port 6543):

**Get correct pooler URL from Supabase:**
1. Go to Supabase Dashboard → Settings → Database
2. Scroll to "Connection Pooling"
3. Copy the "Connection string" (Session mode)
4. Format: `postgresql://postgres.hsypmyqtlxjwpnkkacmo:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require`

**Update .env.local:**
```env
DATABASE_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:E1hqrL3FjsWVItZR@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Step 4: Check Network Access
Test if you can reach Supabase:
```bash
# Test API endpoint (should work)
curl https://hsypmyqtlxjwpnkkacmo.supabase.co

# Test direct database connection (might be blocked)
telnet hsypmyqtlxjwpnkkacmo.supabase.co 5432
```

## Alternative: Use Supabase Connection String from Dashboard

The most reliable way is to get the exact connection string from Supabase:

1. Go to: https://supabase.com/dashboard/project/hsypmyqtlxjwpnkkacmo
2. Navigate to: **Settings** → **Database**
3. Scroll to **Connection string** section
4. Select **URI** tab
5. Copy the connection string (it will have the correct format)
6. Update `.env.local` with the exact string from Supabase

## Test After Fix

```bash
# Test connection
cd apps/app
node test-db-connection.js

# Test via API
curl -X POST http://localhost:3002/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"tableId":"T-TEST","customerName":"Test","flavor":"Blue Mist"}'
```

## Expected Success Indicators

✅ `[Sessions API] Database connection successful` in server logs  
✅ API returns 200 status with session data  
✅ No "Database connection failed" errors in console  
✅ Session appears in database (check Prisma Studio)

## Files Reference

- `apps/app/test-db-connection.js` - Direct connection test
- `apps/app/test-db-connection-pooler.js` - Pooler connection test
- `apps/app/.env.local` - Environment variables (verify DATABASE_URL is correct)

