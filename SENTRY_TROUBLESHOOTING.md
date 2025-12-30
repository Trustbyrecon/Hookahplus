# 🔍 Sentry Troubleshooting Guide

## Issue: Errors Not Appearing in Sentry Dashboard

If you're seeing the Sentry onboarding/getting started page, it means **no errors have been received yet**. Here's how to troubleshoot:

---

## ✅ Step 1: Verify DSN Configuration

### Check Local Environment
```bash
# App build
cd apps/app
cat .env.local | grep SENTRY_DSN

# Guest build  
cd apps/guest
cat .env.local | grep SENTRY_DSN
```

### Check Test Endpoint Response
```bash
# Test app build
curl http://localhost:3002/api/test-sentry

# Test guest build
curl http://localhost:3001/api/test-sentry
```

**Expected Response:**
```json
{
  "message": "✅ Test error sent to Sentry!",
  "dsn_configured": true,
  "dsn_preview": "https://9ccf63cd4d0078..."
}
```

If `dsn_configured: false`, the DSN is not set correctly.

---

## ✅ Step 2: Verify Sentry Project

Make sure you're looking at the **correct Sentry project**:

- **App Build**: `javascript-nextjs-app` project
- **Guest Build**: `javascript-nextjs-guest` project

**Check Project in Sentry:**
1. Go to Sentry Dashboard
2. Click the project dropdown (top left)
3. Select the correct project:
   - `javascript-nextjs-app` for app build errors
   - `javascript-nextjs-guest` for guest build errors

---

## ✅ Step 3: Check Environment Filters

Sentry might be filtering by environment. Check the filter bar:

1. **Environment Filter**: Make sure it's set to "All Envs" or includes "development"
2. **Time Range**: Check "14D" or "24H" to see recent errors
3. **Status Filter**: Make sure "is unresolved" is selected (or check "All")

---

## ✅ Step 4: Verify Errors Are Being Sent

### Enable Debug Mode

The Sentry configs have `debug: true` in development. Check your server console for Sentry debug logs:

```bash
# Look for logs like:
[Sentry] Sending event to Sentry: https://o4510619153858560.ingest.us.sentry.io/...
[Sentry] Event sent successfully
```

### Check Network Tab

1. Open browser DevTools → Network tab
2. Trigger the test endpoint: `http://localhost:3002/api/test-sentry`
3. Look for requests to `*.ingest.us.sentry.io` or `*.ingest.sentry.io`
4. Check if the request returns `200 OK`

---

## ✅ Step 5: Wait for Processing

Sentry can take **10-30 seconds** to process and display errors:

1. Trigger the test endpoint
2. Wait 30 seconds
3. Refresh the Sentry dashboard
4. Check the "Issues" tab (not just the Feed page)

---

## ✅ Step 6: Check Sentry Stats Tab

1. Go to Sentry Dashboard → **Stats** tab
2. Enable **"Show client-discarded data"** option
3. This will show if events are being discarded and why

Common reasons for discards:
- Rate limiting
- Invalid DSN
- Filtered by `beforeSend` hook
- Network errors

---

## ✅ Step 7: Verify Production vs Development

**Important:** If you set DSNs in Vercel but are testing locally:

- **Local testing** uses `.env.local` files
- **Production** uses Vercel environment variables
- Make sure DSNs are set in **both places** if you want to test locally

---

## ✅ Step 8: Test with Browser Console

Open browser console and manually trigger Sentry:

```javascript
// In browser console
import('@sentry/nextjs').then(Sentry => {
  Sentry.captureException(new Error('Manual test from browser console'));
  console.log('Error sent!');
});
```

---

## ✅ Step 9: Check Sentry Project Settings

1. Go to **Settings** → **Projects** → Select your project
2. Check **Client Keys (DSN)**
3. Verify the DSN matches what's in your `.env.local`
4. Make sure the project is **active** (not paused)

---

## ✅ Step 10: Verify Next.js Sentry Integration

Check that `next.config.js` has Sentry wrapper:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

const configWithSentry = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;
```

---

## 🚨 Common Issues

### Issue: "DSN not configured" in test endpoint
**Solution:** Add DSN to `.env.local`:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o4510619153858560.ingest.us.sentry.io/4510624294109184
```

### Issue: Errors appear but then disappear
**Solution:** Check `beforeSend` hook - it might be filtering out test errors. The test endpoint errors should NOT be filtered.

### Issue: Network errors in browser console
**Solution:** Check firewall/proxy settings. Sentry requires outbound HTTPS to `*.ingest.sentry.io`.

### Issue: Wrong project receiving errors
**Solution:** Verify DSN matches the project. Each project has a unique DSN.

---

## 📊 Expected Behavior

After triggering the test endpoint:

1. **Immediate**: Test endpoint returns success JSON
2. **10-30 seconds**: Error appears in Sentry Issues tab
3. **Dashboard**: Onboarding page disappears, replaced with Issues list

---

## 🔗 Quick Test Commands

```bash
# Test app build
curl http://localhost:3002/api/test-sentry | jq

# Test guest build  
curl http://localhost:3001/api/test-sentry | jq

# Check Sentry is initialized (look for debug logs)
# Restart dev server and watch console
```

---

## 📝 Next Steps

If errors still don't appear after following these steps:

1. **Check Sentry Status Page**: https://status.sentry.io
2. **Review Sentry Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
3. **Contact Sentry Support**: If DSN is correct but no events are received

---

**Last Updated:** 2025-01-27

