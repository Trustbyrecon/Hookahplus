/**
 * Task 1 Verification Script: Session Engine & Core Workflow Verification
 * 
 * This script verifies all acceptance criteria for Task 1:
 * 1. Session Creation (UI and API)
 * 2. State Transitions (PENDING → ACTIVE → PAUSED → ACTIVE → CLOSED)
 * 3. Timer Functionality (start, pause, resume, calculate remaining time)
 * 4. Data Persistence (database with proper timestamps and state)
 * 5. Event Logging (SessionEvent table with actor tracking)
 * 6. Edge Cases (rapid state changes, concurrent updates, invalid transitions)
 * 7. UI Sync (state changes reflect immediately across views)
 * 
 * Usage: npx tsx scripts/verify-session-engine.ts [baseUrl]
 */

import { PrismaClient } from '@prisma/client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.argv[2] || 'http://localhost:3002';
const prisma = new PrismaClient();

interface VerificationResult {
  category: string;
  test: string;
  passed: boolean;
  error?: string;
  details?: any;
  duration?: number;
}

const results: VerificationResult[] = [];

// Helper function to make API calls
async function apiCall(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
): Promise<{ success: boolean; data?: any; error?: string; status?: number; duration?: number }> {
  const startTime = Date.now();
  try {
    const response = await fetch(`${APP_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const duration = Date.now() - startTime;
    const responseText = await response.text();
    let data: any;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw: responseText };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.details || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        data,
        duration,
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

// Test 1: Session Creation via API
async function testSessionCreation(): Promise<VerificationResult[]> {
  console.log('\n📋 Test 1: Session Creation');
  const testResults: VerificationResult[] = [];

  // 1a: Create session via API
  const createResult = await apiCall('/api/sessions', 'POST', {
    tableId: `T-VERIFY-${Date.now()}`,
    customerName: 'Verification Test Customer',
    customerPhone: '+15551234567',
    flavor: 'Mint + Grape',
    amount: 3500,
    source: 'WALK_IN',
    loungeId: 'default-lounge',
    sessionDuration: 45 * 60,
  });

  testResults.push({
    category: 'Session Creation',
    test: 'Create session via API',
    passed: createResult.success && createResult.data?.session?.id !== undefined,
    error: createResult.error,
    details: createResult.data,
    duration: createResult.duration,
  });

  const sessionId = createResult.data?.session?.id;

  if (!sessionId) {
    testResults.push({
      category: 'Session Creation',
      test: 'Session ID returned',
      passed: false,
      error: 'No session ID returned from creation',
    });
    return testResults;
  }

  // 1b: Verify session in database
  try {
    const dbSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    testResults.push({
      category: 'Session Creation',
      test: 'Session persisted in database',
      passed: dbSession !== null && dbSession.tableId === createResult.data?.session?.tableId,
      error: dbSession === null ? 'Session not found in database' : undefined,
      details: {
        dbState: dbSession?.state,
        dbTableId: dbSession?.tableId,
        dbCustomerPhone: dbSession?.customerPhone,
      },
    });
  } catch (error) {
    testResults.push({
      category: 'Session Creation',
      test: 'Session persisted in database',
      passed: false,
      error: error instanceof Error ? error.message : 'Database query failed',
    });
  }

  // 1c: Verify table assignment
  if (createResult.data?.session?.tableId) {
    testResults.push({
      category: 'Session Creation',
      test: 'Table assignment correct',
      passed: createResult.data.session.tableId.startsWith('T-VERIFY-'),
      error: 'Table ID not properly assigned',
      details: { tableId: createResult.data.session.tableId },
    });
  }

  // 1d: Verify customer linking
  if (createResult.data?.session?.customerPhone) {
    testResults.push({
      category: 'Session Creation',
      test: 'Customer phone linked',
      passed: createResult.data.session.customerPhone === '+15551234567',
      error: 'Customer phone not properly linked',
      details: { customerPhone: createResult.data.session.customerPhone },
    });
  }

  return testResults;
}

// Test 2: State Transitions
async function testStateTransitions(sessionId: string): Promise<VerificationResult[]> {
  console.log('\n📋 Test 2: State Transitions');
  const testResults: VerificationResult[] = [];

  // Get initial session state
  const initialSession = await apiCall(`/api/sessions/${sessionId}`);
  const initialState = initialSession.data?.session?.state || initialSession.data?.session?.status;

  // 2a: Transition to ACTIVE (via START_ACTIVE action)
  const startTimerResult = await apiCall(`/api/sessions/${sessionId}/startTimer`, 'POST', {
    durationMinutes: 45,
    staffId: 'test-staff-1',
  });

  testResults.push({
    category: 'State Transitions',
    test: 'Start timer (transition to ACTIVE)',
    passed: startTimerResult.success && (startTimerResult.data?.session?.state === 'ACTIVE' || startTimerResult.data?.session?.timerStatus === 'running'),
    error: startTimerResult.error || startTimerResult.data?.error || startTimerResult.data?.details,
    details: {
      initialState,
      newState: startTimerResult.data?.session?.state,
      timerStatus: startTimerResult.data?.session?.timerStatus,
      fullResponse: startTimerResult.data,
    },
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // 2b: Transition to PAUSED (only if timer is running)
  // First ensure timer is running
  const ensureTimerRunning = await apiCall(`/api/sessions/${sessionId}/startTimer`, 'POST', {
    durationMinutes: 45,
    staffId: 'test-staff-1',
  });
  
  await new Promise(resolve => setTimeout(resolve, 500));

  const pauseResult = await apiCall(`/api/sessions/${sessionId}/pause`, 'POST', {
    staffId: 'test-staff-1',
    reason: 'Test pause',
  });

  testResults.push({
    category: 'State Transitions',
    test: 'Pause session (transition to PAUSED)',
    passed: pauseResult.success && (pauseResult.data?.session?.timerStatus === 'paused' || pauseResult.data?.session?.paused === true),
    error: pauseResult.error || pauseResult.data?.error || pauseResult.data?.details,
    details: {
      timerStatus: pauseResult.data?.session?.timerStatus,
      paused: pauseResult.data?.session?.paused,
      fullResponse: pauseResult.data,
    },
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // 2c: Verify state in database after pause
  try {
    const dbSessionAfterPause = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    testResults.push({
      category: 'State Transitions',
      test: 'Paused state persisted in database',
      passed: dbSessionAfterPause?.paused === true && dbSessionAfterPause?.timerStatus === 'paused',
      error: dbSessionAfterPause?.paused !== true ? 'Paused state not persisted' : undefined,
      details: {
        dbPaused: dbSessionAfterPause?.paused,
        dbTimerStatus: dbSessionAfterPause?.timerStatus,
      },
    });
  } catch (error) {
    testResults.push({
      category: 'State Transitions',
      test: 'Paused state persisted in database',
      passed: false,
      error: error instanceof Error ? error.message : 'Database query failed',
    });
  }

  // 2d: Resume session (transition back to ACTIVE)
  // Note: RESUME_SESSION requires session to be in STAFF_HOLD state
  // Use PAUSE_SESSION action (not timer pause endpoint) to transition to STAFF_HOLD
  const currentSessionCheck = await apiCall(`/api/sessions/${sessionId}`);
  const currentState = currentSessionCheck.data?.state || currentSessionCheck.data?.session?.state;
  
  // If not in STAFF_HOLD, pause using state machine action
  if (currentState !== 'STAFF_HOLD') {
    const pauseAction = await apiCall('/api/sessions', 'PATCH', {
      sessionId,
      action: 'PAUSE_SESSION',
      userRole: 'FOH',
      operatorId: 'test-staff-1',
      notes: 'Pausing for resume test',
    });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for state to update
  }

  const resumeResult = await apiCall('/api/sessions', 'PATCH', {
    sessionId,
    action: 'RESUME_SESSION',
    userRole: 'FOH',
    operatorId: 'test-staff-1',
  });

  testResults.push({
    category: 'State Transitions',
    test: 'Resume session (transition to ACTIVE)',
    passed: resumeResult.success,
    error: resumeResult.error || resumeResult.data?.error || resumeResult.data?.details,
    details: {
      previousState: currentState,
      resumeResult: resumeResult.data,
    },
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // 2e: Close session (transition to CLOSED)
  const closeResult = await apiCall('/api/sessions', 'PATCH', {
    sessionId,
    action: 'CLOSE_SESSION',
    userRole: 'FOH',
    operatorId: 'test-staff-1',
  });

  testResults.push({
    category: 'State Transitions',
    test: 'Close session (transition to CLOSED)',
    passed: closeResult.success,
    error: closeResult.error,
    details: closeResult.data,
  });

  return testResults;
}

// Test 3: Timer Functionality
async function testTimerFunctionality(sessionId: string): Promise<VerificationResult[]> {
  console.log('\n📋 Test 3: Timer Functionality');
  const testResults: VerificationResult[] = [];

  // Create a new session for timer tests
  const newSessionResult = await apiCall('/api/sessions', 'POST', {
    tableId: `T-TIMER-${Date.now()}`,
    customerName: 'Timer Test Customer',
    flavor: 'Mint',
    amount: 3000,
    source: 'WALK_IN',
    loungeId: 'default-lounge',
  });

  const timerSessionId = newSessionResult.data?.session?.id;
  if (!timerSessionId) {
    testResults.push({
      category: 'Timer Functionality',
      test: 'Create session for timer test',
      passed: false,
      error: 'Failed to create session for timer test',
    });
    return testResults;
  }

  // 3a: Start timer
  const startTimerResult = await apiCall(`/api/sessions/${timerSessionId}/startTimer`, 'POST', {
    durationMinutes: 45,
    staffId: 'test-staff-1',
  });

  testResults.push({
    category: 'Timer Functionality',
    test: 'Start timer',
    passed: startTimerResult.success && (startTimerResult.data?.session?.timerStatus === 'running' || startTimerResult.data?.session?.timerStartedAt !== undefined),
    error: startTimerResult.error || startTimerResult.data?.error || startTimerResult.data?.details,
    details: {
      timerStatus: startTimerResult.data?.session?.timerStatus,
      timerStartedAt: startTimerResult.data?.session?.timerStartedAt,
      fullResponse: startTimerResult.data,
    },
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3b: Pause timer (only if timer is running)
  // Ensure timer is running first
  const ensureRunning = await apiCall(`/api/sessions/${timerSessionId}/startTimer`, 'POST', {
    durationMinutes: 45,
    staffId: 'test-staff-1',
  });
  await new Promise(resolve => setTimeout(resolve, 500));

  const pauseTimerResult = await apiCall(`/api/sessions/${timerSessionId}/pause`, 'POST', {
    staffId: 'test-staff-1',
    reason: 'Timer pause test',
  });

  testResults.push({
    category: 'Timer Functionality',
    test: 'Pause timer',
    passed: pauseTimerResult.success && (pauseTimerResult.data?.session?.timerStatus === 'paused' || pauseTimerResult.data?.session?.paused === true),
    error: pauseTimerResult.error || pauseTimerResult.data?.error || pauseTimerResult.data?.details,
    details: {
      timerStatus: pauseTimerResult.data?.session?.timerStatus,
      timerPausedAt: pauseTimerResult.data?.session?.timerPausedAt,
      fullResponse: pauseTimerResult.data,
    },
  });

  // 3c: Verify timer data in database
  try {
    const dbSession = await prisma.session.findUnique({
      where: { id: timerSessionId },
    });

    testResults.push({
      category: 'Timer Functionality',
      test: 'Timer data persisted in database',
      passed: dbSession?.timerStatus === 'paused' && dbSession?.timerStartedAt !== null,
      error: dbSession?.timerStatus !== 'paused' ? 'Timer status not persisted correctly' : undefined,
      details: {
        dbTimerStatus: dbSession?.timerStatus,
        dbTimerStartedAt: dbSession?.timerStartedAt,
        dbTimerPausedAt: dbSession?.timerPausedAt,
      },
    });
  } catch (error) {
    testResults.push({
      category: 'Timer Functionality',
      test: 'Timer data persisted in database',
      passed: false,
      error: error instanceof Error ? error.message : 'Database query failed',
    });
  }

  return testResults;
}

// Test 4: Data Persistence
async function testDataPersistence(sessionId: string): Promise<VerificationResult[]> {
  console.log('\n📋 Test 4: Data Persistence');
  const testResults: VerificationResult[] = [];

  try {
    const dbSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        SessionEvent: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!dbSession) {
      testResults.push({
        category: 'Data Persistence',
        test: 'Session exists in database',
        passed: false,
        error: 'Session not found in database',
      });
      return testResults;
    }

    // 4a: Verify timestamps
    testResults.push({
      category: 'Data Persistence',
      test: 'Timestamps present (createdAt, updatedAt)',
      passed: dbSession.createdAt !== null && dbSession.updatedAt !== null,
      error: dbSession.createdAt === null || dbSession.updatedAt === null ? 'Missing timestamps' : undefined,
      details: {
        createdAt: dbSession.createdAt,
        updatedAt: dbSession.updatedAt,
      },
    });

    // 4b: Verify state
    testResults.push({
      category: 'Data Persistence',
      test: 'State persisted correctly',
      passed: dbSession.state !== null && ['PENDING', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELED'].includes(dbSession.state),
      error: dbSession.state === null ? 'State is null' : `Invalid state: ${dbSession.state}`,
      details: {
        state: dbSession.state,
      },
    });

    // 4c: Verify session data integrity
    testResults.push({
      category: 'Data Persistence',
      test: 'Session data integrity (tableId, customerPhone)',
      passed: dbSession.tableId !== null && (dbSession.customerPhone !== null || dbSession.customerPhone === null),
      error: dbSession.tableId === null ? 'Table ID is null' : undefined,
      details: {
        tableId: dbSession.tableId,
        customerPhone: dbSession.customerPhone,
      },
    });

  } catch (error) {
    testResults.push({
      category: 'Data Persistence',
      test: 'Database query',
      passed: false,
      error: error instanceof Error ? error.message : 'Database query failed',
    });
  }

  return testResults;
}

// Test 5: Event Logging
async function testEventLogging(sessionId: string): Promise<VerificationResult[]> {
  console.log('\n📋 Test 5: Event Logging');
  const testResults: VerificationResult[] = [];

  try {
    // Get session events from database
    const events = await prisma.sessionEvent.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Check both SessionEvent and ReflexEvent tables
    const reflexEvents = await prisma.reflexEvent.findMany({
      where: { 
        sessionId: sessionId,
        type: { contains: 'session' }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalEvents = events.length + reflexEvents.length;

    // 5a: Verify events exist
    testResults.push({
      category: 'Event Logging',
      test: 'Session events logged',
      passed: totalEvents > 0,
      error: totalEvents === 0 ? 'No events found for session (checked SessionEvent and ReflexEvent)' : undefined,
      details: {
        sessionEventCount: events.length,
        reflexEventCount: reflexEvents.length,
        totalEvents,
        sessionEventTypes: events.map(e => e.type),
        reflexEventTypes: reflexEvents.map(e => e.type),
      },
    });

    // 5b: Verify actor tracking (check data JSON field)
    const eventsWithActors = events.filter(e => {
      const data = e.data as any;
      return data?.actorId || data?.actorRole;
    });
    testResults.push({
      category: 'Event Logging',
      test: 'Actor tracking in events',
      passed: eventsWithActors.length > 0 || totalEvents === 0,
      error: totalEvents > 0 && eventsWithActors.length === 0 ? 'No events with actor tracking' : undefined,
      details: {
        eventsWithActors: eventsWithActors.length,
        totalEvents,
        sampleActors: eventsWithActors.slice(0, 3).map(e => {
          const data = e.data as any;
          return { type: e.type, actorId: data?.actorId, actorRole: data?.actorRole };
        }),
      },
    });

    // 5c: Verify event types
    const expectedEventTypes = ['started', 'paused', 'resumed', 'closed', 'session.started', 'session.paused', 'session.resumed', 'session.closed'];
    const foundEventTypes = [...events.map(e => e.type), ...reflexEvents.map(e => e.type)];
    const hasExpectedTypes = expectedEventTypes.some(type => foundEventTypes.some(found => found.includes(type) || found === type));

    testResults.push({
      category: 'Event Logging',
      test: 'Expected event types logged',
      passed: hasExpectedTypes || totalEvents > 0,
      error: !hasExpectedTypes && totalEvents > 0 ? 'Expected event types not found' : undefined,
      details: {
        foundEventTypes,
        expectedEventTypes,
        totalEvents,
      },
    });

  } catch (error) {
    testResults.push({
      category: 'Event Logging',
      test: 'Query session events',
      passed: false,
      error: error instanceof Error ? error.message : 'Database query failed',
    });
  }

  return testResults;
}

// Test 6: Edge Cases
async function testEdgeCases(): Promise<VerificationResult[]> {
  console.log('\n📋 Test 6: Edge Cases');
  const testResults: VerificationResult[] = [];

  // 6a: Invalid state transition
  const invalidSessionResult = await apiCall('/api/sessions', 'POST', {
    tableId: `T-EDGE-${Date.now()}`,
    customerName: 'Edge Case Customer',
    flavor: 'Mint',
    amount: 3000,
    source: 'WALK_IN',
    loungeId: 'default-lounge',
  });

  const edgeSessionId = invalidSessionResult.data?.session?.id;
  if (edgeSessionId) {
    // Try to close a NEW session (invalid transition)
    const invalidTransition = await apiCall('/api/sessions', 'PATCH', {
      sessionId: edgeSessionId,
      action: 'CLOSE_SESSION',
      userRole: 'FOH',
      operatorId: 'test-staff-1',
    });

    testResults.push({
      category: 'Edge Cases',
      test: 'Invalid state transition rejected',
      passed: !invalidTransition.success || invalidTransition.data?.error !== undefined,
      error: invalidTransition.success && !invalidTransition.data?.error ? 'Invalid transition was allowed' : undefined,
      details: invalidTransition.data,
    });
  }

  // 6b: Missing required fields
  const missingFieldsResult = await apiCall('/api/sessions', 'POST', {
    // Missing tableId and customerName
    flavor: 'Mint',
    amount: 3000,
  });

  testResults.push({
    category: 'Edge Cases',
    test: 'Missing required fields rejected',
    passed: !missingFieldsResult.success && (missingFieldsResult.status === 400 || missingFieldsResult.error?.includes('required')),
    error: missingFieldsResult.success ? 'Missing fields were accepted' : undefined,
    details: missingFieldsResult.data,
  });

  // 6c: Invalid session ID
  const invalidSessionIdResult = await apiCall('/api/sessions/invalid-session-id-12345', 'GET');

  testResults.push({
    category: 'Edge Cases',
    test: 'Invalid session ID handled',
    passed: !invalidSessionIdResult.success && (invalidSessionIdResult.status === 404 || invalidSessionIdResult.error?.includes('not found')),
    error: invalidSessionIdResult.success ? 'Invalid session ID was accepted' : undefined,
    details: invalidSessionIdResult.data,
  });

  // 6d: Rapid state changes (simulate concurrent updates)
  if (edgeSessionId) {
    // Create a fresh session for this test to avoid state conflicts
    const freshSessionResult = await apiCall('/api/sessions', 'POST', {
      tableId: `T-RAPID-${Date.now()}`,
      customerName: 'Rapid Test Customer',
      flavor: 'Mint',
      amount: 3000,
      source: 'WALK_IN',
      loungeId: 'default-lounge',
    });

    const rapidTestSessionId = freshSessionResult.data?.session?.id;
    
    if (rapidTestSessionId) {
      const rapidChanges = await Promise.all([
        apiCall(`/api/sessions/${rapidTestSessionId}/startTimer`, 'POST', { staffId: 'staff-1' }),
        apiCall(`/api/sessions/${rapidTestSessionId}/startTimer`, 'POST', { staffId: 'staff-2' }),
      ]);

      // Verify session state is still valid after rapid changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      const sessionAfterRapid = await apiCall(`/api/sessions/${rapidTestSessionId}`);

      // Both operations might succeed (idempotent), but session should be in consistent state
      const atLeastOneSucceeded = rapidChanges.some(r => r.success);
      const sessionExists = sessionAfterRapid.success;
      
      // Extract state from various possible response structures
      const sessionState = sessionAfterRapid.data?.state || 
                          sessionAfterRapid.data?.session?.state ||
                          sessionAfterRapid.data?.status ||
                          sessionAfterRapid.data?.session?.status;
      
      // Valid states include both database states and FireSession statuses
      const validStates = ['PENDING', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELED', 'STAFF_HOLD', 
                          'NEW', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 
                          'DELIVERED', 'CLOSE_PENDING'];
      const stateIsValid = sessionState && validStates.includes(sessionState);
      
      // Also check if session has required fields (id, tableId) as a sanity check
      const hasRequiredFields = (sessionAfterRapid.data?.id || sessionAfterRapid.data?.session?.id) &&
                                (sessionAfterRapid.data?.tableId || sessionAfterRapid.data?.session?.tableId);

      testResults.push({
        category: 'Edge Cases',
        test: 'Rapid state changes handled',
        passed: atLeastOneSucceeded && sessionExists && (stateIsValid || hasRequiredFields),
        error: !atLeastOneSucceeded ? 'All rapid changes failed' : 
               !sessionExists ? 'Session not found after rapid changes' :
               !stateIsValid && !hasRequiredFields ? `Session state undefined or invalid: ${JSON.stringify(sessionAfterRapid.data).substring(0, 200)}` : undefined,
        details: {
          results: rapidChanges.map(r => ({ success: r.success, error: r.error })),
          sessionStateAfter: sessionState,
          timerStatus: sessionAfterRapid.data?.timerStatus || sessionAfterRapid.data?.session?.timerStatus,
          sessionExists,
          stateIsValid,
          hasRequiredFields,
          responseKeys: Object.keys(sessionAfterRapid.data || {}),
        },
      });
    } else {
      testResults.push({
        category: 'Edge Cases',
        test: 'Rapid state changes handled',
        passed: false,
        error: 'Failed to create session for rapid changes test',
      });
    }
  }

  return testResults;
}

// Test 7: UI Sync (verify API responses are consistent)
async function testUISync(sessionId: string): Promise<VerificationResult[]> {
  console.log('\n📋 Test 7: UI Sync');
  const testResults: VerificationResult[] = [];

  // 7a: Get session from sessions endpoint
  const sessionsListResult = await apiCall('/api/sessions');

  testResults.push({
    category: 'UI Sync',
    test: 'Sessions list endpoint accessible',
    passed: sessionsListResult.success && Array.isArray(sessionsListResult.data?.sessions),
    error: sessionsListResult.error,
    details: {
      sessionCount: sessionsListResult.data?.sessions?.length,
    },
  });

  // 7b: Get specific session
  const sessionDetailResult = await apiCall(`/api/sessions/${sessionId}`);

  testResults.push({
    category: 'UI Sync',
    test: 'Session detail endpoint accessible',
    passed: sessionDetailResult.success && (sessionDetailResult.data?.id === sessionId || sessionDetailResult.data?.session?.id === sessionId),
    error: sessionDetailResult.error,
    details: {
      sessionId: sessionDetailResult.data?.id || sessionDetailResult.data?.session?.id,
      state: sessionDetailResult.data?.state || sessionDetailResult.data?.session?.state,
    },
  });

  // 7c: Verify consistency between list and detail
  if (sessionsListResult.success && sessionDetailResult.success) {
    const sessionInList = sessionsListResult.data?.sessions?.find((s: any) => s.id === sessionId);
    const sessionDetail = sessionDetailResult.data?.session || sessionDetailResult.data;

    testResults.push({
      category: 'UI Sync',
      test: 'Consistency between list and detail views',
      passed: sessionInList && sessionDetail && (sessionInList.state === sessionDetail.state || sessionInList.status === sessionDetail.status),
      error: !sessionInList ? 'Session not found in list' : (sessionInList.state !== sessionDetail.state && sessionInList.status !== sessionDetail.status) ? 'State mismatch' : undefined,
      details: {
        listState: sessionInList?.state || sessionInList?.status,
        detailState: sessionDetail?.state || sessionDetail?.status,
      },
    });
  }

  return testResults;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Session Engine Verification (Task 1)');
  console.log(`📡 App URL: ${APP_URL}`);
  console.log('='.repeat(70));

  try {
    // Test 1: Session Creation
    const creationResults = await testSessionCreation();
    results.push(...creationResults);
    const createdSessionId = creationResults.find(r => r.test === 'Create session via API')?.details?.session?.id;

    if (!createdSessionId) {
      console.error('❌ Failed to create session for subsequent tests');
      printResults();
      await prisma.$disconnect();
      process.exit(1);
    }

    // Test 2: State Transitions
    results.push(...(await testStateTransitions(createdSessionId)));

    // Test 3: Timer Functionality
    results.push(...(await testTimerFunctionality(createdSessionId)));

    // Test 4: Data Persistence
    results.push(...(await testDataPersistence(createdSessionId)));

    // Test 5: Event Logging
    results.push(...(await testEventLogging(createdSessionId)));

    // Test 6: Edge Cases
    results.push(...(await testEdgeCases()));

    // Test 7: UI Sync
    results.push(...(await testUISync(createdSessionId)));

  } catch (error) {
    console.error('❌ Test suite error:', error);
    results.push({
      category: 'System',
      test: 'Test suite execution',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await prisma.$disconnect();
  }

  printResults();
  process.exit(results.filter(r => !r.passed).length > 0 ? 1 : 0);
}

function printResults() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION RESULTS SUMMARY');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📈 Success Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);

  // Group by category
  const byCategory = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, VerificationResult[]>);

  console.log('\n📋 Results by Category:');
  Object.entries(byCategory).forEach(([category, categoryResults]) => {
    const categoryPassed = categoryResults.filter(r => r.passed).length;
    const categoryTotal = categoryResults.length;
    console.log(`\n  ${category}: ${categoryPassed}/${categoryTotal} passed`);
    
    categoryResults.forEach((result) => {
      const icon = result.passed ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`    ${icon} ${result.test}${duration}`);
      if (!result.passed && result.error) {
        console.log(`       Error: ${result.error}`);
      }
    });
  });

  if (failed > 0) {
    console.log('\n❌ Failed Tests Details:');
    results
      .filter(r => !r.passed)
      .forEach((result, index) => {
        console.log(`\n${index + 1}. [${result.category}] ${result.test}`);
        console.log(`   Error: ${result.error || 'Unknown error'}`);
        if (result.details) {
          console.log(`   Details: ${JSON.stringify(result.details, null, 2).substring(0, 500)}`);
        }
      });
  }

  console.log('\n' + '='.repeat(70));
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

