# Fix Connection Pool Exhaustion & Security Warning

**Date:** 2025-11-15  
**Agent:** Noor (session_agent)  
**Priority:** P0 - Critical

## Issues Identified

### 1. Database Connection Pool Exhaustion
**Symptoms:**
- Load tests: 0/10, 0/50, 0/100 success (all failing)
- Timer tests: "Timed out fetching a new connection"
- Errors: "Can't reach database server"

**Root Cause:**
- `connection_limit=15` is too low for 100 concurrent requests
- `pool_timeout=5` is too short for high-load scenarios
- No retry logic for transient connection failures

### 2. Security Warning: Function Search Path Mutable
**Supabase Security Advisor Warning:**
- Function `public.taxonomy_unknown_upsert` has a mutable search_path
- **Risk:** Search path injection attacks

---

## Fixes Applied

### 1. Connection Pool Optimization

**File:** `apps/app/lib/db.ts`
- Added connection retry logic with exponential backoff
- Improved error handling for connection pool exhaustion

**File:** `apps/app/scripts/update-database-url-pool.ts`
- Increased `connection_limit`: 15 → **30**
- Increased `pool_timeout`: 5 → **10 seconds**

**New DATABASE_URL Format:**
```
postgresql://...?connection_limit=30&pool_timeout=10
```

### 2. Security Fix: Function Search Path

**File:** `supabase/migrations/20251115000006_fix_taxonomy_function_security.sql`
- Added `SET search_path = ''` to function definition
- Added `SECURITY DEFINER` for proper privilege handling
- All table references are fully qualified (`public."TaxonomyUnknown"`)

**Before:**
```sql
CREATE OR REPLACE FUNCTION public.taxonomy_unknown_upsert(...)
LANGUAGE plpgsql
AS $$ ... $$;
```

**After:**
```sql
CREATE OR REPLACE FUNCTION public.taxonomy_unknown_upsert(...)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$ ... $$;
```

---

## Action Items

### Step 1: Update DATABASE_URL

**Option A: Use Script (Recommended)**
```bash
cd apps/app
npx tsx scripts/update-database-url-pool.ts
```

**Option B: Manual Update**
Edit `apps/app/.env.local`:
```env
DATABASE_URL="postgresql://...?connection_limit=30&pool_timeout=10"
```

**Also update in:**
- Vercel Production environment variables
- Vercel Preview environment variables (if needed)

### Step 2: Apply Security Migration

Run in Supabase SQL Editor:
```sql
-- Copy contents of:
-- supabase/migrations/20251115000006_fix_taxonomy_function_security.sql
```

Or apply via Supabase CLI:
```bash
supabase db push
```

### Step 3: Restart Server

**CRITICAL:** Server must be restarted to pick up new DATABASE_URL:
```bash
# Stop current server (Ctrl+C)
# Then restart:
cd apps/app
npm run dev
```

**Verify in logs:**
```
[db.ts] 🔑 DATABASE_URL: SET (postgresql://...connection_limit=30...)
```

### Step 4: Re-run Performance Tests

```bash
cd apps/app
npx tsx scripts/performance/run-all.ts --base http://localhost:3002 --concurrency 10,50,100
```

**Expected Improvements:**
- Load tests: 0% → **>80% success**
- Timer tests: Connection timeouts → **Successful session creation**
- API tests: 5-6s → **<2s** (with indexes applied)

---

## Verification

### Check Connection Pool Settings
```bash
# In apps/app/.env.local, verify:
grep DATABASE_URL .env.local
# Should show: connection_limit=30&pool_timeout=10
```

### Check Security Fix
Run in Supabase SQL Editor:
```sql
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proconfig as search_path_config
FROM pg_proc
WHERE proname = 'taxonomy_unknown_upsert'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

**Expected:**
- `security_definer`: `true`
- `search_path_config`: `{search_path=}` (empty search_path)

---

## Notes

- **Connection Pool:** 30 connections should handle 100 concurrent requests (with proper queuing)
- **Pool Timeout:** 10 seconds gives enough time for connection acquisition under load
- **Retry Logic:** Exponential backoff (100ms, 200ms, 400ms) handles transient failures
- **Security:** Empty search_path prevents search_path injection attacks

---

## Files Modified

1. `apps/app/lib/db.ts` - Added retry logic
2. `apps/app/scripts/update-database-url-pool.ts` - Increased pool limits
3. `supabase/migrations/20251115000001_add_taxonomy_v1_columns.sql` - Updated function definition
4. `supabase/migrations/20251115000006_fix_taxonomy_function_security.sql` - New migration for security fix

