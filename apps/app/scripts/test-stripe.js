#!/usr/bin/env node

// Test Stripe connectivity
require('dotenv').config({ path: '.env.local' });

async function testStripe() {
  console.log('Ì¥ç Testing Stripe Integration...\n');
  
  // Check environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
  
  console.log('Ì≥ã Environment Check:');
  console.log(`   STRIPE_SECRET_KEY: ${secretKey ? '‚úÖ Set' : '‚ùå Missing'}`);
  console.log(`   NEXT_PUBLIC_STRIPE_PUBLIC_KEY: ${publicKey ? '‚úÖ Set' : '‚ùå Missing'}`);
  
  if (!secretKey || secretKey.includes('placeholder')) {
    console.log('\n‚ö†Ô∏è  Stripe keys are not configured properly.');
    console.log('   Please update your .env.local file with real Stripe test keys.');
    console.log('   See STRIPE_SETUP_GUIDE.md for instructions.\n');
    return;
  }
  
  if (!publicKey || publicKey.includes('placeholder')) {
    console.log('\n‚ö†Ô∏è  Stripe public key is not configured properly.');
    console.log('   Please update your .env.local file with real Stripe test keys.');
    console.log('   See STRIPE_SETUP_GUIDE.md for instructions.\n');
    return;
  }
  
  try {
    // Test Stripe connection
    const Stripe = require('stripe');
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
    });
    
    console.log('\nÌ¥å Testing Stripe Connection...');
    
    // Test API call
    const account = await stripe.accounts.retrieve();
    console.log(`   ‚úÖ Connected to Stripe account: ${account.id}`);
    console.log(`   ‚úÖ Account type: ${account.type}`);
    console.log(`   ‚úÖ Country: ${account.country}`);
    console.log(`   ‚úÖ Charges enabled: ${account.charges_enabled}`);
    console.log(`   ‚úÖ Payouts enabled: ${account.payouts_enabled}`);
    
    console.log('\nÌæâ Stripe integration is working correctly!');
    console.log('   You can now run test sessions and see them in your Stripe dashboard.');
    
  } catch (error) {
    console.log('\n‚ùå Stripe connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\nÌ¥ß Troubleshooting:');
    console.log('   1. Check that your Stripe secret key is correct');
    console.log('   2. Ensure you are using test keys (sk_test_...)');
    console.log('   3. Verify your Stripe account is active');
    console.log('   4. Check your internet connection');
  }
}

testStripe().catch(console.error);
