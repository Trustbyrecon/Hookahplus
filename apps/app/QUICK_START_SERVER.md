# Quick Start Server Guide

**Issue:** Server crashed or stopped (`ERR_CONNECTION_REFUSED`)

---

## 🚀 Quick Restart

### Method 1: Using npm script (Recommended)
```bash
# From project root:
npm run dev:app

# Or from apps/app:
cd apps/app
npm run dev
```

### Method 2: Using restart script
```bash
cd apps/app
npx tsx scripts/restart-server.ts
# Then manually start:
npm run dev
```

### Method 3: Check and start manually
```bash
# Check if port is in use:
netstat -ano | findstr :3002

# If no process found, start server:
cd apps/app
npm run dev
```

---

## ✅ Verify Server is Running

After starting, wait 10-15 seconds, then check:
- Browser: `http://localhost:3002/status`
- Terminal: Look for `✓ Ready in Xms`
- API: `curl http://localhost:3002/api/health`

---

## 🔍 If Server Won't Start

1. **Check for port conflicts:**
   ```bash
   netstat -ano | findstr :3002
   ```

2. **Kill existing process:**
   ```bash
   taskkill /PID <PID> /F
   ```

3. **Check for syntax errors:**
   ```bash
   cd apps/app
   npx tsc --noEmit
   ```

4. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

**Status:** Server restarting in background...

