# 🔧 Fix Database Connection - Immediate Steps

## Current Issue
The dev server is running but can't connect to the database. The Prisma client needs to be regenerated and the connection string needs SSL.

## ⚠️ Action Required

### Step 1: Stop the Dev Server
Press `Ctrl+C` in the terminal where `npm run dev` is running to stop it.

### Step 2: Update Connection String with SSL
The `.env.local` file has been updated to include SSL mode. Verify it contains:
```env
DATABASE_URL="postgresql://postgres:E1hqrL3FjsWVItZR@hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres?sslmode=require"
```

### Step 3: Regenerate Prisma Client
```bash
cd apps/app
npx prisma generate
```

**If you still get a file lock error:**
- Close all terminal windows
- Close any Prisma Studio instances
- Close VS Code/Cursor if it has the Prisma extension running
- Try again

### Step 4: Run Migrations (if needed)
```bash
npx prisma migrate deploy
```

This will apply your schema to the Supabase database.

### Step 5: Restart Dev Server
```bash
npm run dev
```

### Step 6: Test Again
Go to http://localhost:3002/fire-session-dashboard and try creating a session.

## 🔍 What Changed

1. **Added SSL to connection string**: Supabase requires `?sslmode=require`
2. **Prisma client needs regeneration**: After changing DATABASE_URL, Prisma must regenerate

## ✅ Expected Result

After these steps:
- No more "Unable to connect to database" errors
- Sessions can be created successfully
- Data persists in Supabase database

## 🐛 If Still Failing

Check the terminal output for specific error messages:
- Connection timeout → Check Supabase project is active
- Authentication failed → Verify password is correct
- SSL error → Connection string should have `?sslmode=require`
- Schema mismatch → Run `npx prisma migrate deploy`

