# Server Restart Instructions

**Agent:** Noor (session_agent) + deployment_agent  
**Date:** 2025-01-14  
**Status:** ⏳ Manual restart required

---

## Issue

The app build server is using a cached Prisma client that doesn't recognize the new `externalRef` column, even though:
- ✅ Migration executed successfully in Supabase
- ✅ Prisma client regenerated
- ✅ Verification script confirms column exists

---

## Solution: Manual Server Restart

### Step 1: Stop Current Server

**Option A: If server is running in terminal:**
- Press `Ctrl+C` to stop the server

**Option B: If server is running in background:**
- Find the process:
  ```bash
  netstat -ano | findstr :3002
  ```
- Kill the process (replace `PID` with actual process ID):
  ```bash
  taskkill /PID <PID> /F
  ```

### Step 2: Restart Server

```bash
cd apps/app
npm run dev
```

### Step 3: Wait for Server to Start

Wait ~15-20 seconds for the server to fully initialize.

### Step 4: Verify Server is Running

```bash
curl http://localhost:3002/api/sessions
```

Should return JSON (even if empty array `[]`), not a 500 error.

### Step 5: Re-run Guest → App Sync Test

```bash
npx tsx scripts/test-guest-app-sync.ts
```

---

## Expected Results After Restart

✅ **GET /api/sessions** - Should return 200 with sessions array  
✅ **POST /api/sessions** - Should create session successfully  
✅ **Guest → App Sync** - Should work end-to-end

---

## Why This Happens

Next.js dev server caches the Prisma client instance. When the database schema changes, the server needs to be restarted to pick up the new Prisma client that's aware of the new column.

---

## Alternative: Force Prisma Client Reload

If restart doesn't work, try:

```bash
# Delete Prisma client cache
rm -rf node_modules/.prisma
# Or on Windows:
rmdir /s /q node_modules\.prisma

# Regenerate
npx prisma generate

# Restart server
npm run dev
```

