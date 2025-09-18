# 🔧 Vercel Dashboard Fix Guide

## 🚨 **Current Issue**
Vercel is looking for `apps/guest` and `apps/app` directories, but they don't exist in the deployment because Vercel only downloads the specific app directory, not the entire monorepo.

## ✅ **Solution: Update Root Directory Settings**

### **Step 1: Update Root Directory in Vercel Dashboard**

For each project, change the root directory to the **monorepo root**:

#### **Project: `app`**
1. Go to Vercel Dashboard → `app` project
2. Settings → General → Root Directory
3. **Change from**: `apps/app`
4. **Change to**: `.` (root directory)
5. Click **Save**

#### **Project: `guest`**
1. Go to Vercel Dashboard → `guest` project
2. Settings → General → Root Directory
3. **Change from**: `apps/guest`
4. **Change to**: `.` (root directory)
5. Click **Save**

#### **Project: `site`**
1. Go to Vercel Dashboard → `site` project
2. Settings → General → Root Directory
3. **Change from**: `apps/site`
4. **Change to**: `.` (root directory)
5. Click **Save**

### **Step 2: Verify Build Settings**

The build commands should now work correctly with the updated `vercel.json` files:

#### **Build Command** (automatically set):
```bash
cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@hookahplus/app
```

#### **Install Command** (automatically set):
```bash
cd ../.. && pnpm install --frozen-lockfile
```

#### **Output Directory** (automatically set):
- App: `apps/app/.next`
- Guest: `apps/guest/.next`
- Site: `apps/site/.next`

### **Step 3: Redeploy All Projects**

After updating the root directories:

1. Go to each project's **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

### **Step 4: Verify Deployment**

After redeployment, the URLs should work:
- **App**: `https://app-8cm83m8ky-dwaynes-projects-1c5c280a.vercel.app`
- **Guest**: `https://guest-ebnp6ncy9-dwaynes-projects-1c5c280a.vercel.app`
- **Site**: `https://site-[hash]-dwaynes-projects-1c5c280a.vercel.app`

## 🔍 **Why This Fixes the Issue**

### **Before (Broken)**:
- Root Directory: `apps/app`
- Vercel downloads only `apps/app` folder
- Build command looks for `apps/app` inside `apps/app` ❌

### **After (Fixed)**:
- Root Directory: `.` (monorepo root)
- Vercel downloads entire monorepo
- Build command navigates to root and builds specific app ✅

## 📋 **Quick Checklist**

- [ ] App root directory = `.` (not `apps/app`)
- [ ] Guest root directory = `.` (not `apps/guest`)
- [ ] Site root directory = `.` (not `apps/site`)
- [ ] All projects redeployed
- [ ] Test URLs are accessible

## 🚀 **Expected Results**

After this fix:
- ✅ Deployments will build successfully
- ✅ URLs will return 200 status codes
- ✅ Webhook endpoints will work
- ✅ Stripe catalog will be accessible
- ✅ Smoke tests will pass

---

**Next Step**: Update the root directories in Vercel dashboard, then I'll run the smoke tests again to verify everything is working!
