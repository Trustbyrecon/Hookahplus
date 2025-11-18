# Restart Server and Run Load Tests

## Status
✅ Migration applied - columns `session_state_v1` and `paused` exist in database
✅ Prisma schema updated with `@map("session_state_v1")` directive

## Required Steps

### 1. Stop the Dev Server
Press `Ctrl+C` in the terminal where the server is running.

### 2. Regenerate Prisma Client
```bash
cd apps/app
npx prisma generate
```

### 3. Restart the Dev Server
```bash
npm run dev
# or from root: npm run dev:app
```

### 4. Verify Session Creation Works
```bash
curl -s -i -X POST http://localhost:3002/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"tableId":"BENCH-001","customerName":"Load","flavor":["Mint"],"source":"QR"}'
```

Expected: HTTP 200 with session data (not 500 error)

### 5. Run Load Tests
```bash
npx tsx scripts/performance/run-all.ts --base http://localhost:3002 --concurrency 10,50,100
```

## Expected Results

After server restart:
- ✅ Single session creation: HTTP 200 OK
- ✅ 10 concurrent: ≥95% success
- ✅ 50 concurrent: ≥90% success
- ✅ 100 concurrent: ≥80% success
- ✅ No prepared statement errors (confirming PgBouncer compatibility)

## What Was Fixed

1. **Removed all raw SQL** - Using Prisma Client only (PgBouncer-compatible)
2. **Added column mapping** - `sessionStateV1 @map("session_state_v1")` in Prisma schema
3. **Migration applied** - Columns exist in database
4. **Ready for load testing** - Once server is restarted

