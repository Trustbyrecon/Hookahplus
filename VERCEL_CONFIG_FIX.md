# Vercel Configuration Issues & Solutions

**Date:** January 2025  
**Issue:** Vercel projects configured with incorrect Root Directories

---

## 🔴 Problem

### Vercel Projects Configured With:
- **App Project** (`prj_VgBHIL2JyisEMdfs0WG2idMOxz1j`): Root Directory = `apps/app` ❌
- **Guest Project** (`prj_3dIAx8o3OOfoDHXQ3hFxfES8LlbV`): Root Directory = `apps/guest` ❌
- **Site Project** (`prj_DgjWlhhn9T6FcvnZuQBezLyA7xkg`): Root Directory = `apps/site` ❌

### Actual Repository Structure:
```
/workspace/
├── app/              ← Next.js app directory (exists)
├── components/       ← Shared components
├── lib/              ← Shared libraries
└── package.json      ← Root package.json
```

**No `apps/` directory exists.**

---

## ✅ Solutions

### Option 1: Update Vercel Root Directory (Recommended if Single App)

**For all 3 projects, set Root Directory to:** Empty (root) or `.`

**Steps:**
1. Go to Vercel Project Settings
2. General → Root Directory
3. Clear the field (leave empty) or set to `.`
4. Save

**Pros:**
- Quick fix
- No code restructuring needed
- Works with current structure

**Cons:**
- All 3 projects will build from same directory
- May need different build commands per project

---

### Option 2: Restructure to Monorepo (Recommended if Multiple Apps)

**Create the expected structure:**

```
/workspace/
├── apps/
│   ├── app/              ← Main dashboard app
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   └── package.json
│   ├── guest/            ← Guest-facing app
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── site/             ← Marketing site
│       ├── app/
│       ├── components/
│       └── package.json
└── package.json          ← Root workspace config
```

**Migration Steps:**
1. Create `apps/` directory
2. Move current structure to `apps/app/`
3. Create `apps/guest/` and `apps/site/` (if needed)
4. Update `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - './apps/*'
   ```
5. Create root `package.json` with workspace config
6. Update Vercel build commands if needed

**Pros:**
- Matches Vercel configuration
- Supports multiple apps
- Proper monorepo structure

**Cons:**
- Requires restructuring
- More complex setup

---

### Option 3: Use Vercel Monorepo Feature

**If apps should share code:**

```
/workspace/
├── apps/
│   ├── app/              ← Dashboard (uses shared components)
│   ├── guest/            ← Guest app (uses shared components)
│   └── site/             ← Site (uses shared components)
├── packages/
│   ├── components/       ← Shared components
│   └── lib/              ← Shared libraries
└── package.json
```

**Vercel Configuration:**
- Set Root Directory per project
- Configure build commands
- Share packages via workspace

---

## 🎯 Recommended Action

**For Quick Fix (Immediate):**
1. ✅ Update Vercel Root Directory to empty for all 3 projects
2. ✅ Keep current structure
3. ✅ Fix API routes (already done)

**For Long-term (Proper Setup):**
1. Create `apps/` directory structure
2. Move code to appropriate locations
3. Configure workspace properly
4. Update Vercel configs

---

## 📝 Current Status

**API Routes Fixed:** ✅
- Created `/api/checkout/create` (replaces Netlify function)
- Created `/api/checkout/session-notes` (replaces Netlify functions)
- Updated code references

**Vercel Config:** ⚠️ Needs Update
- Root Directory settings need to be cleared or updated
- OR restructure to match expected directories

---

## 🔧 Immediate Fix Steps

1. **Fix Vercel Root Directory:**
   - Go to each project in Vercel dashboard
   - Settings → General → Root Directory
   - Clear field (set to empty)
   - Save

2. **Verify Build:**
   - Push changes
   - Check Vercel build logs
   - Should build successfully

3. **Test Deployments:**
   - Test app project
   - Test guest project
   - Test site project

---

*Fixed API routes are ready. Vercel configuration is the remaining blocker.*
