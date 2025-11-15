# Vercel Build Optimization Setup Guide

## ✅ Build Scripts Created

Three optimized build scripts have been created:
- `scripts/vercel-build-app.sh` - Only builds app if app files changed
- `scripts/vercel-build-guest.sh` - Only builds guest if guest files changed  
- `scripts/vercel-build-site.sh` - Only builds site if site files changed

## 🔧 How to Configure in Vercel Dashboard

### For Each Project (App, Guest, Site):

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Git**

2. **Find "Ignored Build Step"** section

3. **Enter the appropriate script:**

#### **App Project:**
```bash
bash scripts/vercel-build-app.sh
```

#### **Guest Project:**
```bash
bash scripts/vercel-build-guest.sh
```

#### **Site Project:**
```bash
bash scripts/vercel-build-site.sh
```

4. **Click "Save"**

## 📊 How It Works

### Exit Codes:
- **Exit 0** = Skip build (ignore) - No relevant changes
- **Exit 1** = Build (don't ignore) - Relevant changes detected

### Logic:
1. Gets list of changed files from `git diff HEAD^ HEAD`
2. Checks if any changed file matches app/guest/site patterns
3. If match found → Exit 1 (build)
4. If only unrelated files → Exit 0 (skip)

### Trigger Patterns:

#### App Build Triggers:
- `apps/app/` - Any app file
- `apps/shared/` - Shared code
- `packages/` - Shared packages
- `prisma/` - Database schema
- `turbo.json` - Build config
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `lib/` - Shared libraries

#### Guest Build Triggers:
- `apps/guest/` - Any guest file
- `apps/shared/` - Shared code
- `packages/` - Shared packages
- `turbo.json` - Build config
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config

#### Site Build Triggers:
- `apps/site/` - Any site file
- `apps/shared/` - Shared code
- `packages/` - Shared packages
- `turbo.json` - Build config
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config

## 🎯 Expected Results

### Before Optimization:
- **Every commit:** All 3 apps build
- **Build time:** ~6 minutes (3 apps × 2 min)
- **Cost:** High (unnecessary builds)

### After Optimization:
- **App-only commit:** Only app builds
- **Build time:** ~2 minutes (1 app × 2 min)
- **Cost:** ~67% reduction

## 📝 Example Scenarios

### Scenario 1: App-only fix (like current TypeScript error)
**Changed files:**
- `apps/app/components/SimpleFSDDesign.tsx`

**Result:**
- ✅ App builds (triggered by `apps/app/`)
- ❌ Guest skips (no `apps/guest/` changes)
- ❌ Site skips (no `apps/site/` changes)

### Scenario 2: Shared package update
**Changed files:**
- `packages/shared-utils/index.ts`

**Result:**
- ✅ App builds (triggered by `packages/`)
- ✅ Guest builds (triggered by `packages/`)
- ✅ Site builds (triggered by `packages/`)

### Scenario 3: Documentation only
**Changed files:**
- `README.md`
- `docs/guide.md`

**Result:**
- ❌ App skips (only docs changed)
- ❌ Guest skips (only docs changed)
- ❌ Site skips (only docs changed)

## ⚠️ Important Notes

1. **First commit or manual deploy:** Scripts will always build (safety)
2. **Shared code changes:** All apps will build (correct behavior)
3. **False positives:** Scripts err on the side of building (safer than skipping)
4. **Testing:** Test locally with `git diff HEAD^ HEAD` to verify logic

## 🔍 Verification

After setting up, verify it's working:

1. Make an app-only change (e.g., fix TypeScript error)
2. Commit and push
3. Check Vercel dashboard:
   - App project should build ✅
   - Guest project should skip ❌
   - Site project should skip ❌

## 🚀 Next Steps

1. **Configure in Vercel Dashboard** (see above)
2. **Test with app-only commit** (current fix)
3. **Monitor build logs** to verify scripts are running
4. **Track savings** in build minutes/costs

---

**Status:** Scripts ready, waiting for Vercel dashboard configuration.

