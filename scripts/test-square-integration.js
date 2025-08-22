#!/usr/bin/env node

/**
 * Square POS Integration Test Script
 * 
 * Usage:
 * 1. Set environment variables (see below)
 * 2. Run: node scripts/test-square-integration.js
 * 
 * Environment Variables Required:
 * SQUARE_ENV=sandbox
 * SQUARE_ACCESS_TOKEN=EAAA_sandbox_xxxxxxxxxxxxxxxxx
 * SQUARE_LOCATION_ID=XXXXXXXXXXXX
 * TRUSTLOCK_SECRET=super-long-random-string
 */

const crypto = require('crypto');

// Mock environment variables for testing
process.env.SQUARE_ENV = process.env.SQUARE_ENV || 'sandbox';
process.env.SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || 'EAAA_sandbox_xxxxxxxxxxxxxxxxx';
process.env.SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || 'XXXXXXXXXXXX';
process.env.TRUSTLOCK_SECRET = process.env.TRUSTLOCK_SECRET || 'super-long-random-string';

// Import the Square adapter
const { createSquareAdapter } = require('../lib/pos/square');

// Test data
const testOrder = {
  hp_order_id: `test_${Date.now()}`,
  venue_id: 'hookahplus_main',
  table: 'A1',
  guest_count: 2,
  items: [
    {
      sku: 'FLAVOR_001',
      name: 'Double Apple Hookah',
      qty: 1,
      unit_amount: 2500, // $25.00
      notes: 'Fresh coals, extra flavor'
    },
    {
      sku: 'DRINK_001',
      name: 'Mint Tea',
      qty: 2,
      unit_amount: 500, // $5.00
      notes: 'Hot, no sugar'
    }
  ],
  totals: {
    subtotal: 3500, // $35.00
    grand_total: 3780 // $37.80 (8% tax)
  },
  payment: {
    mode: 'external',
    provider: 'stripe',
    payment_intent: `pi_test_${Date.now()}`,
    status: 'succeeded',
    amount: 3780
  },
  trust_lock: {
    sig: crypto.createHmac('sha256', process.env.TRUSTLOCK_SECRET)
      .update(`test_${Date.now()}`)
      .digest('hex')
  }
};

async function testSquareIntegration() {
  console.log('🚀 Starting Square POS Integration Test...\n');
  
  try {
    // Initialize Square adapter
    console.log('1️⃣ Initializing Square adapter...');
    const squareAdapter = createSquareAdapter();
    console.log('✅ Square adapter initialized successfully\n');

    // Test capabilities
    console.log('2️⃣ Testing adapter capabilities...');
    const capabilities = await squareAdapter.capabilities();
    console.log('📊 Capabilities:', capabilities);
    console.log('✅ Capabilities test passed\n');

    // Test order attachment
    console.log('3️⃣ Testing order attachment...');
    const attachResult = await squareAdapter.attachOrder(testOrder);
    console.log('📋 Attach result:', attachResult);
    console.log('✅ Order attachment test passed\n');

    // Test item upsert
    console.log('4️⃣ Testing item upsert...');
    const updatedItems = [
      ...testOrder.items,
      {
        sku: 'SNACK_001',
        name: 'Mixed Nuts',
        qty: 1,
        unit_amount: 800, // $8.00
        notes: 'Premium selection'
      }
    ];
    await squareAdapter.upsertItems(attachResult.pos_order_id, updatedItems);
    console.log('✅ Item upsert test passed\n');

    // Test order closure with external tender
    console.log('5️⃣ Testing order closure with external tender...');
    const externalTender = {
      provider: 'stripe',
      reference: testOrder.payment.payment_intent,
      amount: 4580, // $45.80 (updated total)
      currency: 'USD'
    };
    await squareAdapter.closeOrder(attachResult.pos_order_id, externalTender);
    console.log('✅ Order closure test passed\n');

    console.log('🎉 All tests passed! Square integration is working correctly.\n');
    console.log('📝 Test Summary:');
    console.log(`   - Order ID: ${attachResult.pos_order_id}`);
    console.log(`   - Hookah+ Order ID: ${testOrder.hp_order_id}`);
    console.log(`   - Items: ${updatedItems.length}`);
    console.log(`   - Total Amount: $${(externalTender.amount / 100).toFixed(2)}`);
    console.log(`   - Payment Provider: ${externalTender.provider}`);
    console.log(`   - Environment: ${process.env.SQUARE_ENV}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔍 Debug information:');
    console.error('   - Check your Square credentials');
    console.error('   - Verify SQUARE_LOCATION_ID is correct');
    console.error('   - Ensure you have sandbox access');
    console.error('   - Check Square API documentation for any changes');
    process.exit(1);
  }
}

// Helper function to validate environment
function validateEnvironment() {
  const required = [
    'SQUARE_ENV',
    'SQUARE_ACCESS_TOKEN', 
    'SQUARE_LOCATION_ID',
    'TRUSTLOCK_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Set these in your .env file or export them before running the script.');
    process.exit(1);
  }

  if (process.env.SQUARE_ACCESS_TOKEN === 'EAAA_sandbox_xxxxxxxxxxxxxxxxx') {
    console.warn('⚠️  Using placeholder Square access token. Please set SQUARE_ACCESS_TOKEN.');
  }

  if (process.env.SQUARE_LOCATION_ID === 'XXXXXXXXXXXX') {
    console.warn('⚠️  Using placeholder location ID. Please set SQUARE_LOCATION_ID.');
  }
}

// Run the test
if (require.main === module) {
  validateEnvironment();
  testSquareIntegration();
}

module.exports = { testSquareIntegration };
