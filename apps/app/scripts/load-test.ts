/**
 * Concurrent Load Testing Script
 * 
 * Tests API endpoints under concurrent load to identify bottlenecks
 * Run with: npx tsx apps/app/scripts/load-test.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

interface LoadTestConfig {
  endpoint: string;
  method: string;
  body?: any;
  queryParams?: Record<string, string>;
  name: string;
}

interface TestResult {
  endpoint: string;
  name: string;
  totalRequests: number;
  successful: number;
  failed: number;
  errorRate: number;
  responseTimes: number[];
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50: number;
  p95: number;
  p99: number;
  requestsPerSecond: number;
  errors: Array<{ status?: number; message: string; count: number }>;
}

const testConfigs: LoadTestConfig[] = [
  {
    name: 'Get Lounge Layout',
    endpoint: '/api/lounges',
    method: 'GET',
    queryParams: { layout: 'true' }
  },
  {
    name: 'Get Lounge Analytics (7d)',
    endpoint: '/api/lounges/analytics',
    method: 'GET',
    queryParams: { timeRange: '7d' }
  },
  {
    name: 'Get Table Availability',
    endpoint: '/api/lounges/tables/availability',
    method: 'GET',
    queryParams: { partySize: '2' }
  },
  {
    name: 'Get Zone Routing Info',
    endpoint: '/api/staff/zones',
    method: 'GET'
  },
  {
    name: 'Get Unified Analytics',
    endpoint: '/api/analytics/unified',
    method: 'GET',
    queryParams: { timeRange: '7d' }
  },
  {
    name: 'Validate Table',
    endpoint: '/api/lounges/tables/validate',
    method: 'POST',
    body: { tableId: 'test-table', checkAvailability: true }
  }
];

interface LoadTestOptions {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime?: number; // seconds
}

const defaultOptions: LoadTestOptions = {
  concurrentUsers: 10,
  requestsPerUser: 10,
  rampUpTime: 0
};

async function makeRequest(config: LoadTestConfig): Promise<{ success: boolean; status?: number; time: number; error?: string }> {
  const startTime = Date.now();
  const url = new URL(`${BASE_URL}${config.endpoint}`);
  
  if (config.queryParams) {
    Object.entries(config.queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  try {
    const response = await fetch(url.toString(), {
      method: config.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: config.body ? JSON.stringify(config.body) : undefined
    });

    const time = Date.now() - startTime;
    const success = response.status >= 200 && response.status < 400;
    
    // Read response to ensure it's complete
    await response.text();

    return {
      success,
      status: response.status,
      time,
      error: success ? undefined : `HTTP ${response.status}`
    };
  } catch (error) {
    const time = Date.now() - startTime;
    return {
      success: false,
      time,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runLoadTestForEndpoint(
  config: LoadTestConfig,
  options: LoadTestOptions
): Promise<TestResult> {
  const totalRequests = options.concurrentUsers * options.requestsPerUser;
  const results: Array<{ success: boolean; status?: number; time: number; error?: string }> = [];
  const errors = new Map<string, number>();

  console.log(`\n🧪 Testing: ${config.name}`);
  console.log(`   Endpoint: ${config.method} ${config.endpoint}`);
  console.log(`   Concurrent Users: ${options.concurrentUsers}`);
  console.log(`   Requests per User: ${options.requestsPerUser}`);
  console.log(`   Total Requests: ${totalRequests}`);

  const startTime = Date.now();

  // Create concurrent user groups
  const userPromises = Array.from({ length: options.concurrentUsers }, async (_, userIndex) => {
    // Ramp up delay if specified
    if (options.rampUpTime && userIndex > 0) {
      await new Promise(resolve => 
        setTimeout(resolve, (options.rampUpTime! / options.concurrentUsers) * userIndex * 1000)
      );
    }

    // Each user makes multiple requests
    const userRequests = Array.from({ length: options.requestsPerUser }, async () => {
      const result = await makeRequest(config);
      results.push(result);
      
      if (!result.success) {
        const errorKey = result.error || `Status ${result.status || 'Unknown'}`;
        errors.set(errorKey, (errors.get(errorKey) || 0) + 1);
      }
    });

    await Promise.all(userRequests);
  });

  await Promise.all(userPromises);

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000; // seconds
  const requestsPerSecond = totalRequests / totalTime;

  // Calculate statistics
  const responseTimes = results.map(r => r.time).sort((a, b) => a - b);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const errorRate = (failed / totalRequests) * 100;

  const avgResponseTime = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;
  const minResponseTime = responseTimes[0] || 0;
  const maxResponseTime = responseTimes[responseTimes.length - 1] || 0;
  const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)] || 0;
  const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
  const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;

  return {
    endpoint: config.endpoint,
    name: config.name,
    totalRequests,
    successful,
    failed,
    errorRate,
    responseTimes,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    p50,
    p95,
    p99,
    requestsPerSecond,
    errors: Array.from(errors.entries()).map(([message, count]) => ({
      message,
      count
    }))
  };
}

function printResults(results: TestResult[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(80));

  results.forEach(result => {
    console.log(`\n${result.name}`);
    console.log(`  Endpoint: ${result.endpoint}`);
    console.log(`  Total Requests: ${result.totalRequests}`);
    console.log(`  ✅ Successful: ${result.successful} (${(100 - result.errorRate).toFixed(1)}%)`);
    console.log(`  ❌ Failed: ${result.failed} (${result.errorRate.toFixed(1)}%)`);
    console.log(`  ⚡ Requests/sec: ${result.requestsPerSecond.toFixed(2)}`);
    console.log(`\n  Response Times (ms):`);
    console.log(`    Average: ${result.avgResponseTime.toFixed(0)}`);
    console.log(`    Min: ${result.minResponseTime}`);
    console.log(`    Max: ${result.maxResponseTime}`);
    console.log(`    P50: ${result.p50}`);
    console.log(`    P95: ${result.p95}`);
    console.log(`    P99: ${result.p99}`);

    if (result.errors.length > 0) {
      console.log(`\n  Errors:`);
      result.errors.forEach(err => {
        console.log(`    - ${err.message}: ${err.count} occurrences`);
      });
    }

    // Performance warnings
    if (result.avgResponseTime > 1000) {
      console.log(`  ⚠️  WARNING: Average response time > 1s`);
    }
    if (result.p95 > 2000) {
      console.log(`  ⚠️  WARNING: P95 response time > 2s`);
    }
    if (result.errorRate > 1) {
      console.log(`  ⚠️  WARNING: Error rate > 1%`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('='.repeat(80));

  const totalRequests = results.reduce((sum, r) => sum + r.totalRequests, 0);
  const totalSuccessful = results.reduce((sum, r) => sum + r.successful, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const overallErrorRate = (totalFailed / totalRequests) * 100;
  const avgResponseTime = results.reduce((sum, r) => sum + r.avgResponseTime, 0) / results.length;
  const avgThroughput = results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / results.length;

  console.log(`\nTotal Requests: ${totalRequests}`);
  console.log(`✅ Successful: ${totalSuccessful} (${(100 - overallErrorRate).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalFailed} (${overallErrorRate.toFixed(1)}%)`);
  console.log(`⚡ Average Throughput: ${avgThroughput.toFixed(2)} requests/sec`);
  console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);

  // Identify slowest endpoints
  const slowest = results.sort((a, b) => b.avgResponseTime - a.avgResponseTime).slice(0, 3);
  if (slowest.length > 0) {
    console.log(`\n🐌 Slowest Endpoints:`);
    slowest.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name}: ${r.avgResponseTime.toFixed(0)}ms avg`);
    });
  }

  // Identify endpoints with highest error rates
  const highestErrors = results
    .filter(r => r.errorRate > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 3);
  if (highestErrors.length > 0) {
    console.log(`\n❌ Endpoints with Errors:`);
    highestErrors.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name}: ${r.errorRate.toFixed(1)}% error rate`);
    });
  }
}

async function runLoadTests() {
  console.log('🚀 Starting Load Tests');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(80));

  // Check if server is accessible
  try {
    // Try health endpoint first, then root path as fallback
    let healthCheck;
    try {
      healthCheck = await fetch(`${BASE_URL}/api/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
    } catch {
      // If health endpoint fails, try root path
      healthCheck = await fetch(`${BASE_URL}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
    }
    
    // Any response (even 404) means server is running
    if (healthCheck.status >= 500) {
      throw new Error(`Server returned error: ${healthCheck.status}`);
    }
    console.log(`✅ Server is accessible at ${BASE_URL}\n`);
  } catch (error) {
    // Check if it's a network error or timeout
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('ECONNREFUSED') || error.message.includes('timeout'))) {
      console.error(`\n❌ Error: Could not reach ${BASE_URL}`);
      console.error('   Make sure the dev server is running: npm run dev');
      console.error(`   Network error: ${error.message}`);
      process.exit(1);
    } else {
      // Other errors, but server might still be accessible
      console.warn(`\n⚠️  Health check warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.warn('   Continuing with tests anyway...\n');
    }
  }

  // Test configurations with different load levels
  const testScenarios = [
    { name: 'Light Load', options: { concurrentUsers: 5, requestsPerUser: 5 } },
    { name: 'Medium Load', options: { concurrentUsers: 10, requestsPerUser: 10 } },
    { name: 'Heavy Load', options: { concurrentUsers: 20, requestsPerUser: 10 } }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n\n${'='.repeat(80)}`);
    console.log(`📊 ${scenario.name.toUpperCase()} TEST`);
    console.log(`${'='.repeat(80)}`);

    const results: TestResult[] = [];

    // Run tests for each endpoint
    for (const config of testConfigs) {
      try {
        const result = await runLoadTestForEndpoint(config, scenario.options);
        results.push(result);
      } catch (error) {
        console.error(`\n❌ Error testing ${config.name}:`, error);
      }
    }

    printResults(results);

    // Wait between scenarios
    if (scenario !== testScenarios[testScenarios.length - 1]) {
      console.log('\n⏳ Waiting 5 seconds before next scenario...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Load Testing Complete');
  console.log('='.repeat(80));
}

// Parse command line arguments
const args = process.argv.slice(2);
const customOptions: Partial<LoadTestOptions> = {};

if (args.includes('--light')) {
  customOptions.concurrentUsers = 5;
  customOptions.requestsPerUser = 5;
} else if (args.includes('--medium')) {
  customOptions.concurrentUsers = 10;
  customOptions.requestsPerUser = 10;
} else if (args.includes('--heavy')) {
  customOptions.concurrentUsers = 20;
  customOptions.requestsPerUser = 10;
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: npx tsx apps/app/scripts/load-test.ts [options]

Options:
  --light     Run light load test (5 concurrent users, 5 requests each)
  --medium    Run medium load test (10 concurrent users, 10 requests each)
  --heavy     Run heavy load test (20 concurrent users, 10 requests each)
  --help      Show this help message

Default: Runs all three scenarios (light, medium, heavy)
  `);
  process.exit(0);
}

runLoadTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

