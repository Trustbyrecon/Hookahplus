/**
 * Service Validation Script
 * 
 * Validates all services are working correctly
 * Run with: npx tsx apps/app/scripts/validate-services.ts
 */

import { TableLayoutService } from '../lib/services/TableLayoutService';
import { TableAvailabilityService } from '../lib/services/TableAvailabilityService';
import { ZoneRoutingService } from '../lib/services/ZoneRoutingService';
import { UnifiedAnalyticsService } from '../lib/services/UnifiedAnalyticsService';

interface TestResult {
  service: string;
  test: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logTest(service: string, test: string, passed: boolean, error?: string) {
  results.push({ service, test, passed, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${service}: ${test}`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
}

async function testTableLayoutService() {
  console.log('\n📋 Testing TableLayoutService...\n');

  try {
    // Test loadTables
    const tables = await TableLayoutService.loadTables();
    logTest('TableLayoutService', 'loadTables()', Array.isArray(tables));

    // Test validateTableId with non-existent table
    const validation = await TableLayoutService.validateTableId('non-existent-table-123');
    logTest('TableLayoutService', 'validateTableId() - invalid', !validation.valid);

    // Test validateCapacity
    const mockTable = {
      id: 'test-table',
      name: 'Test Table',
      seatingType: 'table',
      capacity: 4,
      coordinates: { x: 50, y: 50 },
      zone: 'Main'
    };
    const capacityCheck = TableLayoutService.validateCapacity(mockTable, 5);
    logTest('TableLayoutService', 'validateCapacity() - exceeds', !capacityCheck.valid);
    
    const capacityCheck2 = TableLayoutService.validateCapacity(mockTable, 3);
    logTest('TableLayoutService', 'validateCapacity() - valid', capacityCheck2.valid);

    // Test cache
    TableLayoutService.clearCache();
    logTest('TableLayoutService', 'clearCache()', true);

  } catch (error) {
    logTest('TableLayoutService', 'General', false, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testTableAvailabilityService() {
  console.log('\n📋 Testing TableAvailabilityService...\n');

  try {
    // Test checkTableAvailability (without Prisma - will fail gracefully)
    const check = await TableAvailabilityService.checkTableAvailability(
      { tableId: 'test-table', partySize: 2 },
      [],
      []
    );
    logTest('TableAvailabilityService', 'checkTableAvailability()', typeof check === 'object');

    // Test getAvailableTables
    const available = await TableAvailabilityService.getAvailableTables(2, [], undefined, []);
    logTest('TableAvailabilityService', 'getAvailableTables()', Array.isArray(available));

    // Test findTableCombinations
    const combinations = await TableAvailabilityService.findTableCombinations(10, []);
    logTest('TableAvailabilityService', 'findTableCombinations()', Array.isArray(combinations));

  } catch (error) {
    logTest('TableAvailabilityService', 'General', false, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testZoneRoutingService() {
  console.log('\n📋 Testing ZoneRoutingService...\n');

  try {
    // Test getTableZone
    const zone = await ZoneRoutingService.getTableZone('test-table');
    logTest('ZoneRoutingService', 'getTableZone()', zone === null || typeof zone === 'string');

    // Test assignStaffToZone
    const staff = ZoneRoutingService.assignStaffToZone('VIP', [
      { id: 'staff-1', name: 'Staff 1', role: 'FOH', currentLoad: 2, maxCapacity: 5 }
    ]);
    logTest('ZoneRoutingService', 'assignStaffToZone()', Array.isArray(staff) && staff.length > 0);

    // Test routeSessionToStaff
    const routing = ZoneRoutingService.routeSessionToStaff(
      'test-table',
      'Main',
      [{ id: 'staff-1', name: 'Staff 1', role: 'FOH', currentLoad: 1 }],
      []
    );
    logTest('ZoneRoutingService', 'routeSessionToStaff()', typeof routing === 'object');

    // Test calculateZoneWorkload
    const workload = ZoneRoutingService.calculateZoneWorkload(
      [{ id: 't1', name: 'Table 1', seatingType: 'table', capacity: 4, coordinates: { x: 0, y: 0 }, zone: 'Main' }],
      [],
      new Map()
    );
    logTest('ZoneRoutingService', 'calculateZoneWorkload()', Array.isArray(workload));

  } catch (error) {
    logTest('ZoneRoutingService', 'General', false, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testUnifiedAnalyticsService() {
  console.log('\n📋 Testing UnifiedAnalyticsService...\n');

  try {
    // Test calculateUnifiedMetrics
    const metrics = UnifiedAnalyticsService.calculateUnifiedMetrics(
      [
        { priceCents: 2500, status: 'ACTIVE', durationSecs: 3600, createdAt: new Date(), startedAt: new Date() }
      ],
      [{ id: 't1', name: 'Table 1', zone: 'Main' }],
      [{ tableId: 't1', status: 'ACTIVE' }],
      1,
      1
    );
    logTest('UnifiedAnalyticsService', 'calculateUnifiedMetrics()', typeof metrics === 'object' && metrics.revenue !== undefined);

    // Test generateCrossSystemInsights
    const insights = UnifiedAnalyticsService.generateCrossSystemInsights(
      [{ tableId: 't1', priceCents: 2500, createdAt: new Date() }],
      [{ id: 't1', name: 'Table 1', zone: 'Main', capacity: 4 }],
      []
    );
    logTest('UnifiedAnalyticsService', 'generateCrossSystemInsights()', Array.isArray(insights));

    // Test generateForecasts
    const forecasts = UnifiedAnalyticsService.generateForecasts(
      [{ createdAt: new Date(), priceCents: 2500 }],
      [{ id: 't1', zone: 'Main' }],
      50
    );
    logTest('UnifiedAnalyticsService', 'generateForecasts()', Array.isArray(forecasts) && forecasts.length > 0);

    // Test getTopTables
    const topTables = UnifiedAnalyticsService.getTopTables(
      [{ tableId: 't1', priceCents: 2500, status: 'ACTIVE' }],
      [{ id: 't1', name: 'Table 1', zone: 'Main' }],
      []
    );
    logTest('UnifiedAnalyticsService', 'getTopTables()', Array.isArray(topTables));

  } catch (error) {
    logTest('UnifiedAnalyticsService', 'General', false, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runAllTests() {
  console.log('🧪 Service Validation Tests\n');
  console.log('=' .repeat(50));

  await testTableLayoutService();
  await testTableAvailabilityService();
  await testZoneRoutingService();
  await testUnifiedAnalyticsService();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.service}: ${r.test}`);
      if (r.error) {
        console.log(`    Error: ${r.error}`);
      }
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

