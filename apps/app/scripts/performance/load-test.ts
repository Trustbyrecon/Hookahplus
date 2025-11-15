/**
 * Load Testing Script
 * Tests concurrent session creation and API performance
 * 
 * Usage: npx tsx scripts/performance/load-test.ts [concurrency] [baseUrl]
 * Example: npx tsx scripts/performance/load-test.ts 50 http://localhost:3002
 */

import { performance } from 'perf_hooks';

interface TestResult {
  concurrency: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

async function loadTestSessionCreation(
  concurrency: number,
  baseUrl: string = 'http://localhost:3002'
): Promise<TestResult> {
  const startTime = performance.now();
  const results: { time: number; success: boolean; error?: string }[] = [];

  const promises = Array(concurrency).fill(null).map(async (_, index) => {
    const requestStart = performance.now();
    try {
      const response = await fetch(`${baseUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: `T-LOAD-${index}`,
          customerName: `LoadTest-${index}`, // API expects customerName, not customerRef
          flavor: 'Mint', // API expects flavor, not flavorMix
          source: 'QR'
        })
      });

      const requestTime = performance.now() - requestStart;
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = `HTTP ${response.status} - Could not read error body`;
        }
        results.push({
          time: requestTime,
          success: false,
          error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`
        });
        return;
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        results.push({
          time: requestTime,
          success: false,
          error: 'Failed to parse JSON response'
        });
        return;
      }

      results.push({
        time: requestTime,
        success: data.success !== false && (data.session || data.id)
      });
    } catch (error: any) {
      const requestTime = performance.now() - requestStart;
      results.push({
        time: requestTime,
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  });

  await Promise.all(promises);
  const endTime = performance.now();

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  const times = results.map(r => r.time);
  const errors = results.filter(r => !r.success).map(r => r.error || 'Unknown error');

  return {
    concurrency,
    totalTime: endTime - startTime,
    avgTime: times.length > 0 ? times.reduce((sum, t) => sum + t, 0) / times.length : 0,
    minTime: times.length > 0 ? Math.min(...times) : 0,
    maxTime: times.length > 0 ? Math.max(...times) : 0,
    successCount,
    errorCount,
    errors: [...new Set(errors)] // Unique errors
  };
}

async function runLoadTests() {
  const baseUrl = process.env.BASE_URL || process.argv[3] || 'http://localhost:3002';
  const concurrencyLevels = [10, 50, 100, 500];

  console.log('🚀 Starting Load Tests');
  console.log(`Base URL: ${baseUrl}\n`);

  const allResults: TestResult[] = [];

  for (const concurrency of concurrencyLevels) {
    console.log(`Testing with ${concurrency} concurrent requests...`);
    const result = await loadTestSessionCreation(concurrency, baseUrl);
    allResults.push(result);

    console.log(`  ✅ Success: ${result.successCount}/${concurrency}`);
    console.log(`  ❌ Errors: ${result.errorCount}`);
    console.log(`  ⏱️  Total Time: ${(result.totalTime / 1000).toFixed(2)}s`);
    console.log(`  📊 Avg Response: ${result.avgTime.toFixed(2)}ms`);
    console.log(`  📈 Min/Max: ${result.minTime.toFixed(2)}ms / ${result.maxTime.toFixed(2)}ms`);
    
    if (result.errors.length > 0) {
      console.log(`  ⚠️  Errors: ${result.errors.slice(0, 3).join(', ')}`);
    }
    console.log('');
  }

  // Summary
  console.log('📊 Load Test Summary');
  console.log('='.repeat(60));
  console.log('Concurrency | Success Rate | Avg Time | Max Time');
  console.log('-'.repeat(60));
  allResults.forEach(result => {
    const successRate = ((result.successCount / result.concurrency) * 100).toFixed(1);
    console.log(
      `${result.concurrency.toString().padStart(10)} | ${successRate.padStart(11)}% | ${result.avgTime.toFixed(2).padStart(7)}ms | ${result.maxTime.toFixed(2).padStart(7)}ms`
    );
  });
  console.log('='.repeat(60));
}

if (require.main === module) {
  runLoadTests().catch(console.error);
}

export { loadTestSessionCreation, TestResult };

