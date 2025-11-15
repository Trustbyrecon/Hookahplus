/**
 * Session Creation Test Script
 * 
 * Tests session creation endpoint with various scenarios to diagnose HTTP 500 errors
 * 
 * Usage: npx tsx scripts/test-session-creation.ts [baseUrl]
 */

const baseUrl = process.env.BASE_URL || process.argv[2] || 'http://localhost:3002';

interface TestCase {
  name: string;
  payload: any;
  expectedStatus?: number;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: 'Basic Session Creation',
    description: 'Minimal required fields (tableId, customerName)',
    payload: {
      tableId: 'TEST-001',
      customerName: 'Test User',
      flavor: 'Mint',
      source: 'QR'
    },
    expectedStatus: 200
  },
  {
    name: 'Session with All Fields',
    description: 'All optional fields included',
    payload: {
      tableId: 'TEST-002',
      customerName: 'Test User Full',
      customerPhone: '+1234567890',
      flavor: 'Mint + Grape',
      source: 'QR',
      amount: 3500,
      notes: 'Test session notes',
      sessionDuration: 45 * 60,
      loungeId: 'default-lounge',
      assignedStaff: {
        boh: 'BOH-001',
        foh: 'FOH-001'
      }
    },
    expectedStatus: 200
  },
  {
    name: 'Session with Array Flavor',
    description: 'Flavor as array (should be converted to JSON)',
    payload: {
      tableId: 'TEST-003',
      customerName: 'Test User Array',
      flavor: ['Mint', 'Grape', 'Watermelon'],
      source: 'QR'
    },
    expectedStatus: 200
  },
  {
    name: 'Session with WALK_IN Source',
    description: 'Different source type',
    payload: {
      tableId: 'TEST-004',
      customerName: 'Walk-in Customer',
      flavor: 'Custom Mix',
      source: 'WALK_IN'
    },
    expectedStatus: 200
  },
  {
    name: 'Session with RESERVE Source',
    description: 'Reservation source type',
    payload: {
      tableId: 'TEST-005',
      customerName: 'Reserved Customer',
      flavor: 'Mint',
      source: 'RESERVE',
      externalRef: 'RES-12345'
    },
    expectedStatus: 200
  },
  {
    name: 'Missing Required Fields',
    description: 'Should return 400 (missing tableId)',
    payload: {
      customerName: 'Test User',
      flavor: 'Mint',
      source: 'QR'
    },
    expectedStatus: 400
  },
  {
    name: 'Missing Customer Name',
    description: 'Should return 400 (missing customerName)',
    payload: {
      tableId: 'TEST-006',
      flavor: 'Mint',
      source: 'QR'
    },
    expectedStatus: 400
  },
  {
    name: 'Invalid Source',
    description: 'Invalid source should default to WALK_IN',
    payload: {
      tableId: 'TEST-007',
      customerName: 'Test User',
      flavor: 'Mint',
      source: 'INVALID_SOURCE'
    },
    expectedStatus: 200
  },
  {
    name: 'Session with Empty Optional Fields',
    description: 'Empty strings for optional fields should be handled',
    payload: {
      tableId: 'TEST-008',
      customerName: 'Test User',
      customerPhone: '',
      flavor: 'Mint',
      source: 'QR',
      notes: ''
    },
    expectedStatus: 200
  },
  {
    name: 'Session with Null Optional Fields',
    description: 'Null values for optional fields should be handled',
    payload: {
      tableId: 'TEST-009',
      customerName: 'Test User',
      customerPhone: null,
      flavor: 'Mint',
      source: 'QR',
      notes: null,
      assignedStaff: null
    },
    expectedStatus: 200
  }
];

