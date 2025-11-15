# P0 Performance Fixes - Implementation Status

**Date:** 2025-11-15  
**Priority:** P0 (Critical - Stop 500s and make analytics fast)

---

## ✅ Completed Fixes

### 1. **Input Coercion Hardening** (`/api/sessions` POST)
- ✅ Normalize `flavor` (array, string, comma-separated → array)
- ✅ Normalize `source` (validate against allowed values)
- ✅ Normalize all optional fields (`customerPhone`, `notes`, `amount`, etc.)
- ✅ Handle `null` values properly (use `NULL` in SQL, not `undefined`)
- ✅ Type-safe number coercion (`Number.isFinite()`)

**File:** `apps/app/app/api/sessions/route.ts` (lines 253-290)

### 2. **Error Reporting** (Test Scripts)
- ✅ Load test now shows real error messages from API
- ✅ Parses JSON error responses
- ✅ Shows `error`, `details`, and `requestContext` fields

**File:** `apps/app/scripts/performance/load-test.ts` (lines 45-66)

---

## ⏳ Pending Fixes

### 3. **Missing Database Indexes**
- ⏳ Migration created: `supabase/migrations/20251115000005_add_missing_indexes.sql`
- ⏳ Needs to be applied in Supabase SQL Editor

**Indexes to add:**
- `idx_session_started_at` - For timer/duration queries
- `idx_events_session_id` - For event lookups (if events table exists)
- `idx_events_created_at` - For time-series queries
- `idx_payments_paid_at` - For revenue queries (if payments table exists)

### 4. **Connection Pool Limits**
- ⏳ Add to `DATABASE_URL`: `?connection_limit=15&pool_timeout=5`
- ⏳ Update `.env.local` and Vercel environment variables

**Example:**
```
DATABASE_URL="postgresql://...?connection_limit=15&pool_timeout=5"
```

### 5. **Analytics Query Optimization**
- ⏳ Cap `windowDays` to max 31 days
- ⏳ Add `LIMIT` to list queries
- ⏳ Consider materialized view for revenue (future)

### 6. **Timer Accuracy** (P1 - Lower Priority)
- ⏳ Server-side scheduler (not client `setInterval`)
- ⏳ Idempotent updates with `last_tick_at`
- ⏳ WebSocket broadcast with backpressure

---

## 🚀 Next Steps

### Immediate (Before Re-testing)

1. **Apply Missing Indexes:**
   ```sql
   -- Run in Supabase SQL Editor:
   -- supabase/migrations/20251115000005_add_missing_indexes.sql
   ```

2. **Update DATABASE_URL:**
   ```bash
   # In apps/app/.env.local, add connection pool params:
   DATABASE_URL="postgresql://...?connection_limit=15&pool_timeout=5"
   ```

3. **Restart Dev Server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Restart to pick up new env vars
   npm run dev
   ```

### Then Re-test

```bash
cd apps/app
npx tsx scripts/test-session-creation.ts
npx tsx scripts/performance/run-all.ts
```

---

## 📊 Expected Improvements

### Before Fixes
- ❌ 50 concurrent: 40/50 failures (HTTP 500)
- ❌ Analytics: 3.8s - 26.5s
- ❌ Timer: 50% accuracy

### After Fixes (Expected)
- ✅ 50 concurrent: >45/50 success
- ✅ Analytics: <1s (with indexes)
- ✅ Timer: >90% accuracy (with server-side scheduler)

---

## 🔍 Debugging

If you still see 500s, check server logs for:
- Database connection errors
- Constraint violations
- Type coercion issues

The improved error reporting will now show:
- Actual error message
- Request context (tableId, customerName, source)
- Stack trace (in development)

---

**Status:** 🟡 **In Progress** - Input coercion done, indexes pending

