/**
 * Production Environment Verification Script
 * 
 * Verifies that all required production environment variables are set correctly.
 * 
 * Usage:
 *   npx tsx scripts/verify-production-env.ts
 */

interface EnvVar {
  name: string;
  required: boolean;
  validator?: (value: string) => boolean;
  hint?: string;
}

const REQUIRED_VARS: EnvVar[] = [
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    validator: (value) => value.startsWith('sk_live_'),
    hint: 'Must start with sk_live_ for production',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    validator: (value) => value.startsWith('whsec_'),
    hint: 'Must start with whsec_',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    validator: (value) => value.startsWith('pk_live_'),
    hint: 'Must start with pk_live_ for production',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    validator: (value) => value.startsWith('https://'),
    hint: 'Must be HTTPS URL',
  },
  {
    name: 'DATABASE_URL',
    required: true,
    validator: (value) => value.length > 0,
    hint: 'Must be a valid database URL',
  },
  {
    name: 'NODE_ENV',
    required: true,
    validator: (value) => value === 'production',
    hint: 'Must be "production"',
  },
];

const OPTIONAL_VARS: EnvVar[] = [
  {
    name: 'LOYALTY_RATE_PERCENT',
    required: false,
    validator: (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0 && num <= 100;
    },
    hint: 'Must be a number between 0 and 100',
  },
  {
    name: 'NEXT_PUBLIC_GA_ID',
    required: false,
    validator: (value) => value.startsWith('G-'),
    hint: 'Must start with G-',
  },
];

function verifyEnvironment(): {
  allRequired: boolean;
  passed: number;
  failed: number;
  warnings: number;
} {
  console.log('🔍 Verifying Production Environment Configuration\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  // Check required variables
  console.log('\n📋 Required Variables:');
  console.log('-'.repeat(60));

  for (const envVar of REQUIRED_VARS) {
    const value = process.env[envVar.name];
    const isSet = !!value;

    if (!isSet) {
      console.log(`❌ ${envVar.name}: NOT SET`);
      console.log(`   ⚠️  This is required for production!`);
      failed++;
      continue;
    }

    // Validate format if validator provided
    if (envVar.validator && !envVar.validator(value)) {
      console.log(`❌ ${envVar.name}: Invalid format`);
      console.log(`   Current: ${value.substring(0, 20)}...`);
      if (envVar.hint) {
        console.log(`   ${envVar.hint}`);
      }
      failed++;
      continue;
    }

    // Mask sensitive values
    const displayValue = envVar.name.includes('SECRET') || envVar.name.includes('KEY')
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : value;

    console.log(`✅ ${envVar.name}: Set`);
    console.log(`   Value: ${displayValue}`);
    passed++;
  }

  // Check optional variables
  console.log('\n📋 Optional Variables:');
  console.log('-'.repeat(60));

  for (const envVar of OPTIONAL_VARS) {
    const value = process.env[envVar.name];
    const isSet = !!value;

    if (!isSet) {
      console.log(`⚪ ${envVar.name}: Not set (optional)`);
      continue;
    }

    // Validate format if validator provided
    if (envVar.validator && !envVar.validator(value)) {
      console.log(`⚠️  ${envVar.name}: Invalid format`);
      console.log(`   Current: ${value}`);
      if (envVar.hint) {
        console.log(`   ${envVar.hint}`);
      }
      warnings++;
      continue;
    }

    const displayValue = envVar.name.includes('SECRET') || envVar.name.includes('KEY')
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : value;

    console.log(`✅ ${envVar.name}: Set`);
    console.log(`   Value: ${displayValue}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);

  const allRequired = failed === 0;

  if (allRequired) {
    console.log('\n🎉 All required variables are set correctly!');
    console.log('   ✅ Ready for production deployment');
  } else {
    console.log('\n⚠️  Some required variables are missing or invalid!');
    console.log('   ❌ Please fix the issues above before deploying');
  }

  return {
    allRequired,
    passed,
    failed,
    warnings,
  };
}

// Run verification
const result = verifyEnvironment();

// Exit with appropriate code
process.exit(result.allRequired ? 0 : 1);

