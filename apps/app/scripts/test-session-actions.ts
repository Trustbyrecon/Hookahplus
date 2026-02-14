/**
 * Comprehensive Testing Script for Session Actions
 * 
 * Tests all session creation, BOH/FOH actions, edge cases, and waitlist functionality
 * 
 * Usage:
 *   npx tsx scripts/test-session-actions.ts
 * 
 * Prerequisites:
 *   - App build running on localhost:3002
 *   - Site build running on localhost:3000 (for Start Demo Session)
 *   - Database connected and accessible
 */

import fetch from 'node-fetch';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
  duration?: number;
}

const results: TestResult[] = [];

// Helper function to make API calls
async function apiCall(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: any,
  origin?: string
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {
  const startTime = Date.now();
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (origin) {
      headers['Origin'] = origin;
    }

    const response = await fetch(`${APP_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw: responseText };
    }

    const duration = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.details || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        data,
      };
    }

    return {
      success: true,
      data,
      duration,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}

// Test 1: Start Demo Session (Site Build → App Build)
async function testStartDemoSession(): Promise<TestResult> {
  console.log('\n🧪 Test 1: Start Demo Session (Site → App)');
  
  const result = await apiCall(
    '/api/sessions',
    'POST',
    {
      tableId: `T-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: 'Demo Customer',
      customerPhone: '+1234567890',
      flavor: 'Demo Flavor Mix',
      amount: 3000,
      source: 'WALK_IN',
      loungeId: 'demo-lounge',
      sessionDuration: 45 * 60,
    },
    SITE_URL
  );

  return {
    name: 'Start Demo Session',
    passed: result.success && result.data?.success === true,
    error: result.error,
    data: result.data,
    duration: result.duration,
  };
}

