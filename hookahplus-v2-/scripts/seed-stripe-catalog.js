#!/usr/bin/env node
/**
 * Hookah+ Stripe Catalog Seeder
 * Creates products and prices in Stripe for the complete Hookah+ capability set
 */

const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const PRODUCTS_CSV = path.join(__dirname, '..', 'data', 'products.csv');

async function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const product = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Parse JSON metadata
      if (header === 'metadata' && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.warn(`Failed to parse metadata for ${values[0]}: ${e.message}`);
          value = {};
        }
      }
      
      // Parse price as integer
      if (header === 'price_cents' && value) {
        value = parseInt(value, 10);
      }
      
      product[header] = value;
    });
    return product;
  });
}

async function createStripeProduct(product) {
  try {
    console.log(`Creating product: ${product.product_name}`);
    
    const stripeProduct = await stripe.products.create({
      name: product.product_name,
      description: product.description,
      metadata: {
        product_type: product.product_type,
        ...product.metadata
      },
      active: true,
    });

    let stripePrice = null;
    
    if (product.price_cents > 0) {
      stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.price_cents,
        currency: 'usd',
        metadata: {
          product_type: product.product_type,
          ...product.metadata
        },
      });
    }

    return {
      ...product,
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice?.id || null
    };
  } catch (error) {
    console.error(`Failed to create product ${product.product_name}:`, error.message);
    return product;
  }
}

async function updateCSVWithStripeIds(products) {
  const csvContent = [
    'product_type,product_name,description,price_cents,metadata,stripe_product_id,stripe_price_id'
  ];
  
  products.forEach(product => {
    const metadataStr = JSON.stringify(product.metadata || {});
    csvContent.push([
      product.product_type,
      product.product_name,
      product.description,
      product.price_cents,
      metadataStr,
      product.stripe_product_id || '',
      product.stripe_price_id || ''
    ].join(','));
  });
  
  fs.writeFileSync(PRODUCTS_CSV, csvContent.join('\n'));
  console.log(`Updated ${PRODUCTS_CSV} with Stripe IDs`);
}

async function main() {
  try {
    console.log('🚀 Starting Hookah+ Stripe Catalog Seeding...');
    console.log(`Using Stripe Secret Key: ${process.env.STRIPE_SECRET_KEY?.substring(0, 7)}...`);
    
    // Parse products from CSV
    const products = await parseCSV(PRODUCTS_CSV);
    console.log(`Found ${products.length} products to create`);
    
    // Create products in Stripe
    const results = [];
    for (const product of products) {
      const result = await createStripeProduct(product);
      results.push(result);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update CSV with Stripe IDs
    await updateCSVWithStripeIds(results);
    
    // Generate environment variables for easy copy-paste
    console.log('\n📋 Environment Variables to Add:');
    console.log('='.repeat(50));
    
    const envVars = results
      .filter(p => p.stripe_price_id)
      .map(p => {
        const key = p.product_name.toUpperCase()
          .replace(/[^A-Z0-9]/g, '_')
          .replace(/_+/g, '_');
        return `${key}=${p.stripe_price_id}`;
      });
    
    console.log(envVars.join('\n'));
    console.log('='.repeat(50));
    
    console.log('\n✅ Stripe catalog seeding completed!');
    console.log(`Created ${results.filter(r => r.stripe_product_id).length} products`);
    console.log(`Created ${results.filter(r => r.stripe_price_id).length} prices`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseCSV, createStripeProduct, updateCSVWithStripeIds };
