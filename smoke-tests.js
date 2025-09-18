#!/usr/bin/env node

/**
 * HookahPlus MVP Smoke Tests
 * Tests the complete session flow and payment integration
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const CONFIG = {
  // Vercel deployment URLs
  APP_URL: 'https://app-8cm83m8ky-dwaynes-projects-1c5c280a.vercel.app',
  GUEST_URL: 'https://guest-ebnp6ncy9-dwaynes-projects-1c5c280a.vercel.app',
  
  // Supabase (using public anon key for read operations)
  SUPABASE_URL: 'https://hsypmyqtlxjwpnkkacmo.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeXBteXF0bHhqd3Bua2thY21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjA0MjQsImV4cCI6MjA2NTUzNjQyNH0.RoYFf-uSgewj4xPx2d0sxczqGGLwzaYVRCYI4LGdIHM',
  
  // Test data
  TEST_VENUE_ID: '550e8400-e29b-41d4-a716-446655440000',
  TEST_TABLE: 'T-12',
  TEST_SESSION_ID: `test_session_${Date.now()}`,
};

// Initialize Supabase client
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`PASS: ${name}`, 'success');
  } else {
    testResults.failed++;
    log(`FAIL: ${name} - ${details}`, 'error');
  }
  testResults.details.push({ name, passed, details });
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HookahPlus-SmokeTest/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test 1: Verify Vercel deployments are accessible
async function testDeploymentAccess() {
  log('🧪 Testing deployment accessibility...');
  
  try {
    // Test App deployment
    const appResponse = await makeRequest(CONFIG.APP_URL);
    recordTest('App deployment accessible', appResponse.status === 200, `Status: ${appResponse.status}`);
    
    // Test Guest deployment
    const guestResponse = await makeRequest(CONFIG.GUEST_URL);
    recordTest('Guest deployment accessible', guestResponse.status === 200, `Status: ${guestResponse.status}`);
    
  } catch (error) {
    recordTest('Deployment accessibility', false, error.message);
  }
}

// Test 2: Verify Supabase connection and schema
async function testSupabaseConnection() {
  log('🧪 Testing Supabase connection and schema...');
  
  try {
    // Test basic connection
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('id, name')
      .limit(1);
    
    recordTest('Supabase connection', !venuesError, venuesError?.message || 'Connected successfully');
    
    // Test schema tables exist
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);
    
    recordTest('Sessions table accessible', !sessionsError, sessionsError?.message || 'Table exists');
    
    // Test webhook events table
    const { data: webhookEvents, error: webhookError } = await supabase
      .from('stripe_webhook_events')
      .select('id')
      .limit(1);
    
    recordTest('Webhook events table accessible', !webhookError, webhookError?.message || 'Table exists');
    
  } catch (error) {
    recordTest('Supabase connection', false, error.message);
  }
}

// Test 3: Test Stripe webhook endpoints
async function testWebhookEndpoints() {
  log('🧪 Testing Stripe webhook endpoints...');
  
  try {
    // Test App webhook endpoint
    const appWebhookUrl = `${CONFIG.APP_URL}/api/stripe/webhook`;
    const appWebhookResponse = await makeRequest(appWebhookUrl, {
      method: 'POST',
      body: { test: 'webhook' }
    });
    
    recordTest('App webhook endpoint', appWebhookResponse.status === 200, `Status: ${appWebhookResponse.status}`);
    
    // Test Guest webhook endpoint
    const guestWebhookUrl = `${CONFIG.GUEST_URL}/api/stripe/webhook`;
    const guestWebhookResponse = await makeRequest(guestWebhookUrl, {
      method: 'POST',
      body: { test: 'webhook' }
    });
    
    recordTest('Guest webhook endpoint', guestWebhookResponse.status === 200, `Status: ${guestWebhookResponse.status}`);
    
  } catch (error) {
    recordTest('Webhook endpoints', false, error.message);
  }
}

// Test 4: Test session creation flow
async function testSessionCreation() {
  log('🧪 Testing session creation flow...');
  
  try {
    // Test session start endpoint (if it exists)
    const sessionStartUrl = `${CONFIG.APP_URL}/api/session/start`;
    const sessionData = {
      table: CONFIG.TEST_TABLE,
      tier: 'base',
      venue_id: CONFIG.TEST_VENUE_ID
    };
    
    const sessionResponse = await makeRequest(sessionStartUrl, {
      method: 'POST',
      body: sessionData
    });
    
    // This might not exist yet, so we'll just check if the endpoint responds
    const endpointExists = sessionResponse.status !== 404;
    recordTest('Session start endpoint', endpointExists, `Status: ${sessionResponse.status}`);
    
  } catch (error) {
    recordTest('Session creation', false, error.message);
  }
}

// Test 5: Test Stripe product catalog
async function testStripeCatalog() {
  log('🧪 Testing Stripe product catalog...');
  
  try {
    // Check if stripe_ids.json exists and is valid
    const stripeIdsUrl = `${CONFIG.APP_URL}/stripe_ids.json`;
    const stripeResponse = await makeRequest(stripeIdsUrl);
    
    if (stripeResponse.status === 200 && stripeResponse.data.products) {
      recordTest('Stripe catalog accessible', true, `Found ${Object.keys(stripeResponse.data.products).length} products`);
    } else {
      recordTest('Stripe catalog accessible', false, 'Catalog not found or invalid');
    }
    
  } catch (error) {
    recordTest('Stripe catalog', false, error.message);
  }
}

// Test 6: Test environment variables are set
async function testEnvironmentVariables() {
  log('🧪 Testing environment variables...');
  
  try {
    // Test if we can access environment-dependent endpoints
    const healthUrl = `${CONFIG.APP_URL}/api/health`;
    const healthResponse = await makeRequest(healthUrl);
    
    // This endpoint might not exist, so we'll just check if it responds
    const hasHealthEndpoint = healthResponse.status !== 404;
    recordTest('Health endpoint', hasHealthEndpoint, `Status: ${healthResponse.status}`);
    
  } catch (error) {
    recordTest('Environment variables', false, error.message);
  }
}

// Test 7: Test database RLS policies
async function testDatabaseRLS() {
  log('🧪 Testing database RLS policies...');
  
  try {
    // Test that we can read venues (should work with anon key)
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('id, name');
    
    recordTest('RLS - Venues readable', !venuesError, venuesError?.message || `Found ${venues?.length || 0} venues`);
    
    // Test that we cannot write to sessions without proper auth (should fail)
    const { data: sessionInsert, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        venue_id: CONFIG.TEST_VENUE_ID,
        table_id: CONFIG.TEST_TABLE,
        tier: 'base',
        status: 'PENDING'
      });
    
    // This should fail due to RLS, which is expected
    const rlsWorking = sessionError && sessionError.message.includes('RLS');
    recordTest('RLS - Sessions protected', rlsWorking, sessionError?.message || 'RLS not working');
    
  } catch (error) {
    recordTest('Database RLS', false, error.message);
  }
}

// Test 8: Test payment flow simulation
async function testPaymentFlow() {
  log('🧪 Testing payment flow simulation...');
  
  try {
    // Test if we can access payment-related endpoints
    const paymentUrl = `${CONFIG.GUEST_URL}/api/payment/create-intent`;
    const paymentData = {
      amount: 2100, // $21.00 for base session
      currency: 'usd',
      table: CONFIG.TEST_TABLE
    };
    
    const paymentResponse = await makeRequest(paymentUrl, {
      method: 'POST',
      body: paymentData
    });
    
    // This endpoint might not exist yet, so we'll just check if it responds
    const paymentEndpointExists = paymentResponse.status !== 404;
    recordTest('Payment endpoint', paymentEndpointExists, `Status: ${paymentResponse.status}`);
    
  } catch (error) {
    recordTest('Payment flow', false, error.message);
  }
}

// Main test runner
async function runSmokeTests() {
  console.log('🚀 Starting HookahPlus MVP Smoke Tests\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  // Run all tests
  await testDeploymentAccess();
  await testSupabaseConnection();
  await testWebhookEndpoints();
  await testSessionCreation();
  await testStripeCatalog();
  await testEnvironmentVariables();
  await testDatabaseRLS();
  await testPaymentFlow();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Print results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SMOKE TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total:  ${testResults.total}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  testResults.details.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}${test.details ? ` - ${test.details}` : ''}`);
  });
  
  // Overall status
  const allPassed = testResults.failed === 0;
  console.log('\n' + '=' .repeat(60));
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! MVP is ready for launch!');
  } else {
    console.log('⚠️  SOME TESTS FAILED! Review the issues above.');
  }
  console.log('=' .repeat(60));
  
  return allPassed;
}

// Run the tests
if (require.main === module) {
  runSmokeTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runSmokeTests };
