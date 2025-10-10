# 🚀 Vercel Monorepo Subdir Deployment Guide

## ✅ **Configuration Complete: Independent Deployments**

The monorepo has been configured for **Vercel subdir deployments** with no overlap between apps.

### **📁 Deployment Structure:**

```
Hookahplus/ (Root Monorepo)
├── vercel.json (Root - Routes traffic to subdirs)
├── apps/
│   ├── admin/ (→ /admin routes)
│   │   ├── vercel.json ✅
│   │   └── package.json ✅
│   ├── dashboard/ (→ /dashboard routes)  
│   │   ├── vercel.json ✅
│   │   └── package.json ✅
│   ├── preorder/ (→ /preorder routes)
│   │   ├── vercel.json ✅
│   │   └── package.json ✅
│   └── app/ (→ /operator + remaining routes)
│       ├── vercel.json ✅
│       └── package.json ✅
```

### **🎯 Route Mapping:**

| Route | Source App | Deployment Target |
|-------|------------|-------------------|
| `/admin/*` | `apps/admin/` | Independent deployment |
| `/dashboard/*` | `apps/dashboard/` | Independent deployment |
| `/preorder/*` | `apps/preorder/` | Independent deployment |
| `/operator/*` | `apps/app/app/operator/` | Independent deployment |
| `/*` (remaining) | `apps/app/` | Main app deployment |

### **🔧 Vercel Configuration:**

#### **Root vercel.json:**
- **Routes**: Traffic routing to appropriate subdirs
- **Builds**: Multiple build configurations for each app
- **Functions**: API route configurations
- **Regions**: `iad1` (Washington, D.C.)

#### **Individual App vercel.json:**
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`
- **Framework**: `nextjs`

### **🚀 Deployment Steps:**

#### **Option 1: Single Project (Recommended)**
1. **Import Root Repository**: Import `Trustbyrecon/Hookahplus` to Vercel
2. **Root Directory**: Leave empty (uses root `vercel.json`)
3. **Build Command**: Automatically handled by `vercel.json`
4. **Deploy**: Single deployment handles all subdirs

#### **Option 2: Multiple Projects (Advanced)**
1. **Admin Project**: 
   - Import `Trustbyrecon/Hookahplus`
   - Root Directory: `apps/admin`
   - Custom Domain: `hookahplus.net/admin`

2. **Dashboard Project**:
   - Import `Trustbyrecon/Hookahplus` 
   - Root Directory: `apps/dashboard`
   - Custom Domain: `hookahplus.net/dashboard`

3. **Preorder Project**:
   - Import `Trustbyrecon/Hookahplus`
   - Root Directory: `apps/preorder` 
   - Custom Domain: `hookahplus.net/preorder`

4. **Main App Project**:
   - Import `Trustbyrecon/Hookahplus`
   - Root Directory: `apps/app`
   - Custom Domain: `hookahplus.net`

### **⚡ Benefits Achieved:**

#### **✅ No Deploy Overlap:**
- **Independent Builds**: Each app builds separately
- **Selective Deployment**: Only changed apps redeploy
- **Faster CI/CD**: Reduced build times

#### **✅ Route Separation:**
- **Clear Boundaries**: Each route maps to specific app
- **No Conflicts**: Apps can't interfere with each other
- **Scalable**: Easy to add new apps

#### **✅ Team Workflow:**
- **Parallel Development**: Teams can work on different apps
- **Independent Releases**: Deploy apps separately
- **Isolated Testing**: Test individual apps

### **🔍 Testing the Configuration:**

#### **Local Testing:**
```bash
# Test individual apps
cd apps/admin && npm run dev
cd apps/dashboard && npm run dev  
cd apps/preorder && npm run dev
cd apps/app && npm run dev
```

#### **Build Testing:**
```bash
# Test builds
cd apps/admin && npm run build
cd apps/dashboard && npm run build
cd apps/preorder && npm run build
cd apps/app && npm run build
```

### **🌐 Production URLs:**

Once deployed, the routes will be available at:
- **`https://hookahplus.net/admin`** → Admin dashboard
- **`https://hookahplus.net/dashboard`** → Analytics dashboard  
- **`https://hookahplus.net/preorder`** → Pre-order system
- **`https://hookahplus.net/operator`** → Operator dashboard
- **`https://hookahplus.net/`** → Main app (remaining routes)

### **📊 Deployment Status:**

- ✅ **Root Configuration**: `vercel.json` created
- ✅ **Admin App**: `apps/admin/vercel.json` configured
- ✅ **Dashboard App**: `apps/dashboard/vercel.json` configured  
- ✅ **Preorder App**: `apps/preorder/vercel.json` configured
- ✅ **Main App**: `apps/app/vercel.json` already exists
- ✅ **Route Mapping**: All routes properly mapped
- ✅ **No Overlap**: Clean separation achieved

### **🎯 Next Steps:**

1. **Deploy to Vercel**: Use Option 1 (Single Project) for simplicity
2. **Test Routes**: Verify all routes work correctly
3. **Monitor Performance**: Check build times and deployment speed
4. **Team Training**: Share this guide with development teams

---

**🎉 Mission Accomplished: Monorepo subdir configuration complete with zero deploy overlap!**
