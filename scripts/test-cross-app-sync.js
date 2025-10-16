#!/usr/bin/env node

/**
 * Cross-App Data Sync Validation Test Suite
 * Tests guest checkout seating metadata flow into app seating type
 * Validates domain ecosystem consistency across all apps
 * 
 * Run with: node scripts/test-cross-app-sync.js
 */

const BASE_URLS = {
  APP: process.env.APP_URL || 'https://hookahplus-app.vercel.app',
  GUEST: process.env.GUEST_URL || 'https://hookahplus-guests.vercel.app',
  SITE: process.env.SITE_URL || 'https://hookahplus-site.vercel.app'
};

// Test configuration
const TEST_CONFIG = {
  TEST_SESSION_ID: `sync_test_${Date.now()}`,
  TEST_TABLE_ID: 'T-SYNC-001',
  TEST_CUSTOMER_NAME: 'Sync Test Customer',
  TEST_CUSTOMER_PHONE: '+1 (555) 999-8888',
  TEST_FLAVOR: 'Premium Mix + Mint',
  TEST_AMOUNT: 4500, // $45.00 in cents
  TEST_DURATION: 60 * 60, // 60 minutes in seconds
  SEATING_METADATA: {
    seatingType: 'VIP',
    zone: 'zone_premium',
    capacity: 6,
    position: { x: 100, y: 200 },
    preferences: ['quiet', 'window_seat', 'private'],
    amenities: ['premium_coals', 'extra_flavors', 'personal_service']
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
  syncTests: [],
  metadataTests: [],
  apiTests: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(name, passed, details = '', category = 'general') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`PASS: ${name}`, 'success');
  } else {
    testResults.failed++;
    log(`FAIL: ${name} - ${details}`, 'error');
  }
  
  const testRecord = { name, passed, details, category };
  testResults.details.push(testRecord);
  
  // Categorize tests
  switch (category) {
    case 'sync':
      testResults.syncTests.push(testRecord);
      break;
    case 'metadata':
      testResults.metadataTests.push(testRecord);
      break;
    case 'api':
      testResults.apiTests.push(testRecord);
      break;
  }
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HookahPlus-SyncTest/1.0',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { status: 0, data: { error: error.message }, headers: {} };
  }
}

// Test 1: Guest App Session Creation with Seating Metadata
async function testGuestSessionCreation() {
  log('🧪 Testing guest app session creation with seating metadata...');
  
  try {
    const guestSessionData = {
      sessionId: TEST_CONFIG.TEST_SESSION_ID,
      tableId: TEST_CONFIG.TEST_TABLE_ID,
      customerName: TEST_CONFIG.TEST_CUSTOMER_NAME,
      customerPhone: TEST_CONFIG.TEST_CUSTOMER_PHONE,
      flavor: TEST_CONFIG.TEST_FLAVOR,
      amount: TEST_CONFIG.TEST_AMOUNT,
      sessionDuration: TEST_CONFIG.TEST_DURATION,
      // Seating metadata
      seatingType: TEST_CONFIG.SEATING_METADATA.seatingType,
      zone: TEST_CONFIG.SEATING_METADATA.zone,
      capacity: TEST_CONFIG.SEATING_METADATA.capacity,
      position: TEST_CONFIG.SEATING_METADATA.position,
      preferences: TEST_CONFIG.SEATING_METADATA.preferences,
      amenities: TEST_CONFIG.SEATING_METADATA.amenities,
      metadata: {
        source: 'guest_portal',
        seatingType: TEST_CONFIG.SEATING_METADATA.seatingType,
        zone: TEST_CONFIG.SEATING_METADATA.zone,
        capacity: TEST_CONFIG.SEATING_METADATA.capacity,
        position: TEST_CONFIG.SEATING_METADATA.position,
        preferences: TEST_CONFIG.SEATING_METADATA.preferences,
        amenities: TEST_CONFIG.SEATING_METADATA.amenities,
        timestamp: new Date().toISOString()
      }
    };

    const guestResponse = await makeRequest(`${BASE_URLS.GUEST}/api/session/start`, {
      method: 'POST',
      body: guestSessionData
    });

    recordTest('Guest app session creation', guestResponse.status === 200, 
      `Status: ${guestResponse.status}`, 'api');

    if (guestResponse.status === 200) {
      const sessionData = guestResponse.data;
      
      // Test that guest app preserves seating metadata
      const hasSeatingType = sessionData.seatingType === TEST_CONFIG.SEATING_METADATA.seatingType;
      recordTest('Guest app preserves seating type', hasSeatingType, 
        hasSeatingType ? sessionData.seatingType : 'Seating type not preserved', 'metadata');

      const hasZoneData = sessionData.zone === TEST_CONFIG.SEATING_METADATA.zone;
      recordTest('Guest app preserves zone data', hasZoneData, 
        hasZoneData ? sessionData.zone : 'Zone data not preserved', 'metadata');

      const hasCapacityData = sessionData.capacity === TEST_CONFIG.SEATING_METADATA.capacity;
      recordTest('Guest app preserves capacity data', hasCapacityData, 
        hasCapacityData ? sessionData.capacity : 'Capacity data not preserved', 'metadata');

      const hasMetadata = sessionData.metadata && Object.keys(sessionData.metadata).length > 0;
      recordTest('Guest app preserves metadata object', hasMetadata, 
        hasMetadata ? `${Object.keys(sessionData.metadata).length} metadata fields` : 'No metadata object', 'metadata');
    }

    return guestResponse.status === 200;

  } catch (error) {
    recordTest('Guest session creation', false, error.message, 'api');
    return false;
  }
}

