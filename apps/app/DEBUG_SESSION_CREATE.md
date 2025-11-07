# Debugging Session Create API

## Current Issue
Getting "Internal server error" when creating a session via `/api/sessions` POST endpoint.

## Root Cause Analysis

### Database Configuration Mismatch ✅ FIXED
- **Prisma Schema**: Configured for `postgresql` ✅
- **DATABASE_URL**: ~~Set to `file:./dev.db` (SQLite format)~~ → **Updated to PostgreSQL** ✅
- **Result**: ~~Prisma client fails to connect~~ → **Connection configured, ready to test**

### ✅ Configuration Complete
- `.env.local` updated with Supabase PostgreSQL connection string
- `.gitignore` files updated to protect credentials
- `env.template` updated with DATABASE_URL placeholder

## Solutions

### Option 1: Use PostgreSQL (Recommended for Production)

#### A. Supabase Setup (Recommended - You Already Have RLS Migrations)

1. **Get Your Supabase Connection String:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **Settings** → **Database**
   - Scroll to **Connection String** section
   - Copy the **URI** connection string
   - Format: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`
   - **Important:** Replace `[PASSWORD]` with your actual database password

2. **Update `.env.local` in `apps/app/`:**
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

#### B. Local PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed):
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

### Option 2: Switch to SQLite (Quick Fix for Development)
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `.env.local`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```
3. Regenerate Prisma client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Option 3: Use Supabase (Cloud PostgreSQL)
1. Get connection string from Supabase dashboard
2. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Testing After Fix

1. **Test Database Connection**:
   ```bash
   npx prisma db pull
   ```
   Should complete without errors.

2. **Test API Endpoint**:
   ```bash
   curl -X POST http://localhost:3002/api/sessions \
     -H "Content-Type: application/json" \
     -d '{
       "tableId": "T-001",
       "customerName": "Test Customer",
       "flavor": "Blue Mist"
     }'
   ```

3. **Check Server Logs**:
   Look for:
   - `[Sessions API] POST request received`
   - `[Sessions API] Database connection successful`
   - `[Sessions API] Creating session with data:`
   - `[Sessions API] Session created successfully:`

## Enhanced Error Logging

The API now includes:
- Connection testing before processing
- Detailed error logging with stack traces
- Specific Prisma error code handling (P2002, P2003)
- Development vs production error detail levels

## Next Steps

1. Choose database solution (PostgreSQL or SQLite)
2. Update configuration
3. Test session creation
4. Verify data persists in database

