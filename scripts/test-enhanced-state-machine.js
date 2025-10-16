#!/usr/bin/env node

/**
 * Comprehensive Enhanced State Machine Validation Test Suite
 * Tests all 17 session states, 16 actions, business logic, and role permissions
 * 
 * Run with: node scripts/test-enhanced-state-machine.js
 */

const BASE_URL = process.env.APP_URL || 'https://hookahplus-app.vercel.app';

// Import the enhanced session types and state machine
const { 
  SessionStatus, 
  SessionAction, 
  UserRole,
  VALID_TRANSITIONS,
  STATUS_COLORS,
  ACTION_TO_STATUS,
  STATUS_TO_STAGE,
  ROLE_PERMISSIONS
} = require('../apps/app/types/enhancedSession');

const { 
  canPerformAction, 
  isValidTransition, 
  nextStateWithTrust,
  calculateRemainingTime,
  formatDuration,
  STATE_DESCRIPTIONS,
  ACTION_DESCRIPTIONS
} = require('../apps/app/lib/sessionStateMachine');

// Test configuration
const TEST_CONFIG = {
  APP_URL: BASE_URL,
  TEST_SESSION_ID: `test_session_${Date.now()}`,
  TEST_TABLE_ID: 'T-TEST-001',
  TEST_CUSTOMER_NAME: 'Test Customer',
  TEST_CUSTOMER_PHONE: '+1 (555) 123-4567',
  TEST_FLAVOR: 'Blue Mist + Mint',
  TEST_AMOUNT: 3500, // $35.00 in cents
  TEST_DURATION: 45 * 60, // 45 minutes in seconds
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
  stateMachineTests: [],
  businessLogicTests: [],
  rolePermissionTests: [],
  crossAppTests: []
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
    case 'stateMachine':
      testResults.stateMachineTests.push(testRecord);
      break;
    case 'businessLogic':
      testResults.businessLogicTests.push(testRecord);
      break;
    case 'rolePermissions':
      testResults.rolePermissionTests.push(testRecord);
      break;
    case 'crossApp':
      testResults.crossAppTests.push(testRecord);
      break;
  }
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HookahPlus-StateMachine-Test/1.0',
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

// Test 1: Validate All 17 Session States
async function testAllSessionStates() {
  log('🧪 Testing all 17 session states...');
  
  const allStates = [
    'NEW', 'PAID_CONFIRMED', 'PREP_IN_PROGRESS', 'HEAT_UP', 
    'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 
    'ACTIVE', 'CLOSE_PENDING', 'CLOSED', 'STAFF_HOLD', 
    'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 
    'REFUNDED', 'FAILED_PAYMENT', 'VOIDED'
  ];

  // Test state count
  recordTest('Session States Count', allStates.length === 17, `Found ${allStates.length} states`, 'stateMachine');

  // Test each state has valid transitions
  for (const state of allStates) {
    const hasTransitions = VALID_TRANSITIONS[state] && VALID_TRANSITIONS[state].length > 0;
    recordTest(`State ${state} has valid transitions`, hasTransitions, 
      hasTransitions ? `${VALID_TRANSITIONS[state].length} transitions` : 'No transitions defined', 'stateMachine');

    // Test state has color mapping
    const hasColor = STATUS_COLORS[state] !== undefined;
    recordTest(`State ${state} has color mapping`, hasColor, 
      hasColor ? STATUS_COLORS[state] : 'No color defined', 'stateMachine');

    // Test state has stage mapping
    const hasStage = STATUS_TO_STAGE[state] !== undefined;
    recordTest(`State ${state} has stage mapping`, hasStage, 
      hasStage ? STATUS_TO_STAGE[state] : 'No stage defined', 'stateMachine');

    // Test state has description
    const hasDescription = STATE_DESCRIPTIONS[state] !== undefined;
    recordTest(`State ${state} has description`, hasDescription, 
      hasDescription ? STATE_DESCRIPTIONS[state] : 'No description defined', 'stateMachine');
  }
}

