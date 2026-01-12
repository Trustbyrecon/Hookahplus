# Guest Sync Debug Guide

**Issue:** Guest session created but appSessionId not returned  
**Status:** Debugging in progress

---

## Current Behavior

- ✅ Guest session created successfully
- ❌ App session ID not returned (sync failed)
- ✅ Idempotency test passing (second request finds session)

**This suggests:**
- Session IS being created in app build
- First request response format might not match expectations
- Guest build server might need restart to pick up new code

---

## Debug Steps

### 1. Check Guest Build Server Logs

When you run the test, check the guest build server console for logs like:
```
[Session Start] App build response status: 200
[Session Start] App build response: {...}
[Session Start] Extracted appSessionId: <id>
[Session Start] Response has success: true
[Session Start] Response is OK: true
[Session Start] Response has session: true
```

### 2. Restart Guest Build Server

The guest build server needs to be restarted to pick up the new code:

```bash
# Stop guest build server (Ctrl+C if running)
cd apps/guest
npm run dev

# Wait for server to start, then run test:
cd apps/app
npx tsx scripts/test-guest-app-sync.ts
```

### 3. Check App Build Response Format

The app build should return:
```json
{
  "success": true,
  "id": "<session-id>",
  "sessionId": "<session-id>",
  "session": {
    "id": "<session-id>",
    ...
  }
}
```

### 4. Verify Response Parsing

The guest build should extract session ID from:
1. `appResult.session.id` (preferred)
2. `appResult.id` (fallback)
3. `appResult.sessionId` (fallback)

---

## Expected Logs

If working correctly, you should see:
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

## If Still Failing

1. **Check guest build server logs** - Look for the detailed logging output
2. **Check app build server logs** - Look for any errors during session creation
3. **Verify network connectivity** - Ensure guest build can reach app build
4. **Check response format** - Verify the actual JSON response matches expectations

---

## Next Steps

1. Restart guest build server
2. Run test again
3. Check logs for detailed response information
4. Report findings if issue persists
