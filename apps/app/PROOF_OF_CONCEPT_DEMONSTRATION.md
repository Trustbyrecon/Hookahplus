# Proof-of-Concept Demonstration Guide

## Overview

This guide provides step-by-step instructions for demonstrating the Reflex Ops flow with a single session, showing the complete connectivity from QR code to checkout completion.

## Prerequisites

### Before Starting:
1. ✅ Database connection configured in Vercel
2. ✅ Application deployed and accessible
3. ✅ Manager access to Fire Session Dashboard
4. ✅ BOH and FOH staff accounts ready (or use demo mode)

## Demonstration Flow

### Step 1: Manager Creates Session (2 minutes)

**Location:** Fire Session Dashboard  
**URL:** `https://app.hookahplus.net/fire-session-dashboard`

**Actions:**
1. Navigate to Fire Session Dashboard
2. Click "New Session" button (orange button in top right)
3. Fill in session details:
   - **Table ID:** T-001 (or any available table)
   - **Customer Name:** "Demo Customer"
   - **Flavor Mix:** Select any flavor (e.g., "Blue Mist")
   - **Pricing Model:** Flat Fee
   - **Amount:** $30.00
   - **Session Duration:** 45 minutes
   - **BOH Staff:** (Optional) Select BOH staff member
   - **FOH Staff:** (Optional) Select FOH staff member
4. Click "Create New Session"

**Expected Result:**
- ✅ Session created successfully message
- ✅ Session appears in dashboard
- ✅ Session state: NEW
- ✅ Session ID generated

**Connectivity Point:**
- **API:** `POST /api/sessions`
- **File:** `apps/app/app/api/sessions/route.ts` (line 201)
- **Database:** Session saved to `Session` table
- **Reflex Chain:** `initializeReflexChain()` called (line 43 in integration.ts)

---

### Step 2: BOH Staff Claims Prep (2 minutes)

**Location:** Fire Session Dashboard → BOH Tab  
**URL:** `https://app.hookahplus.net/fire-session-dashboard` (BOH tab)

**Actions:**
1. Switch to "BOH" tab in dashboard
2. Locate the created session
3. Click "Claim Prep" button on session card
4. Confirm action

**Expected Result:**
- ✅ Session state changes: NEW → PREP_IN_PROGRESS
- ✅ BOH staff assigned to session
- ✅ Prep timer starts
- ✅ Reflex Chain BOH layer processes

**Connectivity Point:**
- **API:** `PATCH /api/sessions` with action: `CLAIM_PREP`
- **File:** `apps/app/app/api/sessions/route.ts` (line 488)
- **Reflex Chain:** `processBOHLayer(session, 'CLAIM_PREP')` (line 77)
- **Output:** BOHReflexOutput with prep status
- **Sync:** POS Adapter receives prep completion data

**What Happens Behind the Scenes:**
```typescript
// BOH Layer Processing
processBOHLayer(session, 'CLAIM_PREP')
  → Creates BOHReflexOutput
  → Updates resource status (inventory, staff capacity)
  → Syncs to POS Adapter
  → Prep ping sent to FOH
```

---

### Step 3: BOH Marks Ready for Pickup (1 minute)

**Location:** Fire Session Dashboard → BOH Tab

**Actions:**
1. Wait for prep to complete (or click "Ready for Pickup")
2. Session state: PREP_IN_PROGRESS → READY_FOR_DELIVERY

**Expected Result:**
- ✅ Session marked ready
- ✅ FOH receives notification
- ✅ Heat state updated
- ✅ Estimated ready time recorded

**Connectivity Point:**
- **State Transition:** HEAT_UP → READY_FOR_DELIVERY
- **Reflex Chain:** BOH layer updates ready status
- **Output:** readyForService signal sent

---

### Step 4: FOH Receives Handoff (2 minutes)

**Location:** Fire Session Dashboard → FOH Tab  
**URL:** `https://app.hookahplus.net/fire-session-dashboard` (FOH tab)

**Actions:**
1. Switch to "FOH" tab
2. Locate session marked "Ready for Pickup"
3. Click "Start Active" or "Pick Up" button
4. Confirm delivery to customer

**Expected Result:**
- ✅ Session state: READY_FOR_DELIVERY → ACTIVE
- ✅ FOH staff assigned
- ✅ Delivery timer starts
- ✅ Reflex Chain FOH layer processes

**Connectivity Point:**
- **API:** `PATCH /api/sessions` with action: `START_ACTIVE`
- **File:** `apps/app/app/api/sessions/route.ts` (line 493)
- **Reflex Chain:** `processFOHLayer(session, 'START_ACTIVE', staffId)` (line 149)
- **Output:** FOHReflexOutput with activation data
- **Sync:** POS Adapter receives order metadata (order ID, amount, items)

**What Happens Behind the Scenes:**
```typescript
// FOH Layer Processing
processFOHLayer(session, 'START_ACTIVE', staffId)
  → Creates FOHReflexOutput
  → Generates POS metadata (order ID, amount, items)
  → Configures session timer
  → Syncs to POS Adapter
  → Session activation confirmed
```

---

### Step 5: Delivery Confirmation (1 minute)

