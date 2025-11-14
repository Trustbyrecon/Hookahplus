# Taxonomy v1 Rollout Checklist

**Agent:** Noor (session_agent) + database_agent  
**Date:** 2025-11-15  
**Status:** Implementation Complete → Verification Phase

## ✅ Completed

1. ✅ **Enum Definitions Created** (`apps/app/lib/taxonomy/enums-v1.ts`)
   - SessionState v1: 8 values (queued, prep, handoff, delivering, delivered, checkout, closed, canceled)
   - TrustEventType v1: 6 values (on_time_delivery, fav_used, fast_checkout, corrected_issue, staff_greeting, loyalty_redeemed)
   - DriftReason v1: 6 values (slow_handoff, long_dwell, payment_retry, missing_notes, queue_backlog, no_show)

2. ✅ **Database Migration Created** (`supabase/migrations/20251115000001_add_taxonomy_v1_columns.sql`)
   - Added `sessionStateV1` and `paused` columns to Session table
   - Added `trustEventTypeV1` column to reflex_events table
   - Added `driftReasonV1` column to DriftEvent table
   - Created TaxonomyUnknown table for tracking unknown values

3. ✅ **Dual-Write Pattern Implemented**
   - Session creation writes to both legacy and v1 columns
   - Reflex event tracking writes to both legacy and v1 columns
   - Graceful fallback if v1 columns don't exist yet

4. ✅ **Unknown Tracker Implemented** (`apps/app/lib/taxonomy/unknown-tracker.ts`)
   - Tracks unknown enum values with counts and examples
   - Stores in TaxonomyUnknown table for review

5. ✅ **KPI Monitoring Implemented** (`apps/app/lib/taxonomy/kpi-tracker.ts`)
   - Tracks coverage (≥95% target)
   - Tracks unknown rate (<5% target)
   - Provides alerts when thresholds exceeded

6. ✅ **Admin Dashboard Tab Added** (`apps/app/app/admin/page.tsx`)
   - Taxonomy tab shows KPI metrics
   - Displays top unknown values
   - Allows promoting unknowns to suggested mappings

7. ✅ **API Endpoints Created**
   - `/api/taxonomy/kpi` - KPI metrics
   - `/api/taxonomy/unknowns` - Top unknown values
   - `/api/taxonomy/promote` - Promote unknown to mapping

8. ✅ **RLS Security Migration Created** (`supabase/migrations/20251115000002_enable_rls_drift_taxonomy.sql`)
   - Enables RLS on DriftEvent and TaxonomyUnknown tables
   - Adds appropriate policies for service role and authenticated users

## ⏳ Pending (Next Steps)

### 1. Run Database Migrations (database_agent)

**Priority: P0 - Security & Functionality**

#### Migration 1: Taxonomy v1 Columns
```sql
-- Run in Supabase SQL Editor:
-- File: supabase/migrations/20251115000001_add_taxonomy_v1_columns.sql
```
**Status:** ⏳ Needs to be run  
**Impact:** Enables v1 taxonomy columns and unknown tracking

#### Migration 2: RLS Security
```sql
-- Run in Supabase SQL Editor:
-- File: supabase/migrations/20251115000002_enable_rls_drift_taxonomy.sql
```
**Status:** ⏳ Needs to be run  
**Impact:** Fixes Supabase Security Advisor warnings

**Action Items:**
1. Open Supabase SQL Editor
2. Copy and paste migration 1, execute
3. Copy and paste migration 2, execute
4. Verify both migrations completed successfully

### 2. Backfill Existing Data (Noor)

**Priority: P1 - Data Consistency**

**Script:** `apps/app/scripts/backfill-taxonomy-v1.ts`

**What it does:**
- Migrates existing Session records to v1 taxonomy
- Migrates existing ReflexEvent records to v1 taxonomy
- Migrates existing DriftEvent records to v1 taxonomy
- Tracks unknown values for review

**How to run:**
```bash
cd apps/app
npm run ts-node scripts/backfill-taxonomy-v1.ts
```

