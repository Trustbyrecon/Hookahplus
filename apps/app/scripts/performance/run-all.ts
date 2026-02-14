/**
 * Run All Performance Tests
 * Executes all performance tests and generates comprehensive report
 * 
 * Usage: npx tsx scripts/performance/run-all.ts [baseUrl]
 */

import { performance } from 'perf_hooks';
import { loadTestSessionCreation, TestResult as LoadTestResult } from './load-test';
import { testEndpoint, EndpointResult } from './api-test';
import { testTimerPerformance, TimerTestResult } from './timer-test';

interface PerformanceReport {
  timestamp: string;
  baseUrl: string;
  loadTests: LoadTestResult[];
  apiTests: EndpointResult[];
  timerTests: TimerTestResult[];
  summary: {
    loadTestSuccess: boolean;
    apiTestSuccess: boolean;
    timerTestSuccess: boolean;
    overallStatus: 'pass' | 'warn' | 'fail';
  };
}

function parseArgs() {
  const args: { base?: string; concurrency?: string } = {};
  
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--base' && process.argv[i + 1]) {
      args.base = process.argv[i + 1];
      i++; // Skip next arg as it's the value
    } else if (process.argv[i] === '--concurrency' && process.argv[i + 1]) {
      args.concurrency = process.argv[i + 1];
      i++; // Skip next arg as it's the value
    } else if (process.argv[i].startsWith('--base=')) {
      args.base = process.argv[i].split('=')[1];
    } else if (process.argv[i].startsWith('--concurrency=')) {
      args.concurrency = process.argv[i].split('=')[1];
    }
  }
  
  return args;
}

async function runAllTests(): Promise<PerformanceReport> {
  const parsedArgs = parseArgs();
  const baseUrl = process.env.BASE_URL || parsedArgs.base || process.argv[2] || 'http://localhost:3002';
  const concurrencyArg = parsedArgs.concurrency || process.env.CONCURRENCY || '10,50,100';
  const concurrencyLevels = concurrencyArg.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  
  const startTime = performance.now();

  console.log('🚀 Running All Performance Tests');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Concurrency levels: ${concurrencyLevels.join(', ')}`);
  console.log(`Started at: ${new Date().toISOString()}\n`);
  console.log('='.repeat(70));

  const report: PerformanceReport = {
    timestamp: new Date().toISOString(),
    baseUrl,
    loadTests: [],
    apiTests: [],
    timerTests: [],
    summary: {
      loadTestSuccess: false,
      apiTestSuccess: false,
      timerTestSuccess: false,
      overallStatus: 'fail'
    }
  };

  // 1. Load Tests
  console.log('\n📦 Phase 1: Load Tests');
  console.log('-'.repeat(70));
  try {
    // Use parsed concurrency levels or default
    const levelsToTest = concurrencyLevels.length > 0 ? concurrencyLevels : [10, 50, 100];
    for (const concurrency of levelsToTest) {
      const result = await loadTestSessionCreation(concurrency, baseUrl);
      report.loadTests.push(result);
      console.log(`✅ ${concurrency} concurrent: ${result.successCount}/${concurrency} success`);
    }
    report.summary.loadTestSuccess = report.loadTests.every(r => r.successCount > 0);
  } catch (error: any) {
    console.error(`❌ Load tests failed: ${error.message}`);
  }

  // 2. API Tests
  console.log('\n🔌 Phase 2: API Performance Tests');
  console.log('-'.repeat(70));
  try {
    const endpoints = [
      { path: '/api/health', method: 'GET' },
      { path: '/api/sessions', method: 'GET' },
      { path: '/api/analytics/sessions?windowDays=7', method: 'GET' },
      { path: '/api/analytics/conversion?windowDays=7', method: 'GET' },
      { path: '/api/analytics/retention?windowDays=30', method: 'GET' },
      { path: '/api/revenue?startDate=2025-01-01&endDate=2025-01-31', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      const result = await testEndpoint(baseUrl, endpoint.path, endpoint.method);
      report.apiTests.push(result);
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${endpoint.method} ${endpoint.path}: ${result.responseTime.toFixed(2)}ms`);
    }
    report.summary.apiTestSuccess = report.apiTests.every(r => r.success);
  } catch (error: any) {
    console.error(`❌ API tests failed: ${error.message}`);
  }

  // 3. Timer Tests
  console.log('\n⏱️  Phase 3: Timer Performance Tests');
  console.log('-'.repeat(70));
  try {
    const sessionCounts = [10, 50];
    for (const count of sessionCounts) {
      const result = await testTimerPerformance(baseUrl, count);
      report.timerTests.push(result);
      console.log(`✅ ${count} sessions: ${result.updateFrequency.toFixed(2)} updates/sec, ${result.accuracy.toFixed(1)}% accuracy`);
    }
    report.summary.timerTestSuccess = report.timerTests.every(r => r.accuracy > 80);
  } catch (error: any) {
    console.error(`❌ Timer tests failed: ${error.message}`);
  }

  // Determine overall status
  const allPassed = report.summary.loadTestSuccess && report.summary.apiTestSuccess && report.summary.timerTestSuccess;
  const somePassed = report.summary.loadTestSuccess || report.summary.apiTestSuccess || report.summary.timerTestSuccess;
  
  report.summary.overallStatus = allPassed ? 'pass' : somePassed ? 'warn' : 'fail';

  const endTime = performance.now();
  const totalTime = (endTime - startTime) / 1000;

  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Performance Test Summary');
  console.log('='.repeat(70));
  console.log(`Total Time: ${totalTime.toFixed(2)}s`);
  console.log(`Load Tests: ${report.summary.loadTestSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Tests: ${report.summary.apiTestSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Timer Tests: ${report.summary.timerTestSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Overall Status: ${report.summary.overallStatus.toUpperCase()}`);
  console.log('='.repeat(70));

  // Performance Recommendations
  console.log('\n💡 Recommendations:');
  const avgApiTime = report.apiTests.reduce((sum, r) => sum + r.responseTime, 0) / report.apiTests.length;
  if (avgApiTime > 1000) {
    console.log('  ⚠️  API response times are high (>1000ms). Consider optimizing database queries.');
  }
  if (report.loadTests.some(r => r.errorCount > r.successCount * 0.1)) {
    console.log('  ⚠️  High error rate in load tests. Check server capacity and error handling.');
  }
  if (report.timerTests.some(r => r.accuracy < 90)) {
    console.log('  ⚠️  Timer accuracy is below 90%. Check real-time update mechanism.');
  }

  return report;
}

if (require.main === module) {
  runAllTests()
    .then(report => {
      // Optionally save report to file
      if (process.env.SAVE_REPORT === 'true') {
        const fs = require('fs');
        const path = require('path');
        const reportPath = path.join(__dirname, `performance-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Report saved to: ${reportPath}`);
      }
      process.exit(report.summary.overallStatus === 'pass' ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runAllTests, PerformanceReport };

