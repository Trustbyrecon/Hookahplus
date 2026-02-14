#!/usr/bin/env node

/**
 * Test script for $1 Stripe Smoke Test
 * This script tests the live-test API endpoint to ensure it's working correctly
 */

// Using built-in fetch (Node.js 18+)

async function testStripeSmoke() {
  console.log('🧪 Testing $1 Stripe Smoke Test...\n');

  try {
    // Test the live-test API endpoint
    const response = await fetch('http://localhost:3002/api/payments/live-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartTotal: 0,
        itemsCount: 0
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ $1 Stripe Smoke Test PASSED!');
      console.log(`   Intent ID: ${data.intentId}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Amount: $${data.amount / 100} ${data.currency.toUpperCase()}`);
      console.log(`   Stripe URL: ${data.stripeUrl}`);
      console.log(`   Duration: ${data.duration}ms`);
      
      // Test GhostLog
      console.log('\n📝 Testing GhostLog...');
      const logResponse = await fetch('http://localhost:3002/api/ghost-log?kind=stripe_smoke_test&limit=5');
      const logData = await logResponse.json();
      
      if (logData.ok) {
        console.log('✅ GhostLog working correctly');
        console.log(`   Found ${logData.logs.length} smoke test logs`);
      } else {
        console.log('⚠️ GhostLog test failed');
      }
      
    } else {
      console.log('❌ $1 Stripe Smoke Test FAILED!');
      console.log(`   Error: ${data.error}`);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Run the test
testStripeSmoke();
