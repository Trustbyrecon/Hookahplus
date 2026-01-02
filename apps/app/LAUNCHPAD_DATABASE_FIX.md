# Fix LaunchPad 500 Error - Database Connection

**Issue:** `/api/launchpad/session` returning 500 error  
**Root Cause:** Database connection or missing SetupSession table

---

## Quick Fix Steps

### 1. Verify DATABASE_URL Configuration

Your `DATABASE_URL` should use the **pooler** (port 6543) for app queries:

```env
DATABASE_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:${DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
```

**NOT** the direct connection (port 5432) - that's only for migrations via `DIRECT_URL`.

### 2. Check if SetupSession Table Exists

Run this to check:

```bash
cd apps/app
npx prisma db execute --stdin <<< "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'SetupSession');"
```

### 3. If Table Doesn't Exist - Run Migration

The `SetupSession` model should already be in your schema. If the table doesn't exist:

```bash
cd apps/app
npx prisma migrate dev --name add_setup_session
```

Or if you prefer to push the schema directly:

```bash
cd apps/app
npx prisma db push
```

### 4. Verify Connection

Test the connection:

```bash
cd apps/app
npx prisma db execute --stdin <<< "SELECT 1;"
```

---

## Common Issues

### Issue 1: Wrong Port in DATABASE_URL

**Symptom:** `Can't reach database server at db.hsypmyqtlxjwpnkkacmo.supabase.co:5432`

**Fix:** Use pooler URL (port 6543) in `DATABASE_URL`:

```env
# ✅ CORRECT - For app queries
DATABASE_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:${DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# ❌ WRONG - This is for migrations only
DATABASE_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:${DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

### Issue 2: Missing SetupSession Table

**Symptom:** `relation "SetupSession" does not exist`

**Fix:** Run migration:

```bash
cd apps/app
npx prisma migrate dev --name add_setup_session
```

### Issue 3: Prisma Client Not Generated

**Symptom:** `Cannot find module '@prisma/client'` or similar

**Fix:** Generate Prisma client:

```bash
cd apps/app
npx prisma generate
```

---

## Verification Checklist

- [ ] `DATABASE_URL` uses port `6543` (pooler)
- [ ] `DIRECT_URL` uses port `5432` (direct) - for migrations only
- [ ] `SetupSession` table exists in database
- [ ] Prisma client is generated (`npx prisma generate`)
- [ ] Connection test succeeds (`npx prisma db execute --stdin <<< "SELECT 1;"`)

---

## After Fix

Once fixed, the `/api/launchpad/session` endpoint should:
- ✅ Return 200 with session token
- ✅ Create SetupSession records
- ✅ Allow LaunchPad to proceed

Test by visiting: `http://localhost:3002/launchpad`

