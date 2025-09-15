const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

async function seedStripeCatalog() {
  console.log('🌱 Seeding Stripe catalog...');
  
  const csvPath = path.join(__dirname, 'products.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const results = {
    products: [],
    prices: [],
    errors: []
  };
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    try {
      // Create product
      const product = await stripe.products.create({
        name: row.name,
        description: row.description,
        metadata: {
          'hp:type': row.type,
          'hp:tier': row.tier || '',
          'hp:duration_minutes': row.duration_minutes || '0',
          'hp:flavors_included': row.flavors_included || '0',
          'hp:refill_included': row.refill_included || '0'
        }
      });
      
      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: parseInt(row.unit_amount),
        currency: row.currency,
        lookup_key: row.lookup_key,
        metadata: {
          'hp:type': row.type,
          'hp:tier': row.tier || '',
          'hp:duration_minutes': row.duration_minutes || '0',
          'hp:flavors_included': row.flavors_included || '0',
          'hp:refill_included': row.refill_included || '0'
        }
      });
      
      results.products.push({ id: product.id, name: product.name });
      results.prices.push({ id: price.id, lookup_key: price.lookup_key });
      
      console.log(`✅ Created ${row.name} - ${row.lookup_key}`);
      
    } catch (error) {
      console.error(`❌ Error creating ${row.name}:`, error.message);
      results.errors.push({ product: row.name, error: error.message });
    }
  }
  
  // Save results
  const outputPath = path.join(__dirname, 'stripe_ids.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📊 Summary:`);
  console.log(`Products created: ${results.products.length}`);
  console.log(`Prices created: ${results.prices.length}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`\n💾 Results saved to: ${outputPath}`);
  
  return results;
}

if (require.main === module) {
  seedStripeCatalog().catch(console.error);
}

module.exports = { seedStripeCatalog };
