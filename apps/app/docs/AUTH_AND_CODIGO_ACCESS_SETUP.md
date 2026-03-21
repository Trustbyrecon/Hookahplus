# Auth and CODIGO Access Setup

## Overview

Professional-grade SaaS auth and time-boxed CODIGO access (14-day auto-expiry) have been implemented.

## What Was Implemented

### 1. SaaS Login Foundation
- **`/login`** — Polished sign-in page (email/password + magic link)
- Session persistence via Supabase Auth cookies
- Redirect to `/login` when accessing protected routes without auth (when `FIRST_LIGHT_MODE` is off)

### 2. CODIGO Access Control
- **`CodigoAccess`** model in Prisma — stores `userId`, `grantedAt`, `expiresAt`, `status`
- **`lib/codigo-access.ts`** — `hasCodigoAccess(user)`, `grantCodigoAccess`, `extendCodigoAccess`, `revokeCodigoAccess`, `expireCodigoAccessNow` (sets `expiresAt` in the past; status stays `active`)
- **14-day expiry** — centralized in `CODIGO_ACCESS_DURATION_DAYS`
- **Admin override** — owner/admin roles bypass expiry

### 3. Route Protection
- **Middleware** — Protects app routes (fire-session-dashboard, staff-panel, lounge-layout, etc.) when not in First Light mode
- **CODIGO operator routes** — `/codigo/operator`, `/codigo/profile`, `/codigo/kpis` require valid CODIGO access
- **`/codigo/access-expired`** — Shown when access has expired; "Request extension" and "Back to dashboard" CTAs

### 4. API Routes
- **`GET /api/codigo/access/status`** — Returns access status for current user
- **`POST /api/codigo/access/grant`** — Admin-only; grant access to a user
- **`POST /api/codigo/access/extend`** — Admin-only; extend by 14 days

## Auth Troubleshooting

If magic link or password login fails, see [AUTH_TROUBLESHOOTING.md](./AUTH_TROUBLESHOOTING.md). Common fixes:

- **Supabase Redirect URLs** — Add `https://app.hookahplus.net/**` in Supabase Dashboard → Auth → URL Configuration
- **No password** — Magic-link-only users: use "Forgot password?" to set one, or use magic link

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for auth) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for auth) | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | For admin ops | Service role key |
| `FIRST_LIGHT_MODE` | Optional | `true` = bypass auth for core routes |
| `DATABASE_URL` | Yes | PostgreSQL connection string |

## Database Migration

Run the CODIGO access table migration:

```bash
cd apps/app
npx prisma db execute --file prisma/add_codigo_access.sql
```

Or use Prisma migrate:

```bash
npx prisma migrate dev --name add_codigo_access
```

## How CODIGO 14-Day Expiry Works

1. **Grant** — Admin calls `POST /api/codigo/access/grant` (or with `{ userId }` for another user). Sets `grantedAt = now`, `expiresAt = now + 14 days`.
2. **Check** — On each request to CODIGO operator routes, `CodigoAccessGate` calls `hasCodigoAccess(userId, isAdmin)`. Returns `true` if status is `active` and `now < expiresAt`, or if user is admin/owner.
3. **Expired** — If expired, user is redirected to `/codigo/access-expired`.
4. **Extend** — Admin calls `POST /api/codigo/access/extend` to add 14 days from current expiry.

## How to Activate CODIGO Access for a User

### Option A: API (Admin)
Use the **full URL** of your app. Admin must be logged in (include session cookies).

```bash
# Local dev
curl -X POST http://localhost:3002/api/codigo/access/grant \
  -H "Content-Type: application/json" \
  -d '{}' \
  --cookie "sb-<project-ref>-auth-token=..." \
  --cookie "sb-<project-ref>-auth-token-code-verifier=..."

# Production (replace with your domain)
curl -X POST https://app.hookahplus.net/api/codigo/access/grant \
  -H "Content-Type: application/json" \
  -d '{}' \
  --cookie "sb-<project-ref>-auth-token=..." \
  --cookie "sb-<project-ref>-auth-token-code-verifier=..."

# Grant to specific user (admin only)
curl -X POST https://app.hookahplus.net/api/codigo/access/grant \
  -H "Content-Type: application/json" \
  -d '{"userId":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}' \
  --cookie "..." 
```

**Tip:** Copy cookies from your browser (DevTools → Application → Cookies) after signing in at `/admin/login`.

### Option B: Database (Manual)
Replace `'YOUR-SUPABASE-USER-UUID'` with a **valid UUID** from Supabase Auth. Get it from Supabase Dashboard → Authentication → Users, or from `auth.users.id`.