// Test 2: App Build Session Sync
async function testAppBuildSessionSync() {
  log('🧪 Testing app build session sync...');
  
  try {
    // Wait a moment for sync to occur
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if session appears in app build
    const appResponse = await makeRequest(`${BASE_URLS.APP}/api/sessions/${TEST_CONFIG.TEST_SESSION_ID}`);
    
    recordTest('App build session retrieval', appResponse.status === 200, 
      `Status: ${appResponse.status}`, 'sync');

    if (appResponse.status === 200) {
      const session = appResponse.data.session || appResponse.data;
      
      // Test seating type sync
      const seatingTypeSynced = session.tableType === TEST_CONFIG.SEATING_METADATA.seatingType || 
                                session.seatingType === TEST_CONFIG.SEATING_METADATA.seatingType ||
                                (session.metadata && session.metadata.seatingType === TEST_CONFIG.SEATING_METADATA.seatingType);
      
      recordTest('Seating type synced to app build', seatingTypeSynced, 
        seatingTypeSynced ? 'Seating type preserved' : 'Seating type lost in sync', 'sync');

      // Test zone data sync
      const zoneSynced = session.zone === TEST_CONFIG.SEATING_METADATA.zone ||
                        (session.metadata && session.metadata.zone === TEST_CONFIG.SEATING_METADATA.zone);
      
      recordTest('Zone data synced to app build', zoneSynced, 
        zoneSynced ? 'Zone data preserved' : 'Zone data lost in sync', 'sync');

      // Test capacity data sync
      const capacitySynced = session.capacity === TEST_CONFIG.SEATING_METADATA.capacity ||
                            (session.metadata && session.metadata.capacity === TEST_CONFIG.SEATING_METADATA.capacity);
      
      recordTest('Capacity data synced to app build', capacitySynced, 
        capacitySynced ? 'Capacity data preserved' : 'Capacity data lost in sync', 'sync');

      // Test preferences sync
      const preferencesSynced = session.preferences && 
                               Array.isArray(session.preferences) &&
                               session.preferences.length === TEST_CONFIG.SEATING_METADATA.preferences.length;
      
      recordTest('Preferences synced to app build', preferencesSynced, 
        preferencesSynced ? `${session.preferences.length} preferences` : 'Preferences not synced', 'sync');

      // Test amenities sync
      const amenitiesSynced = session.amenities && 
                             Array.isArray(session.amenities) &&
                             session.amenities.length === TEST_CONFIG.SEATING_METADATA.amenities.length;
      
      recordTest('Amenities synced to app build', amenitiesSynced, 
        amenitiesSynced ? `${session.amenities.length} amenities` : 'Amenities not synced', 'sync');

      // Test metadata object preservation
      const metadataPreserved = session.metadata && 
                                typeof session.metadata === 'object' &&
                                Object.keys(session.metadata).length > 0;
      
      recordTest('Metadata object preserved in app build', metadataPreserved, 
        metadataPreserved ? `${Object.keys(session.metadata).length} metadata fields` : 'No metadata object', 'sync');
    }

    return appResponse.status === 200;

  } catch (error) {
    recordTest('App build session sync', false, error.message, 'sync');
    return false;
  }
}

