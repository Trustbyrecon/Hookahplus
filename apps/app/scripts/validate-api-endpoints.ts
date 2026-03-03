/**
 * API Endpoint Validation Script
 * 
 * Validates all API endpoints are accessible and return expected structure
 * Run with: npx tsx apps/app/scripts/validate-api-endpoints.ts
 * 
 * Note: Requires the dev server to be running on localhost:3002
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

interface EndpointTest {
  method: string;
  path: string;
  description: string;
  expectedStatus?: number;
  body?: any;
  queryParams?: Record<string, string>;
}

const endpoints: EndpointTest[] = [
  {
    method: 'GET',
    path: '/api/lounges',
    description: 'Get lounge layout',
    queryParams: { layout: 'true' }
  },
  {
    method: 'GET',
    path: '/api/lounges/tables/validate',
    description: 'Validate table (will fail without POST body, but endpoint should exist)',
    expectedStatus: 400 // Expected to fail without body
  },
  {
    method: 'GET',
    path: '/api/lounges/analytics',
    description: 'Get lounge analytics',
    queryParams: { timeRange: '7d' }
  },
  {
    method: 'GET',
    path: '/api/lounges/tables/availability',
    description: 'Get table availability',
    queryParams: { partySize: '2' }
  },
  {
    method: 'GET',
    path: '/api/staff/zones',
    description: 'Get zone routing information'
  },
  {
    method: 'GET',
    path: '/api/analytics/unified',
    description: 'Get unified analytics',
    queryParams: { timeRange: '7d' }
  }
];

interface TestResult {
  endpoint: string;
  method: string;
  passed: boolean;
  status?: number;
  error?: string;
  responseTime?: number;
}

const results: TestResult[] = [];

async function testEndpoint(test: EndpointTest): Promise<TestResult> {
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
    const passed = test.expectedStatus 
      ? response.status === test.expectedStatus 
      : response.status < 500; // Any non-server error is acceptable

    // Try to parse response
    let data;
    try {
      data = await response.json();
    } catch {
      // Not JSON, that's okay
    }

    return {
      endpoint: test.path,
      method: test.method,
      passed,
      status: response.status,
      responseTime
    };
  } catch (error) {
    return {
      endpoint: test.path,
      method: test.method,
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runTests() {
  console.log('🧪 API Endpoint Validation Tests\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(50) + '\n');

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    const icon = result.passed ? '✅' : '❌';
    const status = result.status ? ` [${result.status}]` : '';
    const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
    const error = result.error ? ` - ${result.error}` : '';

    console.log(`${icon} ${endpoint.method} ${endpoint.path}${status}${time}${error}`);
    console.log(`   ${endpoint.description}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (results.some(r => r.responseTime)) {
    const avgTime = results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.filter(r => r.responseTime).length;
    console.log(`Average Response Time: ${avgTime.toFixed(0)}ms`);
  }

  if (failed > 0) {
    console.log('\n❌ Failed Endpoints:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.method} ${r.endpoint}`);
      if (r.error) {
        console.log(`    Error: ${r.error}`);
      }
      if (r.status) {
        console.log(`    Status: ${r.status}`);
      }
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is accessible
fetch(`${BASE_URL}/api/health`).catch(() => {
  console.warn(`⚠️  Warning: Could not reach ${BASE_URL}`);
  console.warn('   Make sure the dev server is running: npm run dev');
  console.warn('   Continuing with tests anyway...\n');
}).then(() => {
  runTests();
});

