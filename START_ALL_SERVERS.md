# How to Start All Servers

**Issue:** `npm run dev:all` doesn't work from `apps/app` directory

---

## ✅ Correct Way to Start All Servers

### From Project Root (Required)
```bash
# Navigate to project root first
cd ~/Projects/Hookahplus

# Then start all servers
npm run dev:all
```

This will start:
- **Guest Portal** on `http://localhost:3001`
- **Operator App** on `http://localhost:3002`
- **Marketing Site** on `http://localhost:3003`

---

## 📋 Script Locations

**Root `package.json`** (has `dev:all`):
```json
"dev:all": "concurrently \"npm run dev:guest\" \"npm run dev:app\" \"npm run dev:site\""
```

**Individual app `package.json`** files only have:
- `dev`: Starts that specific app

---

## 🚀 Alternative: Start Individual Servers

### Option 1: From Root
```bash
npm run dev:guest  # Port 3001
npm run dev:app    # Port 3002
npm run dev:site   # Port 3003
```

### Option 2: From Each App Directory
```bash
# Terminal 1
cd apps/guest && npm run dev

# Terminal 2
cd apps/app && npm run dev

# Terminal 3
cd apps/site && npm run dev
```

---

## 📝 Using start-projects.sh Script

If you prefer the bash script:
```bash
# From project root
bash start-projects.sh

# Then select option 4 (Start all projects)
```

---

**Status:** All servers starting from project root!