**Location:** Fire Session Dashboard → FOH Tab

**Actions:**
1. FOH confirms delivery to customer table
2. Click "Mark Delivered" button
3. Confirm delivery

**Expected Result:**
- ✅ Session state: ACTIVE → DELIVERED
- ✅ Delivery timestamp recorded
- ✅ Reflex Chain Delivery layer processes
- ✅ Heatmap updated

**Connectivity Point:**
- **API:** `PATCH /api/sessions` with action: `MARK_DELIVERED`
- **Reflex Chain:** `processDeliveryLayer(session, 'MARK_DELIVERED', runnerId)` (line 198)
- **Output:** DeliveryReflexOutput with delivery data
- **Sync:** Session Replay Adapter receives heatmap update

**What Happens Behind the Scenes:**
```typescript
// Delivery Layer Processing
processDeliveryLayer(session, 'MARK_DELIVERED', runnerId)
  → Creates DeliveryReflexOutput
  → Updates heatmap (zone, table data)
  → Records trust loop data (delivery time, quality score)
  → Syncs to Session Replay Adapter
  → Heatmap visualization updated
```

---

### Step 6: Checkout Completion (2 minutes)

**Location:** Customer completes payment (or manager marks complete)

**Actions:**
1. Customer completes payment (or manager marks session complete)
2. Session state: DELIVERED → COMPLETED
3. Checkout processed

**Expected Result:**
- ✅ Session state: COMPLETED
- ✅ Payment recorded
- ✅ Reflex Chain Customer layer processes
- ✅ Loyalty tokens issued

**Connectivity Point:**
- **State Transition:** DELIVERED → COMPLETED
- **Reflex Chain:** Customer Experience Layer processes
- **Output:** CustomerReflexOutput with session fingerprint
- **Sync:** Loyalty Adapter receives token calculation

**What Happens Behind the Scenes:**
```typescript
// Customer Layer Processing
Customer Experience Layer
  → Creates CustomerReflexOutput
  → Generates session fingerprint (preferences, trust score, loyalty tier)
  → Calculates loyalty tokens (amount, rating, re-order bonuses)
  → Syncs to Loyalty Adapter
  → Tokens issued to customer
```

---

## Complete Flow Summary

```
1. QR Code Scan
   ↓
2. Session Creation (Manager)
   ├─→ Database: Session saved
   ├─→ Reflex Chain: initializeReflexChain()
   └─→ State: NEW
   ↓
3. BOH Claims Prep
   ├─→ Reflex Chain: processBOHLayer()
   ├─→ Sync: POS Adapter (prep status)
   └─→ State: PREP_IN_PROGRESS
   ↓
4. BOH Marks Ready
   ├─→ Reflex Chain: BOH layer updates
   └─→ State: READY_FOR_DELIVERY
   ↓
5. FOH Handoff
   ├─→ Reflex Chain: processFOHLayer()
   ├─→ Sync: POS Adapter (order metadata)
   └─→ State: ACTIVE
   ↓
6. Delivery Confirmation
   ├─→ Reflex Chain: processDeliveryLayer()
   ├─→ Sync: Session Replay Adapter (heatmap)
   └─→ State: DELIVERED
   ↓
7. Checkout Completion
   ├─→ Reflex Chain: Customer layer processes
   ├─→ Sync: Loyalty Adapter (tokens)
   └─→ State: COMPLETED
```

## Connectivity Points to Highlight

### For Owner Demonstration:

1. **QR Code → Session Creation**
   - Webhook receives payment confirmation
   - Session created in database
   - QR code URL generated
   - Reflex Chain initialized

2. **Prep Ping → BOH Reflex Layer**
   - BOH action triggers Reflex Chain
   - Prep status synced to POS
   - Resource status updated
   - FOH notified

3. **FOH Handoff → FOH Reflex Layer**
   - FOH action triggers Reflex Chain
   - Order metadata synced to POS
   - Timer configured
   - Session activated

4. **Delivery → Delivery Reflex Layer**
   - Delivery confirmation triggers Reflex Chain
   - Heatmap updated
   - Trust data recorded
   - Analytics updated

5. **Checkout → Customer Reflex Layer**
   - Checkout triggers Customer layer
   - Loyalty tokens calculated
   - Session fingerprint created
   - Trust score updated

## Troubleshooting

### If Session Creation Fails:
- Check database connection in Vercel logs
- Verify DATABASE_URL is set in Vercel
- Check RLS policies allow INSERT

### If BOH/FOH Actions Don't Work:
- Verify session state allows the action
- Check Reflex Chain integration is active
- Review API logs for errors

### If Reflex Chain Doesn't Process:
- Check `apps/app/lib/reflex-chain/integration.ts` is imported
- Verify state machine transitions are correct
- Review adapter sync logs

## Files Reference

- `apps/app/app/fire-session-dashboard/page.tsx` - Session creation UI
- `apps/app/app/api/sessions/route.ts` - Session API and state transitions
- `apps/app/lib/reflex-chain/integration.ts` - Reflex Chain processing
- `apps/app/REFLEX_OPS_FLOW_DOCUMENTATION.md` - Complete flow documentation