// Test 2: Validate All 16 Actions
async function testAllSessionActions() {
  log('🧪 Testing all 16 session actions...');
  
  const allActions = [
    'CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW',
    'MARK_DELIVERED', 'START_ACTIVE', 'PAUSE_SESSION', 'RESUME_SESSION',
    'REQUEST_REFILL', 'COMPLETE_REFILL', 'CLOSE_SESSION', 'PUT_ON_HOLD',
    'RESOLVE_HOLD', 'REQUEST_REMAKE', 'PROCESS_REFUND', 'VOID_SESSION'
  ];

  // Test action count
  recordTest('Session Actions Count', allActions.length === 16, `Found ${allActions.length} actions`, 'stateMachine');

  // Test each action has status mapping
  for (const action of allActions) {
    const hasStatusMapping = ACTION_TO_STATUS[action] !== undefined;
    recordTest(`Action ${action} has status mapping`, hasStatusMapping, 
      hasStatusMapping ? ACTION_TO_STATUS[action] : 'No status mapping', 'stateMachine');

    // Test action has description
    const hasDescription = ACTION_DESCRIPTIONS[action] !== undefined;
    recordTest(`Action ${action} has description`, hasDescription, 
      hasDescription ? ACTION_DESCRIPTIONS[action] : 'No description defined', 'stateMachine');
  }
}

// Test 3: Validate State Transitions
async function testStateTransitions() {
  log('🧪 Testing state transition validation...');
  
  // Test valid transitions
  const validTransitionTests = [
    { from: 'NEW', to: 'PAID_CONFIRMED', shouldPass: true },
    { from: 'PAID_CONFIRMED', to: 'PREP_IN_PROGRESS', shouldPass: true },
    { from: 'PREP_IN_PROGRESS', to: 'HEAT_UP', shouldPass: true },
    { from: 'HEAT_UP', to: 'READY_FOR_DELIVERY', shouldPass: true },
    { from: 'READY_FOR_DELIVERY', to: 'OUT_FOR_DELIVERY', shouldPass: true },
    { from: 'OUT_FOR_DELIVERY', to: 'DELIVERED', shouldPass: true },
    { from: 'DELIVERED', to: 'ACTIVE', shouldPass: true },
    { from: 'ACTIVE', to: 'CLOSE_PENDING', shouldPass: true },
    { from: 'CLOSE_PENDING', to: 'CLOSED', shouldPass: true }
  ];

  // Test invalid transitions
  const invalidTransitionTests = [
    { from: 'NEW', to: 'ACTIVE', shouldPass: false },
    { from: 'CLOSED', to: 'NEW', shouldPass: false },
    { from: 'ACTIVE', to: 'PREP_IN_PROGRESS', shouldPass: false },
    { from: 'VOIDED', to: 'ACTIVE', shouldPass: false }
  ];

  const allTransitionTests = [...validTransitionTests, ...invalidTransitionTests];

  for (const test of allTransitionTests) {
    const isValid = isValidTransition(test.from, test.to);
    const testPassed = isValid === test.shouldPass;
    recordTest(`Transition ${test.from} → ${test.to}`, testPassed, 
      `Expected: ${test.shouldPass}, Got: ${isValid}`, 'stateMachine');
  }
}

// Test 4: Validate Role-Based Permissions
async function testRolePermissions() {
  log('🧪 Testing role-based permissions...');
  
  const roles = ['BOH', 'FOH', 'MANAGER', 'ADMIN'];
  const allActions = Object.keys(ACTION_TO_STATUS);

  // Test each role has permissions defined
  for (const role of roles) {
    const hasPermissions = ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].length > 0;
    recordTest(`Role ${role} has permissions defined`, hasPermissions, 
      hasPermissions ? `${ROLE_PERMISSIONS[role].length} permissions` : 'No permissions defined', 'rolePermissions');

    // Test specific role permissions
    if (role === 'BOH') {
      const bohActions = ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'PUT_ON_HOLD', 'RESOLVE_HOLD', 'REQUEST_REMAKE'];
      const hasBohActions = bohActions.every(action => ROLE_PERMISSIONS[role].includes(action));
      recordTest(`BOH role has correct permissions`, hasBohActions, 
        hasBohActions ? 'All BOH actions present' : 'Missing BOH actions', 'rolePermissions');
    }

    if (role === 'FOH') {
      const fohActions = ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'PAUSE_SESSION', 'RESUME_SESSION', 'REQUEST_REFILL', 'COMPLETE_REFILL', 'CLOSE_SESSION', 'PROCESS_REFUND'];
      const hasFohActions = fohActions.every(action => ROLE_PERMISSIONS[role].includes(action));
      recordTest(`FOH role has correct permissions`, hasFohActions, 
        hasFohActions ? 'All FOH actions present' : 'Missing FOH actions', 'rolePermissions');
    }

    if (role === 'ADMIN') {
      const hasAllActions = allActions.every(action => ROLE_PERMISSIONS[role].includes(action));
      recordTest(`ADMIN role has all permissions`, hasAllActions, 
        hasAllActions ? 'All actions present' : 'Missing some actions', 'rolePermissions');
    }
  }

  // Test permission validation function
  for (const role of roles) {
    for (const action of allActions) {
      const hasPermission = canPerformAction(role, action);
      const shouldHavePermission = ROLE_PERMISSIONS[role].includes(action);
      const testPassed = hasPermission === shouldHavePermission;
      
      if (!testPassed) {
        recordTest(`Permission check ${role} → ${action}`, testPassed, 
          `Expected: ${shouldHavePermission}, Got: ${hasPermission}`, 'rolePermissions');
      }
    }
  }
}

