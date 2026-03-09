# Admin Access Setup

This guide explains how to grant access to `/admin` and `/admin/codigo-kpis` for yourself and others.

## Requirements

1. **Supabase configured** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must be set in your environment.
2. **Database** — Prisma must be able to connect (same DB as Supabase, or shared `memberships` table).

## Quick Setup (Script)

From the repo root or `apps/app`:

```bash
# Set credentials via environment (never commit these)
export ADMIN_EMAIL="your-email@example.com"
export ADMIN_PASSWORD="your-secure-password"

npm run admin:create
```

(From root this runs the script in `apps/app`; from `apps/app` it runs directly.)

The script will:

1. Create or update the Supabase Auth user (email + password)
2. Create a tenant if none exists
3. Create a membership with `role: admin` linking the user to the tenant

## Manual Steps (Supabase Dashboard)

If the script fails or you prefer manual setup:

### 1. Create Auth User (Supabase Dashboard)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Confirm email (or use "Auto Confirm User" if available)

### 2. Create Tenant + Membership (Database)

Run in Supabase SQL Editor or via Prisma:

```sql
-- Get your user ID from Supabase Auth → Users (copy the UUID)
-- Create a tenant
INSERT INTO tenants (id, name, created_at)
VALUES (gen_random_uuid(), 'Admin Tenant', now())
RETURNING id;

-- Create membership (replace USER_ID and TENANT_ID with actual UUIDs)
INSERT INTO memberships (user_id, tenant_id, role, created_at)
VALUES ('USER_ID', 'TENANT_ID', 'admin', now());
```

Or use the script above, which does this automatically.

## Adding More Admins

Run the script again with a different email:

```bash
export ADMIN_EMAIL="another-admin@example.com"
export ADMIN_PASSWORD="their-secure-password"
npx tsx scripts/create-admin-user.ts
```

Each new admin gets a membership on the same default tenant (or a new tenant if you customize the script).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Supabase admin env not configured" | Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` or deployment env |
| "insufficient_permissions" after login | No `memberships` row with `role: admin` or `owner` — run the script or add membership manually |
| "Invalid login credentials" | User doesn't exist in Supabase Auth, or password is wrong — create user via script or dashboard |
| "memberships_user_id_fkey" error | User ID doesn't exist in `auth.users` — create the Auth user first |

## Security Notes

- **Never commit** `ADMIN_EMAIL`, `ADMIN_PASSWORD`, or `SUPABASE_SERVICE_ROLE_KEY` to git.
- Use strong passwords for admin accounts.
- Rotate `SUPABASE_SERVICE_ROLE_KEY` if it is ever exposed.
