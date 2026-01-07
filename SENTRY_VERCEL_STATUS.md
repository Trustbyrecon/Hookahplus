# ✅ Sentry Vercel DSN Status

**Date:** 2025-01-27  
**Last Checked:** 2025-01-27

---

## 📊 Current Status

### Vercel Production DSNs

**Status:** ⚠️ **Manual Setup Required**

The DSNs are **NOT automatically set** in Vercel. You need to manually add them via the Vercel dashboard.

---

## 🔑 DSNs to Configure

### App Build (hookahplus-app)
```
NEXT_PUBLIC_SENTRY_DSN=https://9ccf63cd4d007820a02decc75cf47b36@o4510619153858560.ingest.us.sentry.io/4510624294109184
```

### Guest App (hookahplus-guests)
```
NEXT_PUBLIC_SENTRY_DSN=https://d3f813910bcf9752c23d4a2b17fe1ae8@o4510619153858560.ingest.us.sentry.io/4510624346603520
```

---

## ✅ Setup Checklist

- [ ] App DSN added to `hookahplus-app` in Vercel
- [ ] Guest DSN added to `hookahplus-guests` in Vercel
- [ ] Both set for all environments (Production, Preview, Development)
- [ ] Projects redeployed after adding DSNs
- [ ] Test endpoints verified in production
- [ ] Errors appearing in Sentry dashboard from production

---

## 🚀 Quick Setup Steps

### 1. Add DSN to App Project

1. Go to: https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-app/settings/environment-variables
2. Click **"+ Add Another"**
3. **Key:** `NEXT_PUBLIC_SENTRY_DSN`
4. **Value:** `https://9ccf63cd4d007820a02decc75cf47b36@o4510619153858560.ingest.us.sentry.io/4510624294109184`
5. **Environments:** ✅ Production, ✅ Preview, ✅ Development
6. Click **"Save"**

### 2. Add DSN to Guest Project

1. Go to: https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-guests/settings/environment-variables
2. Click **"+ Add Another"**
3. **Key:** `NEXT_PUBLIC_SENTRY_DSN`
4. **Value:** `https://d3f813910bcf9752c23d4a2b17fe1ae8@o4510619153858560.ingest.us.sentry.io/4510624346603520`
5. **Environments:** ✅ Production, ✅ Preview, ✅ Development
6. Click **"Save"**

### 3. Redeploy Projects

**Option A: Via Dashboard**
- Go to each project → Deployments
- Click "..." on latest deployment → "Redeploy"

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "Trigger redeploy for Sentry DSN"
git push
```

### 4. Verify Setup

**Test App Build:**
```bash
curl https://your-app-domain.vercel.app/api/test-sentry
```

**Test Guest App:**
```bash
curl https://your-guest-domain.vercel.app/api/test-sentry
```

**Check Sentry Dashboard:**
- Go to https://hookahplusnet.sentry.io
- Check `javascript-nextjs-app` project for app errors
- Check `javascript-nextjs-guest` project for guest errors

---

## 🔍 Verification

**After redeploy, verify:**

1. **Environment Variables:**
   ```bash
   # Check app project
   vercel env ls hookahplus-app
   
   # Check guest project
   vercel env ls hookahplus-guests
   ```

2. **Test Endpoints:**
   - App: `https://your-app.vercel.app/api/test-sentry`
   - Guest: `https://your-guest.vercel.app/api/test-sentry`

3. **Sentry Dashboard:**
   - Errors should appear with environment: `vercel-production` or `production`
   - Check Issues tab for new errors

---

## 📝 Notes

- **Local vs Production**: Local `.env.local` files are separate from Vercel environment variables
- **Automatic Detection**: Vercel doesn't automatically detect or set Sentry DSNs
- **Redeploy Required**: Changes to environment variables require a redeploy to take effect
- **Environment Tags**: Sentry will tag events with `vercel-production`, `vercel-preview`, or `vercel-development` based on Vercel's `VERCEL_ENV` variable

---

## 🔗 Quick Links

- **App Project Settings:** https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-app/settings/environment-variables
- **Guest Project Settings:** https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-guests/settings/environment-variables
- **Sentry Dashboard:** https://hookahplusnet.sentry.io
- **Full Setup Guide:** See `SENTRY_VERCEL_SETUP.md`

---

**Status:** ⚠️ Manual Setup Required  
**Last Updated:** 2025-01-27


