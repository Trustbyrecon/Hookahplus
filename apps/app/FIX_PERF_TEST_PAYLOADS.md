# Fix Performance Test Payloads

**Issue:** Performance tests failing with "Missing required fields" (400 errors)

**Root Cause:** Test scripts sending payloads that API rejects

**Status:** ✅ Fixed test scripts, investigating API response format

---

## Changes Applied

### 1. Fixed Test Script Payloads

**Files Modified:**
- `apps/app/scripts/performance/timer-test.ts`
- `apps/app/scripts/performance/load-test.ts`

**Changes:**
- Changed `flavor: 'Mint'` → `flavor: ['Mint']` (array format)
- Added `loungeId: process.env.DEFAULT_LOUNGE_ID || 'default-lounge'`

### 2. Enhanced API Error Messages

**File:** `apps/app/app/api/sessions/route.ts`

**Changes:**
- Added detailed logging for body parsing
- Added debug info in error responses (development mode)
- Better error messages showing what was received vs expected

---

## Next Steps

1. **Restart server** to pick up API changes
2. **Re-run tests** to verify fixes
3. **Check server logs** for detailed error messages if still failing

---

## Test Commands

```bash
# Test API directly
curl -X POST http://localhost:3002/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"tableId":"TEST-001","customerName":"Perf Probe","flavor":["Mint"],"source":"QR"}'

# Run session creation test
npx tsx scripts/test-session-creation.ts

# Run full performance suite
npx tsx scripts/performance/run-all.ts --base http://localhost:3002 --concurrency 10,50,100
```