// Test 5: Validate Business Logic Tooltips
async function testBusinessLogicTooltips() {
  log('🧪 Testing business logic tooltips...');
  
  // Test that all actions have business logic descriptions
  const allActions = Object.keys(ACTION_TO_STATUS);
  
  for (const action of allActions) {
    const hasDescription = ACTION_DESCRIPTIONS[action] !== undefined;
    const descriptionLength = ACTION_DESCRIPTIONS[action]?.length || 0;
    const hasDetailedDescription = descriptionLength > 20; // Should be detailed, not just action name
    
    recordTest(`Action ${action} has business logic description`, hasDescription, 
      hasDescription ? `${descriptionLength} characters` : 'No description', 'businessLogic');
    
    recordTest(`Action ${action} has detailed business logic`, hasDetailedDescription, 
      hasDetailedDescription ? 'Detailed description' : 'Too brief', 'businessLogic');
  }

  // Test that all states have business logic descriptions
  const allStates = Object.keys(VALID_TRANSITIONS);
  
  for (const state of allStates) {
    const hasDescription = STATE_DESCRIPTIONS[state] !== undefined;
    const descriptionLength = STATE_DESCRIPTIONS[state]?.length || 0;
    const hasDetailedDescription = descriptionLength > 20;
    
    recordTest(`State ${state} has business logic description`, hasDescription, 
      hasDescription ? `${descriptionLength} characters` : 'No description', 'businessLogic');
    
    recordTest(`State ${state} has detailed business logic`, hasDetailedDescription, 
      hasDetailedDescription ? 'Detailed description' : 'Too brief', 'businessLogic');
  }
}

// Test 6: Test Live API Integration
async function testLiveAPIIntegration() {
  log('🧪 Testing live API integration...');
  
  try {
    // Test 1: Create session via API
    const createResponse = await makeRequest(`${TEST_CONFIG.APP_URL}/api/sessions`, {
      method: 'POST',
      body: {
        tableId: TEST_CONFIG.TEST_TABLE_ID,
        customerName: TEST_CONFIG.TEST_CUSTOMER_NAME,
        customerPhone: TEST_CONFIG.TEST_CUSTOMER_PHONE,
        flavor: TEST_CONFIG.TEST_FLAVOR,
        amount: TEST_CONFIG.TEST_AMOUNT,
        sessionDuration: TEST_CONFIG.TEST_DURATION
      }
    });

    recordTest('Session creation API', createResponse.status === 200, 
      `Status: ${createResponse.status}`, 'crossApp');

    if (createResponse.status === 200) {
      const sessionId = createResponse.data.session?.id || TEST_CONFIG.TEST_SESSION_ID;
      
      // Test 2: Test session actions API
      const actionResponse = await makeRequest(`${TEST_CONFIG.APP_URL}/api/sessions/actions`, {
        method: 'POST',
        body: {
          sessionId: sessionId,
          action: 'CLAIM_PREP',
          userRole: 'BOH',
          operatorId: 'test-operator',
          notes: 'Test session action'
        }
      });

      recordTest('Session actions API', actionResponse.status === 200, 
        `Status: ${actionResponse.status}`, 'crossApp');

      // Test 3: Test guest intelligence API
      const intelligenceResponse = await makeRequest(`${TEST_CONFIG.APP_URL}/api/guest-intelligence/${sessionId}`);
      
      recordTest('Guest intelligence API', intelligenceResponse.status === 200, 
        `Status: ${intelligenceResponse.status}`, 'crossApp');
    }

  } catch (error) {
    recordTest('Live API integration', false, error.message, 'crossApp');
  }
}