**Expected output:**
```
Starting Taxonomy v1 backfill...
Backfilling SessionStateV1 for Session table...
Completed SessionStateV1 backfill. Migrated X sessions.
Backfilling TrustEventTypeV1 for ReflexEvent table...
Completed TrustEventTypeV1 backfill. Migrated X reflex events.
Backfilling DriftReasonV1 for DriftEvent table...
Completed DriftReasonV1 backfill. Migrated X drift events.

--- Backfill Summary ---
Sessions Migrated: X
Reflex Events Migrated: X
Drift Events Migrated: X
Unknowns Tracked: X
```

**Status:** ⏳ Ready to run after migrations

### 3. Verify Coverage Metrics (Noor)

**Priority: P1 - Validation**

**Steps:**
1. Navigate to `/admin` → Taxonomy tab
2. Check KPI metrics:
   - Overall Coverage should be ≥95%
   - Unknown Rate should be <5%
3. Review Top Unknowns table:
   - Should be empty or minimal
   - Any unknowns should be reviewed and promoted

**Success Criteria:**
- ✅ Overall coverage ≥95%
- ✅ Unknown rate <5%
- ✅ No critical alerts

**Status:** ⏳ Ready after migrations and backfill

### 4. Test Session Creation End-to-End (Noor)

**Priority: P0 - Core Functionality**

**Steps:**
1. Navigate to `/fire-session-dashboard`
2. Click "+ New Session"
3. Fill in session details:
   - Table ID: `test-table-001`
   - Customer Name: `Test Customer`
   - Flavor: `Mint + Lemon`
   - Amount: `$35.00`
4. Click "Create Session"
5. Verify:
   - ✅ Session created successfully (no 500 error)
   - ✅ Session appears in dashboard
   - ✅ `sessionStateV1` is set to `'queued'`
   - ✅ `paused` is set to `false`
   - ✅ Legacy `state` is set to `'PENDING'`

**Status:** ✅ 500 error fixed, ready to test

### 5. Monitor Unknown Values (Ongoing)

**Priority: P2 - Operational Excellence**

**Weekly Review:**
1. Check `/admin` → Taxonomy tab
2. Review Top Unknowns table
3. Promote high-frequency unknowns to mappings
4. Update `LEGACY_TRUST_EVENT_MAP` in `enums-v1.ts` if needed

**Status:** ⏳ Ongoing after rollout

## Success Metrics

### Coverage Targets
- **Overall Coverage:** ≥95% ✅
- **Unknown Rate:** <5% ✅
- **Known Types:** ≥80% of all events ✅

### Operational KPIs
- **SessionState Coverage:** ≥95%
- **TrustEventType Coverage:** ≥95%
- **DriftReason Coverage:** ≥95% (when implemented)

## Rollout Phases

### Phase 1: Infrastructure ✅ COMPLETE
- [x] Enum definitions
- [x] Database migrations
- [x] Dual-write pattern
- [x] Unknown tracker
- [x] KPI monitoring
- [x] Admin dashboard

### Phase 2: Deployment ⏳ IN PROGRESS
- [ ] Run taxonomy v1 migration
- [ ] Run RLS migration
- [ ] Verify migrations successful
- [ ] Run backfill script
- [ ] Verify coverage metrics

### Phase 3: Validation ⏳ PENDING
- [ ] Test session creation
- [ ] Test reflex event tracking
- [ ] Verify unknown tracking
- [ ] Check KPI dashboard
- [ ] Review and promote unknowns

### Phase 4: Monitoring ⏳ PENDING
- [ ] Set up weekly reviews
- [ ] Monitor coverage trends
- [ ] Promote high-frequency unknowns
- [ ] Update mappings as needed

## Next Immediate Actions

1. **Run Migrations** (15 min)
   - Run `20251115000001_add_taxonomy_v1_columns.sql` in Supabase
   - Run `20251115000002_enable_rls_drift_taxonomy.sql` in Supabase
   - Verify both completed successfully

2. **Run Backfill** (5 min)
   - Execute `backfill-taxonomy-v1.ts` script
   - Verify all existing data migrated

3. **Test & Verify** (10 min)
   - Test session creation
   - Check Admin → Taxonomy tab
   - Verify coverage metrics

**Total Time:** ~30 minutes to complete rollout

