# Magic Link Fix - Routing to App Instead of Site

## Problem
Magic links from admin login were routing to the site (localhost:3000) instead of the app (localhost:3002).

## Root Cause
1. Supabase's "Site URL" setting might be set to the site URL
2. When `NEXT_PUBLIC_APP_URL` is not set, the code falls back to `window.location.origin`, which could be the site URL if accessed from the site
3. Supabase may use the Site URL as a default if the redirect URL doesn't match allowed redirects

## Solution Implemented

### 1. Hardcoded Local Development URL
In `apps/app/app/admin/login/page.tsx`, the magic link generation now:
- **For localhost:** Always uses `http://localhost:3002` (app port)
- **For production:** Uses `NEXT_PUBLIC_APP_URL` or falls back to current origin

```typescript
let appUrl: string;
if (typeof window !== 'undefined') {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    // Force app port (3002) for local development
    appUrl = `http://localhost:3002`;
  } else {
    // Production: use env var or current origin
    appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
} else {
  // Server-side: use env var or default to localhost:3002
  appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
}
```

### 2. Supabase Configuration Required

**In Supabase Dashboard → Authentication → URL Configuration:**

1. **Site URL:** Set to your production app URL:
   ```
   https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app
   ```
   OR for local dev testing:
   ```
   http://localhost:3002
   ```

2. **Redirect URLs:** Add these exact URLs:
   ```
   http://localhost:3002/auth/callback
   http://localhost:3002/admin
   http://localhost:3002/admin/operator-onboarding
   https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/auth/callback
   https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/admin
   ```

### 3. Testing

1. **Test Admin Login:**
   - Go to `http://localhost:3002/admin/login`
   - Enter email: `clark.dwayne@gmail.com`
   - Click "Use magic link instead"
   - Click "Send Magic Link"
   - Check email for magic link
   - Click magic link → Should route to `http://localhost:3002/admin`

2. **Verify Console Log:**
   - Open browser console
   - Look for: `[Admin Login] Magic link redirect URL: http://localhost:3002/auth/callback?...`
   - This confirms the correct URL is being used

3. **Check Email Link:**
   - Open the magic link email
   - The link should start with: `http://localhost:3002/auth/callback?...`
   - NOT `http://localhost:3000/...`

## Environment Variables

Ensure `apps/app/.env.local` has:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_SUPABASE_URL=https://hsypmyqtlxjwpnkkacmo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## If Still Routing to Site

1. **Check Supabase Site URL:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Ensure "Site URL" is set to `http://localhost:3002` (for local dev)

2. **Check Redirect URLs:**
   - Ensure `http://localhost:3002/auth/callback` is in the allowed redirect URLs list

3. **Clear Browser Cache:**
   - Clear cookies and cache
   - Try in incognito/private mode

4. **Check Email Link:**
   - Copy the magic link from email
   - Verify it starts with `http://localhost:3002/auth/callback`
   - If it starts with `http://localhost:3000`, Supabase is using the wrong Site URL

