# Sentry DSN Setup for Vercel

**Date:** 2025-01-27  
**Status:** Ready to Configure

---

## 🔑 Sentry DSNs

### App Build (hookahplus-app)
```
https://9ccf63cd4d007820a02decc75cf47b36@o4510619153858560.ingest.us.sentry.io/4510624294109184
```

### Guest App (hookahplus-guests)
```
https://d3f813910bcf9752c23d4a2b17fe1ae8@o4510619153858560.ingest.us.sentry.io/4510624346603520
```

---

## 📋 Manual Setup in Vercel Dashboard

### For App Build (hookahplus-app)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-app/settings/environment-variables

2. **Add Environment Variable:**
   - Click **"+ Add Another"**
   - **Key:** `NEXT_PUBLIC_SENTRY_DSN`
   - **Value:** `https://9ccf63cd4d007820a02decc75cf47b36@o4510619153858560.ingest.us.sentry.io/4510624294109184`
   - **Environments:** Select all (Production, Preview, Development)
   - Click **"Save"**

### For Guest App (hookahplus-guests)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-guests/settings/environment-variables

2. **Add Environment Variable:**
   - Click **"+ Add Another"**
   - **Key:** `NEXT_PUBLIC_SENTRY_DSN`
   - **Value:** `https://d3f813910bcf9752c23d4a2b17fe1ae8@o4510619153858560.ingest.us.sentry.io/4510624346603520`
   - **Environments:** Select all (Production, Preview, Development)
   - Click **"Save"**

---

## 🚀 After Setting Environment Variables

### 1. Redeploy Projects

After adding the environment variables, you need to redeploy:

**Option A: Via Vercel Dashboard**
- Go to project → Deployments
- Click "..." on latest deployment → "Redeploy"

**Option B: Via Git Push**
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy for Sentry DSN"
git push
```

**Option C: Via Vercel CLI**
```bash
vercel --prod hookahplus-app
vercel --prod hookahplus-guests
```

### 2. Verify Environment Variables

Check that the variables are set:
```bash
# Check app project
vercel env ls hookahplus-app

# Check guest project
vercel env ls hookahplus-guests
```

---

## 🧪 Testing

### Test App Build

1. **Create test endpoint:** `apps/app/app/api/test-sentry/route.ts`
2. **Visit:** `https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/api/test-sentry`
3. **Check Sentry:** `hookahplusnet.sentry.io` → `javascript-nextjs-app` project

### Test Guest App

1. **Create test endpoint:** `apps/guest/app/api/test-sentry/route.ts`
2. **Visit:** `https://guest-rho.vercel.app/api/test-sentry`
3. **Check Sentry:** `hookahplusnet.sentry.io` → `javascript-nextjs-guest` project

---

## ✅ Verification Checklist

- [ ] App DSN added to `hookahplus-app` in Vercel
- [ ] Guest DSN added to `hookahplus-guests` in Vercel
- [ ] Both set for all environments (Production, Preview, Development)
- [ ] Projects redeployed
- [ ] Test endpoints created
- [ ] Errors appear in Sentry dashboard

---

## 🔗 Quick Links

- **App Project Settings:** https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-app/settings/environment-variables
- **Guest Project Settings:** https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-guests/settings/environment-variables
- **Sentry Dashboard:** https://hookahplusnet.sentry.io

---

**Status:** Ready to Configure  
**Last Updated:** 2025-01-27

