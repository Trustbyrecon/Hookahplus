# Verify Production Database Connection

## Quick Verification Steps

### 1. Check Vercel Environment Variables
1. Go to: https://vercel.com/dashboard
2. Select project: `hookahplus-app`
3. Navigate to: **Settings** → **Environment Variables**
4. Verify `DATABASE_URL` exists with value:
   ```
   postgresql://postgres:E1hqrL3FjsWVItZR@hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres?sslmode=require
   ```
5. Verify environment is set to **Production** ✅

### 2. Verify RLS Policies in Supabase
1. Go to: https://supabase.com/dashboard
2. Select project: `hsypmyqtlxjwpnkkacmo`
3. Navigate to: **SQL Editor**
4. Run verification query:
   ```sql
   SELECT 
     tablename,
     policyname,
     cmd as "Command"
   FROM pg_policies 
   WHERE schemaname = 'public' 
     AND tablename = 'Session'
   ORDER BY policyname;
   ```
5. Expected policies:
   - "Allow session inserts" (FOR INSERT)
   - "Allow session updates" (FOR UPDATE)
   - "Allow session deletes" (FOR DELETE)
   - "Service role can manage sessions" (FOR ALL)
   - "Users can read own sessions alt" (FOR SELECT)

### 3. Test Database Connection
After redeploying with DATABASE_URL:

1. **Via API Test:**
   ```bash
   curl -X POST https://app.hookahplus.net/api/sessions \
     -H "Content-Type: application/json" \
     -d '{
       "tableId": "T-TEST",
       "customerName": "Test Customer",
       "flavor": "Blue Mist",
       "amount": 3000
     }'
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "session": {
       "id": "...",
       "tableId": "T-TEST",
       "status": "NEW"
     },
     "message": "Session created successfully"
   }
   ```

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments → Latest → Functions → View Logs
   - Look for: `[Sessions API] Database connection successful`
   - Should NOT see: `Database connection failed`

### 4. Verify Session Persistence
1. Create session via Fire Session Dashboard UI
2. Check Prisma Studio or Supabase Table Editor
3. Session should appear in `Session` table
4. Dashboard should refresh and show the session

## Troubleshooting

### If Connection Still Fails

**Check Connection String Format:**
- Must start with `postgresql://`
- Must include `?sslmode=require` at the end
- No spaces or extra characters

**Check Supabase Project:**
- Verify project is active (not paused)
- Check project URL matches: `hsypmyqtlxjwpnkkacmo.supabase.co`
- Verify database password is correct

**Check RLS Policies:**
- If INSERT fails, run migration: `supabase/migrations/20251106000001_fix_session_insert_policy.sql`
- Verify policies allow INSERT/UPDATE/DELETE

**Check Vercel Deployment:**
- Ensure environment variable is set for **Production** environment
- Redeploy after adding variable
- Check deployment logs for errors

## Success Indicators

✅ Database connection successful in API logs  
✅ Session creation API returns 200 status  
✅ Session appears in database  
✅ Dashboard shows created session  
✅ No "Database connection failed" errors in console

