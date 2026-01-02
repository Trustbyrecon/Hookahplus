# Quick Fix: Update DIRECT_URL

Your `.env.local` has `DIRECT_URL` pointing to the wrong hostname.

## Current (Wrong):
```
DIRECT_URL=postgresql://postgres:${DB_PASSWORD}@db.hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres?sslmode=require
```

## Should Be (Correct):
```
DIRECT_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:${DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

## Quick Fix:

1. Open `apps/app/.env.local`
2. Find the `DIRECT_URL` line
3. Replace it with (use your actual password from Supabase dashboard):
   ```
   DIRECT_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:${DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
   ```
   **Note:** Replace `${DB_PASSWORD}` with your actual database password from Supabase.
4. Save the file
5. Run migration again:
   ```bash
   cd apps/app
   npx prisma migrate dev --name add_setup_session
   ```

## Key Differences:
- ✅ Use `aws-0-us-east-2.pooler.supabase.com` (not `db.hsypmyqtlxjwpnkkacmo.supabase.co`)
- ✅ Use `postgres.hsypmyqtlxjwpnkkacmo` (not just `postgres`)
- ✅ Port `5432` for direct connection (correct)
- ✅ Include `sslmode=require`

