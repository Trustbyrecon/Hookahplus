# Debug Environment Variable Loading

**Agent:** Noor (session_agent)  
**Date:** 2025-01-14

---

## Current Issue

The app build API is returning 500 errors because `DATABASE_URL` is not being loaded from `.env.local`.

**Error:**
```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

---

## Diagnostic Steps

### 1. Check Server Logs

In the terminal where `npm run dev` is running, look for:
- `[db.ts] ✅ Loaded DATABASE_URL from .env.local` (success)
- `[db.ts] ⚠️ Could not load .env.local` (failure)
- `[Sessions API] ❌ DATABASE_URL is not set!` (diagnostic message)

### 2. Verify .env.local Location

```bash
cd apps/app
ls -la .env.local
cat .env.local | grep DATABASE_URL
```

### 3. Test Direct Loading

```bash
cd apps/app
node -e "require('dotenv').config({path:'.env.local'}); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0,20) + '...)' : 'NOT SET')"
```

### 4. Check API Response

```bash
curl http://localhost:3002/api/sessions
```

Look for the `diagnostic` object in the error response.

---

## Root Cause

Next.js should automatically load `.env.local`, but PrismaClient initializes at module load time, which might happen before Next.js loads environment variables.

---

## Solution Applied

1. ✅ Added explicit dotenv loading in `db.ts`
2. ✅ Added diagnostic logging in `GET /api/sessions`
3. ⏳ Need to verify server logs to confirm if dotenv is loading

---

## Next Steps

1. **Check server terminal** for `[db.ts]` and `[Sessions API]` log messages
2. **Verify .env.local** exists and has correct format
3. **If still failing**, try lazy initialization of Prisma client

---

**Status:** ⏳ **Waiting for server log confirmation**

