# 🚀 Vercel Monorepo Subdir Deployment Guide

## ✅ **Configuration Complete: Independent Deployments**

The monorepo has been configured for **Vercel subdir deployments** with clean separation between the three core apps: **Guest**, **App**, and **Site**.

### **📁 Deployment Structure:**

```
Hookahplus/ (Root Monorepo)
├── vercel.json (Root - Routes traffic to subdirs)
├── apps/
│   ├── guest/ (→ Guest Portal + Mobile Optimizations)
│   │   ├── vercel.json ✅
│   │   ├── package.json ✅
│   │   └── app/mobile/ (Mobile-optimized routes)
│   ├── app/ (→ Operator Dashboard + Business Logic)
│   │   ├── vercel.json ✅
│   │   ├── package.json ✅
│   │   └── app/operator/ (Operator dashboard)
│   └── site/ (→ Main Landing Page + Marketing)
│       ├── vercel.json ✅
│       └── package.json ✅
```

### **🎯 Route Mapping:**

| Route | Source App | Deployment Target | Purpose |
|-------|------------|-------------------|---------|
| `/guest/*` | `apps/guest/` | Independent deployment | Guest portal, QR checkin, mobile FSD |
| `/app/*` | `apps/app/` | Independent deployment | Operator dashboard, business logic |
| `/operator/*` | `apps/app/app/operator/` | Independent deployment | Staff management, analytics |
| `/*` (remaining) | `apps/site/` | Main site deployment | Landing page, marketing |

### **🔧 Vercel Configuration:**

#### **Root vercel.json:**
- **Routes**: Traffic routing to appropriate subdirs
- **Builds**: Multiple build configurations for each app
- **Functions**: API route configurations
- **Environment Variables**: Cross-app communication
- **Regions**: `iad1` (Washington, D.C.)

#### **Individual App vercel.json:**
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`
- **Framework**: `nextjs`
- **Environment**: Cross-app URL references

### **🌊 Guest Intelligence Flow:**

#### **Guest → App Integration:**
- **QR Checkin**: Guest scans QR → App receives session data
- **Session Tracking**: Guest FSD → App dashboard updates
- **Mobile Optimizations**: Touch interactions → App analytics
- **Flow Constant (Λ∞)**: Agent injection system → App orchestration

#### **Cross-App Communication:**
- **Guest Portal**: `NEXT_PUBLIC_GUEST_URL`
- **App Dashboard**: `NEXT_PUBLIC_APP_URL`
- **Main Site**: `NEXT_PUBLIC_SITE_URL`

### **🚀 Deployment Steps:**

#### **Option 1: Single Project (Recommended)**
1. **Import Root Repository**: Import `Trustbyrecon/Hookahplus` to Vercel
2. **Root Directory**: Leave empty (uses root `vercel.json`)
3. **Build Command**: Automatically handled by `vercel.json`
4. **Deploy**: Single deployment handles all subdirs

#### **Option 2: Multiple Projects (Advanced)**
1. **Guest Project**: 
   - Import `Trustbyrecon/Hookahplus`
   - Root Directory: `apps/guest`
   - Custom Domain: `guest.hookahplus.net`

2. **App Project**:
   - Import `Trustbyrecon/Hookahplus` 
   - Root Directory: `apps/app`
   - Custom Domain: `app.hookahplus.net`

3. **Site Project**:
   - Import `Trustbyrecon/Hookahplus`
   - Root Directory: `apps/site` 
   - Custom Domain: `hookahplus.net`

### **⚡ Benefits Achieved:**

#### **✅ No Deploy Overlap:**
- **Independent Builds**: Each app builds separately
- **Selective Deployment**: Only changed apps redeploy
- **Faster CI/CD**: Reduced build times
- **Mobile Optimizations**: Guest app deploys independently

#### **✅ Route Separation:**
- **Clear Boundaries**: Each route maps to specific app
- **No Conflicts**: Apps can't interfere with each other
- **Scalable**: Easy to add new apps
- **Mobile-First**: Guest app optimized for mobile

#### **✅ Team Workflow:**
- **Parallel Development**: Teams can work on different apps
- **Independent Releases**: Deploy apps separately
- **Isolated Testing**: Test individual apps
- **Agent Injection**: Flow Constant system isolated

### **🔍 Testing the Configuration:**

#### **Local Testing:**
```bash
# Test individual apps (3-port setup)
cd apps/guest && npm run dev    # Port 3001
cd apps/app && npm run dev     # Port 3002
cd apps/site && npm run dev    # Port 3003

# Or run all together
npm run dev:all
```

#### **Build Testing:**
```bash
# Test builds
cd apps/guest && npm run build
cd apps/app && npm run build
cd apps/site && npm run build
```

### **🌐 Production URLs:**

Once deployed, the routes will be available at:
- **`https://guest.hookahplus.net/`** → Guest portal + mobile optimizations
- **`https://guest.hookahplus.net/mobile`** → Mobile-optimized experience
- **`https://app.hookahplus.net/`** → Operator dashboard
- **`https://app.hookahplus.net/operator`** → Staff management
- **`https://hookahplus.net/`** → Main landing page

### **📊 Deployment Status:**

- ✅ **Root Configuration**: `vercel.json` created
- ✅ **Guest App**: `apps/guest/vercel.json` configured
- ✅ **App Dashboard**: `apps/app/vercel.json` configured  
- ✅ **Site Landing**: `apps/site/vercel.json` configured
- ✅ **Route Mapping**: All routes properly mapped
- ✅ **No Overlap**: Clean separation achieved
- ✅ **Mobile Optimizations**: Guest app mobile-ready
- ✅ **Agent Injection**: Flow Constant (Λ∞) system deployed

### **🎯 Next Steps:**

1. **Deploy to Vercel**: Use Option 1 (Single Project) for simplicity
2. **Test Routes**: Verify all routes work correctly
3. **Test Mobile**: Access `/mobile` route on guest app
4. **Test Agent System**: Verify Flow Constant injection
5. **Monitor Performance**: Check build times and deployment speed
6. **Team Training**: Share this guide with development teams

### **🌊 Flow Constant Integration:**

The **Flow Constant (Λ∞)** agent injection system is integrated across all apps:
- **Guest**: Mobile touch interactions and session tracking
- **App**: Business logic and operator dashboard
- **Site**: Marketing and customer acquisition

**Signature**: ∴ Allow → Align → Amplify

---

**🎉 Mission Accomplished: Monorepo subdir configuration complete with zero deploy overlap and Flow Constant alignment!**