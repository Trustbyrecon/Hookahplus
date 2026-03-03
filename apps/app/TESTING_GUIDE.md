# 🧪 Comprehensive Testing Guide

## Test Script: Session Actions

A comprehensive testing script has been created to test all session creation, BOH/FOH actions, edge cases, and waitlist functionality.

### Location
`apps/app/scripts/test-session-actions.ts`

### Prerequisites

1. **App build running** on `localhost:3002`
2. **Site build running** on `localhost:3000` (for Start Demo Session test)
3. **Database connected** and accessible
4. **Node.js dependencies** installed

### Installation

```bash
# Install node-fetch if not already installed
cd apps/app
npm install --save-dev node-fetch @types/node-fetch
```

### Running the Tests

```bash
# From apps/app directory
npx tsx scripts/test-session-actions.ts

# Or with ts-node
npx ts-node scripts/test-session-actions.ts
```

### Test Coverage

#### 1. **Start Demo Session** (Site → App)
- Tests cross-origin session creation from site build
- Validates CORS headers
- Verifies session creation success

#### 2. **+ New Session** (App Build)
- Tests session creation from app build
- Validates required fields
- Verifies session data structure

#### 3. **BOH Actions**
- ✅ **CLAIM_PREP** - BOH claims preparation
- ✅ **HEAT_UP** - BOH heats up coals
- ✅ **READY_FOR_DELIVERY** - BOH marks ready for FOH pickup

#### 4. **FOH Actions**
- ✅ **DELIVER_NOW** - FOH starts delivery
- ✅ **MARK_DELIVERED** - FOH marks as delivered
- ✅ **START_ACTIVE** - FOH starts active session
- ✅ **CLOSE_SESSION** - FOH closes session

#### 5. **Edge Cases**
- ✅ Duplicate session (same table)
- ✅ Invalid action (wrong state)
- ✅ Missing required fields
- ✅ Invalid session ID
- ✅ PUT_ON_HOLD action

#### 6. **Waitlist Functionality**
- ✅ Create waitlist entry
- ✅ Get waitlist entries

#### 7. **CORS Headers**
- ✅ OPTIONS preflight request
- ✅ Cross-origin POST request

### Expected Output

```
🚀 Starting Comprehensive Session Actions Test Suite
📡 App URL: http://localhost:3002
🌐 Site URL: http://localhost:3000
============================================================

🧪 Test 1: Start Demo Session (Site → App)
🧪 Test 2: + New Session (App Build)
🧪 Test 4: BOH Actions
🧪 Test 5: FOH Actions
🧪 Test 6: Edge Cases
🧪 Test 7: Waitlist Functionality
🧪 Test 8: CORS Headers

============================================================
📊 TEST RESULTS SUMMARY
============================================================

✅ Passed: 15/18
❌ Failed: 3/18
📈 Success Rate: 83.3%

📋 Detailed Results:
✅ 1. Start Demo Session (245ms)
✅ 2. + New Session (189ms)
✅ 3. BOH: Claim Prep (156ms)
...
```

### Troubleshooting

#### Test Failures

1. **CORS Errors**
   - Verify `NEXT_PUBLIC_SITE_URL` is set correctly
   - Check that CORS headers are being returned
   - Ensure both servers are running

2. **Session Not Found**
   - Verify database connection
   - Check that sessions exist in database
   - Ensure Prisma client is generated

3. **Invalid State Transitions**
   - Check session current state
   - Verify action is valid for current state
   - Review state machine rules

#### Common Issues

- **Port conflicts**: Ensure ports 3000 and 3002 are available
- **Database connection**: Verify `DATABASE_URL` is set
- **Missing dependencies**: Run `npm install` in apps/app

### Manual Testing Checklist

#### Start Demo Session
- [ ] Navigate to site build (`localhost:3000`)
- [ ] Scroll to "How it Works" section
- [ ] Click "Start Demo Session" button
- [ ] Verify session is created
- [ ] Check session appears in app build FSD

#### + New Session
- [ ] Navigate to app build FSD (`localhost:3002/fire-session-dashboard`)
- [ ] Click "+ New Session" button
- [ ] Fill in session details
- [ ] Submit form
- [ ] Verify session appears in dashboard

#### BOH Actions
- [ ] Find session in BOH tab
- [ ] Click "Claim Prep"
- [ ] Verify state changes to PREP_IN_PROGRESS
- [ ] Click "Heat Up"
- [ ] Verify state changes to HEAT_UP
- [ ] Click "Ready for Delivery"
- [ ] Verify state changes to READY_FOR_DELIVERY

#### FOH Actions
- [ ] Find session in FOH tab
- [ ] Click "Deliver Now"
- [ ] Verify state changes to OUT_FOR_DELIVERY
- [ ] Click "Mark Delivered"
- [ ] Verify state changes to DELIVERED
- [ ] Click "Start Active"
- [ ] Verify state changes to ACTIVE
- [ ] Click "Close Session"
- [ ] Verify state changes to CLOSED

#### Edge Cases
- [ ] Try creating duplicate session (same table)
- [ ] Try invalid action (e.g., CLOSE on NEW session)
- [ ] Try missing required fields
- [ ] Try invalid session ID
- [ ] Test PUT_ON_HOLD action

### Integration with CI/CD

To integrate into CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Session Actions Tests
  run: |
    cd apps/app
    npm install
    npx tsx scripts/test-session-actions.ts
  env:
    NEXT_PUBLIC_APP_URL: ${{ secrets.APP_URL }}
    NEXT_PUBLIC_SITE_URL: ${{ secrets.SITE_URL }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Next Steps

1. Run the test script to verify all functionality
2. Fix any failing tests
3. Add additional test cases as needed
4. Integrate into CI/CD pipeline
5. Set up automated testing schedule

