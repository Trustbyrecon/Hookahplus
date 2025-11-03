/**
 * Production Verification Script
 * 
 * Verifies production setup is complete and ready for go-live.
 * 
 * Usage:
 *   npx tsx scripts/verify-production-ready.ts
 */

interface VerificationCheck {
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  message: string;
  action?: string;
}

const checks: VerificationCheck[] = [];

async function verifyStripeConnection(): Promise<VerificationCheck> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripeKey || !publishableKey) {
    return {
      name: 'Stripe Keys',
      status: 'fail',
      message: 'Stripe keys not configured',
      action: 'Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to Vercel',
    };
  }

  const isLive = stripeKey.startsWith('sk_live_') && publishableKey.startsWith('pk_live_');
  if (!isLive) {
    return {
      name: 'Stripe Keys',
      status: 'fail',
      message: 'Using test keys in production',
      action: 'Use live keys (sk_live_, pk_live_) in production',
    };
  }

  return {
    name: 'Stripe Keys',
    status: 'pass',
    message: 'Live Stripe keys configured',
  };
}

async function verifyWebhookSecret(): Promise<VerificationCheck> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return {
      name: 'Webhook Secret',
      status: 'fail',
      message: 'Webhook secret not configured',
      action: 'Add STRIPE_WEBHOOK_SECRET to Vercel',
    };
  }

  if (!webhookSecret.startsWith('whsec_')) {
    return {
      name: 'Webhook Secret',
      status: 'warning',
      message: 'Webhook secret format may be incorrect',
      action: 'Verify webhook secret starts with whsec_',
    };
  }

  return {
    name: 'Webhook Secret',
    status: 'pass',
    message: 'Webhook secret configured',
  };
}

async function verifyAppUrl(): Promise<VerificationCheck> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    return {
      name: 'App URL',
      status: 'fail',
      message: 'App URL not configured',
      action: 'Add NEXT_PUBLIC_APP_URL to Vercel',
    };
  }

  if (!appUrl.startsWith('https://')) {
    return {
      name: 'App URL',
      status: 'warning',
      message: 'App URL should use HTTPS',
      action: 'Update NEXT_PUBLIC_APP_URL to use https://',
    };
  }

  return {
    name: 'App URL',
    status: 'pass',
    message: `App URL configured: ${appUrl}`,
  };
}

async function verifyDatabase(): Promise<VerificationCheck> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      name: 'Database',
      status: 'fail',
      message: 'Database URL not configured',
      action: 'Add DATABASE_URL to Vercel',
    };
  }

  // Check if SQLite (not recommended for production)
  if (databaseUrl.startsWith('file:')) {
    return {
      name: 'Database',
      status: 'warning',
      message: 'Using SQLite (consider PostgreSQL for production)',
      action: 'Consider migrating to PostgreSQL for production',
    };
  }

  return {
    name: 'Database',
    status: 'pass',
    message: 'Database URL configured',
  };
}

async function verifyEnvironment(): Promise<VerificationCheck> {
  const nodeEnv = process.env.NODE_ENV;

  if (!nodeEnv) {
    return {
      name: 'Node Environment',
      status: 'warning',
      message: 'NODE_ENV not set',
      action: 'Set NODE_ENV=production in Vercel',
    };
  }

  if (nodeEnv !== 'production') {
    return {
      name: 'Node Environment',
      status: 'warning',
      message: `NODE_ENV is "${nodeEnv}" (should be "production")`,
      action: 'Set NODE_ENV=production in Vercel',
    };
  }

  return {
    name: 'Node Environment',
    status: 'pass',
    message: 'NODE_ENV set to production',
  };
}

async function runVerification(): Promise<void> {
  console.log('🔍 Production Go-Live Verification\n');
  console.log('='.repeat(60));

  const results: VerificationCheck[] = [];

  // Run all checks
  results.push(await verifyStripeConnection());
  results.push(await verifyWebhookSecret());
  results.push(await verifyAppUrl());
  results.push(await verifyDatabase());
  results.push(await verifyEnvironment());

  // Display results
  console.log('\n📋 Verification Results:\n');

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  results.forEach((check) => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
    
    if (check.action) {
      console.log(`   → ${check.action}`);
    }
    console.log('');

    if (check.status === 'pass') passed++;
    else if (check.status === 'fail') failed++;
    else warnings++;
  });

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   ❌ Failed: ${failed}`);

  // Calculate readiness percentage
  const totalChecks = results.length;
  const passedChecks = passed;
  const warningChecks = warnings * 0.5; // Warnings count as half
  const readinessPercent = Math.round((passedChecks + warningChecks) / totalChecks * 100);

  console.log(`\n🎯 Go-Live Readiness: ${readinessPercent}%`);

  if (failed === 0 && warnings === 0) {
    console.log('\n🎉 All checks passed! Ready for go-live! 🚀');
    console.log('\n📋 Next Steps:');
    console.log('   1. Test $1 live transaction');
    console.log('   2. Verify webhook delivery in Stripe Dashboard');
    console.log('   3. Check REM coverage: npx tsx bin/rem-lint.ts --coverage');
    console.log('   4. Monitor first few transactions');
  } else if (failed === 0) {
    console.log('\n✅ Core checks passed! Address warnings for optimal setup.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Fix warnings above');
    console.log('   2. Test $1 live transaction');
    console.log('   3. Verify webhook delivery');
  } else {
    console.log('\n⚠️  Some checks failed. Fix issues before going live.');
    console.log('\n📋 Immediate Actions:');
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => {
        console.log(`   - ${r.action}`);
      });
  }

  console.log('');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run verification
runVerification().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

