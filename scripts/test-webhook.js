#!/usr/bin/env node

/**
 * Test script for Stripe webhook functionality
 * Run with: node scripts/test-webhook.js
 */

const https = require('https');
const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/stripe';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Test payloads
const testEvents = {
  checkout_session_completed: {
    id: 'evt_test_webhook',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        object: 'checkout.session',
        amount_total: 4000, // $40.00
        metadata: {
          hp_reservation_id: 'r_2025_01_15_1830_01',
          hp_venue_id: 'v_001',
          hp_table: 'T12',
          hp_party_size: '4',
          hp_slot_start_iso: '2025-01-15T18:30:00-05:00',
          hp_slot_end_iso: '2025-01-15T20:00:00-05:00',
          hp_policy_version: 'dep_v1.2'
        }
      }
    }
  },
  payment_intent_succeeded: {
    id: 'evt_test_webhook_2',
    object: 'event',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_123',
        object: 'payment_intent',
        amount: 8450, // $84.50
        metadata: {
          hp_reservation_id: 'r_2025_01_15_1830_01',
          hp_table: 'T12',
          hp_items: JSON.stringify([
            { name: 'Hookah Mint', qty: 1, unit: 3000 },
            { name: 'Coal Refresh', qty: 2, unit: 500 },
            { name: 'Water', qty: 2, unit: 200 }
          ])
        }
      }
    }
  },
  charge_dispute_created: {
    id: 'evt_test_webhook_3',
    object: 'event',
    type: 'charge.dispute.created',
    data: {
      object: {
        id: 'dp_test_123',
        object: 'dispute',
        charge: 'ch_test_123',
        amount: 4000,
        reason: 'fraudulent'
      }
    }
  }
};

function createStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${payloadString}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

function makeRequest(url, payload, signature) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Stripe-Signature': signature
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function testWebhook(eventName, eventData) {
  console.log(`\n🧪 Testing ${eventName}...`);
  
  try {
    const signature = createStripeSignature(eventData, STRIPE_WEBHOOK_SECRET);
    const response = await makeRequest(WEBHOOK_URL, eventData, signature);
    
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📄 Response: ${response.body}`);
    
    if (response.statusCode === 200) {
      console.log(`🎉 ${eventName} test passed!`);
    } else {
      console.log(`❌ ${eventName} test failed!`);
    }
  } catch (error) {
    console.log(`❌ ${eventName} test error:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Stripe Webhook Tests');
  console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
  console.log(`🔑 Using webhook secret: ${STRIPE_WEBHOOK_SECRET.substring(0, 10)}...`);
  
  // Test all events
  await testWebhook('checkout.session.completed', testEvents.checkout_session_completed);
  await testWebhook('payment_intent.succeeded', testEvents.payment_intent_succeeded);
  await testWebhook('charge.dispute.created', testEvents.charge_dispute_created);
  
  console.log('\n✨ All tests completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check your webhook logs in Vercel Dashboard');
  console.log('2. Verify events are being processed correctly');
  console.log('3. Test with real Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testWebhook, testEvents };
