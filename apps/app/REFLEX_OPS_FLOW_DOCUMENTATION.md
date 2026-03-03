# Reflex Ops Flow: Complete Connectivity Documentation

## Overview

The Reflex Ops flow demonstrates the complete end-to-end session lifecycle from QR code scan to checkout completion, with real-time synchronization across all layers.

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REFLEX OPS COMPLETE FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. QR CODE SCAN
   │
   ├─→ Customer scans QR code on table
   ├─→ URL: https://app.hookahplus.net/staff/scan/{sessionId}
   ├─→ File: apps/app/app/staff/scan/[sessionId]/page.tsx
   └─→ Triggers: Session lookup and display

2. SESSION CREATION
   │
   ├─→ Webhook: apps/app/app/api/webhooks/stripe/route.ts (line 82)
   ├─→ Creates session in database
   ├─→ Generates QR code URL (line 139)
   ├─→ Initializes Reflex Chain: initializeReflexChain()
   └─→ File: apps/app/lib/reflex-chain/integration.ts (line 43)

3. BOH PREP PING
   │
   ├─→ Manager/BOH staff claims prep
   ├─→ Action: CLAIM_PREP
   ├─→ API: apps/app/app/api/sessions/route.ts (line 488)
   ├─→ Processes: processBOHLayer(session, 'CLAIM_PREP')
   ├─→ File: apps/app/lib/reflex-chain/integration.ts (line 77)
   ├─→ Output: BOHReflexOutput
   │   ├─→ readyForService: Prep completion status
   │   ├─→ resourceStatus: Inventory and staff capacity
   │   └─→ Syncs to: POS Adapter
   └─→ State: PREP_IN_PROGRESS → HEAT_UP → READY_FOR_DELIVERY

4. FOH HANDOFF
   │
   ├─→ BOH marks session ready
   ├─→ Action: START_ACTIVE
   ├─→ API: apps/app/app/api/sessions/route.ts (line 493)
   ├─→ Processes: processFOHLayer(session, 'START_ACTIVE', staffId)
   ├─→ File: apps/app/lib/reflex-chain/integration.ts (line 149)
   ├─→ Output: FOHReflexOutput
   │   ├─→ sessionActivation: Confirmation and timer config
   │   ├─→ posMetadata: Order ID, amount, items
   │   └─→ Syncs to: POS Adapter (smart pricing, order logging)
   └─→ State: READY_FOR_DELIVERY → ACTIVE

5. DELIVERY CONFIRMATION
   │
   ├─→ FOH/Runner confirms delivery
   ├─→ Action: MARK_DELIVERED
   ├─→ Processes: processDeliveryLayer(session, 'MARK_DELIVERED', runnerId)
   ├─→ File: apps/app/lib/reflex-chain/integration.ts (line 198)
   ├─→ Output: DeliveryReflexOutput
   │   ├─→ deliveryCompletion: Delivery time and status
   │   ├─→ heatmapUpdate: Zone and table data
   │   ├─→ trustLoopData: Delivery time, quality score
   │   └─→ Syncs to: Session Replay Adapter (heatmap, analytics)
   └─→ State: ACTIVE → DELIVERED

6. CHECKOUT COMPLETION
   │
   ├─→ Customer completes payment
   ├─→ Action: COMPLETE_SESSION
   ├─→ Processes: Customer Experience Layer
   ├─→ Output: CustomerReflexOutput
   │   ├─→ sessionFingerprint: Preferences, trust score, loyalty tier
   │   ├─→ loyaltyTokens: Token calculation and issuance
   │   └─→ Syncs to: Loyalty Adapter (token issuance, rewards)
   └─→ State: DELIVERED → COMPLETED
```

## Connectivity Points

### 1. QR Code → Session Creation
**Location:** `apps/app/app/api/webhooks/stripe/route.ts`
- **Line 82:** Webhook receives `checkout.session.completed`
- **Line 139:** Generates QR code URL: `https://app.hookahplus.net/staff/scan/{sessionId}`
- **Line 43 (integration.ts):** Initializes Reflex Chain flow

**Data Flow:**
```typescript
Stripe Webhook → Database Session Creation → QR URL Generation → Reflex Chain Init
```

### 2. Prep Ping → BOH Reflex Layer
**Location:** `apps/app/lib/reflex-chain/integration.ts`
- **Line 77:** `processBOHLayer()` function
- **Line 87:** Creates `BOHReflexOutput` with prep status
- **Line 100:** Syncs to POS Adapter

**Data Flow:**
```typescript
BOH Action (CLAIM_PREP) → processBOHLayer() → BOHReflexOutput → POS Adapter Sync
```

**Key Outputs:**
- `readyForService`: Prep completion timestamp
- `resourceStatus`: Inventory levels, staff capacity
- `estimatedReadyTime`: When session will be ready

### 3. FOH Handoff → FOH Reflex Layer
**Location:** `apps/app/lib/reflex-chain/integration.ts`
- **Line 149:** `processFOHLayer()` function
- **Line 160:** Creates `FOHReflexOutput` with activation data
- **Line 175:** Syncs to POS Adapter with metadata

**Data Flow:**
```typescript
FOH Action (START_ACTIVE) → processFOHLayer() → FOHReflexOutput → POS Adapter Sync
```

