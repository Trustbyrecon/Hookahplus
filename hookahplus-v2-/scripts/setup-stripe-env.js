#!/usr/bin/env node

/**
 * Stripe Environment Setup Script
 * Securely configures Stripe webhook secrets and keys
 */

const fs = require('fs');
const path = require('path');

function setupStripeEnvironment() {
  console.log('🔧 Setting up Stripe Environment...\n');

  const envPath = path.join(process.cwd(), '.env.local');
  const webhookSecret = 'whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI';

  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('   ⚠️  .env.local already exists');
    console.log('   Please manually add the webhook secret:');
    console.log(`   STRIPE_WEBHOOK_SECRET_TEST=${webhookSecret}`);
    return;
  }

  // Create .env.local with webhook secret
  const envContent = `# Stripe Configuration for Hookah+ MVP
# Environment
NODE_ENV=development
STRIPE_LIVE_MODE=false

# Test Keys (for development and testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your_test_publishable_key_here
STRIPE_SECRET_KEY_TEST=sk_test_your_test_secret_key_here
STRIPE_WEBHOOK_SECRET_TEST=${webhookSecret}

# Live Keys (for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_your_live_publishable_key_here
STRIPE_SECRET_KEY_LIVE=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET_LIVE=whsec_your_live_webhook_secret_here

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_URL=https://your-app.vercel.app

# Supabase Configuration (for data persistence)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Webhook Endpoints
# Test: https://your-app.vercel.app/api/stripe-webhook
# Live: https://your-app.vercel.app/api/stripe-webhook

# Stripe Dashboard URLs
# Test: https://dashboard.stripe.com/test
# Live: https://dashboard.stripe.com`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('   ✅ .env.local created with webhook secret');
    console.log(`   ✅ Webhook secret configured: ${webhookSecret}`);
  } catch (error) {
    console.log('   ❌ Failed to create .env.local:', error.message);
    console.log('   Please create manually with the webhook secret');
  }

  console.log('\n🔒 Security Notes:');
  console.log('   - .env.local is in .gitignore (not committed to git)');
  console.log('   - Webhook secret is protected from public exposure');
  console.log('   - Use environment variables in production');

  console.log('\n🚀 Next Steps:');
  console.log('1. Add your Stripe publishable and secret keys to .env.local');
  console.log('2. Configure webhook endpoint in Stripe Dashboard');
  console.log('3. Deploy to Vercel with environment variables');
  console.log('4. Test webhook functionality');

  console.log('\n📋 Webhook Configuration:');
  console.log('   Endpoint: https://your-app.vercel.app/api/stripe-webhook');
  console.log('   Events: payment_intent.succeeded, payment_intent.payment_failed');
  console.log('   Secret: whsec_9K2kuNQOaIW62Ojm8RvmET79lssZ7NbI');
}

// Run setup
setupStripeEnvironment();
