/**
 * Test Stripe Webhook Endpoint
 * Tests the production webhook endpoint for proper configuration
 */

import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://hookahplus.net/api/webhooks/stripe';
const TEST_PAYLOAD = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123',
      object: 'checkout.session',
      amount_total: 2100,
      currency: 'usd',
      customer_details: {
        phone: '+1234567890'
      },
      metadata: {
        loungeId: 'test-lounge',
        tableId: 'T-001'
      }
    }
  }
};

async function testWebhook() {
  console.log('🧪 Testing Stripe Webhook Endpoint...\n');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'test_signature'
      },
      body: JSON.stringify(TEST_PAYLOAD)
    });

    const responseText = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${responseText}`);
    
    if (response.status === 200) {
      console.log('✅ Webhook endpoint is responding');
    } else {
      console.log('❌ Webhook endpoint returned error');
    }
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }
}

// Run the test
testWebhook();
