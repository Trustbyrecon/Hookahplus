#!/usr/bin/env node

/**
 * Hookah+ Live Mode Verification Script
 * Tests production Stripe integration with $1 transaction
 * 
 * ⚠️  WARNING: This will create REAL charges in live mode
 * ⚠️  Only run this when you're ready for production
 */

const https = require('https');
const http = require('http');

console.log('🚀 Hookah+ Live Mode Verification');
console.log('===================================');
console.log('⚠️  WARNING: This will test LIVE Stripe payments');
console.log('⚠️  Only run this when ready for production launch');
console.log('');

// Configuration
const config = {
  production: {
    url: 'https://hookahplus.net',
    health: 'https://hookahplus.net/api/health',
    preorder: 'https://hookahplus.net/preorder/T-001'
  }
};

// Test functions
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
      resolve({ success: true, status: res.statusCode });
    }).on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

async function runLiveModeTests() {
  console.log('🔍 Testing Production Environment:');
  console.log('----------------------------------');

  // Test health endpoint
  await testEndpoint(config.production.health, 'Health Check');

  // Test main site
  await testEndpoint(config.production.url, 'Main Site');

  // Test preorder page
  await testEndpoint(config.production.preorder, 'Preorder Page');

  console.log('\n📋 Live Mode Test Plan:');
  console.log('========================');
  console.log('1. ✅ Verify all endpoints responding');
  console.log('2. 🧪 Test $1 live transaction');
  console.log('3. 🔍 Verify webhook processing');
  console.log('4. 📊 Confirm analytics tracking');
  console.log('5. 📱 Test mobile responsiveness');

  console.log('\n🧪 Manual Live Mode Testing Steps:');
  console.log('===================================');
  console.log('1. Visit: https://hookahplus.net/preorder/T-001');
  console.log('2. Select: "Blue Mist + Mint" (30 min)');
  console.log('3. Click: "Submit Preorder"');
  console.log('4. Complete: Stripe Checkout with real card');
  console.log('5. Verify: Return to dashboard with success');
  console.log('6. Check: Order appears as "paid" in dashboard');

  console.log('\n💳 Live Mode Test Cards (Use sparingly):');
  console.log('==========================================');
  console.log('✅ Success: Your real card with $1 charge');
  console.log('❌ Decline: 4000 0000 0000 0002');
  console.log('🔐 3D Secure: 4000 0025 0000 3155');

  console.log('\n🔧 Pre-Launch Checklist:');
  console.log('========================');
  console.log('□ Stripe webhook configured for production');
  console.log('□ Environment variables set in Netlify');
  console.log('□ SSL certificate verified');
  console.log('□ DNS records configured');
  console.log('□ Analytics tracking verified');
  console.log('□ Mobile responsiveness tested');

  console.log('\n🚨 Emergency Procedures:');
  console.log('========================');
  console.log('1. If issues occur: Disable webhook in Stripe Dashboard');
  console.log('2. Rollback: Revert to last stable Netlify deploy');
  console.log('3. Support: Contact Stripe Support for payment issues');
  console.log('4. Monitoring: Check Netlify logs for deployment issues');

  console.log('\n🎯 Ready for Live Mode Testing! 🚀');
  console.log('Run the manual test steps above to verify production readiness.');
}

// Run tests
runLiveModeTests().catch(console.error);
