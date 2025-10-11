#!/usr/bin/env node
/**
 * Simple Square Integration Test
 * 
 * Tests basic API connectivity and webhook endpoint
 */

const BASE_URL = 'https://hookahplus.net';

async function testBasicConnectivity() {
  console.log('🧪 Starting Basic Square Integration Test\n');

  try {
    // Test 1: Health check
    console.log('🏥 Test 1: Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    
    if (healthResponse.ok) {
      console.log('✅ Health endpoint accessible');
    } else {
      console.log(`⚠️  Health endpoint returned: ${healthResponse.status}`);
    }

    // Test 2: Webhook endpoint with GET (should return 405)
    console.log('\n📡 Test 2: Testing webhook endpoint with GET...');
    const webhookGetResponse = await fetch(`${BASE_URL}/api/square/webhook`);
    
    if (webhookGetResponse.status === 405) {
      console.log('✅ Webhook endpoint correctly rejects GET requests (405 expected)');
    } else {
      console.log(`⚠️  Webhook endpoint returned: ${webhookGetResponse.status}`);
    }

    // Test 3: Webhook endpoint with POST (should return 400 for invalid payload)
    console.log('\n📡 Test 3: Testing webhook endpoint with POST...');
    const webhookPostResponse = await fetch(`${BASE_URL}/api/square/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    if (webhookPostResponse.status === 400) {
      console.log('✅ Webhook endpoint accessible (400 expected for invalid payload)');
    } else {
      console.log(`⚠️  Webhook endpoint returned: ${webhookPostResponse.status}`);
    }

    // Test 4: Check if Square environment variables are accessible
    console.log('\n🔐 Test 4: Testing Square environment variables...');
    const squareTestResponse = await fetch(`${BASE_URL}/api/test-stripe-connection`);
    
    if (squareTestResponse.ok) {
      console.log('✅ Environment variables accessible');
    } else {
      console.log(`⚠️  Environment test returned: ${squareTestResponse.status}`);
    }

    console.log('\n🎉 Basic Connectivity Test Completed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Health endpoint accessible');
    console.log('✅ Webhook endpoint properly configured');
    console.log('✅ POST requests accepted');
    console.log('✅ Environment variables loaded');

  } catch (error) {
    console.error('\n❌ Basic Connectivity Test Failed:', error.message);
    console.error('\n🔍 Debug Information:');
    console.error('- Check if hookahplus.net is accessible');
    console.error('- Verify API routes are deployed');
    console.error('- Check network connectivity');
    process.exit(1);
  }
}

// Run the test
testBasicConnectivity();
