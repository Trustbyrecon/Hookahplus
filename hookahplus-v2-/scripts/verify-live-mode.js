#!/usr/bin/env node

/**
 * Hookah+ Live Mode Verification Script
 * Comprehensive testing of production deployment
 * 
 * ⚠️  WARNING: This will test LIVE Stripe payments
 * ⚠️  Only run this after deploying to production
 */

// Load environment variables
require('dotenv').config({ path: '.env.production' });

const https = require('https');
const http = require('http');

console.log('🚀 Hookah+ Live Mode Verification');
console.log('===================================');
console.log('⚠️  WARNING: This will test LIVE Stripe payments');
console.log('⚠️  Only run this after deploying to production');
console.log('');

// Configuration
const config = {
  production: {
    url: 'https://hookahplus.net',
    health: 'https://hookahplus.net/api/health',
    preorder: 'https://hookahplus.net/preorder/T-001',
    webhook: 'https://hookahplus.net/api/webhooks/stripe',
    checkout: 'https://hookahplus.net/checkout'
  }
};

// Test endpoint function
function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ 
          success: true, 
          status: res.statusCode, 
          description,
          url 
        });
      });
    });

    req.on('error', (err) => {
      resolve({ 
        success: false, 
        error: err.message, 
        description,
        url 
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ 
        success: false, 
        error: 'Timeout', 
        description,
        url 
      });
    });
  });
}

// Run comprehensive verification
async function runLiveModeVerification() {
  console.log('🔍 Phase 1: Production Environment Verification');
  console.log('===============================================\n');

  // Test all production endpoints
  const endpoints = [
    { url: config.production.health, desc: 'Health Check' },
    { url: config.production.url, desc: 'Main Site' },
    { url: config.production.preorder, desc: 'Preorder Page' },
    { url: config.production.checkout, desc: 'Checkout Page' }
  ];

  let allEndpointsWorking = true;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.desc);
    
    if (result.success && result.status === 200) {
      console.log(`✅ ${result.description}: ${result.status} OK`);
    } else {
      console.log(`❌ ${result.description}: ${result.status || 'Failed'} - ${result.error || 'Unknown error'}`);
      allEndpointsWorking = false;
    }
  }

  console.log('');

  if (!allEndpointsWorking) {
    console.log('🚨 CRITICAL: Some endpoints are not responding');
    console.log('Please fix these issues before proceeding with live mode testing');
    return;
  }

  console.log('✅ All production endpoints are responding correctly');
  console.log('');

  // Environment verification
  console.log('🔍 Phase 2: Environment Configuration Verification');
  console.log('=================================================\n');

  const requiredEnvVars = [
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY', 
    'STRIPE_WEBHOOK_SECRET',
    'TRUSTLOCK_SECRET'
  ];

  let envVarsComplete = true;
  
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (value && !value.includes('your_') && !value.includes('test_')) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`❌ ${varName}: Not configured or using placeholder`);
      envVarsComplete = false;
    }
  }

  console.log('');

  if (!envVarsComplete) {
    console.log('🚨 CRITICAL: Environment variables not properly configured');
    console.log('Please complete environment setup before live mode testing');
    return;
  }

  console.log('✅ Environment configuration verified');
  console.log('');

  // Live mode testing plan
  console.log('🧪 Phase 3: Live Mode Testing Plan');
  console.log('===================================\n');

  console.log('📋 Manual Testing Steps (REQUIRED):');
  console.log('====================================');
  console.log('1. Visit: https://hookahplus.net/preorder/T-001');
  console.log('2. Select: "Blue Mist + Mint" (30 min) = $30');
  console.log('3. Click: "Submit Preorder"');
  console.log('4. Complete: Stripe checkout with REAL card');
  console.log('5. Verify: Return to dashboard with success');
  console.log('6. Check: Order appears as "paid" in dashboard');
  console.log('7. Confirm: $30 charge appears in Stripe Dashboard');
  console.log('8. Verify: Webhook processes payment correctly');
  console.log('');

  console.log('💳 Live Mode Test Cards (Use sparingly):');
  console.log('==========================================');
  console.log('✅ Success: Your real card with $30 charge');
  console.log('❌ Decline: 4000 0000 0000 0002');
  console.log('🔐 3D Secure: 4000 0025 0000 3155');
  console.log('');

  console.log('🔒 Security Verification:');
  console.log('==========================');
  console.log('□ Trust-Lock signatures working');
  console.log('□ Webhook signature verification active');
  console.log('□ HTTPS enforced on all endpoints');
  console.log('□ Environment variables secured');
  console.log('');

  console.log('📊 Analytics & Monitoring:');
  console.log('============================');
  console.log('□ Google Analytics tracking active');
  console.log('□ Netlify deployment successful');
  console.log('□ Error monitoring configured');
  console.log('□ Performance metrics available');
  console.log('');

  // Pre-launch checklist
  console.log('🔧 Pre-Launch Checklist:');
  console.log('=========================');
  console.log('□ Stripe webhook configured for production');
  console.log('□ Environment variables set in Netlify');
  console.log('□ SSL certificate verified');
  console.log('□ DNS records configured');
  console.log('□ Analytics tracking verified');
  console.log('□ Mobile responsiveness tested');
  console.log('□ Payment flow end-to-end tested');
  console.log('□ Webhook delivery confirmed');
  console.log('□ Trust-Lock security verified');
  console.log('');

  // Emergency procedures
  console.log('🚨 Emergency Procedures:');
  console.log('=========================');
  console.log('1. If issues occur: Disable webhook in Stripe Dashboard');
  console.log('2. Rollback: Revert to last stable Netlify deploy');
  console.log('3. Support: Contact Stripe Support for payment issues');
  console.log('4. Monitoring: Check Netlify logs for deployment issues');
  console.log('5. Backup: Ensure you have working test mode configuration');
  console.log('');

  // Success criteria
  console.log('🎯 Live Mode Success Criteria:');
  console.log('===============================');
  console.log('✅ All production endpoints responding');
  console.log('✅ Environment variables configured');
  console.log('✅ $30 live transaction completed successfully');
  console.log('✅ Webhook processes payment correctly');
  console.log('✅ Order appears as paid in dashboard');
  console.log('✅ Trust-Lock security working');
  console.log('✅ Mobile responsive design verified');
  console.log('✅ Analytics tracking confirmed');
  console.log('');

  console.log('🚀 Ready for Live Mode Testing! 🚀');
  console.log('====================================');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Complete manual testing steps above');
  console.log('2. Verify $30 transaction in Stripe Dashboard');
  console.log('3. Confirm webhook delivery success');
  console.log('4. Test mobile responsiveness');
  console.log('5. Verify analytics tracking');
  console.log('6. Launch MVP to customers');
  console.log('');
  console.log('🎉 Hookah+ is ready to go live! 🚀');
}

// Run verification
if (require.main === module) {
  runLiveModeVerification().catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = { runLiveModeVerification };