// Test 2: + New Session (App Build)
async function testNewSession(): Promise<TestResult> {
  console.log('\n🧪 Test 2: + New Session (App Build)');
  
  const result = await apiCall(
    '/api/sessions',
    'POST',
    {
      tableId: `T-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: 'Test Customer',
      customerPhone: '+1987654321',
      flavor: 'Test Flavor',
      amount: 3500,
      source: 'WALK_IN',
      loungeId: 'default-lounge',
      sessionDuration: 60 * 60,
      assignedStaff: {
        boh: 'boh-staff-1',
        foh: 'foh-staff-1',
      },
    }
  );

  return {
    name: '+ New Session',
    passed: result.success && result.data?.success === true,
    error: result.error,
    data: result.data,
    duration: result.duration,
  };
}

// Test 3: Get Sessions (to find session for action tests)
async function getTestSession(): Promise<string | null> {
  const result = await apiCall('/api/sessions');
  if (result.success && result.data?.sessions?.length > 0) {
    return result.data.sessions[0].id;
  }
  return null;
}

// Test 4: BOH Actions
async function testBOHActions(sessionId: string): Promise<TestResult[]> {
  console.log('\n🧪 Test 4: BOH Actions');
  const bohResults: TestResult[] = [];

  // 4a: CLAIM_PREP
  const claimPrep = await apiCall(
    '/api/sessions',
    'PATCH',
    {
      sessionId,
      action: 'CLAIM_PREP',
      userRole: 'BOH',
      operatorId: 'boh-operator-1',
      notes: 'BOH claimed prep',
    }
  );
  bohResults.push({
    name: 'BOH: Claim Prep',
    passed: claimPrep.success && claimPrep.data?.success === true,
    error: claimPrep.error,
    data: claimPrep.data,
    duration: claimPrep.duration,
  });

  // Wait a bit for state to update
  await new Promise(resolve => setTimeout(resolve, 500));

  // 4b: HEAT_UP
  const heatUp = await apiCall(
    '/api/sessions',
    'PATCH',
    {
      sessionId,
      action: 'HEAT_UP',
      userRole: 'BOH',
      operatorId: 'boh-operator-1',
      notes: 'Heating up coals',
    }
  );
  bohResults.push({
    name: 'BOH: Heat Up',
    passed: heatUp.success && heatUp.data?.success === true,
    error: heatUp.error,
    data: heatUp.data,
    duration: heatUp.duration,
  });

  // Wait a bit for state to update
  await new Promise(resolve => setTimeout(resolve, 500));

  // 4c: READY_FOR_DELIVERY
  const readyForDelivery = await apiCall(
    '/api/sessions',
    'PATCH',
    {
      sessionId,
      action: 'READY_FOR_DELIVERY',
      userRole: 'BOH',
      operatorId: 'boh-operator-1',
      notes: 'Ready for FOH pickup',
    }
  );
  bohResults.push({
    name: 'BOH: Ready for Delivery',
    passed: readyForDelivery.success && readyForDelivery.data?.success === true,
    error: readyForDelivery.error,
    data: readyForDelivery.data,
    duration: readyForDelivery.duration,
  });

  return bohResults;
}

// Test 5: FOH Actions
async function testFOHActions(sessionId: string): Promise<TestResult[]> {
  console.log('\n🧪 Test 5: FOH Actions');
  const fohResults: TestResult[] = [];

  // 5a: DELIVER_NOW
  const deliverNow = await apiCall(
    '/api/sessions',
    'PATCH',
    {
      sessionId,
      action: 'DELIVER_NOW',
      userRole: 'FOH',
      operatorId: 'foh-operator-1',
      notes: 'Delivering to table',
    }
  );
  fohResults.push({
    name: 'FOH: Deliver Now',
    passed: deliverNow.success && deliverNow.data?.success === true,
    error: deliverNow.error,
    data: deliverNow.data,
    duration: deliverNow.duration,
  });

  // Wait a bit for state to update
  await new Promise(resolve => setTimeout(resolve, 500));

  // 5b: MARK_DELIVERED
  const markDelivered = await apiCall(
    '/api/sessions',
    'PATCH',
    {
      sessionId,
      action: 'MARK_DELIVERED',
      userRole: 'FOH',
      operatorId: 'foh-operator-1',
      notes: 'Delivered to customer',
    }
  );
  fohResults.push({
    name: 'FOH: Mark Delivered',
    passed: markDelivered.success && markDelivered.data?.success === true,
    error: markDelivered.error,
    data: markDelivered.data,
    duration: markDelivered.duration,
  });

  // Wait a bit for state to update
  await new Promise(resolve => setTimeout(resolve, 500));

  // 5c: START_ACTIVE
  const startActive = await apiCall(
    '/api/sessions',
    'PATCH',
    {
      sessionId,
      action: 'START_ACTIVE',
      userRole: 'FOH',
      operatorId: 'foh-operator-1',
      notes: 'Session started',
    }
  );
  fohResults.push({
    name: 'FOH: Start Active',
    passed: startActive.success && startActive.data?.success === true,
    error: startActive.error,
    data: startActive.data,
    duration: startActive.duration,
  });

  // Wait a bit for state to update
  await new Promise(resolve => setTimeout(resolve, 500));

  // 5d: CLOSE_SESSION
  const closeSession = await apiCall(
    '/api/sessions',
    'PATCH',
    {
      sessionId,
      action: 'CLOSE_SESSION',
      userRole: 'FOH',
      operatorId: 'foh-operator-1',
      notes: 'Session closed',
    }
  );
  fohResults.push({
    name: 'FOH: Close Session',
    passed: closeSession.success && closeSession.data?.success === true,
    error: closeSession.error,
    data: closeSession.data,
    duration: closeSession.duration,
  });

  return fohResults;
}

// Test 6: Edge Cases
async function testEdgeCases(): Promise<TestResult[]> {
  console.log('\n🧪 Test 6: Edge Cases');
  const edgeResults: TestResult[] = [];

  // 6a: Duplicate Session (same table)
  const duplicateSession = await apiCall(
    '/api/sessions',
    'POST',
    {
      tableId: 'T-001', // Use fixed table ID
      customerName: 'Edge Case Customer',
      flavor: 'Edge Case Flavor',
      amount: 3000,
      source: 'WALK_IN',
    }
  );
  edgeResults.push({
    name: 'Edge Case: Duplicate Session (Same Table)',
    passed: !duplicateSession.success || duplicateSession.data?.error?.includes('already has an active session'),
    error: duplicateSession.success ? 'Should have failed but succeeded' : undefined,
    data: duplicateSession.data,
  });

  // 6b: Invalid Action (wrong state)
  const testSessionId = await getTestSession();
  if (testSessionId) {
    const invalidAction = await apiCall(
      '/api/sessions',
      'PATCH',
      {
        sessionId: testSessionId,
        action: 'CLOSE_SESSION', // Try to close a NEW session
        userRole: 'FOH',
        operatorId: 'foh-operator-1',
      }
    );
    edgeResults.push({
      name: 'Edge Case: Invalid Action (Wrong State)',
      passed: !invalidAction.success || invalidAction.data?.error?.includes('transition') || invalidAction.data?.error?.includes('not available'),
      error: invalidAction.success ? 'Should have failed but succeeded' : undefined,
      data: invalidAction.data,
    });
  }

  // 6c: Missing Required Fields
  const missingFields = await apiCall(
    '/api/sessions',
    'POST',
    {
      // Missing tableId, customerName, flavor
      amount: 3000,
    }
  );
  edgeResults.push({
    name: 'Edge Case: Missing Required Fields',
    passed: !missingFields.success && (missingFields.status === 400 || missingFields.error?.includes('required')),
    error: missingFields.success ? 'Should have failed but succeeded' : undefined,
    data: missingFields.data,
  });

  // 6d: Invalid Session ID
  const invalidSessionId = await apiCall(
    '/api/sessions',
    'PATCH',
    {
      sessionId: 'invalid-session-id-12345',
      action: 'CLAIM_PREP',
      userRole: 'BOH',
    }
  );
  edgeResults.push({
    name: 'Edge Case: Invalid Session ID',
    passed: !invalidSessionId.success && (invalidSessionId.status === 404 || invalidSessionId.error?.includes('not found')),
    error: invalidSessionId.success ? 'Should have failed but succeeded' : undefined,
    data: invalidSessionId.data,
  });

  // 6e: PUT_ON_HOLD
  const testSessionId2 = await getTestSession();
  if (testSessionId2) {
    const putOnHold = await apiCall(
      '/api/sessions',
      'PATCH',
      {
        sessionId: testSessionId2,
        action: 'PUT_ON_HOLD',
        userRole: 'MANAGER',
        operatorId: 'manager-1',
        notes: 'Putting on hold for edge case test',
      }
    );
    edgeResults.push({
      name: 'Edge Case: Put on Hold',
      passed: putOnHold.success && putOnHold.data?.success === true,
      error: putOnHold.error,
      data: putOnHold.data,
    });
  }

  return edgeResults;
}

// Test 7: Waitlist Functionality
async function testWaitlist(): Promise<TestResult[]> {
  console.log('\n🧪 Test 7: Waitlist Functionality');
  const waitlistResults: TestResult[] = [];

  // 7a: Create Waitlist Entry
  const createWaitlist = await apiCall(
    '/api/admin/pos-waitlist',
    'POST',
    {
      name: 'Waitlist Customer',
      email: 'waitlist@test.com',
      phone: '+1555123456',
      partySize: 4,
      notes: 'Test waitlist entry',
    }
  );
  waitlistResults.push({
    name: 'Waitlist: Create Entry',
    passed: createWaitlist.success,
    error: createWaitlist.error,
    data: createWaitlist.data,
  });

  // 7b: Get Waitlist
  const getWaitlist = await apiCall('/api/admin/pos-waitlist', 'GET');
  waitlistResults.push({
    name: 'Waitlist: Get Entries',
    passed: getWaitlist.success && Array.isArray(getWaitlist.data),
    error: getWaitlist.error,
    data: getWaitlist.data,
  });

  return waitlistResults;
}

// Test 8: CORS Headers
async function testCORS(): Promise<TestResult[]> {
  console.log('\n🧪 Test 8: CORS Headers');
  const corsResults: TestResult[] = [];

  // 8a: OPTIONS preflight
  const optionsResult = await fetch(`${APP_URL}/api/sessions`, {
    method: 'OPTIONS',
    headers: {
      'Origin': SITE_URL,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });

  corsResults.push({
    name: 'CORS: OPTIONS Preflight',
    passed: optionsResult.ok && optionsResult.headers.get('Access-Control-Allow-Origin') !== null,
    error: optionsResult.ok ? undefined : `HTTP ${optionsResult.status}`,
    data: {
      status: optionsResult.status,
      headers: Object.fromEntries(optionsResult.headers.entries()),
    },
  });

  // 8b: Cross-origin POST
  const crossOriginPost = await apiCall(
    '/api/sessions',
    'POST',
    {
      tableId: `T-CORS-${Date.now()}`,
      customerName: 'CORS Test',
      flavor: 'CORS Flavor',
      amount: 3000,
      source: 'WALK_IN',
    },
    SITE_URL
  );

  corsResults.push({
    name: 'CORS: Cross-Origin POST',
    passed: crossOriginPost.success,
    error: crossOriginPost.error,
    data: crossOriginPost.data,
  });

  return corsResults;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Session Actions Test Suite');
  console.log(`📡 App URL: ${APP_URL}`);
  console.log(`🌐 Site URL: ${SITE_URL}`);
  console.log('=' .repeat(60));

  try {
    // Test 1: Start Demo Session
    results.push(await testStartDemoSession());

    // Test 2: New Session
    results.push(await testNewSession());

    // Get a session for action tests
    const testSessionId = await getTestSession();
    if (!testSessionId) {
      console.error('❌ No session found for action tests. Creating one...');
      const createResult = await testNewSession();
      if (createResult.passed && createResult.data?.session?.id) {
        const sessionId = createResult.data.session.id;
        
        // Test 4: BOH Actions
        results.push(...(await testBOHActions(sessionId)));

        // Test 5: FOH Actions
        results.push(...(await testFOHActions(sessionId)));
      }
    } else {
      // Test 4: BOH Actions
      results.push(...(await testBOHActions(testSessionId)));

      // Test 5: FOH Actions
      results.push(...(await testFOHActions(testSessionId)));
    }

    // Test 6: Edge Cases
    results.push(...(await testEdgeCases()));

    // Test 7: Waitlist
    results.push(...(await testWaitlist()));

    // Test 8: CORS
    results.push(...(await testCORS()));

  } catch (error) {
    console.error('❌ Test suite error:', error);
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${icon} ${index + 1}. ${result.name}${duration}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  if (failed > 0) {
    console.log('\n❌ Failed Tests Details:');
    results
      .filter(r => !r.passed)
      .forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.name}`);
        console.log(`   Error: ${result.error}`);
        if (result.data) {
          console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`);
        }
      });
  }

  console.log('\n' + '='.repeat(60));
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(console.error);