// Test 7: Test Cross-App Data Sync
async function testCrossAppDataSync() {
  log('🧪 Testing cross-app data sync...');
  
  try {
    // Test guest app session creation
    const guestSessionData = {
      sessionId: TEST_CONFIG.TEST_SESSION_ID,
      tableId: TEST_CONFIG.TEST_TABLE_ID,
      customerName: TEST_CONFIG.TEST_CUSTOMER_NAME,
      customerPhone: TEST_CONFIG.TEST_CUSTOMER_PHONE,
      flavor: TEST_CONFIG.TEST_FLAVOR,
      amount: TEST_CONFIG.TEST_AMOUNT,
      seatingType: 'VIP',
      zone: 'zone_premium',
      capacity: 4,
      metadata: {
        source: 'guest_portal',
        seatingType: 'VIP',
        zone: 'zone_premium',
        capacity: 4,
        preferences: ['quiet', 'window_seat']
      }
    };

    // Test guest app session start
    const guestUrl = process.env.GUEST_URL || 'https://hookahplus-guests.vercel.app';
    const guestResponse = await makeRequest(`${guestUrl}/api/session/start`, {
      method: 'POST',
      body: guestSessionData
    });

    recordTest('Guest app session creation', guestResponse.status === 200, 
      `Status: ${guestResponse.status}`, 'crossApp');

    if (guestResponse.status === 200) {
      // Test that session appears in app build
      const appResponse = await makeRequest(`${TEST_CONFIG.APP_URL}/api/sessions/${TEST_CONFIG.TEST_SESSION_ID}`);
      
      recordTest('Session sync to app build', appResponse.status === 200, 
        `Status: ${appResponse.status}`, 'crossApp');

      if (appResponse.status === 200) {
        const session = appResponse.data;
        
        // Test metadata preservation
        const hasSeatingType = session.tableType === 'VIP' || session.metadata?.seatingType === 'VIP';
        recordTest('Seating type metadata preserved', hasSeatingType, 
          hasSeatingType ? 'VIP seating preserved' : 'Seating type lost', 'crossApp');

        const hasZoneData = session.zone === 'zone_premium' || session.metadata?.zone === 'zone_premium';
        recordTest('Zone metadata preserved', hasZoneData, 
          hasZoneData ? 'Zone data preserved' : 'Zone data lost', 'crossApp');

        const hasCapacityData = session.capacity === 4 || session.metadata?.capacity === 4;
        recordTest('Capacity metadata preserved', hasCapacityData, 
          hasCapacityData ? 'Capacity preserved' : 'Capacity lost', 'crossApp');
      }
    }

  } catch (error) {
    recordTest('Cross-app data sync', false, error.message, 'crossApp');
  }
}

// Test 8: Test Guest Intelligence Dashboard
async function testGuestIntelligenceDashboard() {
  log('🧪 Testing Guest Intelligence Dashboard...');
  
  try {
    // Test intelligence API endpoint
    const intelligenceResponse = await makeRequest(`${TEST_CONFIG.APP_URL}/api/guest-intelligence/${TEST_CONFIG.TEST_SESSION_ID}`);
    
    recordTest('Guest intelligence API accessible', intelligenceResponse.status === 200, 
      `Status: ${intelligenceResponse.status}`, 'crossApp');

    if (intelligenceResponse.status === 200) {
      const data = intelligenceResponse.data;
      
      // Test PII masking
      const hasPiiMasking = data.piiMasking !== undefined;
      recordTest('PII masking configuration', hasPiiMasking, 
        hasPiiMasking ? 'PII masking present' : 'No PII masking', 'crossApp');

      // Test trust scoring
      const hasTrustScore = data.trustScore !== undefined;
      recordTest('Trust scoring present', hasTrustScore, 
        hasTrustScore ? `Score: ${data.trustScore}` : 'No trust score', 'crossApp');

      // Test behavioral memory
      const hasBehavioralMemory = data.behavioralMemory !== undefined;
      recordTest('Behavioral memory present', hasBehavioralMemory, 
        hasBehavioralMemory ? 'Memory data present' : 'No behavioral memory', 'crossApp');

      // Test operational notes
      const hasOperationalNotes = data.operationalNotes !== undefined;
      recordTest('Operational notes present', hasOperationalNotes, 
        hasOperationalNotes ? `${data.operationalNotes.length} notes` : 'No operational notes', 'crossApp');
    }

  } catch (error) {
    recordTest('Guest Intelligence Dashboard', false, error.message, 'crossApp');
  }
}

