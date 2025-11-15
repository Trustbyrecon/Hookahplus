# Session Creation Test Script

## Overview

The `test-session-creation.ts` script tests the session creation endpoint with various scenarios to diagnose HTTP 500 errors and verify that session creation works correctly.

## Usage

```bash
cd apps/app
npx tsx scripts/test-session-creation.ts
```

Or with a custom base URL:

```bash
npx tsx scripts/test-session-creation.ts http://localhost:3002
```

Or with environment variable:

```bash
BASE_URL=http://localhost:3002 npx tsx scripts/test-session-creation.ts
```

## Test Cases

The script tests 10 different scenarios:

1. **Basic Session Creation** - Minimal required fields
2. **Session with All Fields** - All optional fields included
3. **Session with Array Flavor** - Flavor as array (JSON conversion)
4. **Session with WALK_IN Source** - Different source type
5. **Session with RESERVE Source** - Reservation source type
6. **Missing Required Fields** - Should return 400
7. **Missing Customer Name** - Should return 400
8. **Invalid Source** - Should default to WALK_IN
9. **Session with Empty Optional Fields** - Empty strings handling
10. **Session with Null Optional Fields** - Null values handling

## Output

The script provides:

- ✅ **Pass/Fail status** for each test
- ⏱️ **Response times** for performance monitoring
- 📋 **Detailed error messages** for failed tests
- 📊 **Summary statistics** at the end
- ⚠️ **HTTP 500 error detection** with full details

## Example Output

```
🧪 Session Creation Test Suite
======================================================================
Base URL: http://localhost:3002

📋 Test: Basic Session Creation
   Description: Minimal required fields (tableId, customerName)
   ✅ PASS - Status: 200, Time: 245ms
   Session ID: clx1234567890abcdef

📋 Test: Missing Required Fields
   Description: Should return 400 (missing tableId)
   ✅ PASS - Status: 400, Time: 12ms

======================================================================
📊 Test Summary
======================================================================
Total Tests: 10
✅ Passed: 10
❌ Failed: 0
⏱️  Total Time: 1234ms
📊 Average Time: 123.40ms
```

## Troubleshooting

If you see HTTP 500 errors:

1. **Check server logs** - The script will show detailed error messages
2. **Verify database connection** - Ensure `DATABASE_URL` is set
3. **Check migrations** - Ensure all database migrations have been run
4. **Review error details** - The script shows full error responses in development mode

## Integration

This script can be integrated into:

- CI/CD pipelines for automated testing
- Pre-deployment verification
- Debugging session creation issues
- Performance monitoring

## Next Steps

After running this script:

1. If all tests pass → Session creation is working correctly
2. If HTTP 500 errors occur → Check server logs and database connection
3. If validation errors occur → Review the payload structure
4. If performance is slow → Check database indexes and query optimization