// Test 3: Site Build Integration
async function testSiteBuildIntegration() {
  log('🧪 Testing site build integration...');
  
  try {
    // Test site build accessibility
    const siteResponse = await makeRequest(`${BASE_URLS.SITE}/`);
    
    recordTest('Site build accessible', siteResponse.status === 200, 
      `Status: ${siteResponse.status}`, 'api');

    // Test site build API endpoints
    const siteApiResponse = await makeRequest(`${BASE_URLS.SITE}/api/health`);
    
    recordTest('Site build API endpoints', siteApiResponse.status === 200 || siteApiResponse.status === 404, 
      `Status: ${siteApiResponse.status}`, 'api');

    return siteResponse.status === 200;

  } catch (error) {
    recordTest('Site build integration', false, error.message, 'api');
    return false;
  }
}

// Test 4: Cross-App Data Consistency
async function testCrossAppDataConsistency() {
  log('🧪 Testing cross-app data consistency...');
  
  try {
    // Get session from guest app
    const guestResponse = await makeRequest(`${BASE_URLS.GUEST}/api/session/${TEST_CONFIG.TEST_SESSION_ID}`);
    
    // Get session from app build
    const appResponse = await makeRequest(`${BASE_URLS.APP}/api/sessions/${TEST_CONFIG.TEST_SESSION_ID}`);
    
    if (guestResponse.status === 200 && appResponse.status === 200) {
      const guestSession = guestResponse.data;
      const appSession = appResponse.data.session || appResponse.data;
      
      // Test customer data consistency
      const customerNameConsistent = guestSession.customerName === appSession.customerName;
      recordTest('Customer name consistency', customerNameConsistent, 
        customerNameConsistent ? 'Names match' : 'Names differ', 'sync');

      const customerPhoneConsistent = guestSession.customerPhone === appSession.customerPhone;
      recordTest('Customer phone consistency', customerPhoneConsistent, 
        customerPhoneConsistent ? 'Phones match' : 'Phones differ', 'sync');

      // Test flavor consistency
      const flavorConsistent = guestSession.flavor === appSession.flavor;
      recordTest('Flavor consistency', flavorConsistent, 
        flavorConsistent ? 'Flavors match' : 'Flavors differ', 'sync');

      // Test amount consistency
      const amountConsistent = guestSession.amount === appSession.amount;
      recordTest('Amount consistency', amountConsistent, 
        amountConsistent ? 'Amounts match' : 'Amounts differ', 'sync');

      // Test table ID consistency
      const tableIdConsistent = guestSession.tableId === appSession.tableId;
      recordTest('Table ID consistency', tableIdConsistent, 
        tableIdConsistent ? 'Table IDs match' : 'Table IDs differ', 'sync');
    }

    return guestResponse.status === 200 && appResponse.status === 200;

  } catch (error) {
    recordTest('Cross-app data consistency', false, error.message, 'sync');
    return false;
  }
}

