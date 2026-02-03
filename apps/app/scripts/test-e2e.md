# End-to-End Testing Guide

## Overview
E2E tests validate complete user flows from start to finish.

## Running E2E (including Night After Night / demo claim prep)
- **With Playwright starting the app:** `npm run test:e2e` (port 3002 must be free).
- **With app already running:** `USE_EXISTING_SERVER=1 npx playwright test e2e/flows/night-after-night-engine.spec.ts --project=chromium`.
- See `tasks/demo-nan-claim-prep-e2e-task-brief.md` for demo NAN (Claim Prep) flow and E2E details.

## Test Scenarios

### Scenario 1: Create Session with Table Selection
**Flow:**
1. Navigate to sessions page
2. Click "Create Session"
3. Select table from TableSelector
4. Fill in customer details
5. Submit form
6. Verify session created
7. Verify table shows as occupied

**Expected Results:**
- ✅ TableSelector loads tables
- ✅ Table selection works
- ✅ Capacity validation works
- ✅ Session created successfully
- ✅ Table status updates
- ✅ Session appears in list

**Test Data:**
- Layout with tables configured
- Available table selected

---

### Scenario 2: View Analytics Dashboard
**Flow:**
1. Navigate to analytics page
2. Select "Unified Dashboard" view
3. Select time range (7d)
4. Review metrics
5. Review insights
6. Review forecasts
7. Click on top table
8. Review zone performance

**Expected Results:**
- ✅ Dashboard loads
- ✅ Metrics display correctly
- ✅ Insights show
- ✅ Forecasts display
- ✅ Top tables list shows
- ✅ Zone performance shows
- ✅ Interactions work

**Test Data:**
- Historical session data
- Multiple zones
- Various table types

---

### Scenario 3: Zone-Based Staff Assignment
**Flow:**
1. Navigate to staff panel
2. Go to Zones tab
3. Review zone workloads
4. Create new session
5. Verify auto-assignment to zone staff
6. Check zone workload updates

**Expected Results:**
- ✅ Zone workloads display
- ✅ Staff assignments show
- ✅ Session auto-assigned
- ✅ Zone workload updates
- ✅ Staff load increases

**Test Data:**
- Staff in different zones
- Available tables in zones
- Active sessions

---

### Scenario 4: Table Availability Check
**Flow:**
1. Navigate to lounge layout
2. View live mode
3. See occupied tables
4. Try to create session for occupied table
5. See availability error
6. See alternative suggestions
7. Select alternative table

**Expected Results:**
- ✅ Live view shows occupied tables
- ✅ Occupied table marked unavailable
- ✅ Error message shows
- ✅ Alternatives suggested
- ✅ Can select alternative
- ✅ Session created with alternative

**Test Data:**
- Active session on table
- Alternative tables available

---

### Scenario 5: Reservation System
**Flow:**
1. Navigate to table availability API
2. Create reservation for future time
3. Verify reservation created
4. Try to create session for reserved table
5. See reservation conflict
6. Cancel reservation
7. Verify table available

**Expected Results:**
- ✅ Reservation created
- ✅ Table shows as reserved
- ✅ Conflict detected
- ✅ Reservation cancelled
- ✅ Table available again

**Test Data:**
- Available table
- Future time slot

---

### Scenario 6: Analytics Heat Map
**Flow:**
1. Navigate to lounge layout
2. Switch to analytics view
3. Select metric (revenue)
4. View heat map
5. Click on table
6. Review table details
7. Switch metric (utilization)
8. View updated heat map

**Expected Results:**
- ✅ Analytics view loads
- ✅ Heat map renders
- ✅ Colors reflect metric
- ✅ Table click works
- ✅ Details show
- ✅ Metric switch updates colors

**Test Data:**
- Historical session data
- Multiple tables with revenue
- Various utilization levels

---

### Scenario 7: Complete Session Lifecycle
**Flow:**
1. Create session
2. Verify table occupied
3. Start session
4. View in live mode
5. Add refill request
6. Complete session
7. Verify table available
8. Check analytics updated

**Expected Results:**
- ✅ Session created
- ✅ Table occupied
- ✅ Session started
- ✅ Live view updates
- ✅ Refill tracked
- ✅ Session completed
- ✅ Table available
- ✅ Analytics updated

**Test Data:**
- Available table
- Customer details
- Session duration

---

## Test Execution

### Manual E2E Testing
1. Start dev server: `npm run dev`
2. Set up test data (layout, sessions, staff)
3. Execute each scenario
4. Verify expected results
5. Document any issues

### Automated E2E Testing (Future)
```bash
# Run all E2E tests
npm run test:e2e

# Run specific scenario
npm run test:e2e -- --grep "Create Session"

# Run with UI
npm run test:e2e -- --ui
```

## Test Data Setup

### Prerequisites
- Layout configured with tables
- Staff members created
- Historical session data
- Active sessions (for some scenarios)

### Test Data Scripts (Future)
```typescript
// scripts/setup-test-data.ts
async function setupTestData() {
  // Create test layout
  // Create test sessions
  // Create test staff
  // Create test reservations
}
```

## Success Criteria

### All Scenarios Must:
- ✅ Complete without errors
- ✅ Show correct data
- ✅ Update UI correctly
- ✅ Handle errors gracefully
- ✅ Provide user feedback

### Performance Requirements:
- ✅ Page loads < 2s
- ✅ API calls < 1s
- ✅ UI updates < 500ms
- ✅ No memory leaks

## Known Issues to Test

1. **Empty States**
   - No layout configured
   - No sessions
   - No staff
   - No tables

2. **Error States**
   - API failures
   - Network errors
   - Invalid data
   - Missing permissions

3. **Edge Cases**
   - Very large party sizes
   - All tables occupied
   - No available staff
   - Concurrent updates

## Test Results Documentation

### Test Run Template
```
Date: [Date]
Tester: [Name]
Environment: [Dev/Staging/Prod]

Scenario 1: [Name]
- Status: ✅ Pass / ❌ Fail
- Notes: [Any issues or observations]

Scenario 2: [Name]
- Status: ✅ Pass / ❌ Fail
- Notes: [Any issues or observations]

...
```

## Continuous Testing

### Daily Smoke Tests
- Critical paths only
- Quick validation
- ~10 minutes

### Weekly Full Test Suite
- All scenarios
- Comprehensive validation
- ~1 hour

### Pre-Release Testing
- All scenarios
- Performance testing
- Edge case testing
- ~2 hours

