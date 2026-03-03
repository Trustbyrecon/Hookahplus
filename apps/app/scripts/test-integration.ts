/**
 * Integration Testing Script
 * 
 * Tests service + API combinations and data flow
 * Run with: npx tsx apps/app/scripts/test-integration.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

interface IntegrationTest {
  name: string;
  description: string;
  test: () => Promise<{ passed: boolean; error?: string; details?: any }>;
}

const tests: IntegrationTest[] = [
  {
    name: 'Table Layout → Session Creation Flow',
    description: 'Test that table validation works in session creation flow',
    test: async () => {
      try {
        // 1. Get layout
        const layoutRes = await fetch(`${BASE_URL}/api/lounges?layout=true`);
        if (!layoutRes.ok) {
          return { passed: false, error: 'Failed to get layout' };
        }
        const layoutData = await layoutRes.json();
        
        // 2. Validate a table from layout
        if (layoutData.layout?.tables?.length > 0) {
          const tableId = layoutData.layout.tables[0].id;
          const validateRes = await fetch(`${BASE_URL}/api/lounges/tables/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableId, checkAvailability: true })
          });
          
          if (!validateRes.ok) {
            return { passed: false, error: 'Validation failed' };
          }
          
          const validateData = await validateRes.json();
          return {
            passed: validateData.valid === true,
            details: { tableId, valid: validateData.valid }
          };
        }
        
        return { passed: true, details: { message: 'No tables in layout to test' } };
      } catch (error) {
        return { passed: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  },
  {
    name: 'Availability → Zone Routing Flow',
    description: 'Test that availability check feeds into zone routing',
    test: async () => {
      try {
        // 1. Get available tables
        const availabilityRes = await fetch(`${BASE_URL}/api/lounges/tables/availability?partySize=2`);
        if (!availabilityRes.ok) {
          return { passed: false, error: 'Failed to get availability' };
        }
        const availabilityData = await availabilityRes.json();
        
        // 2. Get zone routing for available tables
        if (availabilityData.availableTables?.length > 0) {
          const tableId = availabilityData.availableTables[0].tableId;
          const routingRes = await fetch(`${BASE_URL}/api/staff/zones/route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableId })
          });
          
          if (!routingRes.ok) {
            return { passed: false, error: 'Routing failed' };
          }
          
          const routingData = await routingRes.json();
          return {
            passed: routingData.success === true && routingData.routing !== undefined,
            details: { tableId, routing: routingData.routing }
          };
        }
        
        return { passed: true, details: { message: 'No available tables to test' } };
      } catch (error) {
        return { passed: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  },
  {
    name: 'Analytics → Unified Dashboard Flow',
    description: 'Test that lounge analytics feeds into unified dashboard',
    test: async () => {
      try {
        // 1. Get lounge analytics
        const analyticsRes = await fetch(`${BASE_URL}/api/lounges/analytics?timeRange=7d`);
        if (!analyticsRes.ok) {
          return { passed: false, error: 'Failed to get analytics' };
        }
        const analyticsData = await analyticsRes.json();
        
        // 2. Get unified analytics
        const unifiedRes = await fetch(`${BASE_URL}/api/analytics/unified?timeRange=7d`);
        if (!unifiedRes.ok) {
          return { passed: false, error: 'Failed to get unified analytics' };
        }
        const unifiedData = await unifiedRes.json();
        
        // 3. Verify data consistency
        const hasMetrics = unifiedData.metrics !== undefined;
        const hasInsights = Array.isArray(unifiedData.insights);
        const hasForecasts = Array.isArray(unifiedData.forecasts);
        
        return {
          passed: hasMetrics && hasInsights && hasForecasts,
          details: {
            hasMetrics,
            hasInsights,
            hasForecasts,
            analyticsTables: analyticsData.tables?.length || 0,
            unifiedMetrics: Object.keys(unifiedData.metrics || {}).length
          }
        };
      } catch (error) {
        return { passed: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  },
  {
    name: 'Zone Workload → Staff Assignment Flow',
    description: 'Test that zone workload calculation feeds into staff assignment',
    test: async () => {
      try {
        // 1. Get zone workloads
        const zonesRes = await fetch(`${BASE_URL}/api/staff/zones`);
        if (!zonesRes.ok) {
          return { passed: false, error: 'Failed to get zones' };
        }
        const zonesData = await zonesRes.json();
        
        // 2. Verify workload data structure
        const hasWorkloads = Array.isArray(zonesData.zones);
        const hasMetrics = Array.isArray(zonesData.metrics);
        const hasAssignments = Array.isArray(zonesData.staffAssignments);
        
        // 3. Check if workloads have staff assignment data
        const workloadsHaveStaff = zonesData.zones?.every((zone: any) => 
          typeof zone.availableStaff === 'number'
        ) || false;
        
        return {
          passed: hasWorkloads && hasMetrics && hasAssignments && workloadsHaveStaff,
          details: {
            hasWorkloads,
            hasMetrics,
            hasAssignments,
            workloadsHaveStaff,
            zoneCount: zonesData.zones?.length || 0
          }
        };
      } catch (error) {
        return { passed: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  },
  {
    name: 'Table Validation → Availability → Routing Chain',
    description: 'Test complete chain from validation to routing',
    test: async () => {
      try {
        // 1. Get layout
        const layoutRes = await fetch(`${BASE_URL}/api/lounges?layout=true`);
        if (!layoutRes.ok) {
          return { passed: false, error: 'Failed to get layout' };
        }
        const layoutData = await layoutRes.json();
        
        if (!layoutData.layout?.tables?.length) {
          return { passed: true, details: { message: 'No tables to test chain' } };
        }
        
        const tableId = layoutData.layout.tables[0].id;
        
        // 2. Validate table
        const validateRes = await fetch(`${BASE_URL}/api/lounges/tables/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId })
        });
        const validateData = await validateRes.json();
        
        if (!validateData.valid) {
          return { passed: false, error: 'Table validation failed' };
        }
        
        // 3. Check availability
        const availabilityRes = await fetch(`${BASE_URL}/api/lounges/tables/availability?tableId=${tableId}&partySize=2`);
        const availabilityData = await availabilityRes.json();
        
        // 4. Get routing
        const routingRes = await fetch(`${BASE_URL}/api/staff/zones/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId })
        });
        const routingData = await routingRes.json();
        
        return {
          passed: validateData.valid && availabilityData.success && routingData.success,
          details: {
            tableId,
            validated: validateData.valid,
            available: availabilityData.available,
            routing: routingData.routing?.recommendedStaffId || 'none'
          }
        };
      } catch (error) {
        return { passed: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  }
];

async function runIntegrationTests() {
  console.log('🔗 Integration Testing\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(60) + '\n');

  // Check server
  try {
    await fetch(`${BASE_URL}/api/health`).catch(() => {
      throw new Error('Server not accessible');
    });
  } catch {
    console.warn(`⚠️  Warning: Could not reach ${BASE_URL}`);
    console.warn('   Make sure the dev server is running: npm run dev');
    console.warn('   Tests may fail without a running server.\n');
  }

  const results: Array<{ name: string; passed: boolean; error?: string; details?: any }> = [];

  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`  ${test.description}`);
    
    const result = await test.test();
    results.push({ name: test.name, ...result });
    
    const icon = result.passed ? '✅' : '❌';
    console.log(`  ${icon} ${result.passed ? 'PASSED' : 'FAILED'}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
    if (result.details) {
      console.log(`    Details:`, JSON.stringify(result.details, null, 2));
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('\n📊 Integration Test Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Integration Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}`);
      if (r.error) console.log(`    Error: ${r.error}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runIntegrationTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

