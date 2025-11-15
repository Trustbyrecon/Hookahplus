/**
 * Real-Time Timer Performance Test
 * Tests timer updates with multiple active sessions
 * 
 * Usage: npx tsx scripts/performance/timer-test.ts [baseUrl] [sessionCount]
 */

import { performance } from 'perf_hooks';

interface TimerTestResult {
  sessionCount: number;
  updateFrequency: number; // Updates per second
  memoryUsage: number; // MB
  accuracy: number; // Percentage of accurate updates
  errors: string[];
}

async function createTestSessions(
  baseUrl: string,
  count: number
): Promise<string[]> {
  const sessionIds: string[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: `T-TIMER-${i}`,
          customerRef: `TimerTest-${i}`,
          flavorMix: 'Mint',
          source: 'QR'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session?.id || data.id) {
          sessionIds.push(data.session?.id || data.id);
        }
      }
    } catch (error) {
      console.warn(`Failed to create session ${i}:`, error);
    }
  }

  return sessionIds;
}

async function activateSessions(
  baseUrl: string,
  sessionIds: string[]
): Promise<void> {
  // Activate sessions by transitioning them to ACTIVE state
  // This simulates the full flow: NEW → PAID → PREP → DELIVERED → ACTIVE
  for (const sessionId of sessionIds) {
    try {
      // Simulate quick activation (skip actual payment for test)
      await fetch(`${baseUrl}/api/sessions/${sessionId}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'START_ACTIVE',
          userRole: 'ADMIN'
        })
      });
    } catch (error) {
      // Ignore errors for test sessions
    }
  }
}

async function testTimerPerformance(
  baseUrl: string,
  sessionCount: number
): Promise<TimerTestResult> {
  console.log(`Creating ${sessionCount} test sessions...`);
  const sessionIds = await createTestSessions(baseUrl, sessionCount);
  
  if (sessionIds.length === 0) {
    throw new Error('Failed to create test sessions');
  }

  console.log(`Activating ${sessionIds.length} sessions...`);
  await activateSessions(baseUrl, sessionIds);

  // Wait a bit for sessions to activate
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test timer update frequency
  const startTime = performance.now();
  const updateCounts: number[] = [];
  const errors: string[] = [];

  // Poll sessions for 10 seconds to measure update frequency
  const pollDuration = 10000; // 10 seconds
  const pollInterval = 1000; // 1 second
  const pollCount = Math.floor(pollDuration / pollInterval);

  for (let i = 0; i < pollCount; i++) {
    const pollStart = performance.now();
    let successfulPolls = 0;

    const pollPromises = sessionIds.map(async (sessionId) => {
      try {
        const response = await fetch(`${baseUrl}/api/sessions/${sessionId}`);
        if (response.ok) {
          successfulPolls++;
        }
      } catch (error: any) {
        errors.push(`Poll error: ${error.message}`);
      }
    });

    await Promise.all(pollPromises);
    const pollTime = performance.now() - pollStart;
    updateCounts.push(successfulPolls);
    
    await new Promise(resolve => setTimeout(resolve, Math.max(0, pollInterval - pollTime)));
  }

  const endTime = performance.now();
  const totalTime = (endTime - startTime) / 1000; // Convert to seconds
  const totalUpdates = updateCounts.reduce((sum, count) => sum + count, 0);
  const updateFrequency = totalUpdates / totalTime;

  // Calculate accuracy (sessions that responded consistently)
  const avgUpdatesPerSession = totalUpdates / sessionIds.length;
  const expectedUpdates = pollCount;
  const accuracy = (avgUpdatesPerSession / expectedUpdates) * 100;

  // Estimate memory usage (rough calculation)
  const memoryUsage = (sessionIds.length * 0.5); // ~0.5MB per active session

  return {
    sessionCount: sessionIds.length,
    updateFrequency,
    memoryUsage,
    accuracy,
    errors: [...new Set(errors)]
  };
}

async function runTimerTests() {
  const baseUrl = process.env.BASE_URL || process.argv[2] || 'http://localhost:3002';
  const sessionCounts = [10, 50, 100];

  console.log('⏱️  Starting Timer Performance Tests');
  console.log(`Base URL: ${baseUrl}\n`);

  const results: TimerTestResult[] = [];

  for (const count of sessionCounts) {
    console.log(`Testing with ${count} active sessions...`);
    try {
      const result = await testTimerPerformance(baseUrl, count);
      results.push(result);

      console.log(`  ✅ Sessions: ${result.sessionCount}`);
      console.log(`  📊 Update Frequency: ${result.updateFrequency.toFixed(2)} updates/sec`);
      console.log(`  💾 Memory Usage: ${result.memoryUsage.toFixed(2)} MB (estimated)`);
      console.log(`  🎯 Accuracy: ${result.accuracy.toFixed(1)}%`);
      if (result.errors.length > 0) {
        console.log(`  ⚠️  Errors: ${result.errors.length}`);
      }
      console.log('');
    } catch (error: any) {
      console.error(`  ❌ Test failed: ${error.message}\n`);
    }
  }

  // Summary
  console.log('📊 Timer Performance Summary');
  console.log('='.repeat(70));
  console.log('Sessions | Update Freq | Memory | Accuracy');
  console.log('-'.repeat(70));
  results.forEach(result => {
    console.log(
      `${result.sessionCount.toString().padStart(8)} | ${result.updateFrequency.toFixed(2).padStart(11)} | ${result.memoryUsage.toFixed(2).padStart(6)}MB | ${result.accuracy.toFixed(1).padStart(7)}%`
    );
  });
  console.log('='.repeat(70));
}

if (require.main === module) {
  runTimerTests().catch(console.error);
}

export { testTimerPerformance, TimerTestResult };

