# Database Optimization Plan

**Date:** 2025-01-XX  
**Status:** 🔄 In Progress  
**Priority:** High Performance Impact

---

## 📊 Summary

Supabase database linter identified **300+ performance warnings** across 4 categories:

1. **Auth RLS Initialization Plan** (WARN) - ~100+ policies
2. **Multiple Permissive Policies** (WARN) - ~150+ policies  
3. **Unindexed Foreign Keys** (INFO) - 6 foreign keys
4. **Unused Indexes** (INFO) - ~100+ indexes
5. **Duplicate Index** (WARN) - 1 duplicate

---

## 🎯 Priority Order

### **Priority 1: Critical Performance (Do First)**

#### 1.1 Fix RLS Auth Function Calls (Highest Impact)
**Issue:** RLS policies re-evaluate `auth.uid()` / `auth.role()` for every row  
**Impact:** Major query performance degradation at scale  
**Fix:** Wrap in `(select auth.uid())` to evaluate once per query

**Affected Tables (Top Priority):**
- `sessions` (most queried)
- `orders`, `order_items`, `order_events`
- `loyalty_profiles`, `loyalty_note_bindings`
- `campaigns`, `campaign_usages`
- All other tables with RLS policies

**SQL Pattern:**
```sql
-- BEFORE (slow)
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- AFTER (fast)
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING ((select auth.uid()) = user_id);
```

#### 1.2 Remove Duplicate Index
**Issue:** `reflex_events` has duplicate indexes  
**Fix:** Drop one of the duplicates

```sql
DROP INDEX IF EXISTS idx_reflex_events_session;
-- Keep: idx_reflex_events_sessionid
```

---

### **Priority 2: High Impact (Do Next)**

#### 2.1 Add Missing Foreign Key Indexes
**Issue:** 6 foreign keys without indexes  
**Impact:** Slower JOINs and constraint checks

**Tables to Fix:**
```sql
-- loyalty_note_bindings
CREATE INDEX idx_loyalty_note_bindings_session_note_id 
  ON loyalty_note_bindings(session_note_id);

-- refills
CREATE INDEX idx_refills_session_id ON refills(session_id);
CREATE INDEX idx_refills_venue_id ON refills(venue_id);

-- seats
CREATE INDEX idx_seats_zone_id ON seats(zone_id);

-- sessions
CREATE INDEX idx_sessions_venue_id ON sessions(venue_id);

-- staff
CREATE INDEX idx_staff_venue_id ON staff(venue_id);
```

#### 2.2 Consolidate Multiple Permissive Policies
**Issue:** Many tables have overlapping RLS policies  
**Impact:** Each policy must be evaluated, slowing queries

**Strategy:**
- Merge service_role policies (they're permissive anyway)
- Combine tenant_read/authenticated_read where possible
- Use single policy with OR conditions instead of multiple policies

**Example:**
```sql
-- BEFORE (2 policies evaluated)
CREATE POLICY "service_role_manage" ON table FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "tenant_read" ON table FOR SELECT USING (tenant_id = current_setting('app.tenant_id'));

-- AFTER (1 policy)
CREATE POLICY "combined_access" ON table FOR ALL 
  USING (
    (select auth.role()) = 'service_role' 
    OR tenant_id = current_setting('app.tenant_id')
  );
```

---

### **Priority 3: Cleanup (Do Later)**

#### 3.1 Remove Unused Indexes
**Issue:** ~100+ indexes never used  
**Impact:** Slower writes, wasted storage

**Strategy:**
- Monitor for 30 days before dropping
- Keep indexes on frequently queried columns
- Remove indexes on legacy/unused tables first

**Safe to Remove (after verification):**
- Indexes on `Session` table (if using `sessions` instead)
- Indexes on old `DriftEvent`, `TaxonomyUnknown` tables
- Composite indexes that duplicate single-column indexes

---

## 🔧 Implementation Scripts

### Script 1: Fix RLS Auth Functions (Batch)

```sql
-- Template for fixing RLS policies
-- Run this for each affected table

DO $$
DECLARE
  policy_record RECORD;
  new_definition TEXT;
BEGIN
  FOR policy_record IN 
    SELECT schemaname, tablename, policyname, definition
    FROM pg_policies
    WHERE schemaname = 'public'
      AND definition LIKE '%auth.%'
      AND definition NOT LIKE '%(select auth.%'
  LOOP
    -- Replace auth.uid() with (select auth.uid())
    new_definition := regexp_replace(
      policy_record.definition,
      '\bauth\.(uid|role|jwt)\(\)',
      '(select auth.\1())',
      'g'
    );
    
    -- Drop and recreate policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      policy_record.policyname, 
      policy_record.schemaname, 
      policy_record.tablename
    );
    
    -- Note: You'll need to reconstruct the full CREATE POLICY statement
    -- This is a template - adjust based on your policy structure
  END LOOP;
END $$;
```

### Script 2: Add Missing Indexes

```sql
-- Add all missing foreign key indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_note_bindings_session_note_id 
  ON loyalty_note_bindings(session_note_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refills_session_id ON refills(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refills_venue_id ON refills(venue_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seats_zone_id ON seats(zone_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_venue_id ON sessions(venue_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_venue_id ON staff(venue_id);
```

### Script 3: Remove Duplicate Index

```sql
-- Remove duplicate index on reflex_events
DROP INDEX CONCURRENTLY IF EXISTS idx_reflex_events_session;
-- Keep: idx_reflex_events_sessionid
```

---

## 📋 Manual Steps Required

### For RLS Policy Fixes:

1. **Export current policies:**
   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual, with_check
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

2. **For each policy with `auth.uid()` or `auth.role()`:**
   - Wrap in `(select auth.uid())` or `(select auth.role())`
   - Recreate the policy

3. **Test each table after changes:**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM table_name WHERE ...;
   ```

---

## ⚠️ Important Notes

1. **Use CONCURRENTLY for indexes** - Won't lock tables
2. **Test in staging first** - RLS changes affect security
3. **Backup before changes** - Especially RLS policies
4. **Monitor query performance** - Use `EXPLAIN ANALYZE`
5. **Don't drop unused indexes immediately** - Verify they're truly unused

---

## 🎯 Success Metrics

- **RLS Performance:** Query times reduced by 30-50% on large tables
- **Index Usage:** Foreign key JOINs 2-5x faster
- **Storage:** Remove 50+ unused indexes (after verification)
- **Policy Count:** Reduce overlapping policies by 40%

---

## 📅 Recommended Timeline

- **Week 1:** Fix RLS auth functions (Priority 1.1)
- **Week 2:** Add missing indexes + remove duplicate (Priority 1.2, 2.1)
- **Week 3:** Consolidate multiple policies (Priority 2.2)
- **Week 4+:** Monitor and remove unused indexes (Priority 3.1)

---

**Next Steps:** Start with Priority 1.1 (RLS auth functions) as it has the highest performance impact.

