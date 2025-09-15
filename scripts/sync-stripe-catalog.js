#!/usr/bin/env node

/**
 * HookahPlus Stripe Catalog Sync Script
 * 
 * This script syncs the product catalog to Stripe and outputs
 * the price IDs for environment configuration.
 */

const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

// Product catalog from CSV
const products = [
  {
    lookup_key: 'price_hookah_session_base',
    name: 'Hookah Session Base',
    description: '90-minute base hookah session',
    unit_amount: 2100,
    currency: 'usd',
    type: 'session',
    tier: 'base',
    duration_minutes: 90,
    flavors_included: 1,
    refill_included: 0
  },
  {
    lookup_key: 'price_hookah_session_premium',
    name: 'Hookah Session Premium',
    description: '90-minute premium hookah session with 2 flavors',
    unit_amount: 2900,
    currency: 'usd',
    type: 'session',
    tier: 'premium',
    duration_minutes: 90,
    flavors_included: 2,
    refill_included: 1
  },
  {
    lookup_key: 'price_hookah_session_vip',
    name: 'Hookah Session VIP',
    description: '90-minute VIP hookah session with premium flavors',
    unit_amount: 4500,
    currency: 'usd',
    type: 'session',
    tier: 'vip',
    duration_minutes: 90,
    flavors_included: 3,
    refill_included: 2
  },
  {
    lookup_key: 'price_flavor_addon',
    name: 'Flavor Add-on',
    description: 'Additional flavor for existing session',
    unit_amount: 300,
    currency: 'usd',
    type: 'addon',
    tier: '',
    duration_minutes: 0,
    flavors_included: 1,
    refill_included: 0
  },
  {
    lookup_key: 'price_coal_refill',
    name: 'Coal Refill',
    description: 'Refill coals for session',
    unit_amount: 600,
    currency: 'usd',
    type: 'service',
    tier: '',
    duration_minutes: 0,
    flavors_included: 0,
    refill_included: 1
  },
  {
    lookup_key: 'price_extended_time_20m',
    name: 'Extended Time 20min',
    description: 'Add 20 minutes to session',
    unit_amount: 1000,
    currency: 'usd',
    type: 'service',
    tier: '',
    duration_minutes: 20,
    flavors_included: 0,
    refill_included: 0
  },
  {
    lookup_key: 'price_table_reservation_hold',
    name: 'Table Reservation Hold',
    description: 'Reserve table with $10 hold',
    unit_amount: 1000,
    currency: 'usd',
    type: 'service',
    tier: '',
    duration_minutes: 0,
    flavors_included: 0,
    refill_included: 0
  },
  {
    lookup_key: 'price_hp_plan_starter',
    name: 'Starter Plan',
    description: 'Basic venue management',
    unit_amount: 4900,
    currency: 'usd',
    type: 'subscription',
    tier: '',
    duration_minutes: 0,
    flavors_included: 0,
    refill_included: 0
  },
  {
    lookup_key: 'price_hp_plan_pro',
    name: 'Pro Plan',
    description: 'Advanced venue management with analytics',
    unit_amount: 14900,
    currency: 'usd',
    type: 'subscription',
    tier: '',
    duration_minutes: 0,
    flavors_included: 0,
    refill_included: 0
  },
  {
    lookup_key: 'price_hp_plan_business',
    name: 'Business Plan',
    description: 'Full venue management suite',
    unit_amount: 39900,
    currency: 'usd',
    type: 'subscription',
    tier: '',
    duration_minutes: 0,
    flavors_included: 0,
    refill_included: 0
  }
];

async function syncStripeCatalog() {
  console.log('🔄 Syncing Stripe catalog...');
  
  const results = {
    products: [],
    prices: [],
    errors: []
  };
  
  for (const product of products) {
    try {
      console.log(`\n📦 Processing: ${product.name}`);
      
      // Create or update product
      let stripeProduct;
      try {
        // Try to find existing product by name
        const existingProducts = await stripe.products.list({
          limit: 100,
          active: true
        });
        
        stripeProduct = existingProducts.data.find(p => p.name === product.name);
        
        if (stripeProduct) {
          console.log(`  ✅ Found existing product: ${stripeProduct.id}`);
        } else {
          // Create new product
          stripeProduct = await stripe.products.create({
            name: product.name,
            description: product.description,
            metadata: {
              'hp:type': product.type,
              'hp:tier': product.tier,
              'hp:duration_minutes': product.duration_minutes.toString(),
              'hp:flavors_included': product.flavors_included.toString(),
              'hp:refill_included': product.refill_included.toString()
            }
          });
          console.log(`  ✅ Created product: ${stripeProduct.id}`);
        }
      } catch (error) {
        console.error(`  ❌ Product error: ${error.message}`);
        results.errors.push({ product: product.name, error: error.message });
        continue;
      }
      
      // Create or update price
      let stripePrice;
      try {
        // Try to find existing price by lookup key
        const existingPrices = await stripe.prices.list({
          lookup_keys: [product.lookup_key],
          limit: 1
        });
        
        if (existingPrices.data.length > 0) {
          stripePrice = existingPrices.data[0];
          console.log(`  ✅ Found existing price: ${stripePrice.id}`);
        } else {
          // Create new price
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: product.unit_amount,
            currency: product.currency,
            lookup_key: product.lookup_key,
            metadata: {
              'hp:type': product.type,
              'hp:tier': product.tier,
              'hp:duration_minutes': product.duration_minutes.toString(),
              'hp:flavors_included': product.flavors_included.toString(),
              'hp:refill_included': product.refill_included.toString()
            }
          });
          console.log(`  ✅ Created price: ${stripePrice.id}`);
        }
      } catch (error) {
        console.error(`  ❌ Price error: ${error.message}`);
        results.errors.push({ product: product.name, error: error.message });
        continue;
      }
      
      results.products.push({
        id: stripeProduct.id,
        name: stripeProduct.name,
        lookup_key: product.lookup_key
      });
      
      results.prices.push({
        id: stripePrice.id,
        lookup_key: stripePrice.lookup_key,
        unit_amount: stripePrice.unit_amount,
        currency: stripePrice.currency
      });
      
    } catch (error) {
      console.error(`❌ Error processing ${product.name}:`, error.message);
      results.errors.push({ product: product.name, error: error.message });
    }
  }
  
  // Save results
  const outputPath = path.join(__dirname, 'stripe-catalog-output.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📊 Sync Summary:`);
  console.log(`  Products: ${results.products.length}`);
  console.log(`  Prices: ${results.prices.length}`);
  console.log(`  Errors: ${results.errors.length}`);
  console.log(`\n💾 Results saved to: ${outputPath}`);
  
  // Generate environment variables
  console.log(`\n🔧 Environment Variables to Add:`);
  console.log(`# Add these to your Vercel environment variables:`);
  results.prices.forEach(price => {
    const envVar = price.lookup_key.toUpperCase().replace(/PRICE_/, 'PRICE_');
    console.log(`${envVar}=${price.id}`);
  });
  
  return results;
}

// Run the sync
if (require.main === module) {
  syncStripeCatalog()
    .then(() => {
      console.log('\n✅ Stripe catalog sync completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncStripeCatalog };
