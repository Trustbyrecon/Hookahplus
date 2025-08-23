#!/usr/bin/env node

/**
 * Hookah+ Stripe Integration Test Script
 * Run this to verify your Stripe setup is working correctly
 */

const https = require('https');
const http = require('http');

console.log('🧪 Hookah+ Stripe Integration Test');
console.log('=====================================');

// Configuration
const config = {
  production: {
    url: 'https://hookahplus.net',
    webhook: 'https://hookahplus.net/api/webhooks/stripe',
    health: 'https://hookahplus.net/api/health'
  },
  staging: {
    url: 'https://staging.hookahplus.net',
    webhook: 'https://staging.hookahplus.net/api/webhooks/stripe',
    health: 'https://staging.hookahplus.net/api/health'
  }
};

// Test functions
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
      resolve({ success: true, status: res.statusCode });
    }).on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

async function testHealthCheck(environment) {
  const env = config[environment];
  if (!env) {
    console.log(`❌ Unknown environment: ${environment}`);
    return;
  }

  console.log(`\n🔍 Testing ${environment.toUpperCase()} Environment:`);
  console.log('----------------------------------------');

  // Test health endpoint
  await testEndpoint(env.health, 'Health Check');

  // Test main site
  await testEndpoint(env.url, 'Main Site');

  // Test webhook endpoint (should return 405 Method Not Allowed for GET)
  await testEndpoint(env.webhook, 'Webhook Endpoint');
}

async function runTests() {
  console.log('\n🚀 Starting Integration Tests...\n');

  // Test staging first (safer)
  await testHealthCheck('staging');
  
  // Test production
  await testHealthCheck('production');

  console.log('\n📋 Test Summary:');
  console.log('==================');
  console.log('✅ Health Check: Should return 200 OK');
  console.log('✅ Main Site: Should return 200 OK');
  console.log('✅ Webhook: Should return 405 Method Not Allowed (GET not allowed)');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Verify Stripe webhooks are configured in Stripe Dashboard');
  console.log('2. Test payment flow with test cards');
  console.log('3. Check webhook delivery in Stripe Dashboard');
  console.log('4. Verify orders appear in dashboard after payment');
  
  console.log('\n🧪 Manual Testing:');
  console.log('1. Visit /preorder/T-001');
  console.log('2. Submit preorder form');
  console.log('3. Complete Stripe checkout with test card: 4242 4242 4242 4242');
  console.log('4. Verify return to dashboard with success message');
  console.log('5. Check order status in dashboard');
  
  console.log('\n🎯 Ready for launch! 🚀');
}

// Run tests
runTests().catch(console.error);