async function testSessionCreation(testCase: TestCase): Promise<{
  success: boolean;
  status: number;
  responseTime: number;
      error?: string;
      data?: any;
      rawResponse?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.payload)
    });

    const responseTime = Date.now() - startTime;
    const status = response.status;

    let data: any;
    let error: string | undefined;
    let rawResponse: string | undefined;

    try {
      const text = await response.text();
      rawResponse = text;
      
      if (text.trim() === '') {
        error = 'Empty response body';
        data = {};
      } else {
        try {
          data = JSON.parse(text);
          // Extract error details from response
          if (data.error) {
            error = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
          }
          if (data.details) {
            error = error ? `${error} - ${data.details}` : data.details;
          }
        } catch (parseError) {
          error = `Non-JSON response: ${text.substring(0, 500)}`;
          data = { rawResponse: text.substring(0, 1000) };
        }
      }
    } catch (e: any) {
      error = `Failed to read response: ${e.message}`;
    }

    const success = testCase.expectedStatus 
      ? status === testCase.expectedStatus 
      : response.ok;

    return {
      success,
      status,
      responseTime,
      error: error || (data?.error ? JSON.stringify(data.error) : undefined),
      data,
      rawResponse
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      status: 0,
      responseTime,
      error: error.message || String(error),
      rawResponse: undefined
    };
  }
}

async function runTests() {
  console.log('🧪 Session Creation Test Suite');
  console.log('='.repeat(70));
  console.log(`Base URL: ${baseUrl}\n`);

  const results: Array<{
    testCase: TestCase;
    result: Awaited<ReturnType<typeof testSessionCreation>>;
  }> = [];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   Payload: ${JSON.stringify(testCase.payload, null, 2).substring(0, 200)}...`);
    
    const result = await testSessionCreation(testCase);
    results.push({ testCase, result });

    if (result.success) {
      console.log(`   ✅ PASS - Status: ${result.status}, Time: ${result.responseTime}ms`);
      if (result.data?.session?.id) {
        console.log(`   Session ID: ${result.data.session.id}`);
      }
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}, Time: ${result.responseTime}ms`);
      if (result.error) {
        console.log(`   Error: ${result.error.substring(0, 300)}`);
      }
      if (result.data) {
        console.log(`   Response Data: ${JSON.stringify(result.data, null, 2).substring(0, 500)}`);
      }
      if (result.rawResponse && !result.data) {
        console.log(`   Raw Response: ${result.rawResponse.substring(0, 500)}`);
      }
      if (result.data?.details) {
        console.log(`   Details: ${JSON.stringify(result.data.details).substring(0, 300)}`);
      }
      if (result.data?.stack && process.env.NODE_ENV === 'development') {
        console.log(`   Stack: ${result.data.stack.substring(0, 500)}`);
      }
    }

    // Small delay between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.result.responseTime, 0);
  const avgTime = totalTime / results.length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`📊 Average Time: ${avgTime.toFixed(2)}ms`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => !r.result.success)
      .forEach(({ testCase, result }) => {
        console.log(`\n   ${testCase.name}:`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Error: ${result.error || 'Unknown error'}`);
        if (result.data?.details) {
          console.log(`   Details: ${JSON.stringify(result.data.details)}`);
        }
      });
  }

  // Check for HTTP 500 errors specifically
  const http500Errors = results.filter(r => r.result.status === 500);
  if (http500Errors.length > 0) {
    console.log('\n⚠️  HTTP 500 Errors Detected:');
    http500Errors.forEach(({ testCase, result }) => {
      console.log(`\n   ${testCase.name}:`);
      console.log(`   Payload: ${JSON.stringify(testCase.payload)}`);
      console.log(`   Error: ${result.error || 'No error message'}`);
      if (result.data) {
        console.log(`   Full Response: ${JSON.stringify(result.data, null, 2)}`);
      }
      if (result.rawResponse) {
        console.log(`   Raw Response (first 1000 chars): ${result.rawResponse.substring(0, 1000)}`);
      }
      if (!result.data && !result.rawResponse) {
        console.log(`   ⚠️  No response body received - server may have crashed`);
      }
    });
  }

  console.log('\n' + '='.repeat(70));

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});

