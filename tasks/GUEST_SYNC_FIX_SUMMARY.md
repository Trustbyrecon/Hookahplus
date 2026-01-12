# Guest Sync Fix Summary

**Date:** 2025-01-27  
**Status:** Code fixed, server restart required

---

## ✅ Fixes Applied

### 1. Idempotency Check Fix (App Build)
- **File:** `apps/app/app/api/sessions/route.ts`
- **Change:** Check by `externalRef` first, then fallback to `tableId`
- **Commit:** `30812848`

### 2. Response Parsing Fix (Guest Build)
- **File:** `apps/guest/app/api/session/start/route.ts`
- **Changes:**
  - Fixed bug where response body was read twice
  - Added priority-based session ID extraction (3 levels)
  - Added detailed logging for debugging
- **Commits:** `f3a6f542`, `9770405d`, `2666ffcc`

---

## 🔧 Required Actions

### Step 1: Restart Guest Build Server

**CRITICAL:** The guest build server must be restarted to pick up the new code.

```bash
# Stop guest build server (Ctrl+C if running)
cd apps/guest
npm run dev

# Wait for server to fully start (~15-20 seconds)
# Look for: "Ready" message and "Local: http://localhost:3001"
```

### Step 2: Run Test Again

```bash
cd apps/app
npx tsx scripts/test-guest-app-sync.ts
```

### Step 3: Check Logs

**Guest Build Server Console** should show:
```
[Session Start] App build response status: 200
[Session Start] App build response: {"success":true,"id":"...","session":{...}}
[Session Start] Extracted appSessionId: <uuid>
[Session Start] Response has success: true
[Session Start] Response is OK: true
[Session Start] Response has session: true
[Session Start] ✅ Successfully created/synced session in app build database: <uuid>
```

---

## 🎯 Expected Results After Restart

- ✅ Guest session created
- ✅ App session ID returned
- ✅ Synced: ✅
- ✅ All 4 tests passing

---

## 🐛 If Still Failing

1. **Verify guest build server restarted** - Check that new code is running
2. **Check guest build server logs** - Look for the detailed logging output
3. **Check app build server logs** - Look for any errors during session creation
4. **Verify network connectivity** - Ensure guest build can reach app build at `http://localhost:3002`
5. **Check response format** - The logs will show the actual JSON response

---

## 📝 Code Changes Summary

### App Build (`apps/app/app/api/sessions/route.ts`)
- Lines 1125-1160: Improved idempotency check to use `externalRef` first

### Guest Build (`apps/guest/app/api/session/start/route.ts`)
- Lines 76-84: Fixed response body parsing (read once)
- Lines 86-96: Added detailed logging
- Lines 89-91: Extract session ID from multiple locations
- Lines 100-140: Priority-based session ID extraction (3 levels)

---

## 🔗 Related Files

- Test Script: `apps/app/scripts/test-guest-app-sync.ts`
- Migration: `supabase/migrations/20251114000001_add_external_ref_column.sql`
- Debug Guide: `tasks/GUEST_SYNC_DEBUG.md`

---

**Next Action:** Restart guest build server and run test again
