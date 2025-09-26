# Vercel Project Settings Fix

The Vercel projects need to be configured with the correct root directory settings in the Vercel dashboard.

## Current Issue
All three projects are showing "DEPLOYMENT_NOT_FOUND" because they're configured to look for files in the wrong directory.

## Required Fixes

### 1. hookahplus-app Project
- **Current Root Directory**: `apps/app` (incorrect)
- **Required Root Directory**: `apps/app`
- **Status**: Needs verification

### 2. hookahplus-guests Project  
- **Current Root Directory**: `apps/guest` (incorrect)
- **Required Root Directory**: `apps/guest`
- **Status**: Needs verification

### 3. hookahplus-site Project
- **Current Root Directory**: `apps/site` (incorrect)
- **Required Root Directory**: `apps/site`
- **Status**: Working (200 OK)

## Steps to Fix

### For Each Project:

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dwaynes-projects-1c5c280a
   - Select the project (hookahplus-app, hookahplus-guests, or hookahplus-site)

2. **Update Project Settings**
   - Go to Settings > General
   - Find "Root Directory" setting
   - Set to the correct app directory:
     - `apps/app` for hookahplus-app
     - `apps/guest` for hookahplus-guests  
     - `apps/site` for hookahplus-site

3. **Update Build Settings**
   - Build Command: `pnpm run build`
   - Output Directory: `.next`
   - Install Command: `pnpm install --no-frozen-lockfile`

4. **Set Environment Variables**
   - Go to Settings > Environment Variables
   - Add the required variables (see `docs/vercel-environment-setup.md`)

5. **Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger automatic deployment

## Verification

After fixing the settings, test each app:

```bash
# Test app
curl -I https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app

# Test guests  
curl -I https://guest-dwaynes-projects-1c5c280a.vercel.app

# Test site
curl -I https://hookahplus-site-v2.vercel.app
```

All should return `200 OK` instead of `404 Not Found`.

## Alternative: Create New Projects

If the existing projects can't be fixed, create new ones:

1. **Delete existing projects** (if possible)
2. **Create new projects** with correct root directories
3. **Import from GitHub** with proper settings
4. **Set environment variables**
5. **Deploy**

## Expected Results

After fixing:
- ✅ All 3 apps return 200 OK
- ✅ $1 Stripe test works on all apps
- ✅ No DEPLOYMENT_NOT_FOUND errors
- ✅ Proper monorepo structure support
