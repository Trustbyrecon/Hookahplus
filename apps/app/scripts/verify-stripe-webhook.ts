/**
 * Stripe Webhook Verification Script
 * 
 * Verifies Stripe webhook configuration for production.
 * 
 * Usage:
 *   npx tsx scripts/verify-stripe-webhook.ts
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface VerificationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  action?: string;
}

function verifyStripeKeys(): VerificationResult {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!secretKey || !publishableKey) {
    return {
      check: 'Stripe Keys',
      status: 'fail',
      message: 'Stripe keys not configured',
      action: 'Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to Vercel Production'
    };
  }

  // Check if using live keys (required for production)
  const isLive = secretKey.startsWith('sk_live_') && publishableKey.startsWith('pk_live_');
  const isTest = secretKey.startsWith('sk_test_') && publishableKey.startsWith('pk_test_');

  if (isTest) {
    return {
      check: 'Stripe Keys',
      status: 'warning',
      message: 'Using test keys - switch to live keys for production',
      action: 'Update to live keys (sk_live_, pk_live_) in Vercel Production environment'
    };
  }

  if (!isLive) {
    return {
      check: 'Stripe Keys',
      status: 'fail',
      message: 'Invalid Stripe key format',
      action: 'Verify keys start with sk_live_ and pk_live_'
    };
  }

  return {
    check: 'Stripe Keys',
    status: 'pass',
    message: 'Live Stripe keys configured'
  };
}

function verifyWebhookSecret(): VerificationResult {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET_APP;

  if (!webhookSecret) {
    return {
      check: 'Webhook Secret',
      status: 'fail',
      message: 'Webhook secret not configured',
      action: 'Add STRIPE_WEBHOOK_SECRET to Vercel Production (get from Stripe Dashboard → Webhooks → Signing secret)'
    };
  }

  if (webhookSecret === 'whsec_placeholder' || webhookSecret.length < 20) {
    return {
      check: 'Webhook Secret',
      status: 'fail',
      message: 'Webhook secret appears to be placeholder or invalid',
      action: 'Get real webhook secret from Stripe Dashboard → Webhooks → Your endpoint → Reveal signing secret'
    };
  }

  if (!webhookSecret.startsWith('whsec_')) {
    return {
      check: 'Webhook Secret',
      status: 'warning',
      message: 'Webhook secret format may be incorrect',
      action: 'Verify webhook secret starts with whsec_'
    };
  }

  return {
    check: 'Webhook Secret',
    status: 'pass',
    message: 'Webhook secret configured'
  };
}

function verifyWebhookEndpoint(): VerificationResult {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;

  if (!appUrl) {
    return {
      check: 'Webhook Endpoint URL',
      status: 'warning',
      message: 'App URL not configured',
      action: 'Set NEXT_PUBLIC_APP_URL in Vercel (e.g., https://app.hookahplus.net)'
    };
  }

  const webhookUrl = appUrl.startsWith('http') 
    ? `${appUrl}/api/webhooks/stripe`
    : `https://${appUrl}/api/webhooks/stripe`;

  return {
    check: 'Webhook Endpoint URL',
    status: 'pass',
    message: `Webhook endpoint: ${webhookUrl}`,
    action: `Configure this URL in Stripe Dashboard → Webhooks → Add endpoint`
  };
}

function verifyDatabaseForWebhook(): VerificationResult {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      check: 'Database for Webhooks',
      status: 'fail',
      message: 'DATABASE_URL not configured (required for webhook processing)',
      action: 'Add DATABASE_URL to Vercel Production environment variables'
    };
  }

  return {
    check: 'Database for Webhooks',
    status: 'pass',
    message: 'Database configured for webhook processing'
  };
}

function runVerification(): void {
  console.log('🔍 Stripe Webhook Verification\n');
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('');

  const results: VerificationResult[] = [];

  // Run all checks
  results.push(verifyStripeKeys());
  results.push(verifyWebhookSecret());
  results.push(verifyWebhookEndpoint());
  results.push(verifyDatabaseForWebhook());

  // Display results
  console.log('📋 Verification Results:\n');

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.check}: ${result.message}`);
    
    if (result.action) {
      console.log(`   → ${result.action}`);
    }
    console.log('');

    if (result.status === 'pass') passed++;
    else if (result.status === 'fail') failed++;
    else warnings++;
  });

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('');

  if (failed === 0 && warnings === 0) {
    console.log('🎉 All Stripe webhook checks passed! Ready for production! 🚀');
    console.log('\n📋 Next Steps:');
    console.log('   1. Configure webhook endpoint in Stripe Dashboard (see URL above)');
    console.log('   2. Select events: checkout.session.completed, payment_intent.succeeded');
    console.log('   3. Test with a $1 live transaction');
    console.log('   4. Verify webhook delivery in Stripe Dashboard → Webhooks → Events');
  } else if (failed === 0) {
    console.log('✅ Core checks passed! Address warnings for optimal setup.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Fix warnings above');
    console.log('   2. Configure webhook in Stripe Dashboard');
    console.log('   3. Test webhook delivery');
  } else {
    console.log('⚠️  Some checks failed. Fix issues before going live.');
    console.log('\n📋 Immediate Actions:');
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => {
        console.log(`   - ${r.action || r.message}`);
      });
  }

  console.log('');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run verification
runVerification();

