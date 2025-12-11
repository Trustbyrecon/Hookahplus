# RLS Policy Consolidation Analysis

## Executive Summary

This document analyzes all Supabase Performance Advisor warnings about multiple permissive RLS policies and provides specific recommendations for consolidation. The goal is to reduce policy evaluation overhead while maintaining security.

**Total Warnings:** 100+ instances across 15+ tables  
**Priority:** Medium (performance impact, not security issue)  
**Estimated Performance Gain:** 10-30% query speedup on affected tables

---

## Policy Consolidation Strategy

### General Rules:
1. **Service Role Policies**: Keep separate - service role bypasses RLS anyway, but explicit policies document intent
2. **User Policies**: Merge using OR conditions when they check the same thing
3. **Tenant Policies**: Prefer tenant-based policies over role-based when both exist
4. **Auth Function Optimization**: Always use `(select auth.uid())` not `auth.uid()`

---

## Table-by-Table Analysis

### 1. `Session` Table (public."Session") - HIGH PRIORITY

**Current Policies:**
- `"Allow session inserts"` - Old policy, role-based
- `"Allow session updates"` - Old policy, role-based  
- `"Allow session deletes"` - Old policy, role-based
- `"Users can read own sessions alt"` - Old policy, role-based
- `tenant_read_sessions` - New policy, tenant-based (optimized)
- `tenant_write_sessions` - New policy, tenant-based (optimized)
- `tenant_update_sessions` - New policy, tenant-based (optimized)
- `tenant_delete_sessions` - New policy, tenant-based (optimized)

**Analysis:**
- The old policies (`"Allow session *"`) are redundant with tenant policies
- `"Users can read own sessions alt"` is less restrictive than `tenant_read_sessions`
- **Recommendation:** Remove old policies, keep only tenant-based ones

**Action:** ✅ Safe to remove old policies

---

### 2. `sessions` Table (public.sessions) - MEDIUM PRIORITY

**Current Policies:**
- `"Service role can manage sessions"` - Service role bypass
- `"Users can read own sessions"` - Role-based read
- `sessions_rw` - Likely a tenant-based policy

**Analysis:**
- Service role policy is documentation-only (service role bypasses RLS)
- `"Users can read own sessions"` conflicts with `sessions_rw`
- **Recommendation:** Keep `sessions_rw`, remove redundant role-based policy

**Action:** ⚠️ Review `sessions_rw` definition first

---

### 3. `reflex_events` Table - HIGH PRIORITY

**Current Policies:**
- `dev_allow_all_reflex_events` - Development permissive policy (FOR ALL)
- `tenant_read_events` - Tenant-based read
- `tenant_write_events` - Tenant-based write
- `tenant_update_events` - Tenant-based update
- `tenant_delete_events` - Tenant-based delete

**Analysis:**
- `dev_allow_all_reflex_events` is a catch-all that conflicts with tenant policies
- In production, this should be removed or made environment-specific
- **Recommendation:** Remove dev policy in production, or gate it with environment check

**Action:** ⚠️ Conditional - Remove in production, keep in dev

---

### 4. `SessionEvent` Table - MEDIUM PRIORITY

**Current Policies:**
- `"Service role can manage session events"` - Service role bypass
- `"Users can read session events"` - Role-based read

**Analysis:**
- Service role policy is documentation-only
- User policy is simple and doesn't conflict
- **Recommendation:** These are fine, but could be optimized with `(select auth.role())`

**Action:** ✅ Low priority - optimize auth functions

---

### 5. `Award` Table - LOW PRIORITY

**Current Policies:**
- `"Service role can manage awards"` - Service role bypass
- `"Users can read own awards"` - User-specific read

**Analysis:**
- Service role policy is documentation-only
- User policy checks `profileId = auth.uid()::text`
- **Recommendation:** Keep both, optimize auth function

**Action:** ✅ Low priority - optimize auth functions

---

### 6. `Badge` Table - LOW PRIORITY

**Current Policies:**
- `"Service role can manage badges"` - Service role bypass
- `"Users can read active badges"` - Public read for active badges

