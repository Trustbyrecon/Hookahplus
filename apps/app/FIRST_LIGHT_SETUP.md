# First Light Setup Guide

## Quick Fix for Current Errors

You're seeing two errors:
1. **401 Unauthorized** on `/api/metrics/live` - Auth not bypassed
2. **500 Internal Server Error** on `/api/sessions` - Database connection failing

## Step 1: Set Environment Variables

Create or update `apps/app/.env.local` with:

```bash
# First Light Mode - Bypasses auth for core routes
FIRST_LIGHT_MODE=true

# Database Connection (required)
# Get this from your Supabase project settings
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# Supabase Auth (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Get Your DATABASE_URL

### If using Supabase:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** under "Connection pooling"
5. Replace `[YOUR-PASSWORD]` with your database password

### If using local PostgreSQL:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/hookahplus
```

## Step 3: Restart Your Dev Server

After setting environment variables, **restart your Next.js dev server**:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
# or
npm run dev:app
```

## Step 4: Verify Setup

1. Visit `/api/health` - Should return:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "auth": "bypassed",
     "firstLightMode": true
   }
   ```

2. Check the Fire Session Dashboard:
   - First Light Banner should show "READY" (green)
   - System Health should show Database: Connected
   - Sessions API should show Ready

## Troubleshooting

### Still getting 401 on metrics?
- Verify `FIRST_LIGHT_MODE=true` in `.env.local`
- Restart dev server after adding env var
- Check that middleware is reading the env var (check server logs)

### Still getting 500 on sessions?
- Verify `DATABASE_URL` is set correctly
- Test connection: `npx prisma db pull` (should connect)
- Check database is running and accessible
- Verify password in connection string is correct

### Database connection errors?
Common issues:
- Wrong password in connection string
- Database server is paused (Supabase free tier pauses after inactivity)
- Firewall blocking connection
- SSL mode mismatch (try adding `?sslmode=require`)

## Next Steps After Setup

Once health check shows green:
1. Enable "First Light Focus" toggle in dashboard
2. Complete the First Light Checklist
3. Create your first session
4. Verify it persists after refresh

