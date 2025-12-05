#!/usr/bin/env node
/**
 * Stripe Subscription Price Seeding Script
 * 
 * Creates all subscription tier products and prices in Stripe:
 * - Starter: $79/month, $790/year
 * - Pro: $249/month, $2490/year
 * - Trust+: $499/month, $4990/year
 * 
 * Usage: npm run seed:stripe
 * Requires: STRIPE_SECRET_KEY in .env.local or environment
 */

const fs = require('fs');
const path = require('path');

// Try loading .env files in order of preference
const envPaths = [
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'apps', 'site', '.env.local'),
  path.join(process.cwd(), 'apps', 'app', '.env.local')
];

let envLoaded = false;
let loadedFrom = null;

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const result = require('dotenv').config({ path: envPath });
    if (result.parsed && Object.keys(result.parsed).length > 0) {
      envLoaded = true;
      loadedFrom = envPath;
      console.log(`📁 Loaded environment from: ${envPath}`);
      break;
    }
  }
}

// Also try default dotenv (loads from process.cwd())
if (!envLoaded) {
  const result = require('dotenv').config();
  if (result.parsed && Object.keys(result.parsed).length > 0) {
    envLoaded = true;
    loadedFrom = '.env (default)';
    console.log(`📁 Loaded environment from: .env`);
  }
}

// Check if STRIPE_SECRET_KEY might be in system environment
if (!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY_SYSTEM) {
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY_SYSTEM;
}

// Security check - ensure we're not accidentally using production keys
if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PRODUCTION_SEED) {
  console.error('❌ Cannot run seed script in production without ALLOW_PRODUCTION_SEED flag!');
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('\n❌ Missing STRIPE_SECRET_KEY in environment\n');
  console.error('📋 To fix this, create a .env.local file in the project root with:');
  console.error('');
  console.error('   STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here');
  console.error('');
  console.error('💡 How to get your Stripe test key:');
  console.error('   1. Go to: https://dashboard.stripe.com/test/apikeys');
  console.error('   2. Copy the "Secret key" (starts with sk_test_)');
  console.error('   3. Create .env.local in project root');
  console.error('   4. Add: STRIPE_SECRET_KEY=sk_test_...');
  console.error('');
  console.error('📁 Checked these locations:');
  envPaths.forEach(envPath => {
    const exists = fs.existsSync(envPath);
    console.error(`   ${exists ? '✅' : '❌'} ${envPath}`);
  });
  console.error('');
  console.error('💡 Note: .env.local is gitignored (this is correct for security)');
  console.error('   You need to create it manually with your Stripe key.\n');
  process.exit(1);
}

// Warn if using live key
if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
  console.warn('⚠️  WARNING: Using LIVE Stripe key!');
  if (!process.env.ALLOW_PRODUCTION_SEED) {
    console.error('❌ Aborting. Set ALLOW_PRODUCTION_SEED=true to proceed with live key.');
    process.exit(1);
  }
}

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Subscription tier configuration
const subscriptionTiers = [
  {
    name: 'Hookah+ Starter',
    tierKey: 'starter',
    description: 'Perfect for mobile hookah operators and small lounges',
    monthly: {
      amount: 7900, // $79.00 in cents
      lookupKey: 'tier_starter_monthly'
    },
    annual: {
      amount: 79000, // $790.00 in cents
      lookupKey: 'tier_starter_annual'
    }
  },
  {
    name: 'Hookah+ Pro',
    tierKey: 'pro',
    description: 'For growing lounges that need advanced features',
    monthly: {
      amount: 24900, // $249.00 in cents
      lookupKey: 'tier_pro_monthly'
    },
    annual: {
      amount: 249000, // $2490.00 in cents
      lookupKey: 'tier_pro_annual'
    }
  },
  {
    name: 'Hookah+ Trust+',
    tierKey: 'trust_plus',
    description: 'For large operations requiring custom solutions',
    monthly: {
      amount: 49900, // $499.00 in cents
      lookupKey: 'tier_trust_plus_monthly'
    },
    annual: {
      amount: 499000, // $4990.00 in cents
      lookupKey: 'tier_trust_plus_annual'
    }
  }
];

