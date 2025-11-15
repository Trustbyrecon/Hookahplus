# Re-test Checklist - Performance Fixes

**Date:** 2025-11-15  
**Status:** 🟢 **All P0 Fixes Complete - Ready for Re-testing**

---

## ✅ Completed Fixes

1. ✅ **Input Coercion Hardening** - `/api/sessions` POST endpoint
2. ✅ **Error Reporting** - Test scripts now show real error messages
3. ✅ **Missing Indexes** - Applied successfully in Supabase
4. ✅ **Connection Pool Limits** - DATABASE_URL updated (`connection_limit=15&pool_timeout=5`)

---

## 🚀 Re-testing Steps

### Step 1: Restart Dev Server
**IMPORTANT:** The server must be restarted to pick up the new DATABASE_URL with connection pool limits.

```bash
# Stop current server (Ctrl+C in terminal running npm run dev)
# Then restart:
cd apps/app
npm run dev
```

### Step 2: Verify Connection Pool
Check server logs on startup - you should see:
```
[db.ts] 📁 Loaded .env.local from: ...
[db.ts] 🔑 DATABASE_URL: SET (postgresql://...connection_limit=15...)
```

### Step 3: Run Session Creation Test
```bash
cd apps/app
npx tsx scripts/test-session-creation.ts
```

**Expected:** All 10 tests should pass (as before)

### Step 4: Run Full Performance Suite
```bash
npx tsx scripts/performance/run-all.ts
```

**Expected Improvements:**
- ✅ 50 concurrent: >45/50 success (up from 10/50)
- ✅ Analytics endpoints: <1s (down from 3.8s-26.5s)
- ✅ Error messages: Show real error details (not "Unknown error")

---

## 📊 Success Criteria

### Load Tests
- **10 concurrent:** >9/10 success ✅ (already passing)
- **50 concurrent:** >45/50 success (target: fix 500s)
- **100 concurrent:** >80/100 success (target: maintain under load)

### API Performance
- **`/api/health`:** <1000ms ✅
- **`/api/sessions`:** <1000ms ✅
- **`/api/analytics/sessions`:** <1000ms (target: down from 3.8s)
- **`/api/analytics/conversion`:** <1000ms (target: down from 4.8s)
- **`/api/revenue`:** <2000ms (target: down from 26.5s)

### Error Reporting
- ✅ Error messages show actual error details
- ✅ Request context included in error responses
- ✅ Stack traces visible in development mode

---

## 🔍 If Tests Still Fail

### Check Server Logs
Look for:
- Connection pool errors
- Constraint violations
- Type coercion issues
- Database query timeouts

### Check Error Messages
The improved error reporting should now show:
- Actual error message (not "Unknown error")
- Request context (tableId, customerName, source)
- Stack trace (in development)

### Verify Indexes
Run in Supabase SQL Editor:
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('Session', 'reflex_events')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Should show:
- 5 Session analytics indexes
- 8 reflex_events indexes
- 1+ additional Session indexes (started_at, etc.)

---

## 📝 Next Steps (After Re-testing)

If tests pass:
1. ✅ Document performance improvements
2. ⏭️ Move to P1 fixes (timer accuracy, materialized views)
3. ⏭️ Production mode testing

If tests still fail:
1. Share server log stack traces
2. Share specific error messages from test output
3. We'll identify the exact column/validation causing issues

---

**Status:** 🟢 **Ready to Re-test**

Restart your server and run the tests!