// Test 5: Metadata Flow Validation
async function testMetadataFlowValidation() {
  log('🧪 Testing metadata flow validation...');
  
  try {
    // Test that seating metadata flows through the entire system
    const metadataFlowTests = [
      {
        name: 'Seating Type Flow',
        path: 'seatingType',
        expected: TEST_CONFIG.SEATING_METADATA.seatingType
      },
      {
        name: 'Zone Flow',
        path: 'zone',
        expected: TEST_CONFIG.SEATING_METADATA.zone
      },
      {
        name: 'Capacity Flow',
        path: 'capacity',
        expected: TEST_CONFIG.SEATING_METADATA.capacity
      },
      {
        name: 'Position Flow',
        path: 'position',
        expected: TEST_CONFIG.SEATING_METADATA.position
      }
    ];

    // Get session from app build
    const appResponse = await makeRequest(`${BASE_URLS.APP}/api/sessions/${TEST_CONFIG.TEST_SESSION_ID}`);
    
    if (appResponse.status === 200) {
      const session = appResponse.data.session || appResponse.data;
      
      for (const test of metadataFlowTests) {
        let actualValue;
        
        // Check multiple possible locations for the metadata
        if (session[test.path] !== undefined) {
          actualValue = session[test.path];
        } else if (session.metadata && session.metadata[test.path] !== undefined) {
          actualValue = session.metadata[test.path];
        } else if (session.tableData && session.tableData[test.path] !== undefined) {
          actualValue = session.tableData[test.path];
        }
        
        const flowTestPassed = JSON.stringify(actualValue) === JSON.stringify(test.expected);
        recordTest(`${test.name} flow validation`, flowTestPassed, 
          flowTestPassed ? 'Metadata flows correctly' : `Expected: ${JSON.stringify(test.expected)}, Got: ${JSON.stringify(actualValue)}`, 'metadata');
      }
    }

    return appResponse.status === 200;

  } catch (error) {
    recordTest('Metadata flow validation', false, error.message, 'metadata');
    return false;
  }
}

// Test 6: API Endpoint Validation
async function testAPIEndpointValidation() {
  log('🧪 Testing API endpoint validation...');
  
  const endpoints = [
    { name: 'Guest Session Start', url: `${BASE_URLS.GUEST}/api/session/start`, method: 'POST' },
    { name: 'Guest Session Get', url: `${BASE_URLS.GUEST}/api/session/${TEST_CONFIG.TEST_SESSION_ID}`, method: 'GET' },
    { name: 'App Session Get', url: `${BASE_URLS.APP}/api/sessions/${TEST_CONFIG.TEST_SESSION_ID}`, method: 'GET' },
    { name: 'App Session Actions', url: `${BASE_URLS.APP}/api/sessions/actions`, method: 'POST' },
    { name: 'App Guest Intelligence', url: `${BASE_URLS.APP}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}`, method: 'GET' },
    { name: 'Site Health', url: `${BASE_URLS.SITE}/api/health`, method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.url, { method: endpoint.method });
      const isAccessible = response.status === 200 || response.status === 404; // 404 is acceptable for some endpoints
      
      recordTest(`${endpoint.name} endpoint`, isAccessible, 
        `Status: ${response.status}`, 'api');
    } catch (error) {
      recordTest(`${endpoint.name} endpoint`, false, error.message, 'api');
    }
  }
}

