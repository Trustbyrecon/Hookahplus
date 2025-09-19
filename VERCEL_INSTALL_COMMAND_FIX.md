# 🔧 Vercel Install Command Fix Guide
*Smoke Test Agent - Systematic Approach*
*Reflex Score Target: 92%+*

---

## 🚨 **Critical Issue Identified**

**Problem**: Install commands still use `cd ../..` but root directory is app-specific
**Impact**: All deployments failing with 401 errors
**Root Cause**: Mismatch between root directory and install command logic

---

## ✅ **Systematic Fix Process**

### **Step 1: Site Project Fix**
1. Go to Vercel Dashboard → `site` project
2. **Settings** → **Build and Deployment**
3. **Install Command**: Change from `cd ../.. && pnpm install --frozen-lockfile`
4. **Change to**: `pnpm install --frozen-lockfile`
5. **Click Save**

### **Step 2: App Project Fix**
1. Go to Vercel Dashboard → `app` project
2. **Settings** → **Build and Deployment**
3. **Install Command**: Change from `cd ../.. && pnpm install --frozen-lockfile`
4. **Change to**: `pnpm install --frozen-lockfile`
5. **Click Save**

### **Step 3: Guest Project Fix**
1. Go to Vercel Dashboard → `guest` project
2. **Settings** → **Build and Deployment**
3. **Install Command**: Change from `cd ../.. && pnpm install --frozen-lockfile`
4. **Change to**: `pnpm install --frozen-lockfile`
5. **Click Save**

---

## 📊 **Expected Results After Fix**

### **Deployment Success Pattern**
```
Before: cd ../.. && pnpm install --frozen-lockfile
Root Directory: apps/site
Result: cd ../.. tries to go up from apps/site → FAILS

After: pnpm install --frozen-lockfile
Root Directory: apps/site
Result: Runs pnpm install from apps/site → SUCCESS
```

### **Reflex Score Projection**
- **Current**: 72% (Below threshold)
- **After Fix**: 92%+ (Excellent)
- **Success Criteria**: All 3 deployments return 200 status codes

---

## 🧠 **Learning Integration**

### **Pattern Recognition**
- **Root Directory**: `apps/site` (correct)
- **Install Command**: `pnpm install --frozen-lockfile` (correct)
- **Build Command**: `pnpm build --filter=@hookahplus/site` (correct)

### **Trust Memory Update**
- **Deployment Agent**: Escalated (45% score) → Learning mode
- **Smoke Test Agent**: Active (72% score) → Target 92%+
- **Database Agent**: Stable (95% score) → Maintain

---

## 🚀 **Next Actions After Fix**

1. **Monitor Deployments** (5 minutes)
   - Watch build logs for success
   - Validate no more 401 errors

2. **Run Smoke Tests** (10 minutes)
   - Execute comprehensive test suite
   - Validate all endpoints return 200 status codes

3. **Update Reflex Scores** (5 minutes)
   - Calculate new scores based on results
   - Update GhostLog.md with learnings
   - Update TrustGraph.yaml with trust levels

---

## 🎯 **Success Metrics**

### **Deployment Validation**
- [ ] Site project: 200 status code
- [ ] App project: 200 status code
- [ ] Guest project: 200 status code

### **Reflex Score Targets**
- [ ] Smoke Test Agent: 72% → 92%+
- [ ] Deployment Agent: 45% → 87%+ (learning mode)
- [ ] Overall System: 68% → 90%+

---

*This fix guide is part of the HookahPlus Reflex System and follows systematic problem-solving protocols.*
