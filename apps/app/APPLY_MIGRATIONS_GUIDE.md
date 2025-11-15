# Apply Analytics Indexes - Quick Guide

## 🚀 Option 1: One-Step SQL Script (Recommended)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" → "New query"

### Step 2: Copy & Run Combined Script
1. Open: `supabase/migrations/APPLY_ALL_ANALYTICS_INDEXES.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click "Run" (or Ctrl+Enter)

**That's it!** All indexes will be created in one transaction.

---

## 🔍 Option 2: Verify Before/After

### Before Running Migration
```bash
cd apps/app
npx tsx scripts/verify-indexes.ts
```

This will show which indexes are missing.

### After Running Migration
Run the same command again to verify all indexes were created.

---

## 📊 What Gets Created

### Session Table (5 indexes)
- `idx_session_created_at_payment_status`
- `idx_session_created_at_state`
- `idx_session_created_at_source`
- `idx_session_created_at_lounge_payment`
- `idx_session_created_at_state_duration`

### reflex_events Table (8 indexes)
- `idx_reflex_event_created_at_type` (analytics)
- `idx_reflex_event_created_at_refill_types` (analytics)
- `idx_reflex_events_type_createdAt` (fixed)
- `idx_reflex_events_ctaSource` (fixed)
- `idx_reflex_events_ctaType` (fixed)
- `idx_reflex_events_campaignId` (fixed)
- `idx_reflex_events_payloadHash` (new)
- `idx_reflex_events_sessionId` (new)

### Additional Improvements
- CHECK constraint on `source` field
- Updated RLS policy with better naming

---

## ✅ Verification Queries

Run these in Supabase SQL Editor to verify:

```sql
-- Check Session indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'Session'
  AND indexname LIKE 'idx_session_created_at%'
ORDER BY indexname;

-- Check reflex_events indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'reflex_events'
  AND indexname LIKE 'idx_reflex_events%'
ORDER BY indexname;

-- Expected: 5 Session indexes + 8 reflex_events indexes = 13 total
```

---

## 🧪 Next Step: Performance Testing

After applying the migration, run performance tests:

```bash
cd apps/app
npx tsx scripts/performance/run-all.ts
```

**Expected improvements:**
- Analytics Sessions: 3.8s → <1s
- Analytics Conversion: 4.8s → <1s
- Revenue: Already optimized (<2s)

---

## 🐛 Troubleshooting

### "Index already exists"
- ✅ This is fine! The migration uses `IF NOT EXISTS`
- The index was already created

### "Table does not exist"
- Make sure `reflex_events` table exists
- Run `supabase/migrations/20251110000001_create_reflex_events_table.sql` first

### "Permission denied"
- Check you're using service role or have admin access
- Verify Supabase project permissions

---

**Status:** 🟢 **Ready to Apply**

