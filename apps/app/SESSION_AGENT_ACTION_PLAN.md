# Session Agent Action Plan - Critical Fixes & Workflow Clarifications

**Agent:** Noor (session_agent)  
**Date:** January 15, 2025  
**Status:** Critical Fixes + Workflow Implementation

## 🚨 Critical Fixes (P0)

### ✅ 1. Build Error Fixed
**Issue:** `Type error: No value exists in scope for the shorthand property 'source'`  
**Location:** `apps/app/app/api/sessions/route.ts:355`  
**Fix:** Changed `source` to `sourceValue` (the validated variable)  
**Status:** ✅ Fixed

### ✅ 2. Runtime Error Fixed
**Issue:** `TypeError: Cannot read properties of undefined (reading 'replace')`  
**Location:** `apps/app/components/SessionQueueManager.tsx:416`  
**Fix:** Added null check: `{session.state ? session.state.replace('_', ' ') : 'PENDING'}`  
**Status:** ✅ Fixed

---

## 📋 Workflow Clarifications & Requirements

### 1. Guest Data Capture for REM Recognition

**Question:** Should we ask for name, phone, email for first-time guests to reduce friction on repeat visits?

**Answer:** YES - Core data for REM (Recognition, Engagement, Memory):

#### Core Data Requirements (Minimum Viable):
1. **Phone Number** (Primary Key)
   - Used for: Customer recognition, session lookup, loyalty tracking
   - Format: E.164 (+1234567890)
   - Validation: Required, must be valid phone format

2. **Name** (Display/Personalization)
   - Used for: Greeting, personalization, staff recognition
   - Format: First name (required), Last name (optional)
   - Validation: Required, min 2 characters

3. **Email** (Optional - Future Use)
   - Used for: Receipts, loyalty notifications, marketing (opt-in)
   - Format: Valid email format
   - Validation: Optional, but validated if provided

#### Data Flow:
```
Guest Build → Session Creation → App Build → REM System
  ↓              ↓                  ↓            ↓
Phone/Name    Session API      Database    Customer Profile
  ↓              ↓                  ↓            ↓
Stored      ExternalRef      CustomerRef   Recognition on Next Visit
```

#### Implementation Priority:
- **P0:** Phone number (required for recognition)
- **P1:** Name (required for personalization)
- **P2:** Email (optional, future receipts/marketing)

**Files to Update:**
- `apps/guest/app/api/session/start/route.ts` - Add phone/name validation
- `apps/app/app/api/sessions/route.ts` - Store customerRef and customerPhone
- `apps/app/lib/reflex/rem-types.ts` - Map to REM actor fields

---

### 2. Session Metadata Not Displaying in Cards

**Issue:** Metadata from session creation flow not appearing in session cards

**Root Cause Analysis:**
1. Session cards may not be fetching all fields
2. Data transformation may be dropping fields
3. Component may not be rendering all available fields

**Fields That Should Display:**
- Customer Name (`customerRef`)
- Phone Number (`customerPhone`)
- Table ID (`tableId`)
- Flavor (`flavor` or `flavorMix`)
- Source (`source` - QR, RESERVE, WALK_IN)
- Price (`priceCents`)
- Assigned Staff (`assignedBOHId`, `assignedFOHId`)
- Notes (`tableNotes`)
- Session State (`state` or `sessionStateV1`)
- Created At (`createdAt`)

**Files to Check:**
- `apps/app/components/SessionQueueManager.tsx` - Display logic
- `apps/app/app/sessions/page.tsx` - Data fetching
- `apps/app/lib/sessionStateMachine.ts` - Data transformation

**Action Items:**
1. Verify session cards fetch all fields from API
2. Add missing fields to card display
3. Test with newly created sessions

---

### 3. Pre-Order Workflow Clarification

**Question:** Is Pre-Order like reserving a table with Hookah? Or is this how we enter new customers/New Sessions?

**Answer:** Pre-Order is a **reservation system** that creates a session when the guest arrives.

#### Pre-Order Workflow:
1. **Guest visits site** → Selects hookah/flavors → Pre-orders
2. **Stripe checkout** → Payment processed → Reservation created
3. **Guest arrives** → Staff scans QR or looks up reservation → Session activated
4. **Session flows** → Through normal BOH → FOH → Delivery → Checkout flow

