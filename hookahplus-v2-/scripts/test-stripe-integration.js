#!/usr/bin/env node

/**
 * Stripe Integration Test Script
 * Tests the complete Stripe integration flow for Hookah+ MVP
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testStripeIntegration() {
  console.log('🚀 Starting Stripe Integration Tests...\n');

  try {
    // Test 1: Product Catalog Sync
    console.log('📦 Test 1: Syncing Product Catalog to Stripe...');
    const syncResponse = await fetch(`${BASE_URL}/api/stripe-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (syncResponse.ok) {
      const syncData = await syncResponse.json();
      console.log('✅ Product catalog sync successful');
      console.log(`   - Sessions: ${syncData.results.sessions}`);
      console.log(`   - Flavors: ${syncData.results.flavors}`);
      console.log(`   - Bundles: ${syncData.results.bundles}`);
      console.log(`   - Memberships: ${syncData.results.memberships}`);
      console.log(`   - Errors: ${syncData.results.errors}`);
    } else {
      console.log('❌ Product catalog sync failed');
      const error = await syncResponse.text();
      console.log(`   Error: ${error}`);
    }

    // Test 2: Payment Intent Creation (Test Mode)
    console.log('\n💳 Test 2: Creating Payment Intent (Test Mode)...');
    const paymentData = {
      sessionId: 'session_test_' + Date.now(),
      tableId: 'T-001',
      customerName: 'Test Customer',
      customerEmail: 'test@hookahplus.com',
      customerPhone: '+1234567890',
      flavors: ['Double Apple', 'Mint'],
      totalAmount: 2500, // $25.00
      isTestMode: true,
      membershipTier: 'silver',
      isBundle: false,
      specialInstructions: 'Test payment for Stripe integration'
    };

    const paymentResponse = await fetch(`${BASE_URL}/api/stripe-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    if (paymentResponse.ok) {
      const payment = await paymentResponse.json();
      console.log('✅ Payment intent created successfully');
      console.log(`   - Payment Intent ID: ${payment.paymentIntentId}`);
      console.log(`   - Amount: $${(payment.amount / 100).toFixed(2)}`);
      console.log(`   - Test Mode: ${payment.isTestMode}`);
      console.log(`   - Dynamic Price: $${(payment.dynamicPrice / 100).toFixed(2)}`);
      console.log(`   - Original Amount: $${(payment.originalAmount / 100).toFixed(2)}`);
    } else {
      console.log('❌ Payment intent creation failed');
      const error = await paymentResponse.text();
      console.log(`   Error: ${error}`);
    }

    // Test 3: Checkout Session Creation
    console.log('\n🛒 Test 3: Creating Checkout Session...');
    const checkoutData = {
      sessionId: 'session_checkout_' + Date.now(),
      tableId: 'T-002',
      customerName: 'Checkout Customer',
      customerEmail: 'checkout@hookahplus.com',
      customerPhone: '+1234567890',
      flavors: ['Grape', 'Strawberry'],
      totalAmount: 3500, // $35.00
      isTestMode: true,
      membershipTier: 'gold',
      isBundle: true,
      specialInstructions: 'Test checkout for Stripe integration'
    };

    const checkoutResponse = await fetch(`${BASE_URL}/api/stripe-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData)
    });

    if (checkoutResponse.ok) {
      const checkout = await checkoutResponse.json();
      console.log('✅ Checkout session created successfully');
      console.log(`   - Checkout URL: ${checkout.checkoutUrl}`);
      console.log(`   - Session ID: ${checkout.sessionId}`);
      console.log(`   - Amount: $${(checkout.amount / 100).toFixed(2)}`);
      console.log(`   - Test Mode: ${checkout.isTestMode}`);
      console.log(`   - Bundle Discount Applied: ${checkout.isBundle}`);
    } else {
      console.log('❌ Checkout session creation failed');
      const error = await checkoutResponse.text();
      console.log(`   Error: ${error}`);
    }

    // Test 4: Dynamic Pricing Calculation
    console.log('\n💰 Test 4: Testing Dynamic Pricing...');
    const pricingTests = [
      {
        name: 'Peak Hours (Friday 8 PM)',
        basePrice: 2500,
        context: { hour: '20:00', day: 'friday', isMember: false, isBundle: false }
      },
      {
        name: 'Quiet Hours (Tuesday 3 PM)',
        basePrice: 2500,
        context: { hour: '15:00', day: 'tuesday', isMember: false, isBundle: false }
      },
      {
        name: 'Gold Member (Weekend)',
        basePrice: 2500,
        context: { hour: '19:00', day: 'saturday', isMember: true, membershipTier: 'gold', isBundle: false }
      },
      {
        name: 'Bundle Discount (Weekday)',
        basePrice: 2500,
        context: { hour: '18:00', day: 'wednesday', isMember: false, isBundle: true }
      }
    ];

    for (const test of pricingTests) {
      const pricingResponse = await fetch(`${BASE_URL}/api/stripe-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session_pricing_' + Date.now(),
          tableId: 'T-003',
          customerName: 'Pricing Test',
          totalAmount: test.basePrice,
          isTestMode: true,
          ...test.context
        })
      });

      if (pricingResponse.ok) {
        const pricing = await pricingResponse.json();
        const originalPrice = test.basePrice / 100;
        const finalPrice = pricing.amount / 100;
        const discount = ((originalPrice - finalPrice) / originalPrice * 100).toFixed(1);
        
        console.log(`   ${test.name}:`);
        console.log(`     Original: $${originalPrice.toFixed(2)}`);
        console.log(`     Final: $${finalPrice.toFixed(2)}`);
        console.log(`     Discount: ${discount}%`);
      }
    }

    // Test 5: Webhook Simulation
    console.log('\n🔗 Test 5: Testing Webhook Endpoints...');
    const webhookResponse = await fetch(`${BASE_URL}/api/stripe-webhook`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_' + Date.now(),
            metadata: {
              sessionId: 'session_webhook_' + Date.now(),
              tableId: 'T-004',
              customerName: 'Webhook Test'
            }
          }
        }
      })
    });

    if (webhookResponse.ok) {
      console.log('✅ Webhook endpoint is accessible');
    } else {
      console.log('❌ Webhook endpoint test failed');
      const error = await webhookResponse.text();
      console.log(`   Error: ${error}`);
    }

    console.log('\n🎉 Stripe Integration Tests Completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure live Stripe keys in environment variables');
    console.log('2. Set up webhook endpoints in Stripe Dashboard');
    console.log('3. Test with real payment methods');
    console.log('4. Deploy to production environment');
    console.log('5. Monitor payment flows and webhook events');

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run the tests
testStripeIntegration();