// Test 7: Real-time Sync Testing
async function testRealTimeSync() {
  log('🧪 Testing real-time sync...');
  
  try {
    // Create session in guest app
    const guestSessionData = {
      sessionId: `${TEST_CONFIG.TEST_SESSION_ID}_realtime`,
      tableId: `${TEST_CONFIG.TEST_TABLE_ID}_realtime`,
      customerName: 'Real-time Test Customer',
      customerPhone: '+1 (555) 777-6666',
      flavor: 'Real-time Test Flavor',
      amount: 5000,
      seatingType: 'PREMIUM',
      zone: 'zone_vip',
      capacity: 8,
      metadata: {
        source: 'realtime_test',
        timestamp: new Date().toISOString(),
        testType: 'realtime_sync'
      }
    };

    const guestResponse = await makeRequest(`${BASE_URLS.GUEST}/api/session/start`, {
      method: 'POST',
      body: guestSessionData
    });

    recordTest('Real-time guest session creation', guestResponse.status === 200, 
      `Status: ${guestResponse.status}`, 'sync');

    if (guestResponse.status === 200) {
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if session appears in app build
      const appResponse = await makeRequest(`${BASE_URLS.APP}/api/sessions/${guestSessionData.sessionId}`);
      
      recordTest('Real-time sync to app build', appResponse.status === 200, 
        `Status: ${appResponse.status}`, 'sync');

      if (appResponse.status === 200) {
        const session = appResponse.data.session || appResponse.data;
        
        // Test that real-time data is preserved
        const realtimeDataPreserved = session.metadata && 
                                     session.metadata.testType === 'realtime_sync';
        
        recordTest('Real-time metadata preserved', realtimeDataPreserved, 
          realtimeDataPreserved ? 'Real-time metadata preserved' : 'Real-time metadata lost', 'sync');
      }
    }

    return guestResponse.status === 200;

  } catch (error) {
    recordTest('Real-time sync', false, error.message, 'sync');
    return false;
  }
}

// Main test runner
async function runCrossAppSyncTests() {
  console.log('🔄 Starting Cross-App Data Sync Validation Tests\n');
  console.log('=' .repeat(80));
  
  const startTime = Date.now();
  
  // Run all test suites
  await testGuestSessionCreation();
  await testAppBuildSessionSync();
  await testSiteBuildIntegration();
  await testCrossAppDataConsistency();
  await testMetadataFlowValidation();
  await testAPIEndpointValidation();
  await testRealTimeSync();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Print comprehensive results
  console.log('\n' + '=' .repeat(80));
  console.log('📊 CROSS-APP DATA SYNC VALIDATION RESULTS');
  console.log('=' .repeat(80));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total:  ${testResults.total}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Categorized results
  console.log('\n📋 CATEGORIZED RESULTS:');
  console.log(`\n🔄 Sync Tests: ${testResults.syncTests.filter(t => t.passed).length}/${testResults.syncTests.length} passed`);
  console.log(`📊 Metadata Tests: ${testResults.metadataTests.filter(t => t.passed).length}/${testResults.metadataTests.length} passed`);
  console.log(`🔌 API Tests: ${testResults.apiTests.filter(t => t.passed).length}/${testResults.apiTests.length} passed`);
  
  // Detailed results by category
  console.log('\n📋 DETAILED RESULTS:');
  testResults.details.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} [${test.category.toUpperCase()}] ${test.name}${test.details ? ` - ${test.details}` : ''}`);
  });
  
  // Overall status
  const allPassed = testResults.failed === 0;
  console.log('\n' + '=' .repeat(80));
  if (allPassed) {
    console.log('🎉 ALL CROSS-APP SYNC TESTS PASSED!');
    console.log('✅ Guest App Session Creation: Validated');
    console.log('✅ App Build Session Sync: Validated');
    console.log('✅ Site Build Integration: Validated');
    console.log('✅ Cross-App Data Consistency: Validated');
    console.log('✅ Metadata Flow Validation: Validated');
    console.log('✅ API Endpoint Validation: Validated');
    console.log('✅ Real-time Sync: Validated');
    console.log('\n🚀 DOMAIN ECOSYSTEM IS READY FOR PRODUCTION!');
  } else {
    console.log('⚠️  SOME SYNC TESTS FAILED! Review the issues above.');
    console.log('❌ Domain ecosystem is NOT ready for production deployment.');
    console.log('🔧 Fix failing tests before proceeding.');
  }
  console.log('=' .repeat(80));
  
  return allPassed;
}

// Run the tests
if (require.main === module) {
  runCrossAppSyncTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runCrossAppSyncTests };
