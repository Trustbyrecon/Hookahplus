# Server Restart Guide

**Date:** 2025-11-15  
**Status:** ✅ **Restart functionality available**

---

## 🚀 Quick Restart Options

### Option 1: Status Page (Web UI)
1. Navigate to `http://localhost:3002/status`
2. Click the **"Restart"** button (orange button next to Refresh)
3. Confirm the action
4. Server will stop - restart manually with `npm run dev`

### Option 2: Script (Terminal)
```bash
cd apps/app
npx tsx scripts/restart-server.ts
```

**Note:** On Windows, the script will stop the server but you'll need to restart manually.

### Option 3: Manual (Traditional)
```bash
# Stop server (Ctrl+C in terminal)
# Then restart:
cd apps/app
npm run dev
```

---

## 📋 What Each Method Does

### Status Page Restart
- ✅ Stops the server process on port 3002
- ⚠️ Requires manual restart (security: can't start server from web page)
- 🔒 Only works from localhost (security check)

### Script Restart
- ✅ Finds process on port 3002
- ✅ Stops the process
- ⚠️ On Windows: Prints instructions for manual restart
- ✅ On Linux/Mac: Attempts to start server in background

### Manual Restart
- ✅ Full control
- ✅ See all server output
- ✅ Best for debugging

---

## 🔒 Security Notes

The `/api/server/restart` endpoint:
- ✅ Only accepts requests from localhost
- ✅ Can be secured with `SERVER_RESTART_TOKEN` env variable
- ⚠️ Should be disabled in production (or heavily secured)

---

## 🐛 Troubleshooting

### "Server not stopping"
- Check if process is actually on port 3002:
  ```bash
  # Windows
  netstat -ano | findstr :3002
  
  # Linux/Mac
  lsof -ti :3002
  ```
- Kill manually if needed:
  ```bash
  # Windows (replace PID)
  taskkill /PID <PID> /F
  
  # Linux/Mac
  kill -9 <PID>
  ```

### "Port still in use after restart"
- Wait 2-3 seconds for port to be released
- Check for other processes using port 3002
- Restart terminal/IDE if needed

---

## 📝 API Endpoint

**POST** `/api/server/restart`
- Stops server on port 3002
- Returns instructions for manual restart
- Requires localhost origin

**GET** `/api/server/restart`
- Checks if restart is available
- Returns current server status

---

**Status:** 🟢 **Ready to use**

