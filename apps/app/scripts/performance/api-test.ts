/**
 * API Performance Test
 * Tests all major API endpoints response times
 * 
 * Usage: npx tsx scripts/performance/api-test.ts [baseUrl]
 */

import { performance } from 'perf_hooks';

interface EndpointResult {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

async function testEndpoint(
  baseUrl: string,
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<EndpointResult> {
  const startTime = performance.now();
  
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const responseTime = performance.now() - startTime;
    
    // Try to read response (but don't wait for full body)
    try {
      await response.text();
    } catch {
      // Ignore read errors
    }

    return {
      endpoint,
      method,
      status: response.status,
      responseTime,
      success: response.ok
    };
  } catch (error: any) {
    return {
      endpoint,
      method,
      status: 0,
      responseTime: performance.now() - startTime,
      success: false,
      error: error.message
    };
  }
}

async function runAPITests() {
  const baseUrl = process.env.BASE_URL || process.argv[2] || 'http://localhost:3002';

  console.log('🧪 Starting API Performance Tests');
  console.log(`Base URL: ${baseUrl}\n`);

  const endpoints = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/sessions', method: 'GET' },
    { path: '/api/sessions', method: 'POST', body: { tableId: 'T-TEST', customerRef: 'Test', flavorMix: 'Mint' } },
    { path: '/api/analytics/sessions?windowDays=7', method: 'GET' },
    { path: '/api/analytics/conversion?windowDays=7', method: 'GET' },
    { path: '/api/analytics/retention?windowDays=30', method: 'GET' },
    { path: '/api/revenue?startDate=2025-01-01&endDate=2025-01-31', method: 'GET' },
    { path: '/api/ktl4/health-check', method: 'GET' }
  ];

  const results: EndpointResult[] = [];

  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
    const result = await testEndpoint(baseUrl, endpoint.path, endpoint.method, endpoint.body);
    results.push(result);

    const statusIcon = result.success ? '✅' : '❌';
    const statusColor = result.success ? '' : '\x1b[31m'; // Red
    const resetColor = '\x1b[0m';
    
    console.log(
      `  ${statusIcon} ${statusColor}${result.status}${resetColor} | ${result.responseTime.toFixed(2)}ms${result.error ? ` | Error: ${result.error}` : ''}`
    );
  }

  // Summary
  console.log('\n📊 API Performance Summary');
  console.log('='.repeat(70));
  console.log('Endpoint'.padEnd(40) + ' | Status | Response Time');
  console.log('-'.repeat(70));
  
  results.forEach(result => {
    const endpointStr = `${result.method} ${result.endpoint}`.padEnd(40);
    const statusStr = result.success ? `✅ ${result.status}` : `❌ ${result.status}`;
    const timeStr = `${result.responseTime.toFixed(2)}ms`;
    console.log(`${endpointStr} | ${statusStr.padEnd(6)} | ${timeStr}`);
  });

  const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const successRate = (results.filter(r => r.success).length / results.length) * 100;
  const p95Time = results.sort((a, b) => a.responseTime - b.responseTime)[
    Math.floor(results.length * 0.95)
  ]?.responseTime || 0;

  console.log('-'.repeat(70));
  console.log(`Average Response Time: ${avgTime.toFixed(2)}ms`);
  console.log(`95th Percentile: ${p95Time.toFixed(2)}ms`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log('='.repeat(70));

  // Performance thresholds
  const thresholds = {
    excellent: 200,
    good: 500,
    acceptable: 1000
  };

  console.log('\n🎯 Performance Assessment:');
  if (avgTime < thresholds.excellent) {
    console.log('✅ Excellent: Average response time < 200ms');
  } else if (avgTime < thresholds.good) {
    console.log('✅ Good: Average response time < 500ms');
  } else if (avgTime < thresholds.acceptable) {
    console.log('⚠️  Acceptable: Average response time < 1000ms');
  } else {
    console.log('❌ Needs Improvement: Average response time > 1000ms');
  }
}

if (require.main === module) {
  runAPITests().catch(console.error);
}

export { testEndpoint, EndpointResult };

