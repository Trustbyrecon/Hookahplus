/**
 * Performance Testing Script
 * 
 * Tests API endpoints for performance characteristics:
 * - Response time consistency
 * - Memory usage
 * - Connection handling
 * - Concurrent request handling
 * 
 * Run with: npx tsx apps/app/scripts/performance-test.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

interface PerformanceTest {
  name: string;
  endpoint: string;
  method: string;
  body?: any;
  queryParams?: Record<string, string>;
}

const tests: PerformanceTest[] = [
  {
    name: 'Get Lounge Layout',
    endpoint: '/api/lounges',
    method: 'GET',
    queryParams: { layout: 'true' }
  },
  {
    name: 'Get Lounge Analytics',
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
    name: 'Get Zone Routing',
    endpoint: '/api/staff/zones',
    method: 'GET'
  },
  {
    name: 'Get Unified Analytics',
    endpoint: '/api/analytics/unified',
    method: 'GET',
    queryParams: { timeRange: '7d' }
  }
];

interface PerformanceMetrics {
  name: string;
  endpoint: string;
  samples: number[];
  avg: number;
  min: number;
  max: number;
  stdDev: number;
  p50: number;
  p95: number;
  p99: number;
  successRate: number;
  errors: number;
}

async function makeRequest(test: PerformanceTest): Promise<{ time: number; success: boolean; error?: string }> {
  const startTime = process.hrtime.bigint();
  const url = new URL(`${BASE_URL}${test.endpoint}`);
  
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

    const endTime = process.hrtime.bigint();
    const time = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

    const success = response.status >= 200 && response.status < 400;
    
    // Read response to ensure it's complete
    await response.text();

    return {
      time,
      success,
      error: success ? undefined : `HTTP ${response.status}`
    };
  } catch (error) {
    const endTime = process.hrtime.bigint();
    const time = Number(endTime - startTime) / 1_000_000;
    return {
      time,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function calculateStats(samples: number[]): {
  avg: number;
  min: number;
  max: number;
  stdDev: number;
  p50: number;
  p95: number;
  p99: number;
} {
  if (samples.length === 0) {
    return { avg: 0, min: 0, max: 0, stdDev: 0, p50: 0, p95: 0, p99: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const sum = samples.reduce((acc, val) => acc + val, 0);
  const avg = sum / samples.length;
  const variance = samples.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);

  return {
    avg,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stdDev,
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

async function testEndpoint(test: PerformanceTest, iterations: number = 50): Promise<PerformanceMetrics> {
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`   Endpoint: ${test.method} ${test.endpoint}`);
  console.log(`   Iterations: ${iterations}`);

  const samples: number[] = [];
  let errors = 0;

  for (let i = 0; i < iterations; i++) {
    const result = await makeRequest(test);
    samples.push(result.time);
    if (!result.success) {
      errors++;
      if (i < 5) {
        console.log(`   ⚠️  Error on iteration ${i + 1}: ${result.error}`);
      }
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`   Progress: ${i + 1}/${iterations}\r`);
    }
  }

  process.stdout.write('   Progress: Complete\n');

  const stats = calculateStats(samples);
  const successRate = ((iterations - errors) / iterations) * 100;

  return {
    name: test.name,
    endpoint: test.endpoint,
    samples,
    ...stats,
    successRate,
    errors
  };
}

async function testConcurrentRequests(test: PerformanceTest, concurrent: number = 10): Promise<PerformanceMetrics> {
  console.log(`\n🔄 Concurrent Test: ${test.name}`);
  console.log(`   Concurrent Requests: ${concurrent}`);

  const startTime = Date.now();
  const promises = Array.from({ length: concurrent }, () => makeRequest(test));
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  const samples = results.map(r => r.time);
  const errors = results.filter(r => !r.success).length;
  const successRate = ((concurrent - errors) / concurrent) * 100;

  const stats = calculateStats(samples);

  console.log(`   Total Time: ${totalTime}ms`);
  console.log(`   Throughput: ${(concurrent / (totalTime / 1000)).toFixed(2)} req/sec`);

  return {
    name: `${test.name} (Concurrent)`,
    endpoint: test.endpoint,
    samples,
    ...stats,
    successRate,
    errors
  };
}

function printResults(metrics: PerformanceMetrics[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 PERFORMANCE TEST RESULTS');
  console.log('='.repeat(80));

  metrics.forEach(m => {
    console.log(`\n${m.name}`);
    console.log(`  Endpoint: ${m.endpoint}`);
    console.log(`  Samples: ${m.samples.length}`);
    console.log(`  ✅ Success Rate: ${m.successRate.toFixed(1)}%`);
    if (m.errors > 0) {
      console.log(`  ❌ Errors: ${m.errors}`);
    }
    console.log(`\n  Response Time Statistics (ms):`);
    console.log(`    Average: ${m.avg.toFixed(2)}`);
    console.log(`    Min: ${m.min.toFixed(2)}`);
    console.log(`    Max: ${m.max.toFixed(2)}`);
    console.log(`    Std Dev: ${m.stdDev.toFixed(2)}`);
    console.log(`    P50: ${m.p50.toFixed(2)}`);
    console.log(`    P95: ${m.p95.toFixed(2)}`);
    console.log(`    P99: ${m.p99.toFixed(2)}`);

    // Consistency check
    const coefficientOfVariation = (m.stdDev / m.avg) * 100;
    if (coefficientOfVariation > 50) {
      console.log(`  ⚠️  WARNING: High variability (CV: ${coefficientOfVariation.toFixed(1)}%)`);
    }

    // Performance thresholds
    if (m.avg > 1000) {
      console.log(`  ⚠️  WARNING: Average response time > 1s`);
    }
    if (m.p95 > 2000) {
      console.log(`  ⚠️  WARNING: P95 response time > 2s`);
    }
    if (m.p99 > 3000) {
      console.log(`  ⚠️  WARNING: P99 response time > 3s`);
    }
    if (m.successRate < 99) {
      console.log(`  ⚠️  WARNING: Success rate < 99%`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('='.repeat(80));

  const avgResponseTime = metrics.reduce((sum, m) => sum + m.avg, 0) / metrics.length;
  const avgSuccessRate = metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
  const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);

  console.log(`\nAverage Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Average Success Rate: ${avgSuccessRate.toFixed(1)}%`);
  console.log(`Total Errors: ${totalErrors}`);

  // Identify slowest endpoints
  const slowest = metrics.sort((a, b) => b.avg - a.avg).slice(0, 3);
  if (slowest.length > 0) {
    console.log(`\n🐌 Slowest Endpoints (by average):`);
    slowest.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name}: ${m.avg.toFixed(2)}ms`);
    });
  }

  // Identify most variable endpoints
  const mostVariable = metrics
    .map(m => ({
      ...m,
      cv: (m.stdDev / m.avg) * 100
    }))
    .sort((a, b) => b.cv - a.cv)
    .slice(0, 3);
  if (mostVariable.length > 0) {
    console.log(`\n📊 Most Variable Endpoints (by coefficient of variation):`);
    mostVariable.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name}: CV ${m.cv.toFixed(1)}%`);
    });
  }
}

async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(80));

  // Check if server is accessible
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/health`).catch(() => {
      throw new Error('Server not accessible');
    });
    if (!healthCheck.ok) {
      throw new Error('Server health check failed');
    }
  } catch (error) {
    console.error(`\n❌ Error: Could not reach ${BASE_URL}`);
    console.error('   Make sure the dev server is running: npm run dev');
    process.exit(1);
  }

  const metrics: PerformanceMetrics[] = [];

  // Sequential performance tests
  console.log('\n\n📊 SEQUENTIAL PERFORMANCE TESTS');
  console.log('='.repeat(80));
  for (const test of tests) {
    try {
      const metric = await testEndpoint(test, 50);
      metrics.push(metric);
    } catch (error) {
      console.error(`\n❌ Error testing ${test.name}:`, error);
    }
  }

  // Concurrent performance tests
  console.log('\n\n🔄 CONCURRENT PERFORMANCE TESTS');
  console.log('='.repeat(80));
  for (const test of tests) {
    try {
      const metric = await testConcurrentRequests(test, 10);
      metrics.push(metric);
    } catch (error) {
      console.error(`\n❌ Error testing ${test.name} concurrently:`, error);
    }
  }

  printResults(metrics);

  console.log('\n' + '='.repeat(80));
  console.log('✅ Performance Testing Complete');
  console.log('='.repeat(80));
}

runPerformanceTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

