#!/usr/bin/env node

/**
 * Simple Environment Verification Script
 * Reads .env.production file directly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Production Environment Verification');
console.log('=====================================\n');

// Read .env.production file
const envFile = path.join(__dirname, '..', '.env.production');

if (!fs.existsSync(envFile)) {
  console.log('❌ .env.production file not found');
  console.log('Please run: cp env.production.template .env.production');
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=');
    }
  }
});

// Check required variables
const requiredVars = {
  'STRIPE_PUBLISHABLE_KEY': 'Live Stripe Publishable Key',
  'STRIPE_SECRET_KEY': 'Live Stripe Secret Key',
  'STRIPE_WEBHOOK_SECRET': 'Live Stripe Webhook Secret',
  'TRUSTLOCK_SECRET': 'Production Trust-Lock Secret'
};

console.log('📋 Environment Variables Status:');
console.log('================================\n');

let allConfigured = true;

for (const [varName, description] of Object.entries(requiredVars)) {
  const value = envVars[varName];
  
  if (value && !value.includes('your_') && !value.includes('test_') && !value.includes('XXXXXXXXXX')) {
    console.log(`✅ ${varName}: ${description}`);
    console.log(`   Value: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: ${description} - NOT CONFIGURED`);
    allConfigured = false;
  }
  console.log('');
}

// Check optional variables
const optionalVars = {
  'NEXT_PUBLIC_GA_ID': 'Google Analytics ID',
  'NEXT_PUBLIC_APP_URL': 'Application URL'
};

console.log('📋 Optional Variables:');
console.log('=======================\n');

for (const [varName, description] of Object.entries(optionalVars)) {
  const value = envVars[varName];
  
  if (value && !value.includes('XXXXXXXXXX')) {
    console.log(`✅ ${varName}: ${description}`);
    console.log(`   Value: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: ${description} - Not configured (optional)`);
  }
  console.log('');
}

if (allConfigured) {
  console.log('🎉 All required environment variables are configured!');
  console.log('🚀 Ready for production deployment');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Configure Stripe webhook in production');
  console.log('2. Deploy to hookahplus.net');
  console.log('3. Run live mode verification tests');
  console.log('4. Complete $30 transaction test');
} else {
  console.log('🚨 Some required variables are missing');
  console.log('Please complete the configuration before proceeding');
}
