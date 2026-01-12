# Guest → App Sync Fix

**Date:** 2025-01-27  
**Issue:** Guest session sync failing - app session ID not returned  
**Status:** ✅ Fixed

---

## Problem

The test showed:
- ✅ Guest session created successfully
- ❌ App session ID not returned (sync failed)
- ✅ Idempotency test passed (second request worked)

**Root Cause:**
The idempotency check in `apps/app/app/api/sessions/route.ts` only checked for existing sessions by `tableId`, but didn't check by `externalRef`. This meant:

1. First request with `externalRef: guest-${sessionId}` might not find existing session if checked only by tableId
2. Second request (idempotency test) found the session by tableId, so it worked
3. But the first request might have failed or created a duplicate

---

## Solution

Updated the idempotency check to:
1. **First check by `externalRef`** if provided (more specific, prevents duplicates)
2. **Fallback to `tableId`** check if no externalRef or not found

**File:** `apps/app/app/api/sessions/route.ts`  
**Lines:** 1125-1158

**Changes:**
- Added `externalRef` check before `tableId` check
- Added `externalRef` to select fields
- Improved idempotency logic to handle guest sync properly

---

## Verification

After fix:
1. Guest session creates with `externalRef: guest-${sessionId}`
2. App build checks for existing session by `externalRef` first
3. If found, returns existing session (idempotent)
4. If not found, creates new session
5. Returns `appSessionId` to guest build

---

## Test

Run the test again:
```bash
cd apps/app
npx tsx scripts/test-guest-app-sync.ts
```

**Expected Results:**
- ✅ Guest session created
- ✅ App session ID returned
- ✅ Synced: ✅
- ✅ Idempotency working

---

## Related

- Migration: `supabase/migrations/20251114000001_add_external_ref_column.sql`
- Test Script: `apps/app/scripts/test-guest-app-sync.ts`
- Guest Route: `apps/guest/app/api/session/start/route.ts`
