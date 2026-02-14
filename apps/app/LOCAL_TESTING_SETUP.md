# Local Testing Setup

**Agent:** Noor (session_agent)  
**Date:** 2025-01-14

---

## Current Status

- ✅ **App build server:** Starting on `http://localhost:3002`
- ❓ **Guest build server:** Status unknown (checking...)
- ⚠️ **DATABASE_URL:** Not loading (needs verification)

---

## Server Status

### App Build (Port 3002)
- **Status:** Starting
- **URL:** http://localhost:3002
- **Issue:** DATABASE_URL not loading

### Guest Build (Port 3001)
- **Status:** Check if running
- **URL:** http://localhost:3001
- **Command:** `cd apps/guest && npm run dev`

---

## Quick Start Commands

### Start App Build Server:
```bash
cd apps/app
npm run dev
```

### Start Guest Build Server (if not running):
```bash
cd apps/guest
npm run dev
```

### Verify DATABASE_URL:
```bash
cd apps/app
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.DATABASE_URL ? 'SET' : 'NOT SET')"
```

---

## Testing Guest → App Sync

1. **Ensure both servers are running:**
   - App build: `http://localhost:3002`
   - Guest build: `http://localhost:3001`

2. **Test from guest build:**
   - Open: `http://localhost:3001`
   - Add items to cart
   - Click "Fire Session"
   - Check console for sync status

3. **Expected Result:**
   - ✅ Session created locally in guest build
   - ✅ Session synced to app build API
   - ✅ Session appears in app build FSD

---

**Status:** ⏳ **App server starting, checking DATABASE_URL loading**

