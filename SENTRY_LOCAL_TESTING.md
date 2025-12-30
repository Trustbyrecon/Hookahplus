# Sentry Local Testing Guide

**Date:** 2025-01-27  
**Status:** Ready for Testing

---

## 🔧 Local Environment Setup

### For App Build (port 3002)

Create or update `apps/app/.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://9ccf63cd4d007820a02decc75cf47b36@o4510619153858560.ingest.us.sentry.io/4510624294109184
```

### For Guest App (port 3001)

Create or update `apps/guest/.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://d3f813910bcf9752c23d4a2b17fe1ae8@o4510619153858560.ingest.us.sentry.io/4510624346603520
```

---

## 🧪 Testing Steps

### 1. Set Up Local Environment Variables

Add the DSNs to `.env.local` files (see above).

### 2. Restart Development Servers

After adding environment variables, restart your dev servers:

```bash
# Terminal 1 - App Build
cd apps/app
npm run dev  # Should run on port 3002

# Terminal 2 - Guest App  
cd apps/guest
npm run dev  # Should run on port 3001
```

### 3. Test Endpoints

**App Build:**
```
http://localhost:3002/api/test-sentry
```

**Guest App:**
```
http://localhost:3001/api/test-sentry
```

### 4. Expected Response

You should see JSON like:
```json
{
  "message": "✅ Test error sent to Sentry! Check your Sentry dashboard.",
  "error": "Sentry test error from app build - this is intentional",
  "sentry": "Error captured successfully",
  "project": "javascript-nextjs-app",
  "dsn_configured": true
}
```

**Key:** `dsn_configured: true` means the DSN is properly set.

### 5. Verify in Sentry Dashboard

1. Go to: https://hookahplusnet.sentry.io
2. Check projects:
   - `javascript-nextjs-app` → Should show test error
   - `javascript-nextjs-guest` → Should show test error
3. Click on an error to see:
   - Tags: `component: test`, `action: sentry_test`
   - Extra data: `test: true`, `app: 'app-build'` or `app: 'guest-app'`
   - Stack trace showing the test endpoint

---

## ✅ Troubleshooting

### Issue: `dsn_configured: false`

**Solution:**
- Make sure `.env.local` file exists in the correct directory
- Make sure the DSN is correct (no extra spaces, quotes, etc.)
- Restart the dev server after adding the DSN

### Issue: "Unauthorized" error (app build)

**Solution:**
- ✅ Fixed! Added `/api/test-sentry` to public routes in middleware
- Restart the dev server to pick up middleware changes

### Issue: Errors don't appear in Sentry

**Check:**
1. DSN is correct in `.env.local`
2. Dev server was restarted after adding DSN
3. Wait 5-10 seconds (Sentry can take a moment to process)
4. Check browser console for Sentry initialization messages
5. Verify Sentry config files exist:
   - `apps/app/sentry.client.config.ts`
   - `apps/app/sentry.server.config.ts`
   - `apps/guest/sentry.client.config.ts` (if created)
   - `apps/guest/sentry.server.config.ts` (if created)

### Issue: Guest app shows `dsn_configured: false`

**Solution:**
- Guest app doesn't have Sentry installed yet
- You need to:
  1. Install Sentry: `cd apps/guest && npm install @sentry/nextjs@10.30.0`
  2. Create Sentry config files (copy from app)
  3. Update `next.config.js`
  4. Add DSN to `.env.local`

---

## 🚀 Next Steps After Local Testing

1. **Add DSNs to Vercel** (see `SENTRY_VERCEL_SETUP.md`)
2. **Redeploy projects** to pick up environment variables
3. **Test in production** using the same endpoints
4. **Remove test endpoints** or keep them for future testing

---

## 📊 What to Look For in Sentry

When errors appear in Sentry, verify:

- ✅ **Tags are correct:**
  - `component: test`
  - `action: sentry_test`
  - `environment: development` (or `production`)

- ✅ **Extra data is present:**
  - `test: true`
  - `app: 'app-build'` or `app: 'guest-app'`
  - `timestamp: [ISO date]`

- ✅ **Stack trace shows:**
  - The test endpoint file
  - The line where error was thrown

- ✅ **Project is correct:**
  - App errors → `javascript-nextjs-app`
  - Guest errors → `javascript-nextjs-guest`

---

**Status:** Ready to Test  
**Last Updated:** 2025-01-27

