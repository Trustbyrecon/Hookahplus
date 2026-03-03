# Production Database Connection Fix

**Agent:** Noor (session_agent)  
**Date:** 2025-01-14  
**Status:** 🔧 **Action Required**

---

## Current Error

```
Can't reach database server at `hsypmyqtlxjwpnkkacmo.supabase.co:5432`
```

**Root Cause:** The production app build in Vercel either:
1. Doesn't have `DATABASE_URL` set, OR
2. Is using direct connection (port 5432) which may be blocked for serverless functions

---

## Solution: Use Connection Pooler

For Vercel serverless functions, **use the connection pooler** instead of direct connection.

### Step 1: Get Connection Pooler URL from Supabase

1. Go to: https://supabase.com/dashboard
2. Select project: `hsypmyqtlxjwpnkkacmo`
3. Navigate to: **Settings** → **Database**
4. Scroll to **Connection Pooling**
5. Copy the **Session Mode** connection string
6. It should look like:
   ```
   postgresql://postgres.hsypmyqtlxjwpnkkacmo:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require
   ```

### Step 2: Add DATABASE_URL to Vercel (App Build)

1. Go to: https://vercel.com/dashboard
2. Select project: **hookahplus-app** (your app build project)
3. Navigate to: **Settings** → **Environment Variables**
4. Click **"Add New"** (or edit existing `DATABASE_URL`)
5. Enter:
   - **Key:** `DATABASE_URL`
   - **Value:** Connection pooler string from Step 1
   - **Environments:** Select **Production** ✅ (and Preview if needed)
6. Click **"Save"**

### Step 3: Redeploy App Build

1. Go to **Deployments** tab
2. Click **"..."** menu on latest deployment
3. Select **"Redeploy"**
4. Wait for build to complete (~2-3 minutes)

---

## Connection String Formats

### ❌ Direct Connection (May Not Work on Vercel)
```
postgresql://postgres:E1hqrL3FjsWVItZR@hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres?sslmode=require
```

### ✅ Connection Pooler (Recommended for Vercel)
```
postgresql://postgres.hsypmyqtlxjwpnkkacmo:E1hqrL3FjsWVItZR@aws-0-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require
```

**Key Differences:**
- Username: `postgres.hsypmyqtlxjwpnkkacmo` (includes project ref)
- Host: `aws-0-us-east-2.pooler.supabase.com` (pooler endpoint)
- Port: `6543` (pooler port, not 5432)

---

## Verification

After redeploying:

1. **Test API Endpoint:**
   ```bash
   curl https://app.hookahplus.net/api/sessions
   ```
   Should return: `{"success": true, "sessions": [], ...}`

2. **Test Guest → App Sync:**
   - Create session from guest build
   - Check console - should see sync success
   - Session should appear in app build's Fire Session Dashboard

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments → Latest → Functions → View Logs
   - Should see: `[Sessions API] Database connection successful`
   - Should NOT see: `Can't reach database server`

---

## Why Connection Pooler?

Vercel serverless functions:
- Have connection limits
- May be blocked from direct database connections
- Benefit from connection pooling for better performance
- Connection pooler handles connection management automatically

---

## Quick Checklist

- [ ] Get connection pooler URL from Supabase Dashboard
- [ ] Add `DATABASE_URL` to Vercel (app build project)
- [ ] Set environment to **Production**
- [ ] Redeploy app build
- [ ] Test API endpoint
- [ ] Test guest → app sync
- [ ] Verify in Vercel logs

---

**Status:** ⏳ **Waiting for DATABASE_URL to be set in Vercel with connection pooler format**