**Analysis:**
- Service role policy is documentation-only
- User policy is public read (not user-specific)
- **Recommendation:** Keep both, optimize auth function

**Action:** ✅ Low priority - optimize auth functions

---

### 7. `Event` Table - LOW PRIORITY

**Current Policies:**
- `"Service role can manage events"` - Service role bypass
- `"Users can read own events"` - User-specific read

**Analysis:**
- Service role policy is documentation-only
- User policy checks `profileId = auth.uid()::text`
- **Recommendation:** Keep both, optimize auth function

**Action:** ✅ Low priority - optimize auth functions

---

### 8. `DriftEvent` Table - MEDIUM PRIORITY

**Current Policies:**
- `"Authenticated users can insert drift events"` - Role-based insert
- `"Authenticated users can read drift events"` - Role-based read
- `"Authenticated users can update drift events"` - Role-based update
- `"Service role can manage drift events"` - Service role bypass

**Analysis:**
- Multiple role-based policies that could be consolidated
- Service role policy is documentation-only
- **Recommendation:** Merge user policies into one per action, optimize auth functions

**Action:** ✅ Safe to consolidate

---

### 9. `TaxonomyUnknown` Table - MEDIUM PRIORITY

**Current Policies:**
- `"Authenticated users can insert taxonomy unknowns"` - Role-based insert
- `"Authenticated users can read taxonomy unknowns"` - Role-based read
- `"Authenticated users can update taxonomy unknowns"` - Role-based update
- `"Service role can manage taxonomy unknowns"` - Service role bypass

**Analysis:**
- Same pattern as DriftEvent
- **Recommendation:** Merge user policies, optimize auth functions

**Action:** ✅ Safe to consolidate

---

### 10. `memberships` Table - LOW PRIORITY

**Current Policies:**
- `"Service role can manage memberships"` - Service role bypass
- `"Users can read own memberships"` - User-specific read

**Analysis:**
- Service role policy is documentation-only
- User policy is user-specific
- **Recommendation:** Keep both, optimize auth function

**Action:** ✅ Low priority - optimize auth functions

---

### 11. `venues` Table - LOW PRIORITY

**Current Policies:**
- `venue_read` - Read policy
- `venue_write` - Write policy

**Analysis:**
- Two separate policies for different actions (read/write)
- This is actually correct - they're not duplicates
- **Recommendation:** Review if they can be combined into one policy with different USING/WITH CHECK

**Action:** ⚠️ Review policy definitions first

---

### 12. Other Tables (staff, refills, reservations, ghostlog)

**Current Policies:**
- Various `*_rw` policies that use `auth.uid()` directly

**Analysis:**
- These need auth function optimization: `auth.uid()` → `(select auth.uid())`
- Not multiple policies, just performance issue

**Action:** ✅ Fix auth function calls

---

## Consolidation Scripts

See `consolidate_rls_policies.sql` for executable SQL scripts.

---

## Implementation Priority

### Phase 1: High Impact, Low Risk (Do First)
1. ✅ Remove old `Session` policies (Allow session *)
2. ✅ Remove/condition `dev_allow_all_reflex_events` in production
3. ✅ Fix auth function calls in staff/refills/reservations/ghostlog

### Phase 2: Medium Impact, Medium Risk (Do Next)
4. ⚠️ Review and consolidate `sessions` table policies
5. ✅ Consolidate `DriftEvent` policies
6. ✅ Consolidate `TaxonomyUnknown` policies

### Phase 3: Low Impact, Low Risk (Do When Convenient)
7. ✅ Optimize auth functions in Award/Badge/Event tables
8. ⚠️ Review `venues` table policies

---

## Testing Checklist

After applying consolidations:

- [ ] Verify service role can still access all tables
- [ ] Verify authenticated users can read their own data
- [ ] Verify tenant isolation still works
- [ ] Run Performance Advisor again - warnings should be reduced
- [ ] Test critical user flows (session creation, event tracking)
- [ ] Monitor query performance metrics

---

## Notes

- Service role policies are kept for documentation, but service role bypasses RLS anyway
- When in doubt, keep the more restrictive policy
- Always test in staging before production
- Use `(select auth.uid())` pattern for all new policies

