# Performance Test Fix Summary

**Date:** 2025-11-15  
**Issue:** Performance tests failing with "Missing required fields" (400 errors)

---

## Root Cause

The performance test scripts were sending payloads that the API was rejecting:
- `flavor` sent as string `'Mint'` instead of array `['Mint']` (though API should handle both)
- Missing `loungeId` in some cases
- API error responses not providing enough detail

---

## Fixes Applied

### 1. Updated Test Scripts ✅

**Files:**
- `apps/app/scripts/performance/timer-test.ts`
- `apps/app/scripts/performance/load-test.ts`

**Changes:**
```typescript
// Before
flavor: 'Mint'

// After  
flavor: ['Mint'], // Array format
loungeId: process.env.DEFAULT_LOUNGE_ID || 'default-lounge'
```

### 2. Enhanced API Error Handling ✅

**File:** `apps/app/app/api/sessions/route.ts`

**Changes:**
- Added detailed logging for body parsing
- Added debug info in error responses (development mode)
- Better error messages showing received vs expected values

---

## Next Steps

### 1. Restart Server (REQUIRED)

The server must be restarted to pick up API changes:

```bash
# Stop current server (Ctrl+C)
cd apps/app
npm run dev
```

### 2. Verify API Works

Test with curl:
```bash
curl -X POST http://localhost:3002/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"tableId":"TEST-001","customerName":"Perf Probe","flavor":["Mint"],"source":"QR"}'
```

**Expected:** 200 OK with session object

### 3. Run Tests

```bash
# Session creation test
npx tsx scripts/test-session-creation.ts

# Full performance suite
npx tsx scripts/performance/run-all.ts --base http://localhost:3002 --concurrency 10,50,100
```

---

## Expected Results

After restart:
- ✅ Session creation tests: 10/10 pass
- ✅ Load tests: >80% success rate
- ✅ Timer tests: Sessions created successfully
- ✅ API tests: <2s response times (with indexes)

---

## Notes

- The API already handles `flavor` as both string and array (normalizes to array)
- The issue was likely server not restarted after API changes
- Enhanced error messages will help debug any remaining issues

