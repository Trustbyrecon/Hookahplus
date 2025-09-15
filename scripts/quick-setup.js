#!/usr/bin/env node

/**
 * HookahPlus Quick Setup Script
 * 
 * This script helps configure the MVP with valid Stripe keys
 * and environment variables.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 HookahPlus MVP Quick Setup');
  console.log('=============================\n');
  
  console.log('This script will help you configure the MVP with valid Stripe keys.');
  console.log('You can get these keys from: https://dashboard.stripe.com/test/apikeys\n');
  
  // Get Stripe keys
  const stripeSecretKey = await question('Enter your Stripe Secret Key (sk_test_...): ');
  const stripePublishableKey = await question('Enter your Stripe Publishable Key (pk_test_...): ');
  const stripeWebhookSecret = await question('Enter your Stripe Webhook Secret (whsec_...): ');
  
  // Get Supabase keys
  console.log('\nNow let\'s configure Supabase. You can get these from: https://supabase.com/dashboard');
  const supabaseUrl = await question('Enter your Supabase URL (https://...supabase.co): ');
  const supabaseAnonKey = await question('Enter your Supabase Anon Key: ');
  const databaseUrl = await question('Enter your Database URL (postgres://...): ');
  
  // Create .env.local file
  const envContent = `# Stripe Configuration
STRIPE_SECRET_KEY=${stripeSecretKey}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}
STRIPE_WEBHOOK_SECRET_TEST=${stripeWebhookSecret}

# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
DATABASE_URL=${databaseUrl}

# App URLs
NEXT_PUBLIC_APP_URL=https://app-ndnxzy6jl-dwaynes-projects-1c5c280a.vercel.app
NEXT_PUBLIC_GUEST_URL=https://guest-98640stzs-dwaynes-projects-1c5c280a.vercel.app
NEXT_PUBLIC_SITE_URL=https://hookahplus-site-1kuwwh4eu-dwaynes-projects-1c5c280a.vercel.app

# Session Configuration
SESSION_DEFAULT_MINUTES=90

# Feature Flags
FEATURE_FLAGS={"happyHour": true, "extensions": true, "reservations": true}
`;

  // Write .env.local file
  fs.writeFileSync('.env.local', envContent);
  console.log('\n✅ .env.local file created successfully!');
  
  // Test Stripe connection
  console.log('\n🧪 Testing Stripe connection...');
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    
    // Test API key
    const products = await stripe.products.list({ limit: 1 });
    console.log('✅ Stripe connection successful!');
    
    // Run catalog sync
    console.log('\n🔄 Syncing Stripe catalog...');
    const { syncStripeCatalog } = require('./sync-stripe-catalog.js');
    await syncStripeCatalog();
    
  } catch (error) {
    console.log('❌ Stripe connection failed:', error.message);
    console.log('Please check your API keys and try again.');
  }
  
  // Show next steps
  console.log('\n📋 Next Steps:');
  console.log('1. Configure Vercel environment variables');
  console.log('2. Deploy Supabase schema');
  console.log('3. Redeploy applications');
  console.log('4. Run API endpoint tests');
  console.log('5. Configure Stripe webhooks');
  
  console.log('\n📚 Setup Guides:');
  console.log('- Database: scripts/setup-supabase.md');
  console.log('- Environment: scripts/setup-environment.md');
  console.log('- Stripe Keys: scripts/setup-stripe-keys.md');
  
  rl.close();
}

main().catch(console.error);
