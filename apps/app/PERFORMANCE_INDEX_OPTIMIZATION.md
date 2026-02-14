# Performance Index Optimization

**Agent:** Noor (session_agent)  
**Date:** 2025-01-14

---

## Problem

Supabase Performance Advisor identified **23 INFO-level suggestions**:

1. **Unindexed Foreign Keys (2):** Missing indexes on foreign key columns
2. **Unused Indexes (21):** Indexes that have never been used

---

## Impact

### Unindexed Foreign Keys
- Slower JOIN operations
- Slower foreign key constraint checks
- Suboptimal query performance

### Unused Indexes
- Consume storage space
- Slow down INSERT/UPDATE operations
- Maintenance overhead

---

## Solution

Created migration: `supabase/migrations/20251114000005_fix_performance_indexes.sql`

### Actions Taken

1. **Added Missing Foreign Key Indexes:**
   - ✅ `Award.badgeId` → `idx_award_badge_id`
   - ✅ `sessions.created_by` → `idx_sessions_created_by`

2. **Removed Unused Indexes (Safe to Remove):**
   - ✅ `Award_profileId_badgeId_venueId_revoked_idx`
   - ✅ `Event_profileId_idx`
   - ✅ `Event_profileId_venueId_idx`
   - ✅ `idx_sessions_venue_id` (lowercase sessions table)
   - ✅ `idx_sessions_status` (lowercase sessions table)
   - ✅ `idx_staff_venue_id`
   - ✅ `idx_refills_venue_id`
   - ✅ `idx_refills_session_id`
   - ✅ `idx_reservations_venue_id`
   - ✅ `idx_ghostlog_venue_id`
   - ✅ `idx_ghostlog_session_id`
   - ✅ `idx_stripe_webhook_events_received_at`

3. **Kept Critical Indexes (Commented Out):**
   - ⚠️ **Session table indexes** - Kept for now (likely needed for queries)
     - `idx_session_external_ref` - Guest sync lookups
     - `idx_session_customer_ref` - Customer queries
     - `idx_session_lounge_id` - Lounge filtering
     - `Session_loungeId_state_idx` - State filtering by lounge
     - `idx_session_state` - State filtering
   - ⚠️ **reflex_events indexes** - Kept for now (analytics queries)

---

## How to Apply

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/[PROJECT-ID]/sql

2. **Run the migration:**
   ```sql
   -- Copy contents from: supabase/migrations/20251114000005_fix_performance_indexes.sql
   ```

3. **Review Session indexes:**
   - Check if Session table indexes are actually used in your queries
   - If not used, uncomment the DROP statements in the migration

4. **Verify the fix:**
   - Run verification queries at the end of the migration
   - Check Supabase Performance Advisor (should show fewer suggestions)

---

## Expected Results

### Before
- 2 unindexed foreign keys
- 21 unused indexes
- Slower JOIN operations
- Slower INSERT/UPDATE operations

### After
- 0 unindexed foreign keys (indexes added)
- ~11 unused indexes removed (10 removed, 5 Session indexes kept)
- Faster JOIN operations
- Faster INSERT/UPDATE operations
- Reduced storage usage

---

## Impact on Session Management

**Critical indexes added:**
- ✅ `sessions.created_by` - Faster user session lookups

**Session table indexes kept:**
- `idx_session_external_ref` - Guest → App sync lookups
- `idx_session_customer_ref` - Customer session queries
- `idx_session_lounge_id` - Lounge filtering
- `Session_loungeId_state_idx` - State filtering by lounge
- `idx_session_state` - State filtering

**Expected improvements:**
- Faster session creation (foreign key checks)
- Faster session queries (JOIN operations)
- Faster session updates (fewer indexes to maintain)

---

## Verification

After running the migration:

1. **Check foreign key indexes:**
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes 
   WHERE schemaname = 'public' 
     AND (indexname LIKE '%award_badge%' OR indexname LIKE '%sessions_created_by%');
   ```

2. **Check Session indexes still exist:**
   ```sql
   SELECT indexname
   FROM pg_indexes 
   WHERE schemaname = 'public' 
     AND tablename = 'Session';
   ```

3. **Run Supabase Performance Advisor:**
   - Should show 0 unindexed foreign keys
   - Should show ~10 fewer unused index warnings

---

## Next Steps

1. **Monitor query performance** after removing indexes
2. **Review Session table indexes** - Check if they're actually used
3. **Consider removing reflex_events indexes** if analytics queries don't use them

---

**Status:** ✅ **Migration ready - Run in Supabase SQL Editor**

**Note:** Session table indexes are kept by default. Review your query patterns and remove if not needed.

