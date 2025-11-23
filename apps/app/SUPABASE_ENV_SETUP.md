# Supabase Environment Variables Setup

**Status:** ✅ Variables added to `.env.local`

---

## What Was Added

The following variables have been added to `apps/app/.env.local`:

```bash
# ===========================================
# SUPABASE AUTH
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://hsypmyqtlxjwpnkkacmo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeXBteXF0bHhqd3Bua2thY21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjA0MjQsImV4cCI6MjA2NTUzNjQyNH0.RoYFf-uSgewj4xPx2d0sxczqGGLwzaYVRCYI4LGdIHM
   DATABASE_URL=postgresql://postgres:E1hqrL3FjsWVItZR@db.hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres?sslmode=require

NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## ⚠️ CRITICAL: Fix Required

### Issue 1: SERVICE_ROLE_KEY is Incorrect

The `SUPABASE_SERVICE_ROLE_KEY` you provided shows `"role":"anon"` in the JWT payload, which means it's actually the **anon key**, not the service role key.

**To Fix:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `hsypmyqtlxjwpnkkacmo`
3. Navigate to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Copy the **`service_role`** key (NOT the `anon` key)
   - It should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - When decoded, the JWT payload should show `"role":"service_role"` (not `"role":"anon"`)
6. Update `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=<paste-correct-service-role-key-here>
   ```

### Issue 2: ANON_KEY is Incomplete

The `NEXT_PUBLIC_SUPABASE_ANON_KEY` shows `...` which means it's incomplete.

**To Fix:**
1. In Supabase Dashboard → **Settings** → **API**
2. Copy the **`anon` public** key (the one that's safe to expose in client code)
3. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-complete-anon-key-here>
   ```

---

## How to Verify Keys

### Verify SERVICE_ROLE_KEY

The service role key JWT payload should decode to:
```json
{
  "iss": "supabase",
  "ref": "hsypmyqtlxjwpnkkacmo",
  "role": "service_role",  // ← Must be "service_role", NOT "anon"
  "iat": ...,
  "exp": ...
}
```

You can decode JWT at: https://jwt.io

### Verify ANON_KEY

The anon key JWT payload should decode to:
```json
{
  "iss": "supabase",
  "ref": "hsypmyqtlxjwpnkkacmo",
  "role": "anon",  // ← This is correct for anon key
  "iat": ...,
  "exp": ...
}
```

---

## Security Notes

1. **`SUPABASE_SERVICE_ROLE_KEY`**:
   - ⚠️ **NEVER** commit to git
   - ⚠️ **NEVER** expose to client-side code
   - ✅ Only use in server-side API routes, webhooks, migrations
   - ✅ Already in `.gitignore` (`.env.local` is ignored)

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**:
   - ✅ Safe to expose (it's public)
   - ✅ Used in client-side code
   - ✅ RLS policies protect your data

3. **`NEXT_PUBLIC_SUPABASE_URL`**:
   - ✅ Safe to expose (it's public)
   - ✅ Used in client-side code

---

## Next Steps

1. **Fix SERVICE_ROLE_KEY** (critical - webhooks won't work without correct key)
2. **Complete ANON_KEY** (required for auth to work)
3. **Test authentication:**
   ```bash
   # Start dev server
   npm run dev:app
   
   # Navigate to login page
   # http://localhost:3002/login
   ```
4. **Run migrations** (see `SUPABASE_AUTH_SETUP.md`)

---

## Quick Reference

| Variable | Where to Find | Security |
|----------|---------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Settings → API → Project URL | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon public | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API → service_role | **Secret** |

---

**After fixing the keys, you're ready to test the Supabase Auth integration!**

