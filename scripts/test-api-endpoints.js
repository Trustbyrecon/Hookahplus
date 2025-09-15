#!/usr/bin/env node

/**
 * HookahPlus API Endpoints Testing Script
 * 
 * This script tests all API endpoints to ensure they're working
 * correctly with the database and Stripe integration.
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  // Update these URLs based on your deployment
  siteUrl: process.env.SITE_URL || 'https://hookahplus-site-1kuwwh4eu-dwaynes-projects-1c5c280a.vercel.app',
  appUrl: process.env.APP_URL || 'https://app-ndnxzy6jl-dwaynes-projects-1c5c280a.vercel.app',
  guestUrl: process.env.GUEST_URL || 'https://guest-98640stzs-dwaynes-projects-1c5c280a.vercel.app',
  
  // Test data
  testVenueId: '550e8400-e29b-41d4-a716-446655440000',
  testTableId: 'T-001',
  testSessionId: 'test-session-123'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };
    
    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }
    
    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test function
async function runTest(name, testFn) {
  console.log(`\n🧪 Testing: ${name}`);
  
  try {
    const result = await testFn();
    if (result.success) {
      console.log(`  ✅ PASSED: ${result.message}`);
      results.passed++;
      results.tests.push({ name, status: 'PASSED', message: result.message });
    } else {
      console.log(`  ❌ FAILED: ${result.message}`);
      results.failed++;
      results.tests.push({ name, status: 'FAILED', message: result.message });
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'ERROR', message: error.message });
  }
}

// Test cases
async function testSiteHealth() {
  const response = await makeRequest(`${config.siteUrl}/`);
  return {
    success: response.status === 200,
    message: `Site homepage returned ${response.status}`
  };
}

async function testAppHealth() {
  const response = await makeRequest(`${config.appUrl}/`);
  return {
    success: response.status === 200,
    message: `App dashboard returned ${response.status}`
  };
}

async function testGuestHealth() {
  const response = await makeRequest(`${config.guestUrl}/`);
  return {
    success: response.status === 200,
    message: `Guest portal returned ${response.status}`
  };
}

async function testSessionStart() {
  const response = await makeRequest(`${config.appUrl}/api/session/start`, {
    method: 'POST',
    body: {
      venueId: config.testVenueId,
      tableId: config.testTableId,
      tier: 'base',
      flavors: ['Double Apple'],
      priceLookupKey: 'price_hookah_session_base'
    }
  });
  
  return {
    success: response.status === 200 && response.data.sessionId,
    message: `Session start returned ${response.status} with sessionId: ${response.data.sessionId}`
  };
}

async function testRefillRequest() {
  const response = await makeRequest(`${config.appUrl}/api/refill/request`, {
    method: 'POST',
    body: {
      venueId: config.testVenueId,
      sessionId: config.testSessionId
    }
  });
  
  return {
    success: response.status === 200 && response.data.refillId,
    message: `Refill request returned ${response.status} with refillId: ${response.data.refillId}`
  };
}

async function testReservationHold() {
  const response = await makeRequest(`${config.appUrl}/api/reserve/hold`, {
    method: 'POST',
    body: {
      venueId: config.testVenueId,
      tableId: config.testTableId
    }
  });
  
  return {
    success: response.status === 200 && response.data.reservationId,
    message: `Reservation hold returned ${response.status} with reservationId: ${response.data.reservationId}`
  };
}

async function testStripeWebhook() {
  const response = await makeRequest(`${config.appUrl}/api/stripe/webhook`, {
    method: 'POST',
    body: {
      type: 'test.event',
      data: { object: { id: 'test' } }
    }
  });
  
  return {
    success: response.status === 400, // Should return 400 for invalid signature
    message: `Stripe webhook returned ${response.status} (expected 400 for test)`
  };
}

async function testGuestExtend() {
  const response = await makeRequest(`${config.guestUrl}/extend`);
  return {
    success: response.status === 200,
    message: `Guest extend page returned ${response.status}`
  };
}

async function testStripeCatalogSync() {
  const response = await makeRequest(`${config.appUrl}/api/stripe-sync`, {
    method: 'POST'
  });
  
  return {
    success: response.status === 200,
    message: `Stripe catalog sync returned ${response.status}`
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting HookahPlus API Endpoint Tests');
  console.log('==========================================');
  
  // Health checks
  await runTest('Site Health Check', testSiteHealth);
  await runTest('App Health Check', testAppHealth);
  await runTest('Guest Health Check', testGuestHealth);
  
  // API endpoints
  await runTest('Session Start API', testSessionStart);
  await runTest('Refill Request API', testRefillRequest);
  await runTest('Reservation Hold API', testReservationHold);
  await runTest('Stripe Webhook API', testStripeWebhook);
  await runTest('Guest Extend Page', testGuestExtend);
  await runTest('Stripe Catalog Sync', testStripeCatalogSync);
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  // Detailed results
  console.log('\n📋 Detailed Results');
  console.log('===================');
  results.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.message}`);
  });
  
  // Recommendations
  if (results.failed > 0) {
    console.log('\n🔧 Recommendations');
    console.log('==================');
    console.log('1. Check environment variables in Vercel');
    console.log('2. Verify Supabase database connection');
    console.log('3. Ensure Stripe keys are configured');
    console.log('4. Check API endpoint implementations');
    console.log('5. Review error logs in Vercel dashboard');
  } else {
    console.log('\n🎉 All tests passed! Your MVP is ready for launch!');
  }
  
  return results.failed === 0;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, makeRequest };