#### Missing Elements:
- ❌ **Table Selection** - Should be added
- ❌ **Time Slot Selection** - Should be added (optional)
- ❌ **Guest Information** - Phone/Name capture (see #1 above)

#### Pre-Order vs Walk-In:
- **Pre-Order:** Guest pays in advance, reservation created, session starts when they arrive
- **Walk-In:** Guest arrives, staff creates session manually, payment at end
- **QR Code:** Guest scans QR at table, session starts immediately

**Files to Update:**
- `apps/site/app/preorder/page.tsx` - Add table selection
- `apps/site/app/api/preorder/route.ts` - Store tableId in reservation
- `apps/app/app/api/webhooks/stripe/route.ts` - Link reservation to table

---

### 4. Pre-Order Stripe Sandbox Mode

**Requirement:** Pre-Order should run in Stripe sandbox, not live. Use cart total instead of $1 test.

**Current State:**
- Guest build uses `STRIPE_SECRET_KEY` from environment
- Need to ensure sandbox keys are used in development

**Action Items:**
1. Verify `.env.local` uses `sk_test_...` keys
2. Update Pre-Order to use actual cart total (not $1)
3. Add environment check: `NODE_ENV === 'development'` → use test keys
4. Document Stripe key configuration

**Files to Update:**
- `apps/guest/lib/stripeServer.ts` - Add environment check
- `apps/guest/app/api/payments/route.ts` - Use cart total
- `apps/guest/.env.local` - Verify test keys

---

### 5. Full Reflex Ops Implementation Readiness

**Question:** Are we ready to fully implement the full business logic flow/Reflex Ops?

**Answer:** YES - 95% ready. Remaining items:

#### ✅ Ready Components:
- Session creation API
- BOH/FOH workflow
- Reflex Chain integration
- State machine transitions
- KTL-4 monitoring

#### ⏳ Remaining Items:
1. **Session metadata display** (see #2 above)
2. **Pre-Order table selection** (see #3 above)
3. **Guest data capture** (see #1 above)
4. **End-to-end testing** (see QA section below)

#### QA: End-to-End Testing ("How It Works" - Night After Night)

**Test Flow:**
1. **Guest Pre-Orders** (site) → Reservation created
2. **Guest Arrives** → Staff activates session
3. **BOH Claims Prep** → Prep starts, inventory updated
4. **BOH Marks Ready** → FOH notified
5. **FOH Delivers** → Session active, timer starts
6. **Guest Completes** → Payment processed, loyalty issued
7. **Session Closed** → Analytics recorded, REM updated

**Success Criteria:**
- ✅ All state transitions work
- ✅ Metadata flows through system
- ✅ REM recognizes returning guests
- ✅ Loyalty points issued correctly
- ✅ Analytics tracked accurately

---

## 🎯 Implementation Priority

### Phase 1: Critical Fixes (Today)
1. ✅ Fix build error (source variable)
2. ✅ Fix runtime error (session.state)
3. ⏳ Fix session metadata display
4. ⏳ Add table selection to Pre-Order

### Phase 2: Data Capture (This Week)
1. ⏳ Add phone/name capture to guest build
2. ⏳ Update session API to store customer data
3. ⏳ Implement REM recognition logic

### Phase 3: Stripe Sandbox (This Week)
1. ⏳ Verify sandbox keys in development
2. ⏳ Update Pre-Order to use cart total
3. ⏳ Test payment flow end-to-end

### Phase 4: End-to-End Testing (Next Week)
1. ⏳ Test complete "How It Works" flow
2. ⏳ Verify metadata flows correctly
3. ⏳ Test guest recognition on repeat visits
4. ⏳ Validate Reflex Ops integration

---

## 📝 Next Steps

1. **Commit fixes** (build + runtime errors)
2. **Update session cards** to display all metadata
3. **Add table selection** to Pre-Order flow
4. **Implement guest data capture** (phone/name)
5. **Switch Pre-Order to sandbox** with cart total
6. **Run end-to-end tests** of complete flow

**Estimated Time:** 4-6 hours for all items

---

## 🎉 Success Metrics

- ✅ Build passes without errors
- ✅ Session cards show all metadata
- ✅ Pre-Order includes table selection
- ✅ Guest data captured for REM
- ✅ Stripe sandbox working correctly
- ✅ End-to-end flow tested and verified

