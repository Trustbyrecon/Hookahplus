# Set DIRECT_URL for Migrations

**Project:** `hookahplus-app` (apps/app)  
**Purpose:** Enable automatic Prisma migrations on Vercel

---

## Quick Setup

### Option 1: Via Vercel CLI (Recommended)

1. **Get your Supabase database password:**
   - Go to: https://supabase.com/dashboard/project/hsypmyqtlxjwpnkkacmo/settings/database
   - Copy the password from "Connection string" section

2. **Run the setup script:**
   ```bash
   cd apps/app
   chmod +x scripts/set-direct-url.sh
   ./scripts/set-direct-url.sh YOUR_SUPABASE_PASSWORD
   ```

### Option 2: Manual Vercel CLI

```bash
cd apps/app

# Set for Production
vercel env add DIRECT_URL production
# When prompted, paste:
# postgresql://postgres.hsypmyqtlxjwpnkkacmo:YOUR_SUPABASE_PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require

# Set for Preview
vercel env add DIRECT_URL preview
# Same value as above

# Set for Development  
vercel env add DIRECT_URL development
# Same value as above
```

### Option 3: Via Vercel Dashboard

1. Go to: https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-app/settings/environment-variables
2. Add new variable:
   - **Name:** `DIRECT_URL`
   - **Value:** `postgresql://postgres.hsypmyqtlxjwpnkkacmo:YOUR_SUPABASE_PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require`
   - **Environments:** Production, Preview, Development
3. Save

---

## Value Format

**DIRECT_URL:**
```
postgresql://postgres.hsypmyqtlxjwpnkkacmo:YOUR_SUPABASE_PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
```

**Key Differences from DATABASE_URL:**
- Port: `5432` (direct) vs `6543` (pooler)
- No `pgbouncer=true` parameter
- Has `sslmode=require` for SSL

---

## Verification

After setting, verify:

```bash
cd apps/app
vercel env ls | grep DIRECT_URL
```

You should see `DIRECT_URL` listed for all environments.

---

## What This Enables

- ✅ Automatic migrations on Vercel deploy
- ✅ `prisma migrate deploy` runs during build
- ✅ No more manual SQL in Supabase editor
- ✅ Schema stays in sync automatically

---

**Status:** Ready to set - just need Supabase password

