# 🔧 Fix Production Database Connection

## Current Issue
The production app at `app.hookahplus.net` is showing "Database connection failed" errors because `DATABASE_URL` is not configured in Vercel's environment variables.

## ✅ Solution: Add DATABASE_URL to Vercel

### Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project: `hookahplus-app` (or your app project name)
3. Navigate to: **Settings** → **Environment Variables**

### Step 2: Add DATABASE_URL
1. Click **"Add New"** button
2. Enter:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:E1hqrL3FjsWVItZR@hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres?sslmode=require`
   - **Environment:** Select **Production** ✅ (and optionally Preview/Development)
3. Click **"Save"**

### Step 3: Redeploy
After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Wait for the build to complete

## 🔍 Verification

After redeploying, test the connection:
1. Go to `app.hookahplus.net/fire-session-dashboard`
2. Try creating a new session
3. Check browser console - should see no "Database connection failed" errors
4. Check server logs in Vercel Dashboard → Deployment → Functions → View Logs

## 📝 Additional Environment Variables to Check

While you're in the Vercel environment variables, also verify these are set for Production:

- `SUPABASE_URL` = `https://hsypmyqtlxjwpnkkacmo.supabase.co`
- `NODE_ENV` = `production`
- `NEXT_PUBLIC_USE_DEMO_MODE` = `false` (or not set)

## 🐛 If Still Failing

### Check Connection String Format
The connection string must include:
- ✅ `postgresql://` protocol
- ✅ Username: `postgres`
- ✅ Password: `E1hqrL3FjsWVItZR`
- ✅ Host: `hsypmyqtlxjwpnkkacmo.supabase.co`
- ✅ Port: `5432`
- ✅ Database: `postgres`
- ✅ SSL: `?sslmode=require`

### Check Supabase Project Status
1. Go to: https://supabase.com/dashboard
2. Verify project `hsypmyqtlxjwpnkkacmo` is active
3. Check **Settings** → **Database** → **Connection string** matches

### Check RLS Policies
If connection works but INSERT fails:
1. Go to Supabase Dashboard → **SQL Editor**
2. Run the migration: `supabase/migrations/20251106000001_fix_session_insert_policy.sql`
3. Verify RLS policies allow INSERT/UPDATE/DELETE

## 📋 Quick Reference

**Vercel Environment Variable:**
```
Name: DATABASE_URL
Value: postgresql://postgres:E1hqrL3FjsWVItZR@hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres?sslmode=require
Environment: Production
```

**Supabase Project:**
- URL: `https://hsypmyqtlxjwpnkkacmo.supabase.co`
- Database: PostgreSQL
- SSL Required: Yes

