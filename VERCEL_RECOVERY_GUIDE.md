# 🚀 Vercel Recovery Guide - Monorepo Deployment Fix

## ✅ **Step 1: Stable Branch Created**
- **Stable Branch**: `stable-production` (commit: c228d17)
- **Status**: Ready for production deployment

## 🔧 **Step 2: Vercel Project Settings Update**

### **For Each Project, Update These Settings:**

#### **Guest Project (prj_3dIAx8o3OOfoDHXQ3hFxfES8LlbV)**
```
Root Directory: . (monorepo root)
Build Command: cd apps/guest && npm install && npm run build
Output Directory: apps/guest/.next
Install Command: npm install
Framework Preset: Next.js
```

#### **App Project**
```
Root Directory: . (monorepo root)
Build Command: cd apps/app && npm install && npm run build
Output Directory: apps/app/.next
Install Command: npm install
Framework Preset: Next.js
```

#### **Site Project**
```
Root Directory: . (monorepo root)
Build Command: cd apps/site && npm install && npm run build
Output Directory: apps/site/.next
Install Command: npm install
Framework Preset: Next.js
```

## 🎯 **Step 3: Branch Tracking Strategy**

### **Production Environment**
- **Branch**: `stable-production` (for immediate fix)
- **Later**: Switch to `main` branch for ongoing deployments

### **Preview Environment**
- **Branch**: `feat/*` branches for testing
- **Development**: Local development

## 🚀 **Step 4: Deployment Commands**

### **Deploy Stable Branch to Production**
```bash
# Deploy guest app
vercel --prod --force --target production --cwd apps/guest

# Deploy app
vercel --prod --force --target production --cwd apps/app

# Deploy site
vercel --prod --force --target production --cwd apps/site
```

### **Or Use Vercel Dashboard**
1. Go to each project's **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push to `stable-production` branch to trigger automatic deployment

## 📋 **Step 5: Verification Checklist**

### **After Deployment, Verify:**
- [ ] Guest app loads at `https://guest.hookahplus.net`
- [ ] App loads at `https://app.hookahplus.net`
- [ ] Site loads at `https://hookahplus.net`
- [ ] All apps show "Ready" status in Vercel dashboard
- [ ] No build errors in deployment logs

## 🔄 **Step 6: Switch to Main Branch (After Verification)**

### **Once Stable Branch is Working:**
1. **Merge stable-production to main**:
   ```bash
   git checkout main
   git merge stable-production
   git push origin main
   ```

2. **Update Vercel branch tracking**:
   - Change all projects to track `main` branch
   - Remove `stable-production` branch tracking

## 🎯 **Expected Results**

### **Before Fix:**
- ❌ Guest builds going to app project
- ❌ Build errors due to wrong root directory
- ❌ Conflicting deployments

### **After Fix:**
- ✅ Each app deploys independently
- ✅ Correct root directory (monorepo root)
- ✅ Proper build commands
- ✅ Clean deployment separation

## 🚨 **Emergency Rollback**

### **If Issues Occur:**
1. **Revert to previous stable commit**:
   ```bash
   git checkout [previous-stable-commit]
   git push origin stable-production --force
   ```

2. **Redeploy all projects**:
   ```bash
   vercel --prod --force
   ```

## 📞 **Next Steps**

1. **Update Vercel project settings** (in dashboard)
2. **Deploy stable branch** to production
3. **Verify all apps work** correctly
4. **Switch to main branch** for ongoing development
5. **Test new deployments** with proper monorepo setup

---

**Status**: Ready for implementation
**Priority**: HIGH - Fixes critical deployment issues
**Timeline**: 30 minutes to complete