(async () => {
  console.log('🚀 Starting Stripe Subscription Price Seeding\n');
  console.log(`🔐 Using Stripe ${process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'} Environment\n`);

  const results = {
    products: {},
    prices: {
      monthly: {},
      annual: {}
    },
    envEntries: []
  };

  try {
    for (const tier of subscriptionTiers) {
      console.log(`\n📦 Processing: ${tier.name}`);
      console.log('─'.repeat(50));

      // Step 1: Find or create product
      let product = null;
      
      // Try to find existing product by metadata
      try {
        const searchResults = await stripe.products.search({
          query: `metadata['tier_key']:'${tier.tierKey}'`,
          limit: 1
        });
        
        if (searchResults.data.length > 0) {
          product = searchResults.data[0];
          console.log(`   ✅ Found existing product: ${product.id}`);
        }
      } catch (searchError) {
        // Search might not be available, fallback to list
        const products = await stripe.products.list({ limit: 100 });
        product = products.data.find(p => 
          p.metadata && p.metadata.tier_key === tier.tierKey
        ) || null;
        
        if (product) {
          console.log(`   ✅ Found existing product: ${product.id}`);
        }
      }

      // Create product if it doesn't exist
      if (!product) {
        product = await stripe.products.create({
          name: tier.name,
          description: tier.description,
          metadata: {
            tier_key: tier.tierKey,
            type: 'subscription'
          }
        });
        console.log(`   ✅ Created product: ${product.id}`);
      }

      results.products[tier.tierKey] = product.id;

      // Step 2: Create or find monthly price
      let monthlyPrice = null;
      try {
        const existingPrices = await stripe.prices.list({
          product: product.id,
          limit: 100
        });
        
        monthlyPrice = existingPrices.data.find(p => 
          p.lookup_key === tier.monthly.lookupKey
        );
      } catch (error) {
        // Continue to create
      }

      if (!monthlyPrice) {
        monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.monthly.amount,
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          lookup_key: tier.monthly.lookupKey,
          metadata: {
            tier_key: tier.tierKey,
            billing_cycle: 'monthly'
          }
        });
        console.log(`   ✅ Created monthly price: ${monthlyPrice.id} ($${(tier.monthly.amount / 100).toFixed(2)}/mo)`);
      } else {
        console.log(`   ✅ Found existing monthly price: ${monthlyPrice.id} ($${(tier.monthly.amount / 100).toFixed(2)}/mo)`);
      }

      results.prices.monthly[tier.tierKey] = monthlyPrice.id;

      // Step 3: Create or find annual price
      let annualPrice = null;
      try {
        const existingPrices = await stripe.prices.list({
          product: product.id,
          limit: 100
        });
        
        annualPrice = existingPrices.data.find(p => 
          p.lookup_key === tier.annual.lookupKey
        );
      } catch (error) {
        // Continue to create
      }

      if (!annualPrice) {
        annualPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.annual.amount,
          currency: 'usd',
          recurring: {
            interval: 'year'
          },
          lookup_key: tier.annual.lookupKey,
          metadata: {
            tier_key: tier.tierKey,
            billing_cycle: 'annual'
          }
        });
        console.log(`   ✅ Created annual price: ${annualPrice.id} ($${(tier.annual.amount / 100).toFixed(2)}/yr)`);
      } else {
        console.log(`   ✅ Found existing annual price: ${annualPrice.id} ($${(tier.annual.amount / 100).toFixed(2)}/yr)`);
      }

      results.prices.annual[tier.tierKey] = annualPrice.id;
    }

    // Step 4: Output results
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Seeding completed successfully!\n');

    // Write JSON output file
    const outputPath = path.join(process.cwd(), 'stripe_subscription_ids.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`📄 Results written to: ${outputPath}\n`);

    // Display formatted .env entries
    console.log('📋 Copy these to your .env.local file:\n');
    console.log('# Stripe Subscription Price IDs');
    console.log(`PRICE_TIER_STARTER=${results.prices.monthly.starter}`);
    console.log(`PRICE_TIER_STARTER_ANNUAL=${results.prices.annual.starter}`);
    console.log(`PRICE_TIER_PRO=${results.prices.monthly.pro}`);
    console.log(`PRICE_TIER_PRO_ANNUAL=${results.prices.annual.pro}`);
    console.log(`PRICE_TIER_TRUST_PLUS=${results.prices.monthly.trust_plus}`);
    console.log(`PRICE_TIER_TRUST_PLUS_ANNUAL=${results.prices.annual.trust_plus}`);
    console.log('');

    // Display summary table
    console.log('📊 Summary:');
    console.log('─'.repeat(60));
    console.log('Tier          | Monthly Price ID              | Annual Price ID');
    console.log('─'.repeat(60));
    console.log(`Starter       | ${results.prices.monthly.starter} | ${results.prices.annual.starter}`);
    console.log(`Pro           | ${results.prices.monthly.pro} | ${results.prices.annual.pro}`);
    console.log(`Trust+        | ${results.prices.monthly.trust_plus} | ${results.prices.annual.trust_plus}`);
    console.log('─'.repeat(60));
    console.log('');

    console.log('✅ Next steps:');
    console.log('1. Copy the PRICE_TIER_* values above to your .env.local file');
    console.log('2. Also add them to Vercel environment variables for production');
    console.log('3. Restart your Next.js development server');
    console.log('4. Test the pricing page checkout flow\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('💡 Check your STRIPE_SECRET_KEY in .env.local file');
    } else if (error.type === 'StripeInvalidRequestError') {
      console.error('💡 Error details:', error.message);
    }
    console.error('\nFull error:', error);
    process.exit(1);
  }
})();

