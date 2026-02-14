# Apply Analytics Indexes Migration

## ✅ Migration File Ready

The migration file is located at:
```
supabase/migrations/20251115000003_add_analytics_indexes.sql
```

## 🚀 How to Apply

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste Migration:**
   - Open `supabase/migrations/20251115000003_add_analytics_indexes.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration:**
   - Click "Run" (or press Ctrl+Enter)
   - Wait for completion (should take < 5 seconds)

5. **Verify Indexes:**
   - Run this verification query:
   ```sql
   SELECT 
     indexname,
     tablename,
     indexdef
   FROM pg_indexes 
   WHERE schemaname = 'public' 
     AND (
       indexname LIKE 'idx_session_created_at%' OR
       indexname LIKE 'idx_reflex_event_created_at%'
     )
     AND tablename IN ('Session', 'ReflexEvent')
   ORDER BY tablename, indexname;
   ```
   - You should see 7 indexes listed

### Option 2: Command Line (if you have Supabase CLI)

```bash
# From project root
supabase db push
```

## 📊 Expected Indexes

After applying, you should have these 7 indexes:

### Session Table (5 indexes):
1. `idx_session_created_at_payment_status` - For revenue/payment queries
2. `idx_session_created_at_state` - For state-based analytics
3. `idx_session_created_at_source` - For source-based analytics
4. `idx_session_created_at_lounge_payment` - For lounge-filtered revenue
5. `idx_session_created_at_state_duration` - For duration calculations

### ReflexEvent Table (2 indexes):
6. `idx_reflex_event_created_at_type` - For event-based analytics
7. `idx_reflex_event_created_at_refill_types` - For refill event queries

## ✅ Verification

After applying, verify the indexes exist:

```sql
SELECT COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (
    indexname LIKE 'idx_session_created_at%' OR
    indexname LIKE 'idx_reflex_event_created_at%'
  )
  AND tablename IN ('Session', 'ReflexEvent');
```

Should return: `7`

## 🎯 Expected Performance Improvements

After applying these indexes:

- **Analytics Sessions Endpoint:** 3.8s → <1s (expected)
- **Analytics Conversion Endpoint:** 4.8s → <1s (expected)
- **Revenue Endpoint:** Already optimized (should remain <2s)

## 🔄 Next Steps

1. ✅ Apply the migration (using Option 1 above)
2. ✅ Verify indexes exist (run verification query)
3. ⏭️ Re-run performance tests:
   ```bash
   cd apps/app
   npx tsx scripts/performance/run-all.ts
   ```
4. ⏭️ Monitor analytics endpoint response times

## 🐛 Troubleshooting

### "Index already exists"
- This is fine! The `IF NOT EXISTS` clause means it's safe to run multiple times
- The index was already created

### "Permission denied"
- Make sure you're using the service role key or have admin access
- Check your Supabase project permissions

### "Table does not exist"
- Make sure you've run all previous migrations
- Check that `Session` and `ReflexEvent` tables exist

---

**Status:** 🟢 **Ready to Apply**

