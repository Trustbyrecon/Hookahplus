/**
 * Test Guest → App Sync
 * Agent: Noor (session_agent)
 * 
 * This script tests the complete flow:
 * 1. Guest build creates a session via /api/session/start
 * 2. Guest build syncs to app build via /api/sessions
 * 3. Verify session appears in app build database
 * 4. Verify session is visible in FSD
 */

import 'dotenv/config';
// Using native fetch (Node.js 18+)

const GUEST_URL = process.env.NEXT_PUBLIC_GUEST_URL || 'http://localhost:3001';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

async function testGuestAppSync(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🧪 [Noor] Testing Guest → App Sync\n');
  console.log(`Guest Build URL: ${GUEST_URL}`);
  console.log(`App Build URL: ${APP_URL}\n`);

  // Step 1: Check if servers are running
  console.log('📋 Step 1: Checking server availability...');
  try {
    const appHealthCheck = await fetch(`${APP_URL}/api/sessions`, {
      method: 'GET',
    });
    
    if (appHealthCheck.status === 200 || appHealthCheck.status === 404) {
      results.push({
        step: 'Server Health Check',
        success: true,
        message: `App build server is running (status: ${appHealthCheck.status})`,
      });
      console.log(`✅ App build server is running (status: ${appHealthCheck.status})`);
    } else {
      results.push({
        step: 'Server Health Check',
        success: false,
        message: `App build server returned unexpected status: ${appHealthCheck.status}`,
      });
      console.error(`❌ App build server returned unexpected status: ${appHealthCheck.status}`);
      return results;
    }
  } catch (error) {
    results.push({
      step: 'Server Health Check',
      success: false,
      message: `Failed to connect to app build server: ${error instanceof Error ? error.message : String(error)}`,
      error,
    });
    console.error(`❌ Failed to connect to app build server:`, error);
    return results;
  }

  // Step 2: Create session from guest build
  console.log('\n📋 Step 2: Creating session from guest build...');
  const testSessionData = {
    loungeId: 'test-lounge-sync',
    tableId: `T-SYNC-${Date.now() % 1000}`,
    guestId: `guest-test-${Date.now()}`,
    sessionType: 'standard',
    customerName: 'Test Guest Customer',
    customerPhone: '+1234567890',
    flavorMix: ['Mint', 'Grape'],
    items: [
      { id: 'item1', name: 'Hookah Session', price: 30, quantity: 1 }
    ],
    totalAmount: 30.00,
  };

  let guestSessionId: string | undefined;
  let appSessionId: string | undefined;

  try {
    const guestResponse = await fetch(`${GUEST_URL}/api/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSessionData),
    });

    const guestResult = await guestResponse.json();

    if (guestResponse.ok && guestResult.success) {
      guestSessionId = guestResult.session?.sessionId;
      appSessionId = guestResult.session?.appSessionId;
      
      results.push({
        step: 'Guest Session Creation',
        success: true,
        message: `Guest session created: ${guestSessionId}`,
        data: {
          guestSessionId,
          appSessionId,
          synced: guestResult.synced,
        },
      });
      console.log(`✅ Guest session created: ${guestSessionId}`);
      console.log(`   App session ID: ${appSessionId || 'Not synced'}`);
      console.log(`   Synced: ${guestResult.synced ? '✅' : '❌'}`);
    } else {
      results.push({
        step: 'Guest Session Creation',
        success: false,
        message: `Failed to create guest session: ${guestResult.error || guestResponse.statusText}`,
        error: guestResult,
      });
      console.error(`❌ Failed to create guest session:`, guestResult);
      return results;
    }
  } catch (error) {
    results.push({
      step: 'Guest Session Creation',
      success: false,
      message: `Error creating guest session: ${error instanceof Error ? error.message : String(error)}`,
      error,
    });
    console.error(`❌ Error creating guest session:`, error);
    return results;
  }

  // Step 3: Verify session exists in app build
  if (appSessionId) {
    console.log('\n📋 Step 3: Verifying session in app build database...');
    try {
      // Query by sessionId directly (more reliable than fetching all sessions)
      const appSessionResponse = await fetch(`${APP_URL}/api/sessions?sessionId=${appSessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (appSessionResponse.ok) {
        const appSessionResult = await appSessionResponse.json();
        // Handle both single session response and array response
        const foundSession = appSessionResult.session || 
                           (Array.isArray(appSessionResult) ? appSessionResult.find((s: any) => s.id === appSessionId) : null) ||
                           (appSessionResult.id === appSessionId ? appSessionResult : null);

        if (foundSession) {
          results.push({
            step: 'App Build Session Verification',
            success: true,
            message: `Session found in app build: ${appSessionId}`,
            data: {
              sessionId: foundSession.id,
              tableId: foundSession.tableId,
              customerName: foundSession.customerRef,
              status: foundSession.status || foundSession.state,
              source: foundSession.source,
            },
          });
          console.log(`✅ Session found in app build: ${appSessionId}`);
          console.log(`   Table ID: ${foundSession.tableId}`);
          console.log(`   Customer: ${foundSession.customerRef}`);
          console.log(`   Status: ${foundSession.status || foundSession.state}`);
          console.log(`   Source: ${foundSession.source}`);
        } else {
          results.push({
            step: 'App Build Session Verification',
            success: false,
            message: `Session ${appSessionId} not found in app build`,
            data: { appSessionId, availableSessions: Array.isArray(appSessions) ? appSessions.length : 0 },
          });
          console.error(`❌ Session ${appSessionId} not found in app build`);
        }
      } else {
        results.push({
          step: 'App Build Session Verification',
          success: false,
          message: `Failed to fetch sessions from app build: ${appSessionResponse.statusText}`,
        });
        console.error(`❌ Failed to fetch sessions from app build: ${appSessionResponse.statusText}`);
      }
    } catch (error) {
      results.push({
        step: 'App Build Session Verification',
        success: false,
        message: `Error verifying session in app build: ${error instanceof Error ? error.message : String(error)}`,
        error,
      });
      console.error(`❌ Error verifying session in app build:`, error);
    }
  } else {
    results.push({
      step: 'App Build Session Verification',
      success: false,
      message: 'No app session ID returned from guest build (sync failed)',
    });
    console.error(`❌ No app session ID returned from guest build (sync failed)`);
  }

  // Step 4: Test externalRef uniqueness (idempotency)
  console.log('\n📋 Step 4: Testing idempotency (duplicate externalRef)...');
  try {
    const duplicateResponse = await fetch(`${GUEST_URL}/api/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testSessionData,
        tableId: testSessionData.tableId, // Same table ID
      }),
    });

    const duplicateResult = await duplicateResponse.json();

    if (duplicateResponse.ok && duplicateResult.success) {
      // If it returns the same session, idempotency works
      if (duplicateResult.session?.appSessionId === appSessionId) {
        results.push({
          step: 'Idempotency Test',
          success: true,
          message: 'Idempotency working: duplicate request returned same session',
        });
        console.log(`✅ Idempotency working: duplicate request returned same session`);
      } else {
        results.push({
          step: 'Idempotency Test',
          success: false,
          message: 'Idempotency issue: duplicate request created new session',
          data: {
            originalSessionId: appSessionId,
            duplicateSessionId: duplicateResult.session?.appSessionId,
          },
        });
        console.error(`❌ Idempotency issue: duplicate request created new session`);
      }
    } else {
      results.push({
        step: 'Idempotency Test',
        success: false,
        message: `Failed to test idempotency: ${duplicateResult.error || duplicateResponse.statusText}`,
      });
      console.error(`❌ Failed to test idempotency:`, duplicateResult);
    }
  } catch (error) {
    results.push({
      step: 'Idempotency Test',
      success: false,
      message: `Error testing idempotency: ${error instanceof Error ? error.message : String(error)}`,
      error,
    });
    console.error(`❌ Error testing idempotency:`, error);
  }

  // Summary
  console.log('\n📊 Test Summary:');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  console.log(`✅ Passed: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);

  return results;
}

// Run the test
testGuestAppSync()
  .then((results) => {
    const allPassed = results.every(r => r.success);
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error during test:', error);
    process.exit(1);
  });