**Key Outputs:**
- `sessionActivation`: Confirmation and timer configuration
- `posMetadata`: Order ID, amount, items for POS system
- `timerConfig`: Session duration and timing

### 4. Delivery Confirm → Delivery Reflex Layer
**Location:** `apps/app/lib/reflex-chain/integration.ts`
- **Line 198:** `processDeliveryLayer()` function
- **Line 210:** Creates `DeliveryReflexOutput` with delivery data
- **Line 225:** Syncs to Session Replay Adapter

**Data Flow:**
```typescript
Delivery Action (MARK_DELIVERED) → processDeliveryLayer() → DeliveryReflexOutput → Session Replay Adapter
```

**Key Outputs:**
- `deliveryCompletion`: Delivery timestamp and status
- `heatmapUpdate`: Zone and table heatmap data
- `trustLoopData`: Delivery time, quality score

### 5. Checkout → Customer Reflex Layer
**Location:** `apps/app/lib/reflex-chain/integration.ts` (Customer layer)
- **File:** `apps/guest/lib/reflex-chain/client.ts`
- **Function:** `trackQRScan()`, `submitSessionRating()`
- **Syncs to:** Loyalty Adapter

**Data Flow:**
```typescript
Checkout Completion → Customer Reflex Layer → CustomerReflexOutput → Loyalty Adapter
```

**Key Outputs:**
- `sessionFingerprint`: Customer preferences, trust score, loyalty tier
- `loyaltyTokens`: Calculated tokens based on amount, rating, re-order bonuses
- `trustGraphData`: Trust score updates

## Adapter Synchronization Points

### POS Adapter
**Location:** `apps/app/lib/reflex-chain/adapters.ts`
- **Syncs from:** BOH and FOH Reflex Layers
- **Purpose:** Smart pricing, order logging, POS system integration
- **Data:** Order ID, amount, items, zone-based pricing multipliers

### Loyalty Adapter
**Location:** `apps/app/lib/reflex-chain/adapters.ts`
- **Syncs from:** Customer Reflex Layer
- **Purpose:** Token issuance, rewards, customer tier updates
- **Data:** Token calculation, customer tier, transaction recording

### Session Replay Adapter
**Location:** `apps/app/lib/reflex-chain/adapters.ts`
- **Syncs from:** Delivery Reflex Layer
- **Purpose:** Heatmap visualization, analytics, trust score tracking
- **Data:** Zone heatmap updates, active session tracking, trust score visualization

## State Machine Transitions

**Session States:**
1. `NEW` → Created, awaiting prep
2. `PREP_IN_PROGRESS` → BOH claimed prep
3. `HEAT_UP` → Coals heating
4. `READY_FOR_DELIVERY` → Ready for FOH pickup
5. `ACTIVE` → FOH delivered to customer
6. `DELIVERED` → Session active, customer using
7. `COMPLETED` → Checkout finished

**Reflex Chain Triggers:**
- `CLAIM_PREP` → Triggers BOH layer
- `START_ACTIVE` → Triggers FOH layer
- `MARK_DELIVERED` → Triggers Delivery layer
- `COMPLETE_SESSION` → Triggers Customer layer

## Proof-of-Concept Demonstration Steps

### For Owner Demo:

1. **Manager Creates Session**
   - Navigate to: `/fire-session-dashboard`
   - Click: "New Session" button
   - Fill in: Table ID, Customer Name, Flavor
   - Submit: Session created in database

2. **BOH Staff Claims Prep**
   - Session appears in BOH queue
   - BOH staff clicks "Claim Prep"
   - Reflex Chain processes BOH layer
   - Prep ping sent, inventory updated

3. **FOH Receives Handoff**
   - BOH marks session "Ready for Pickup"
   - FOH receives notification
   - FOH clicks "Start Active"
   - Reflex Chain processes FOH layer
   - POS metadata synced

4. **Delivery Confirmation**
   - FOH confirms delivery to customer
   - Reflex Chain processes Delivery layer
   - Heatmap updated, trust data recorded

5. **Checkout Completion**
   - Customer completes payment
   - Reflex Chain processes Customer layer
   - Loyalty tokens issued
   - Session state: COMPLETED

## File References

**Core Integration:**
- `apps/app/lib/reflex-chain/integration.ts` - Main Reflex Chain processing
- `apps/app/lib/reflex-chain/core.ts` - Reflex Chain engine
- `apps/app/lib/reflex-chain/adapters.ts` - POS, Loyalty, Session Replay adapters
- `apps/app/lib/reflex-chain/types.ts` - Type definitions

**API Endpoints:**
- `apps/app/app/api/sessions/route.ts` - Session creation and state transitions
- `apps/app/app/api/webhooks/stripe/route.ts` - Webhook handler for QR sessions
- `apps/app/app/api/reflex-chain/process/route.ts` - Reflex Chain API endpoint

**UI Components:**
- `apps/app/app/fire-session-dashboard/page.tsx` - Manager dashboard
- `apps/app/app/staff/scan/[sessionId]/page.tsx` - QR scan page

**Documentation:**
- `REFLEX_CHAIN_IMPLEMENTATION.md` - Architecture overview
- `apps/app/QR_CODE_IMPLEMENTATION.md` - QR code flow details

