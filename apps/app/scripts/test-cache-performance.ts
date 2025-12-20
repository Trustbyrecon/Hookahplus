/**
 * Quick Cache Performance Test
 * 
 * Tests cache effectiveness by making repeated requests
 * Run with: npx tsx apps/app/scripts/test-cache-performance.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

async function testCachePerformance() {
  console.log('🧪 Testing Cache Performance\n');
  console.log('='.repeat(60) + '\n');

  const endpoint = '/api/lounges/tables/availability?partySize=2';
  const iterations = 5;

  console.log(`Testing: ${endpoint}`);
  console.log(`Iterations: ${iterations}\n`);

  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      const time = Date.now() - start;
      times.push(time);
      
      const status = response.ok ? '✅' : '❌';
      const cacheHeader = response.headers.get('x-cache') || 'unknown';
      console.log(`${status} Request ${i + 1}: ${time}ms (cache: ${cacheHeader})`);
      
      if (response.ok) {
        await response.text(); // Consume response
      }
    } catch (error) {
      const time = Date.now() - start;
      times.push(time);
      console.log(`❌ Request ${i + 1}: ${time}ms (error: ${error instanceof Error ? error.message : 'Unknown'})`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Results\n');

  if (times.length > 0) {
    const first = times[0];
    const subsequent = times.slice(1);
    const avgSubsequent = subsequent.reduce((a, b) => a + b, 0) / subsequent.length;
    const improvement = ((first - avgSubsequent) / first) * 100;

    console.log(`First Request: ${first}ms (cache miss)`);
    console.log(`Subsequent Average: ${avgSubsequent.toFixed(0)}ms (cache hits)`);
    console.log(`Improvement: ${improvement > 0 ? improvement.toFixed(1) : 0}% faster`);
    
    if (improvement > 50) {
      console.log('✅ Cache is working effectively!');
    } else if (improvement > 0) {
      console.log('⚠️  Cache is working but improvement could be better');
    } else {
      console.log('❌ Cache may not be working - no improvement seen');
    }
  }
}

testCachePerformance().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

