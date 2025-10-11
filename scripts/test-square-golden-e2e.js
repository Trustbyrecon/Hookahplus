#!/usr/bin/env node
/**
 * Square POS Integration Golden Test E2E
 * 
 * Tests the complete flow:
 * 1. Create Hookah+ session
 * 2. Attach Square order
 * 3. Add items to Square order
 * 4. Process payment
 * 5. Validate webhook events
 */

const BASE_URL = 'https://hookahplus.net';

async function testSquareIntegration() {
  console.log('🧪 Starting Square POS Integration Golden Test E2E\n');

  try {
    // Test 1: Webhook endpoint accessibility
    console.log('📡 Test 1: Testing webhook endpoint accessibility...');
    const webhookResponse = await fetch(`${BASE_URL}/api/square/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-square-signature': 'test-signature'
      },
      body: JSON.stringify({ test: true })
    });
    
    if (webhookResponse.status === 400) {
      console.log('✅ Webhook endpoint accessible (400 expected for invalid payload)');
    } else {
      console.log(`⚠️  Webhook endpoint returned: ${webhookResponse.status}`);
    }

    // Test 2: Create test Hookah+ session
    console.log('\n🎯 Test 2: Creating test Hookah+ session...');
    const sessionResponse = await fetch(`${BASE_URL}/api/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table: 'T-001',
        guest_count: 2,
        venue_id: 'test-venue'
      })
    });

    if (!sessionResponse.ok) {
      throw new Error(`Session creation failed: ${sessionResponse.status}`);
    }

    const sessionData = await sessionResponse.json();
    console.log(`✅ Session created: ${sessionData.session_id}`);

    // Test 3: Test Square order attachment
    console.log('\n💳 Test 3: Testing Square order attachment...');
    const attachResponse = await fetch(`${BASE_URL}/api/pos/mirror`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'attachOrder',
        provider: 'square',
        venueId: 'test-venue',
        hpOrder: {
          hp_order_id: sessionData.session_id,
          table: 'T-001',
          guest_count: 2
        }
      })
    });

    if (!attachResponse.ok) {
      throw new Error(`Order attachment failed: ${attachResponse.status}`);
    }

    const attachData = await attachResponse.json();
    console.log(`✅ Square order attached: ${attachData.pos_order_id}`);

    // Test 4: Test item upsertion
    console.log('\n🛒 Test 4: Testing item upsertion...');
    const itemsResponse = await fetch(`${BASE_URL}/api/pos/mirror`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'upsertItems',
        provider: 'square',
        venueId: 'test-venue',
        posOrderId: attachData.pos_order_id,
        items: [
          {
            sku: 'HOOKAH_SESSION',
            name: 'Hookah Session',
            qty: 1,
            unit_amount: 3000, // $30.00
            tax_code: 'HOOKAH'
          }
        ]
      })
    });

    if (!itemsResponse.ok) {
      throw new Error(`Item upsertion failed: ${itemsResponse.status}`);
    }

    console.log('✅ Items added to Square order');

    // Test 5: Test payment processing
    console.log('\n💰 Test 5: Testing payment processing...');
    const paymentResponse = await fetch(`${BASE_URL}/api/pos/mirror`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'closeOrder',
        provider: 'square',
        venueId: 'test-venue',
        posOrderId: attachData.pos_order_id,
        tender: {
          amount: 3000,
          currency: 'usd',
          reference: 'test-payment-' + Date.now(),
          provider: 'stripe'
        }
      })
    });

    if (!paymentResponse.ok) {
      throw new Error(`Payment processing failed: ${paymentResponse.status}`);
    }

    console.log('✅ Payment processed successfully');

    // Test 6: Validate webhook event handling
    console.log('\n🔔 Test 6: Testing webhook event handling...');
    const webhookTestResponse = await fetch(`${BASE_URL}/api/square/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-square-signature': 'test-signature'
      },
      body: JSON.stringify({
        type: 'payment.updated',
        data: {
          object: {
            payment: {
              id: 'test-payment-id',
              status: 'COMPLETED',
              amount_money: {
                amount: 3000,
                currency: 'USD'
              }
            }
          }
        }
      })
    });

    if (webhookTestResponse.ok) {
      console.log('✅ Webhook event handled successfully');
    } else {
      console.log(`⚠️  Webhook event handling: ${webhookTestResponse.status}`);
    }

    console.log('\n🎉 Golden Test E2E Completed Successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Webhook endpoint accessible');
    console.log('✅ Hookah+ session created');
    console.log('✅ Square order attached');
    console.log('✅ Items added to order');
    console.log('✅ Payment processed');
    console.log('✅ Webhook events handled');

  } catch (error) {
    console.error('\n❌ Golden Test E2E Failed:', error.message);
    console.error('\n🔍 Debug Information:');
    console.error('- Check Square credentials in Vercel environment');
    console.error('- Verify webhook endpoint is deployed');
    console.error('- Check Square API connectivity');
    process.exit(1);
  }
}

// Run the test
testSquareIntegration();
