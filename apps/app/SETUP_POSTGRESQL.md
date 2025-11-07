# PostgreSQL Setup Guide for Local Development

## Current Issue
- Prisma schema is configured for PostgreSQL
- DATABASE_URL is set to SQLite (`file:./dev.db`)
- This causes connection failures

## Quick Setup Options

### Option A: Use Supabase (Recommended - Already Have RLS Migrations)

If you already have a Supabase project with RLS migrations:

1. **Get Your Supabase Connection String:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Settings → Database
   - Copy the "URI" connection string
   - Format: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`

2. **Update `.env.local`:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT.supabase.co:5432/postgres"
   ```

3. **Run Migrations:**
   ```bash
   cd apps/app
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **Test Connection:**
   ```bash
   npx prisma db pull
   ```

### Option B: Local PostgreSQL (For Development)

1. **Install PostgreSQL:**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Create Database:**
   ```sql
   CREATE DATABASE hookahplus_dev;
   ```

3. **Update `.env.local`:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hookahplus_dev"
   ```

4. **Run Migrations:**
   ```bash
   cd apps/app
   npx prisma generate
   npx prisma migrate dev
   ```

### Option C: Quick SQLite Fix (Temporary)

If you need to test immediately without setting up PostgreSQL:

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "sqlite"  // Change from "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Keep `.env.local` as is:**
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Recommended: Supabase Setup

Since you have RLS migrations, you likely already have Supabase configured. Let's set it up:

1. Check if you have Supabase credentials
2. Update DATABASE_URL in .env.local
3. Test the connection
4. Run migrations

## Testing After Setup

```bash
# Test database connection
npx prisma db pull

# Test session creation via API
curl -X POST http://localhost:3002/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "T-001",
    "customerName": "Test Customer",
    "flavor": "Blue Mist"
  }'
```

## Next Steps

1. Choose your database option (Supabase recommended)
2. Update `.env.local` with correct DATABASE_URL
3. Run `npx prisma generate && npx prisma migrate deploy`
4. Test session creation

