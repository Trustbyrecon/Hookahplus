# Monorepo Structure Setup Guide

**Current State:** Single `app/` directory at root  
**Target State:** Monorepo with `apps/app`, `apps/guest`, `apps/site`  
**Vercel Configuration:** Already set correctly ✅

---

## ✅ Your Vercel Configuration is Correct

**For Monorepo Setup:**
- **App Project:** Root Directory = `apps/app` ✅
- **Guest Project:** Root Directory = `apps/guest` ✅  
- **Site Project:** Root Directory = `apps/site` ✅

This is the correct configuration for a monorepo structure.

---

## 📁 Required Structure

```
/workspace/
├── apps/
│   ├── app/                    ← Main dashboard app
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── tsconfig.json
│   ├── guest/                  ← Guest-facing app
│   │   ├── app/
│   │   ├── components/
│   │   ├── package.json
│   │   └── next.config.js
│   └── site/                   ← Marketing site
│       ├── app/
│       ├── components/
│       ├── package.json
│       └── next.config.js
├── packages/                   ← Shared packages (optional)
│   ├── components/             ← Shared components
│   └── lib/                    ← Shared libraries
├── pnpm-workspace.yaml
└── package.json                ← Root workspace config
```

---

## 🔧 Migration Steps

### Step 1: Create Directory Structure

```bash
mkdir -p apps/app
mkdir -p apps/guest
mkdir -p apps/site
mkdir -p packages/components
mkdir -p packages/lib
```

### Step 2: Move Current App to `apps/app/`

**Move from root to `apps/app/`:**
- `app/` → `apps/app/app/`
- `components/` → `apps/app/components/` (or shared)
- `lib/` → `apps/app/lib/` (or shared)
- `public/` → `apps/app/public/`
- `package.json` → `apps/app/package.json`
- `next.config.js` → `apps/app/next.config.js`
- `tsconfig.json` → `apps/app/tsconfig.json`
- `tailwind.config.js` → `apps/app/tailwind.config.js`
- `postcss.config.js` → `apps/app/postcss.config.js`

### Step 3: Create `apps/app/package.json`

```json
{
  "name": "@hookahplus/app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "13.5.11",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "stripe": "^18.4.0",
    "pg": "^8.11.3"
  }
}
```

### Step 4: Update Root `pnpm-workspace.yaml`

```yaml
packages:
  - './apps/*'
  - './packages/*'
```

### Step 5: Create Root `package.json`

```json
{
  "name": "hookahplus-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:app": "pnpm --filter @hookahplus/app dev",
    "dev:guest": "pnpm --filter @hookahplus/guest dev",
    "dev:site": "pnpm --filter @hookahplus/site dev",
    "build:app": "pnpm --filter @hookahplus/app build",
    "build:guest": "pnpm --filter @hookahplus/guest build",
    "build:site": "pnpm --filter @hookahplus/site build"
  }
}
```

---

## 🎯 Quick Decision: What Goes Where?

### Option A: Everything in `apps/app/` (Simplest)
- Move all current code to `apps/app/`
- Keep `apps/guest/` and `apps/site/` empty for now
- Each app is independent

### Option B: Shared Components (Recommended)
- Move shared components to `packages/components/`
- Each app references shared packages
- More maintainable long-term

---

## 📝 Recommended Setup

**For Phase 1 (Current):**
1. Move current code to `apps/app/`
2. Keep `apps/guest/` and `apps/site/` as placeholders
3. Update Vercel build commands if needed

**Build Commands (if needed):**
- **App:** `cd apps/app && npm install && npm run build`
- **Guest:** `cd apps/guest && npm install && npm run build`
- **Site:** `cd apps/site && npm install && npm run build`

---

## ✅ Verification Checklist

After migration:
- [ ] `apps/app/` contains all dashboard code
- [ ] `apps/app/package.json` exists
- [ ] `apps/app/next.config.js` exists
- [ ] Root `pnpm-workspace.yaml` updated
- [ ] Vercel builds succeed
- [ ] All imports still work

---

## 🚀 Next Steps

1. **Create `apps/` structure** (I can help automate this)
2. **Move code** to `apps/app/`
3. **Update imports** if paths change
4. **Test Vercel builds**
5. **Create `apps/guest/` and `apps/site/`** when ready

---

**Your Vercel configuration is correct for monorepo. We just need to create the matching directory structure.**

Would you like me to:
1. Create the directory structure?
2. Move the code automatically?
3. Update all import paths?
