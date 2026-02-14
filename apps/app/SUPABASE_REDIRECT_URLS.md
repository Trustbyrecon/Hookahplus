# Supabase Redirect URLs Configuration

## Issue: Magic Link Expiration Error

If you're seeing `error=access_denied&error_code=otp_expired`, the redirect URL might not be configured in Supabase.

## Required Redirect URLs

Add these URLs to your Supabase project's **Authentication > URL Configuration**:

### Production
```
https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/auth/callback
https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/admin
```

### Local Development
```
http://localhost:3002/auth/callback
http://localhost:3002/admin
```

## How to Configure

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add the URLs above
5. Under **Site URL**, ensure it's set to your production URL:
   ```
   https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app
   ```

## Magic Link Expiration

Magic links expire after **1 hour** by default. If the link is expired:
- Request a new magic link
- The link must be clicked within 1 hour of generation

## Testing

After adding redirect URLs:
1. Request a new magic link
2. Click the link within 1 hour
3. You should be redirected to `/admin` (for admin users) or the specified redirect URL

