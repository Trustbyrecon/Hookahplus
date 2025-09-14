#!/usr/bin/env node

/**
 * Webhook Configuration Test Script
 * Verifies Stripe webhook secret is properly configured
 */

const fs = require('fs');
const path = require('path');

function testWebhookConfig() {
  console.log('🔧 Testing Webhook Configuration...\n');

  const envPath = path.join(process.cwd(), '.env.local');
  const expectedSecret = 'whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI';

  // Check if .env.local exists
  if (!fs.existsSync(envPath)) {
    console.log('   ❌ .env.local not found');
    console.log('   Run: node scripts/setup-stripe-env.js');
    return false;
  }

  // Read .env.local content
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if webhook secret is configured
  if (envContent.includes(expectedSecret)) {
    console.log('   ✅ Webhook secret is properly configured');
    console.log(`   ✅ Secret: ${expectedSecret}`);
  } else {
    console.log('   ❌ Webhook secret not found in .env.local');
    console.log('   Please add: STRIPE_WEBHOOK_SECRET_TEST=whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI');
    return false;
  }

  // Check if .gitignore protects the file
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignoreContent.includes('.env.local')) {
      console.log('   ✅ .env.local is protected by .gitignore');
    } else {
      console.log('   ⚠️  .env.local may not be protected by .gitignore');
    }
  }

  console.log('\n🔗 Webhook Configuration:');
  console.log('   Endpoint: https://your-app.vercel.app/api/stripe-webhook');
  console.log('   Secret: whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI');
  console.log('   Events: payment_intent.succeeded, payment_intent.payment_failed');

  console.log('\n📋 Next Steps:');
  console.log('1. Deploy to Vercel: vercel --prod');
  console.log('2. Configure webhook in Stripe Dashboard');
  console.log('3. Add environment variables to Vercel');
  console.log('4. Test webhook functionality');

  return true;
}

// Run test
testWebhookConfig();
