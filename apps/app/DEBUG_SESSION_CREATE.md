# Debugging Session Create API

## Current Issue
Getting "Internal server error" when creating a session via `/api/sessions` POST endpoint.

## Root Cause Analysis

### Database Configuration Mismatch
- **Prisma Schema**: Configured for `postgresql`
- **DATABASE_URL**: Set to `file:./dev.db` (SQLite format)
- **Result**: Prisma client fails to connect, causing internal server error

## Solutions

### Option 1: Use PostgreSQL (Recommended for Production)
1. Set up PostgreSQL database (local or Supabase)
2. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/hookahplus"
   ```
3. Run migrations:
   ```bash
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

