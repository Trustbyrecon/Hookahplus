# Workflow Improvements - Guest Refills, Edge Cases, Quick Actions

**Date:** 2025-01-27  
**Status:** 🚧 In Progress

---

## 🎯 Overview

This document outlines improvements to three key workflows:
1. **Guest Refill Requests** → BOH/FOH NAN Workflow
2. **Edge Case Creation** → Staff reporting with manager escalation
3. **Quick Actions** → Session-aware or removal

---

## 1. 🔄 Guest Refill Request Flow

### Current State
- ✅ Guests can request refills via guest tracker (`SessionControls.tsx`)
- ✅ Refill API endpoint exists (`/api/sessions/[id]/refill`)
- ❌ Refill requests don't flow into NAN workflow
- ❌ BOH/FOH don't see refill requests in their queues

### Desired Flow

```
Guest Request Refill
    ↓
POST /api/sessions/[id]/refill
    ↓
Session.edgeCase = 'REFILL_REQUESTED'
Session.refillStatus = 'requested'
    ↓
BOH Dashboard shows refill request
    ↓
BOH prepares new coals/flavor
    ↓
BOH marks ready → FOH notified
    ↓
FOH delivers refill to table
    ↓
FOH marks delivered → Session returns to ACTIVE
```

### Implementation Plan

#### A. Update Refill API (`/api/sessions/[id]/refill`)
- Set `refillStatus` field (if exists) or use `edgeCase`
- Update session state to show refill request
- Emit event for BOH/FOH dashboards

#### B. Update BOH Dashboard
- Show sessions with `refillStatus = 'requested'` in BOH queue
- Add "Prepare Refill" button
- Mark refill as ready when prepared

#### C. Update FOH Dashboard
- Show sessions with refill ready for delivery
- Add "Deliver Refill" button
- Mark refill as delivered when completed

#### D. Update Guest Tracker
- Show refill request status
- Update when refill is delivered

---

## 2. 🚨 Edge Case Creation Workflow

### Current State
- ✅ Edge case API exists (`/api/edge`)
- ✅ ResolveEdgeCaseModal exists for resolution
- ❌ No UI for staff to report edge cases
- ❌ No clear escalation path to manager

### Desired Flow

```
Staff Encounters Issue
    ↓
Click "Report Issue" on session
    ↓
ReportEdgeCaseModal opens
    ↓
Select issue type + description
    ↓
POST /api/edge (type: 'report')
    ↓
Session.edgeCase = [type]
Session.edgeNote = [description]
    ↓
Manager Dashboard shows edge case
    ↓
Manager reviews and resolves
    ↓
POST /api/edge (type: 'resolve')
    ↓
Session.edgeCase = null
```

### Edge Case Types

1. **EQUIPMENT_ISSUE** - Hookah equipment malfunction
2. **CUSTOMER_COMPLAINT** - Customer dissatisfaction
3. **STAFF_SHORTAGE** - Not enough staff for workload
4. **INVENTORY_ISSUE** - Missing flavors/coals
5. **PAYMENT_ISSUE** - Payment processing problem
6. **SAFETY_CONCERN** - Health/safety issue
7. **OTHER** - Other issues requiring manager attention

### Implementation Plan

#### A. Create ReportEdgeCaseModal Component
- Similar to ResolveEdgeCaseModal but for reporting
- Dropdown for edge case type
- Text area for description
- Severity selector (LOW, MEDIUM, HIGH, CRITICAL)

#### B. Add "Report Issue" Button to Session Cards
- Show in BOH/FOH tabs
- Only visible for staff roles (not customer)
- Opens ReportEdgeCaseModal

#### C. Update Manager Dashboard
- Show active edge cases prominently
- Filter by severity
- Quick resolve actions

#### D. Add Escalation Path
- Staff can escalate if manager doesn't respond
- Escalation sends notification/alert
- Higher priority in manager queue

---

## 3. ⚡ Quick Actions Refactor

### Current State
- ✅ Quick Actions bar exists in SimpleFSDDesign
- ❌ Actions not tied to specific sessions
- ❌ Some actions don't work without session context
- ❌ Confusing UX - unclear what they do

### Options

#### Option A: Make Session-Aware
- Show Quick Actions only when session is selected
- Actions operate on selected session
- Clear visual connection to session

#### Option B: Remove Quick Actions
- Remove Quick Actions bar entirely
- All actions available in session cards/modals
- Cleaner, less confusing UI

#### Option C: Context-Aware Quick Actions
- Show different actions based on:
  - Selected session state
  - User role
  - Available actions for current context
- Dynamic button visibility

### Recommendation: **Option C - Context-Aware**

**Implementation:**
- Quick Actions show actions for:
  - First unpaid session (if exists)
  - First session needing BOH prep (if exists)
  - First session ready for FOH delivery (if exists)
  - First session ready to light (if exists)
- Each button shows which session it will act on
- Clicking button acts on that specific session

**Example:**
```
Quick Actions:
[Confirm Payment] → Session: T-001 (Sarah & Friends)
[BOH: Claim Prep] → Session: T-002 (John's Party)
[FOH: Deliver] → Session: T-003 (Ready for delivery)
[Light Session] → Session: T-004 (Delivered, ready to light)
```

---

## 📋 Implementation Checklist

### Phase 1: Guest Refill Flow
- [ ] Update refill API to set proper session state
- [ ] Add refill status to session schema (if needed)
- [ ] Update BOH dashboard to show refill requests
- [ ] Update FOH dashboard to show refill ready
- [ ] Test end-to-end refill flow

### Phase 2: Edge Case Creation
- [ ] Create ReportEdgeCaseModal component
- [ ] Add "Report Issue" button to session cards
- [ ] Update manager dashboard to show edge cases
- [ ] Add escalation functionality
- [ ] Test edge case reporting and resolution

### Phase 3: Quick Actions Refactor
- [ ] Make Quick Actions context-aware
- [ ] Show session context for each action
- [ ] Update button labels to include session info
- [ ] Test Quick Actions with various session states
- [ ] Remove Quick Actions if not valuable (fallback)

---

## 🎯 Success Criteria

### Guest Refill Flow
- ✅ Guest can request refill from tracker
- ✅ BOH sees refill request in queue
- ✅ FOH sees refill ready for delivery
- ✅ Refill delivered and session returns to active

### Edge Case Creation
- ✅ Staff can report edge cases from session cards
- ✅ Manager sees edge cases in dashboard
- ✅ Manager can resolve edge cases
- ✅ Escalation works for urgent issues

### Quick Actions
- ✅ Actions are clearly tied to sessions
- ✅ Actions work correctly
- ✅ UI is clear and not confusing
- ✅ Users understand what each action does

---

## 📝 Next Steps

1. **Review and approve workflow designs**
2. **Implement Phase 1 (Guest Refill Flow)**
3. **Implement Phase 2 (Edge Case Creation)**
4. **Implement Phase 3 (Quick Actions Refactor)**
5. **Test all workflows end-to-end**
6. **Update documentation**

---

**Status:** Ready for implementation  
**Priority:** High - Improves core workflows