```sql
INSERT INTO codigo_access (id, user_id, granted_at, expires_at, status, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'YOUR-SUPABASE-USER-UUID'::uuid,   -- e.g. 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  NOW(),
  NOW() + INTERVAL '14 days',
  'active',
  NOW(),
  NOW()
);
```

**Getting your user UUID:**
1. Supabase Dashboard → Authentication → Users → copy the UUID from the user row
2. Or run: `SELECT id FROM auth.users WHERE email = 'your@email.com' LIMIT 1;`

### Option C: Script (by email)
For magic-link users who don't have admin/owner membership, grant CODIGO access by email:

```bash
cd apps/app
npx tsx scripts/grant-codigo-access.ts your@email.com
```

Or with env: `EMAIL=your@email.com npx tsx scripts/grant-codigo-access.ts`

The script looks up the user in Supabase Auth (they must have signed in at least once) and grants 14-day CODIGO access.

### Option D: Expire pilot immediately (Option A — `expiresAt` in the past)

Ends CODIGO entitlement right away by setting `expiresAt` to ~1 minute ago. **`status` stays `active`**; checks use `now < expiresAt`.

```bash
cd apps/app
npm run codigo:expire -- moe@districthookah.com
# or
EMAIL=moe@districthookah.com npx tsx scripts/expire-codigo-access.ts
```

**SQL equivalent:**

```sql
UPDATE codigo_access
SET expires_at = NOW() - INTERVAL '1 minute', updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'moe@districthookah.com' LIMIT 1);
```

### Downgrade tenant role to `viewer` (remove owner/admin bypass)

`owner` / `admin` bypass CODIGO expiry in `hasCodigoAccess`. To use only `codigo_access` gating, downgrade to **`viewer`** (lowest role).

```bash
cd apps/app
# Default: only owner/admin → viewer (staff unchanged)
npm run membership:downgrade-viewer -- moe@districthookah.com

# Every non-viewer membership → viewer (includes staff)
npm run membership:downgrade-viewer -- --all moe@districthookah.com

# Preview only
DRY_RUN=1 npm run membership:downgrade-viewer -- moe@districthookah.com
```

**SQL equivalent** (Hookah+ DB `memberships` table; UUID from Supabase Auth):

```sql
UPDATE memberships
SET role = 'viewer'
WHERE user_id = 'YOUR-SUPABASE-USER-UUID'::uuid
  AND role IN ('owner', 'admin');
```

### Revoke all Hookah+ access (Supabase Auth)

Blocks **app.hookahplus.net** (and any flow using the same Supabase project) by **banning** the Auth user. Reversible in **Supabase Dashboard → Authentication → Users** (remove ban).

```bash
cd apps/app
npm run access:revoke -- moe@districthookah.com
```

**Permanent removal** (deletes Auth user + `memberships` + `codigo_access` for that UUID):

```bash
CONFIRM_DELETE=yes npm run access:revoke -- --delete moe@districthookah.com
```

Requires `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. `--delete` also requires `DATABASE_URL`.

## Magic Link + CODIGO Access

Magic link sign-in at `/login` creates a valid Supabase session. CODIGO access is separate:

- **Admin/owner** — If you have a membership with role `admin` or `owner`, you bypass CODIGO expiry.
- **Other users** — Need a `codigo_access` row. Run `scripts/grant-codigo-access.ts your@email.com` after first sign-in.

The `codigo_access.user_id` must match your Supabase `auth.users.id`. The grant script resolves email → userId automatically.

## What to Test Manually

1. **Login flow** — Visit `/login`, sign in with email/password or magic link. Should redirect to `/fire-session-dashboard`.
2. **Protected routes** — With `FIRST_LIGHT_MODE=false`, visit `/fire-session-dashboard` without auth. Should redirect to `/login`.
3. **CODIGO access** — Grant access to a user, visit `/codigo/operator`. Should load. Revoke or wait for expiry, should redirect to `/codigo/access-expired`.
4. **Admin override** — Admin/owner can access CODIGO operator routes without a CodigoAccess record.
5. **Extend** — Call extend API, verify `expiresAt` is pushed out 14 days.

## First Light Mode

When `FIRST_LIGHT_MODE=true`:
- Auth is bypassed for protected app routes
- CODIGO access gate is bypassed
- Enables development and pilot without full auth setup

Set `FIRST_LIGHT_MODE=false` for production with auth and CODIGO gating.
