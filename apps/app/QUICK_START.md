# 🚀 Quick Start: Test Database Connection

## ✅ Configuration Complete

Your PostgreSQL connection string has been configured in `.env.local`.

## Next Steps

### 1. Generate Prisma Client
```bash
cd apps/app
npx prisma generate
```

**If you get a file lock error:**
- Close all running dev servers
- Close Prisma Studio if open
- Try again

### 2. Test Database Connection
```bash
# Option A: Using dotenv-cli (if installed)
npx dotenv-cli -e .env.local -- npx prisma db pull

# Option B: Set environment variable directly (Windows)
$env:DATABASE_URL="postgresql://postgres:E1hqrL3FjsWVItZR@hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres"; npx prisma db pull

# Option C: Use Next.js dev server (loads .env.local automatically)
npm run dev
# Then test the API endpoint
```

### 3. Run Migrations
```bash
npx prisma migrate deploy
```

### 4. Test Session Creation

Start your dev server:
```bash
npm run dev
```

Then test the API:
```bash
curl -X POST http://localhost:3002/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "T-001",
    "customerName": "Test Customer",
    "flavor": "Blue Mist",
    "amount": 2500
  }'
```

## ✅ Success Indicators

- `npx prisma db pull` completes without errors
- `npx prisma generate` completes successfully
- API returns `200 OK` with session data
- Session appears in Prisma Studio

## 🔍 Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Verify `.env.local` exists in `apps/app/` directory
- Check the file contains `DATABASE_URL="postgresql://..."`
- Try setting it explicitly: `$env:DATABASE_URL="..."` (PowerShell)

### "Connection refused" or "Timeout"
- Verify Supabase project is active
- Check database password is correct
- Ensure network allows connections to Supabase

### "Prisma schema validation error"
- Run `npx prisma format` to fix schema
- Check `prisma/schema.prisma` is valid

## 📝 Files Updated

- ✅ `apps/app/.env.local` - PostgreSQL connection string
- ✅ `.gitignore` - Database security patterns
- ✅ `apps/app/.gitignore` - Database security patterns
- ✅ `apps/app/env.template` - DATABASE_URL placeholder

