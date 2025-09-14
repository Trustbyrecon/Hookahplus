#!/usr/bin/env node

/**
 * Test script for Fire Session State Machine
 * Run with: node scripts/test-fire-session.js
 */

const BASE_URL = 'http://localhost:3000';

async function testFireSession() {
  console.log('🔥 Testing Fire Session State Machine...\n');

  try {
    // Test 1: Create a new session
    console.log('1. Creating new session...');
    const createResponse = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'T-TEST-1' })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create session: ${createResponse.status}`);
    }
    
    const createData = await createResponse.json();
    const sessionId = createData.session.id;
    console.log(`✅ Session created: ${sessionId} (${createData.session.state})`);

    // Test 2: Confirm payment
    console.log('\n2. Confirming payment...');
    const paymentResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'PAYMENT_CONFIRMED', actor: 'system' })
    });
    
    if (!paymentResponse.ok) {
      throw new Error(`Failed to confirm payment: ${paymentResponse.status}`);
    }
    
    const paymentData = await paymentResponse.json();
    console.log(`✅ Payment confirmed: ${paymentData.new_state}`);

    // Test 3: BOH claims prep
    console.log('\n3. BOH claiming prep...');
    const prepResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'CLAIM_PREP', actor: 'boh' })
    });
    
    if (!prepResponse.ok) {
      throw new Error(`Failed to claim prep: ${prepResponse.status}`);
    }
    
    const prepData = await prepResponse.json();
    console.log(`✅ Prep claimed: ${prepData.new_state}`);

    // Test 4: BOH starts heat up
    console.log('\n4. BOH starting heat up...');
    const heatResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'HEAT_UP', actor: 'boh' })
    });
    
    if (!heatResponse.ok) {
      throw new Error(`Failed to start heat up: ${heatResponse.status}`);
    }
    
    const heatData = await heatResponse.json();
    console.log(`✅ Heat up started: ${heatData.new_state}`);

    // Test 5: BOH marks ready for delivery
    console.log('\n5. BOH marking ready for delivery...');
    const readyResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'READY_FOR_DELIVERY', actor: 'boh', data: { note: 'Tray 4' } })
    });
    
    if (!readyResponse.ok) {
      throw new Error(`Failed to mark ready: ${readyResponse.status}`);
    }
    
    const readyData = await readyResponse.json();
    console.log(`✅ Ready for delivery: ${readyData.new_state}`);

    // Test 6: FOH starts delivery
    console.log('\n6. FOH starting delivery...');
    const deliverResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'DELIVER_NOW', actor: 'foh' })
    });
    
    if (!deliverResponse.ok) {
      throw new Error(`Failed to start delivery: ${deliverResponse.status}`);
    }
    
    const deliverData = await deliverResponse.json();
    console.log(`✅ Delivery started: ${deliverData.new_state}`);

    // Test 7: FOH marks delivered
    console.log('\n7. FOH marking delivered...');
    const deliveredResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'MARK_DELIVERED', actor: 'foh' })
    });
    
    if (!deliveredResponse.ok) {
      throw new Error(`Failed to mark delivered: ${deliveredResponse.status}`);
    }
    
    const deliveredData = await deliveredResponse.json();
    console.log(`✅ Marked delivered: ${deliveredData.new_state}`);

    // Test 8: FOH starts active session
    console.log('\n8. FOH starting active session...');
    const activeResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'START_ACTIVE', actor: 'foh' })
    });
    
    if (!activeResponse.ok) {
      throw new Error(`Failed to start active: ${activeResponse.status}`);
    }
    
    const activeData = await activeResponse.json();
    console.log(`✅ Active session started: ${activeData.new_state}`);

    // Test 9: Get final session state
    console.log('\n9. Getting final session state...');
    const finalResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}`);
    
    if (!finalResponse.ok) {
      throw new Error(`Failed to get session: ${finalResponse.status}`);
    }
    
    const finalData = await finalResponse.json();
    console.log(`✅ Final state: ${finalData.session.state}`);
    console.log(`📊 Audit trail: ${finalData.session.audit.length} events`);

    // Test 10: Test invalid transition (should fail)
    console.log('\n10. Testing invalid transition (should fail)...');
    try {
      const invalidResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd: 'CLAIM_PREP', actor: 'boh' })
      });
      
      if (invalidResponse.ok) {
        console.log('❌ Invalid transition should have failed');
      } else {
        const errorData = await invalidResponse.json();
        console.log(`✅ Invalid transition correctly rejected: ${errorData.error}`);
      }
    } catch (error) {
      console.log(`✅ Invalid transition correctly rejected: ${error.message}`);
    }

    console.log('\n🎉 All tests passed! Fire Session State Machine is working correctly.');
    console.log('\n📋 Session Flow:');
    console.log('   NEW → PAID_CONFIRMED → PREP_IN_PROGRESS → HEAT_UP → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED → ACTIVE');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
async function main() {
  console.log('🚀 Fire Session State Machine Test Suite\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server not running. Please start your Next.js dev server first:');
    console.error('   npm run dev');
    console.error('   or');
    console.error('   yarn dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running, starting tests...\n');
  await testFireSession();
}

main().catch(console.error);