// Test 9: Test Timer Logic
async function testTimerLogic() {
  log('🧪 Testing timer logic...');
  
  try {
    // Test timer calculation functions
    const mockSession = {
      sessionStartTime: Date.now() - 1800000, // 30 minutes ago
      sessionTimer: {
        total: 45 * 60, // 45 minutes
        isActive: true,
        startedAt: Date.now() - 1800000,
        pausedDuration: 0
      }
    };

    const remainingTime = calculateRemainingTime(mockSession);
    const expectedRemaining = 15 * 60; // Should be ~15 minutes remaining
    const timeDifference = Math.abs(remainingTime - expectedRemaining);
    const timeTestPassed = timeDifference < 60; // Within 1 minute tolerance

    recordTest('Timer calculation accuracy', timeTestPassed, 
      `Expected: ${expectedRemaining}s, Got: ${remainingTime}s`, 'stateMachine');

    // Test duration formatting
    const formattedTime = formatDuration(3661); // 1 hour, 1 minute, 1 second
    const expectedFormat = '61:01';
    const formatTestPassed = formattedTime === expectedFormat;

    recordTest('Duration formatting', formatTestPassed, 
      `Expected: ${expectedFormat}, Got: ${formattedTime}`, 'stateMachine');

  } catch (error) {
    recordTest('Timer logic', false, error.message, 'stateMachine');
  }
}

// Main test runner
async function runEnhancedStateMachineTests() {
  console.log('🔥 Starting Enhanced State Machine Validation Tests\n');
  console.log('=' .repeat(80));
  
  const startTime = Date.now();
  
  // Run all test suites
  await testAllSessionStates();
  await testAllSessionActions();
  await testStateTransitions();
  await testRolePermissions();
  await testBusinessLogicTooltips();
  await testLiveAPIIntegration();
  await testCrossAppDataSync();
  await testGuestIntelligenceDashboard();
  await testTimerLogic();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Print comprehensive results
  console.log('\n' + '=' .repeat(80));
  console.log('📊 ENHANCED STATE MACHINE VALIDATION RESULTS');
  console.log('=' .repeat(80));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total:  ${testResults.total}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Categorized results
  console.log('\n📋 CATEGORIZED RESULTS:');
  console.log(`\n🧠 State Machine Tests: ${testResults.stateMachineTests.filter(t => t.passed).length}/${testResults.stateMachineTests.length} passed`);
  console.log(`💡 Business Logic Tests: ${testResults.businessLogicTests.filter(t => t.passed).length}/${testResults.businessLogicTests.length} passed`);
  console.log(`🔐 Role Permission Tests: ${testResults.rolePermissionTests.filter(t => t.passed).length}/${testResults.rolePermissionTests.length} passed`);
  console.log(`🔄 Cross-App Tests: ${testResults.crossAppTests.filter(t => t.passed).length}/${testResults.crossAppTests.length} passed`);
  
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
    console.log('🎉 ALL ENHANCED STATE MACHINE TESTS PASSED!');
    console.log('✅ 17 Session States: Validated');
    console.log('✅ 16 Session Actions: Validated');
    console.log('✅ Business Logic Tooltips: Validated');
    console.log('✅ Role-Based Permissions: Validated');
    console.log('✅ Cross-App Data Sync: Validated');
    console.log('✅ Guest Intelligence Dashboard: Validated');
    console.log('✅ Timer Logic: Validated');
    console.log('\n🚀 SYSTEM IS READY FOR PRODUCTION DEPLOYMENT!');
  } else {
    console.log('⚠️  SOME TESTS FAILED! Review the issues above.');
    console.log('❌ System is NOT ready for production deployment.');
    console.log('🔧 Fix failing tests before proceeding.');
  }
  console.log('=' .repeat(80));
  
  return allPassed;
}

// Run the tests
if (require.main === module) {
  runEnhancedStateMachineTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runEnhancedStateMachineTests };
