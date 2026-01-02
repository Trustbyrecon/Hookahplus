# Fix Database Migration Automation

**Date:** 2025-01-27  
**Status:** ✅ Solution Ready  
**Priority:** High

---

## 🔍 Problem

Migrations must be run manually in Supabase SQL Editor instead of automatically via Prisma.

**Root Causes:**
1. `DIRECT_URL` not configured in environment variables
2. No automated migration script in build/deploy process
3. Prisma needs `DIRECT_URL` for migrations (bypasses connection pooling)

---

## ✅ Solution

### 1. Environment Variables Setup

**Required Variables:**
```env
# Connection Pooling URL (for app queries)
DATABASE_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:YOUR_SUPABASE_PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Direct Connection URL (for migrations)
DIRECT_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:YOUR_SUPABASE_PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

**Key Differences:**
- `DATABASE_URL`: Port `6543` (connection pooler) - for app queries
- `DIRECT_URL`: Port `5432` (direct) - for migrations only

---

### 2. Update package.json Scripts

Add migration automation scripts:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:status": "prisma migrate status",
    "postinstall": "prisma generate",
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

### 3. Vercel Deployment Configuration

**Option A: Automatic Migrations (Recommended)**

Add to `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "PRISMA_GENERATE_DATAPROXY": "false"
  }
}
```

**Option B: Manual Migration Hook**

Create `vercel.json` with post-deploy hook:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/migrations/run",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

### 4. Migration API Endpoint (Optional)

Create `/api/migrations/run/route.ts` for manual triggers:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST(req: NextRequest) {
  // Verify authorization token
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECT_URL: process.env.DIRECT_URL,
      },
    });

    return NextResponse.json({ success: true, message: 'Migrations applied' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

### 5. Local Development Setup

**Create `.env.local` (if not exists):**
```bash
# Copy from Supabase Dashboard → Settings → Database
# Connection Pooling (for app)
DATABASE_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:YOUR_SUPABASE_PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:YOUR_SUPABASE_PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

**Run migrations locally:**
```bash
cd apps/app
npx prisma migrate dev --name your_migration_name
```

---

### 6. CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Run Migrations
on:
  push:
    branches: [main]
    paths:
      - 'apps/app/prisma/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
```

---

## 🚀 Quick Fix Steps

1. **Set DIRECT_URL in Vercel:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Add `DIRECT_URL` with direct connection string (port 5432)

2. **Update build script:**
   ```bash
   # In package.json, update build:
   "build": "prisma generate && prisma migrate deploy && next build"
   ```

3. **Test locally:**
   ```bash
   cd apps/app
   npx prisma migrate deploy
   ```

4. **Deploy:**
   - Push to main branch
   - Vercel will run migrations automatically during build

---

## ✅ Verification

After setup, verify migrations run automatically:

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Test new migration:**
   ```bash
   npx prisma migrate dev --name test_migration
   ```

3. **Verify in Supabase:**
   - Check `_prisma_migrations` table
   - All migrations should be listed

---

## 📝 Notes

- **Never use connection pooler for migrations** - Always use `DIRECT_URL` (port 5432)
- **Migrations run during build** - This ensures schema is always up-to-date
- **Rollback strategy** - Use `prisma migrate resolve --rolled-back <migration_name>` if needed

---

**Status:** Ready to implement

