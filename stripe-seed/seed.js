#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Security check - ensure we're not in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cannot run seed script in production!');
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY) { 
  console.error('❌ Missing STRIPE_SECRET_KEY in .env file');
  console.error('💡 Create .env file with: STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1); 
}

// Validate it's a test key
if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('❌ Only test keys (sk_test_*) are allowed in development');
  process.exit(1);
}

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

console.log('🔐 Using Stripe Test Environment');
console.log('📦 Loading product catalog...');

const src = JSON.parse(fs.readFileSync('./products.json','utf8'));

(async () => {
  const out = { products:{}, prices:{} };
  
  try {
    for (const p of src.products) {
      console.log(`\n🔄 Creating: ${p.name}`);
      
      const product = await stripe.products.create({ 
        name: p.name, 
        default_price_data: p.type==='recurring' ? {
          currency: src.currency, 
          unit_amount: p.unit_amount, 
          recurring: { interval: p.interval || 'month' }
        } : undefined 
      });
      
      let price;
      if (p.type==='one_time') {
        price = await stripe.prices.create({ 
          product: product.id, 
          currency: src.currency, 
          unit_amount: p.unit_amount 
        });
      } else {
        price = await stripe.prices.retrieve(product.default_price);
      }
      
      await stripe.products.update(product.id, { metadata: { lookup_key: p.lookup_key }});
      await stripe.prices.update(price.id, { lookup_key: p.lookup_key });
      
      out.products[p.lookup_key] = product.id;
      out.prices[p.lookup_key] = price.id;
      
      console.log(`✅ ${p.name}: ${product.id} / ${price.id}`);
    }
    
    // Write output file
    const outputPath = path.join(__dirname, '..', 'stripe_ids.out.json');
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📄 Output written to: ${outputPath}`);
    console.log('\n📋 Next steps:');
    console.log('1. Copy price IDs to your .env.local file');
    console.log('2. Restart your Next.js app');
    console.log('3. Test the integration');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('💡 Check your STRIPE_SECRET_KEY in .env file');
    }
    process.exit(1);
  }
})();
