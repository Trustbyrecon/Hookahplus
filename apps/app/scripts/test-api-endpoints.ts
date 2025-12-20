/**
 * Comprehensive API Endpoint Testing
 * 
 * Tests all API endpoints with various scenarios
 * Run with: npx tsx apps/app/scripts/test-api-endpoints.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

interface TestCase {
  name: string;
  method: string;
  path: string;
  body?: any;
  queryParams?: Record<string, string>;
  expectedStatus?: number;
  validateResponse?: (data: any) => boolean;
  description: string;
}

const testCases: TestCase[] = [
  // Table Layout API
  {
    name: 'Get Lounge Layout',
    method: 'GET',
    path: '/api/lounges',
    queryParams: { layout: 'true' },
    expectedStatus: 200,
    validateResponse: (data) => data.success !== undefined,
    description: 'Should return lounge layout data'
  },
  {
    name: 'Get Lounge Layout (no query)',
    method: 'GET',
    path: '/api/lounges',
    expectedStatus: 200,
    validateResponse: (data) => typeof data === 'object',
    description: 'Should return lounge data without layout flag'
  },

  // Table Validation API
  {
    name: 'Validate Table (POST - missing body)',
    method: 'POST',
    path: '/api/lounges/tables/validate',
    expectedStatus: 400,
    description: 'Should return 400 for missing body'
  },
  {
    name: 'Validate Table (POST - invalid table)',
    method: 'POST',
    path: '/api/lounges/tables/validate',
    body: { tableId: 'non-existent-table-12345' },
    expectedStatus: 200,
    validateResponse: (data) => data.valid === false,
    description: 'Should return valid=false for non-existent table'
  },

  // Analytics API
  {
    name: 'Get Lounge Analytics (7d)',
    method: 'GET',
    path: '/api/lounges/analytics',
    queryParams: { timeRange: '7d' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true && Array.isArray(data.tables),
    description: 'Should return analytics for 7 days'
  },
  {
    name: 'Get Lounge Analytics (24h)',
    method: 'GET',
    path: '/api/lounges/analytics',
    queryParams: { timeRange: '24h' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true,
    description: 'Should return analytics for 24 hours'
  },
  {
    name: 'Get Lounge Analytics (30d)',
    method: 'GET',
    path: '/api/lounges/analytics',
    queryParams: { timeRange: '30d' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true,
    description: 'Should return analytics for 30 days'
  },

  // Availability API
  {
    name: 'Get Table Availability (party size 2)',
    method: 'GET',
    path: '/api/lounges/tables/availability',
    queryParams: { partySize: '2' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true && Array.isArray(data.availableTables),
    description: 'Should return available tables for party of 2'
  },
  {
    name: 'Get Table Availability (party size 10)',
    method: 'GET',
    path: '/api/lounges/tables/availability',
    queryParams: { partySize: '10' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true,
    description: 'Should return available tables and combinations for party of 10'
  },
  {
    name: 'Check Specific Table Availability',
    method: 'GET',
    path: '/api/lounges/tables/availability',
    queryParams: { tableId: 'test-table', partySize: '2' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true && typeof data.available === 'boolean',
    description: 'Should return availability status for specific table'
  },
  {
    name: 'Create Reservation (missing fields)',
    method: 'POST',
    path: '/api/lounges/tables/availability',
    body: { tableId: 'test-table' }, // Missing required fields
    expectedStatus: 400,
    description: 'Should return 400 for missing required fields'
  },

  // Zone Routing API
  {
    name: 'Get Zone Routing Info',
    method: 'GET',
    path: '/api/staff/zones',
    expectedStatus: 200,
    validateResponse: (data) => data.success === true && Array.isArray(data.zones),
    description: 'Should return zone workload and metrics'
  },
  {
    name: 'Get Zone Routing (filtered by zone)',
    method: 'GET',
    path: '/api/staff/zones',
    queryParams: { zone: 'VIP' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true,
    description: 'Should return filtered zone data'
  },
  {
    name: 'Get Routing Recommendation',
    method: 'POST',
    path: '/api/staff/zones/route',
    body: { tableId: 'test-table' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true && typeof data.routing === 'object',
    description: 'Should return routing recommendation for table'
  },
  {
    name: 'Get Routing Recommendation (missing tableId)',
    method: 'POST',
    path: '/api/staff/zones/route',
    body: {},
    expectedStatus: 400,
    description: 'Should return 400 for missing tableId'
  },

  // Unified Analytics API
  {
    name: 'Get Unified Analytics (7d)',
    method: 'GET',
    path: '/api/analytics/unified',
    queryParams: { timeRange: '7d' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true && typeof data.metrics === 'object',
    description: 'Should return unified analytics for 7 days'
  },
  {
    name: 'Get Unified Analytics (24h)',
    method: 'GET',
    path: '/api/analytics/unified',
    queryParams: { timeRange: '24h' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true,
    description: 'Should return unified analytics for 24 hours'
  },
  {
    name: 'Get Unified Analytics (30d)',
    method: 'GET',
    path: '/api/analytics/unified',
    queryParams: { timeRange: '30d' },
    expectedStatus: 200,
    validateResponse: (data) => data.success === true,
    description: 'Should return unified analytics for 30 days'
  }
];

interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  responseTime?: number;
  error?: string;
  validationError?: string;
}

const results: TestResult[] = [];

async function runTest(test: TestCase): Promise<TestResult> {
  const startTime = Date.now();
  const url = new URL(`${BASE_URL}${test.path}`);
  
  if (test.queryParams) {
    Object.entries(test.queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  try {
    const response = await fetch(url.toString(), {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: test.body ? JSON.stringify(test.body) : undefined
    });

    const responseTime = Date.now() - startTime;
    const statusMatch = test.expectedStatus ? response.status === test.expectedStatus : response.status < 500;

    let data;
    try {
      data = await response.json();
    } catch {
      // Not JSON, that's okay for some error responses
    }

    let validationPassed = true;
    let validationError: string | undefined;

    if (test.validateResponse && data) {
      try {
        validationPassed = test.validateResponse(data);
        if (!validationPassed) {
          validationError = 'Response validation failed';
        }
      } catch (error) {
        validationPassed = false;
        validationError = error instanceof Error ? error.message : 'Validation error';
      }
    }

    const passed = statusMatch && validationPassed;

    return {
      name: test.name,
      passed,
      status: response.status,
      responseTime,
      validationError: validationPassed ? undefined : validationError
    };
  } catch (error) {
    return {
      name: test.name,
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runAllTests() {
  console.log('🧪 API Endpoint Comprehensive Testing\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(60) + '\n');

  // Check if server is accessible
  try {
    await fetch(`${BASE_URL}/api/health`).catch(() => {
      throw new Error('Server not accessible');
    });
  } catch {
    console.warn(`⚠️  Warning: Could not reach ${BASE_URL}`);
    console.warn('   Make sure the dev server is running: npm run dev');
    console.warn('   Some tests may fail without a running server.\n');
  }

  for (const test of testCases) {
    const result = await runTest(test);
    results.push(result);

    const icon = result.passed ? '✅' : '❌';
    const status = result.status ? ` [${result.status}]` : '';
    const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
    const error = result.error ? ` - ${result.error}` : '';
    const validation = result.validationError ? ` - ${result.validationError}` : '';

    console.log(`${icon} ${test.name}${status}${time}${error}${validation}`);
    console.log(`   ${test.description}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (results.some(r => r.responseTime)) {
    const times = results.filter(r => r.responseTime).map(r => r.responseTime!);
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    console.log(`\n⏱️  Performance Metrics:`);
    console.log(`   Average: ${avgTime.toFixed(0)}ms`);
    console.log(`   Min: ${minTime}ms`);
    console.log(`   Max: ${maxTime}ms`);
  }

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}`);
      if (r.status) console.log(`    Status: ${r.status}`);
      if (r.error) console.log(`    Error: ${r.error}`);
      if (r.validationError) console.log(`    Validation: ${r.validationError}`);
    });
  }

  // Performance warnings
  const slowTests = results.filter(r => r.responseTime && r.responseTime > 2000);
  if (slowTests.length > 0) {
    console.log('\n⚠️  Slow Endpoints (>2s):');
    slowTests.forEach(r => {
      console.log(`  - ${r.name}: ${r.responseTime}ms`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

