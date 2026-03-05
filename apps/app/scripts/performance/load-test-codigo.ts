/**
 * CODIGO Concurrency Load Test
 * Tests concurrent session creation for lounge CODIGO (Toast/POS parallel).
 *
 * Usage: npx tsx scripts/performance/load-test-codigo.ts [concurrency] [baseUrl]
 * Example: npx tsx scripts/performance/load-test-codigo.ts 20 http://localhost:3002
 */

import { performance } from 'perf_hooks';

async function loadTestCodigoSessions(
  concurrency: number,
  baseUrl: string = 'http://localhost:3002'
) {
  const startTime = performance.now();
  const tables = ['301', '302', '401', '501', '601', '701', '702', '705', 'KB1', 'KB2'];
  const results: { time: number; success: boolean; error?: string }[] = [];

  const promises = Array(concurrency)
    .fill(null)
    .map(async (_, i) => {
      const tableId = tables[i % tables.length];
      const reqStart = performance.now();
      try {
        const response = await fetch(`${baseUrl}/api/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableId,
            table_id: tableId,
            customerName: `CodigoConcurrent-${i}`,
            customer_name: `CodigoConcurrent-${i}`,
            flavor_mix: ['Lemon Mint'],
            amount: 6000,
            loungeId: 'CODIGO',
            lounge_id: 'CODIGO',
            source: 'POS',
            session_type: 'walk-in',
            codigoOperator: true,
          }),
        });
        const elapsed = performance.now() - reqStart;
        if (!response.ok) {
          const errText = await response.text();
          results.push({ time: elapsed, success: false, error: `HTTP ${response.status}: ${errText.slice(0, 200)}` });
          return;
        }
        const data = await response.json();
        results.push({ time: elapsed, success: !!(data.session?.id || data.id) });
      } catch (e: any) {
        results.push({ time: performance.now() - reqStart, success: false, error: e.message });
      }
    });

  await Promise.all(promises);
  const endTime = performance.now();
  const successCount = results.filter((r) => r.success).length;
  const times = results.map((r) => r.time);

  return {
    concurrency,
    totalTime: endTime - startTime,
    avgTime: times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    successCount,
    errorCount: concurrency - successCount,
    successRate: ((successCount / concurrency) * 100).toFixed(1) + '%',
  };
}

async function main() {
  const baseUrl = process.env.BASE_URL || process.argv[3] || 'http://localhost:3002';
  const concurrency = parseInt(process.argv[2] || '10', 10);

  console.log('🚀 CODIGO Concurrency Load Test');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Concurrency: ${concurrency}\n`);

  const result = await loadTestCodigoSessions(concurrency, baseUrl);
  console.log(`✅ Success: ${result.successCount}/${concurrency} (${result.successRate})`);
  console.log(`⏱️  Total: ${(result.totalTime / 1000).toFixed(2)}s | Avg: ${result.avgTime.toFixed(0)}ms`);
  if (result.errorCount > 0) {
    console.log(`❌ Errors: ${result.errorCount}`);
  }
}

main().catch(console.error);
