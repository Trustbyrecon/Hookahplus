#!/usr/bin/env node

/**
 * Production Webhook Testing Script
 * Tests Stripe and Square webhook endpoints in production
 */

const https = require('https');
const crypto = require('crypto');

// Configuration
const PRODUCTION_URL = 'https://hookahplus.net';
const STRIPE_WEBHOOK_URL = `${PRODUCTION_URL}/api/stripe/webhook`;
const SQUARE_WEBHOOK_URL = `${PRODUCTION_URL}/api/square/webhook`;

// Test data
const STRIPE_TEST_EVENT = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_test_webhook',
      amount: 3500,
      currency: 'usd',
      status: 'succeeded',
      metadata: {
        session_id: 'test_session_123',
        table_id: 'T-001'
      }
    }
  }
};

const SQUARE_TEST_EVENT = {
  merchant_id: 'test_merchant',
  type: 'payment.created',
  event_id: 'test_event_123',
  created_at: new Date().toISOString(),
  data: {
    object: {
      payment: {
        id: 'test_payment_123',
        amount_money: {
          amount: 3500,
          currency: 'USD'
        },
        status: 'COMPLETED',
        metadata: {
          session_id: 'test_session_123',
          table_id: 'T-001'
        }
      }
    }
  }
};

/**
 * Make HTTPS request
 */
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Generate Square webhook signature
 */
function generateSquareSignature(body, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  return hmac.digest('base64');
}

/**
 * Test Stripe webhook
 */
async function testStripeWebhook() {
  console.log('🧪 Testing Stripe webhook...');
  
  try {
    const response = await makeRequest(STRIPE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=1234567890,v1=test_signature'
      }
    }, STRIPE_TEST_EVENT);

    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${response.body}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Stripe webhook test passed');
    } else {
      console.log('   ❌ Stripe webhook test failed');
    }
  } catch (error) {
    console.log(`   ❌ Stripe webhook test error: ${error.message}`);
  }
}

/**
 * Test Square webhook
 */
async function testSquareWebhook() {
  console.log('🧪 Testing Square webhook...');
  
  try {
    const body = JSON.stringify(SQUARE_TEST_EVENT);
    const signature = generateSquareSignature(body, 'test_secret');
    
    const response = await makeRequest(SQUARE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-square-signature': signature
      }
    }, SQUARE_TEST_EVENT);

    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${response.body}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Square webhook test passed');
    } else {
      console.log('   ❌ Square webhook test failed');
    }
  } catch (error) {
    console.log(`   ❌ Square webhook test error: ${error.message}`);
  }
}

/**
 * Test health endpoints
 */
async function testHealthEndpoints() {
  console.log('🏥 Testing health endpoints...');
  
  const endpoints = [
    '/api/health',
    '/api/stripe-health',
    '/api/metrics/live'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${PRODUCTION_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`   ${endpoint}: ${response.statusCode} ${response.statusCode === 200 ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   ${endpoint}: ❌ ${error.message}`);
    }
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Production Webhook Testing');
  console.log('============================');
  console.log(`Production URL: ${PRODUCTION_URL}`);
  console.log('');

  await testHealthEndpoints();
  console.log('');
  
  await testStripeWebhook();
  console.log('');
  
  await testSquareWebhook();
  console.log('');

  console.log('✅ Webhook testing complete');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Verify webhook endpoints are accessible');
  console.log('2. Configure actual webhook secrets in production');
  console.log('3. Test with real Stripe/Square events');
  console.log('4. Monitor webhook delivery in dashboards');
}

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testStripeWebhook,
  testSquareWebhook,
  testHealthEndpoints
};
