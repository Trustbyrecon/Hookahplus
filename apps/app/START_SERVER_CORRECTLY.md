# How to Start the Server Correctly

**Issue:** `npm run dev:app` doesn't work from `apps/app` directory

---

## ✅ Correct Ways to Start Server

### Option 1: From Project Root (Recommended)
```bash
# Navigate to project root
cd ~/Projects/Hookahplus

# Start app server
npm run dev:app
```

### Option 2: From apps/app Directory
```bash
# Navigate to app directory
cd apps/app

# Use the local dev script
npm run dev
```

### Option 3: Start All Servers
```bash
# From project root
npm run dev:all
```

---

## 📋 Script Locations

**Root `package.json`** (has `dev:app`):
- `dev:app`: `cd apps/app && npm run dev`
- `dev:all`: Starts all three servers

**`apps/app/package.json`** (has `dev`):
- `dev`: `next dev --port 3002`

---

## 🚀 Quick Start

**From anywhere in the project:**
```bash
# If in apps/app:
npm run dev

# If in project root:
npm run dev:app
```

---

**Status:** Server should be starting now from root directory!

