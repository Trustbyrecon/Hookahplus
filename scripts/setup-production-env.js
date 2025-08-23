#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * Helps configure production environment for live mode
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Hookah+ Production Environment Setup');
console.log('========================================\n');

const requiredVars = {
  'STRIPE_PUBLISHABLE_KEY': {
    description: 'Live Stripe Publishable Key (starts with pk_live_)',
    example: 'pk_live_51ABC123...',
    required: true
  },
  'STRIPE_SECRET_KEY': {
    description: 'Live Stripe Secret Key (starts with sk_live_)',
    example: 'sk_live_51ABC123...',
    required: true
  },
  'STRIPE_WEBHOOK_SECRET': {
    description: 'Live Stripe Webhook Secret (starts with whsec_)',
    example: 'whsec_ABC123...',
    required: true
  },
  'NEXT_PUBLIC_GA_ID': {
    description: 'Google Analytics ID (starts with G-)',
    example: 'G-ABC1234567',
    required: false
  },
  'TRUSTLOCK_SECRET': {
    description: 'Production Trust-Lock Secret (32+ characters)',
    example: 'super-long-random-string-32-chars-min',
    required: true
  }
};

console.log('📋 Required Environment Variables:');
console.log('==================================\n');

let missingVars = [];

for (const [varName, config] of Object.entries(requiredVars)) {
  const currentValue = process.env[varName];
  const status = currentValue ? '✅' : '❌';
  const required = config.required ? 'REQUIRED' : 'OPTIONAL';
  
  console.log(`${status} ${varName} (${required})`);
  console.log(`   Description: ${config.description}`);
  console.log(`   Example: ${config.example}`);
  
  if (currentValue) {
    console.log(`   Current: ${currentValue.substring(0, 20)}...`);
  } else {
    missingVars.push(varName);
    console.log(`   Current: NOT SET`);
  }
  console.log('');
}

if (missingVars.length > 0) {
  console.log('🚨 Missing Required Variables:');
  console.log('===============================\n');
  
  missingVars.forEach(varName => {
    console.log(`❌ ${varName}: ${requiredVars[varName].description}`);
  });
  
  console.log('\n🔧 Setup Instructions:');
  console.log('======================');
  console.log('1. Copy env.production.template to .env.production');
  console.log('2. Fill in your live Stripe keys from Stripe Dashboard');
  console.log('3. Generate a unique TRUSTLOCK_SECRET (32+ characters)');
  console.log('4. Set NEXT_PUBLIC_GA_ID if using Google Analytics');
  console.log('5. Run this script again to verify');
  
  console.log('\n💳 Getting Live Stripe Keys:');
  console.log('============================');
  console.log('1. Go to https://dashboard.stripe.com/apikeys');
  console.log('2. Switch to "Live" mode (not test mode)');
  console.log('3. Copy "Publishable key" and "Secret key"');
  console.log('4. Create webhook at https://dashboard.stripe.com/webhooks');
  console.log('5. Copy webhook signing secret');
  
} else {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Ready for production deployment');
}

console.log('\n📁 Next Steps:');
console.log('===============');
console.log('1. Verify all variables are set correctly');
console.log('2. Configure production webhook in Stripe');
console.log('3. Deploy to hookahplus.net');
console.log('4. Run live mode verification tests');
console.log('5. Complete $1 transaction test');
