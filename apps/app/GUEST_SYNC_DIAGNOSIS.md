# Guest → App Sync Diagnosis

**Agent:** Noor (session_agent)  
**Date:** 2025-01-14  
**Status:** 🔍 **Diagnosing Connection Issue**

---

## Current Issue

**Console Error:**
```
connection_error: fetch failed
Hint: Check if app build is running on localhost:3002
```

**Root Cause:**
The guest build is trying to sync to the app build, but:
1. **If running locally:** App build server not running on `localhost:3002`
2. **If deployed:** Guest build is trying to connect to `localhost:3002` instead of production app build URL

---

## Solution

### For Local Development:

1. **Start App Build Server:**
   ```bash
   cd apps/app
   npm run dev
   ```
   Wait for server to compile (~30-60 seconds)

2. **Verify Server is Running:**
   ```bash
   curl http://localhost:3002/api/sessions
   ```
   Should return: `{"success": true, "sessions": [], ...}`

3. **Test Guest → App Sync:**
   - Open guest build: `http://localhost:3001`
   - Click "Fire Session"
   - Check console for sync success

### For Production Deployment:

1. **Set Environment Variable in Vercel:**
   - Go to Guest Build project settings
   - Add/Update: `NEXT_PUBLIC_APP_URL`
   - Value: `https://app.hookahplus.net` (or your production app build URL)

2. **Verify App Build is Deployed:**
   - Ensure app build is deployed and accessible
   - Test: `curl https://app.hookahplus.net/api/sessions`

3. **Redeploy Guest Build:**
   - After setting environment variable, redeploy guest build
   - Guest build will now sync to production app build

---

## Code Reference

**Guest Build Sync Code:**
- File: `apps/guest/app/api/session/start/route.ts`
- Line 47: `const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';`
- Line 68: `const appResponse = await fetch(`${appUrl}/api/sessions`, ...)`

**App Build API:**
- Endpoint: `POST /api/sessions`
- File: `apps/app/app/api/sessions/route.ts`

---

## Expected Behavior

### Successful Sync:
```json
{
  "success": true,
  "session": {...},
  "message": "Session started successfully and synced to Fire Session Dashboard",
  "synced": true,
  "appSessionId": "clx..."
}
```

### Failed Sync (Current):
```json
{
  "success": true,
  "session": {...},
  "message": "Session started successfully (database sync unavailable)",
  "warning": "Could not sync to Fire Session Dashboard",
  "syncError": {
    "type": "connection_error",
    "message": "fetch failed",
    "hint": "Check if app build is running on localhost:3002"
  },
  "synced": false
}
```

---

## Next Steps

1. **If Local:** Start app build server
2. **If Production:** Set `NEXT_PUBLIC_APP_URL` in Vercel environment variables
3. **Test sync** after server is running/environment is set

---

**Status:** ⏳ **Waiting for app build server to start or production environment variable to be set**

