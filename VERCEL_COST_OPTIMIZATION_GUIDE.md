# Vercel Cost Optimization Implementation Guide

## 🚀 **Immediate Actions Required**

### **0. Disable Auto-Deployments (CRITICAL - Highest Impact)**

**This is the most effective way to reduce Vercel build costs.** By disabling automatic deployments, you can QA locally first and only deploy when ready, eliminating unnecessary builds.

#### **For Each Project (Guest, App, Site):**

1. Go to: **Project Settings → Git**
2. Find **Automatic Deployments** section
3. **Disable** automatic deployments for:
   - Production Branch (main/master)
   - Preview Deployments (optional, but recommended)
4. Click **Save**

**Result:** Pushing to Git will NOT trigger Vercel builds. You'll deploy manually when ready.

**Manual Deployment Options:**
- Vercel Dashboard → Deployments → **Deploy** button
- Vercel CLI: `vercel --prod`
- Git tags (if configured)

**Expected Savings:** ~$0.80-1.00/day (eliminates most build costs during development)

📖 **See [LOCAL_DEV_WORKFLOW.md](./LOCAL_DEV_WORKFLOW.md) for detailed instructions and workflow.**

### **1. Ignored Build Step Configuration**

For each project in Vercel dashboard:

#### **Guest App Project**
- Go to: Project Settings → Git → Ignored Build Step
- Command: `bash scripts/vercel-build-guest.sh`
- This will skip builds when only unrelated files change

#### **App Build Project**
- Go to: Project Settings → Git → Ignored Build Step  
- Command: `bash scripts/vercel-build-app.sh`
- This will skip builds when only unrelated files change

#### **Site Build Project**
- Go to: Project Settings → Git → Ignored Build Step
- Command: `bash scripts/vercel-build-site.sh`
- This will skip builds when only unrelated files change

### **2. Enable Remote Caching**

- Go to: Team Settings → Remote Caching
- Enable: "Vercel Remote Caching"
- This will reuse build artifacts across deployments

### **3. Auto-Cancel Outdated Deployments**

- Go to: Project Settings → Git → Deploy Hooks
- Enable: "Auto-cancel outdated Deployments"
- This saves build minutes on PR updates

### **4. Function Optimization**

#### **API Response Caching**
Add to API routes:
```typescript
export async function GET() {
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return response;
}
```

#### **SSG/ISR for Static Pages**
```typescript
export const revalidate = 3600; // 1 hour
export async function generateStaticParams() {
  // Generate static params
}
```

## 📊 **Expected Cost Savings**

| Optimization | Daily Savings | Monthly Savings | Priority |
|-------------|---------------|-----------------|----------|
| **Disable Auto-Deployments** | **~$0.80-1.00** | **~$24-30** | **🔴 CRITICAL** |
| Ignored Build Step | ~$0.60 | ~$18 | 🟡 High |
| Remote Caching | ~$0.20 | ~$6 | 🟢 Medium |
| Auto-Cancel | ~$0.10 | ~$3 | 🟢 Medium |
| Function Optimization | ~$0.10 | ~$3 | 🟢 Medium |
| **Total** | **~$1.80-2.00** | **~$54-60** | |

## 🎯 **Target Metrics**

- **Current**: ~$1.50/day
- **Target**: ≤$0.80/day  
- **Savings**: ~$0.70/day
- **Monthly Projection**: ~$24 (vs $45)
- **Overage**: ~$4 (vs $25)

## 📈 **Monitoring**

Check usage in Vercel dashboard after 3-5 days:
- Usage → Build Minutes
- Usage → Function Invocations
- Target: ≤$0.80/day total

## 🔧 **Implementation Checklist**

### **Phase 1: Critical Cost Reduction (Do First)**
- [ ] **Disable auto-deployments for Guest app** (See [LOCAL_DEV_WORKFLOW.md](./LOCAL_DEV_WORKFLOW.md))
- [ ] **Disable auto-deployments for App build** (See [LOCAL_DEV_WORKFLOW.md](./LOCAL_DEV_WORKFLOW.md))
- [ ] **Disable auto-deployments for Site build** (See [LOCAL_DEV_WORKFLOW.md](./LOCAL_DEV_WORKFLOW.md))
- [ ] Set up local development workflow (See [LOCAL_DEV_WORKFLOW.md](./LOCAL_DEV_WORKFLOW.md))

### **Phase 2: Additional Optimizations**
- [ ] Update turbo.json (✅ Completed)
- [ ] Create build step scripts (✅ Completed)
- [ ] Configure Guest app ignored build step
- [ ] Configure App build ignored build step  
- [ ] Configure Site build ignored build step
- [ ] Enable Remote Caching
- [ ] Enable Auto-cancel outdated deployments
- [ ] Monitor usage for 3-5 days
- [ ] Adjust if needed

## 🚀 **Next Steps**

### **Immediate (Today)**
1. **Disable Auto-Deployments** for all three projects (See [LOCAL_DEV_WORKFLOW.md](./LOCAL_DEV_WORKFLOW.md))
   - This alone will save ~$0.80-1.00/day
2. **Set up local development** using `npm run dev:all`
   - Ports: Site (3000), Guest (3001), App (3002)
   - See [LOCAL_DEV_WORKFLOW.md](./LOCAL_DEV_WORKFLOW.md) for details

### **This Week**
3. **Configure Additional Optimizations** (Ignored Build Step, Remote Caching, etc.)
4. **Monitor Usage** (3-5 days)
5. **Adjust Settings** if needed

### **Target Metrics**
- **Current**: ~$1.50/day
- **After Disabling Auto-Deployments**: ~$0.50-0.70/day
- **After All Optimizations**: ≤$0.30-0.50/day
- **Goal**: Stay under $20/month credit limit
