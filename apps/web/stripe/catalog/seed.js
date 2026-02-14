/**
 * Hookah+ Stripe Catalog Seeder
 * - Reads ./stripe/catalog/products.csv
 * - Creates/updates Products & Prices with metadata and lookup_keys
 * - Writes ./stripe/catalog/stripe_ids.json mapping for your app
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... node stripe/catalog/seed.js
 * (use a test key in dev)
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.error('Missing STRIPE_SECRET_KEY env var.');
  process.exit(1);
}
import Stripe from 'stripe';
const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });

const CSV_PATH = path.join(process.cwd(), 'stripe', 'catalog', 'products.csv');
const OUT_PATH = path.join(process.cwd(), 'stripe', 'catalog', 'stripe_ids.json');

(async () => {
  const csv = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parse(csv, { columns: true, skip_empty_lines: true });

  const out = { products: {}, prices: {} };

  for (const row of rows) {
    const {
      product_key,
      name,
      description,
      ['hp:type']: hpType,
      ['hp:tier']: hpTier,
      ['hp:duration_minutes']: duration,
      ['hp:flavors_included']: flavorsIncluded,
      ['hp:refill_included']: refillIncluded,
      unit_amount,
      currency,
      active,
      price_lookup_key,
      tax_behavior
    } = row;

    // 1) Upsert Product by metadata hp:key (idempotent)
    // Use Stripe Search (requires it be enabled in your account).
    let product = null;
    try {
      const search = await stripe.products.search({
        query: `active:'true' AND metadata['hp:key']:'${product_key}'`,
        limit: 1
      });
      product = search.data[0] || null;
    } catch (e) {
      // fallback to list + filter if search not available
      const list = await stripe.products.list({ limit: 100 });
      product = list.data.find(p => p.metadata && p.metadata['hp:key'] === product_key) || null;
    }

    const productPayload = {
      name,
      description,
      active: String(active).toLowerCase() === 'true',
      metadata: {
        'hp:key': product_key,
        'hp:type': hpType || '',
        'hp:tier': hpTier || ''
      }
    };

    if (!product) {
      product = await stripe.products.create(productPayload);
      console.log(`Created product: ${name} (${product.id})`);
    } else {
      // keep updates minimal to avoid churn
      await stripe.products.update(product.id, productPayload);
      console.log(`Updated product: ${name} (${product.id})`);
    }

    out.products[product_key] = product.id;

    // 2) Upsert Price by lookup_key (idempotent)
    // If you plan to handle reservation as auth-only Payment Intents, skip creating a price:
    if (price_lookup_key && price_lookup_key.trim()) {
      // Does a price with this lookup_key already exist?
      const priceList = await stripe.prices.list({ lookup_keys: [price_lookup_key], limit: 1 });
      let price = priceList.data[0] || null;

      const priceMetadata = {
        'hp:type': hpType || '',
        'hp:tier': hpTier || '',
        'hp:duration_minutes': duration || '0',
        'hp:flavors_included': flavorsIncluded || '0',
        'hp:refill_included': refillIncluded || '0'
      };

      if (!price) {
        price = await stripe.prices.create({
          currency: currency || 'usd',
          unit_amount: Number(unit_amount),
          product: product.id,
          active: String(active).toLowerCase() === 'true',
          tax_behavior: (tax_behavior || 'exclusive'),
          lookup_key: price_lookup_key,
          metadata: priceMetadata
        });
        console.log(`Created price: ${price_lookup_key} (${price.id})`);
      } else {
        // Stripe doesn't allow changing currency/unit_amount; create a new price if those change.
        // We only sync metadata/active/tax_behavior here.
        await stripe.prices.update(price.id, {
          active: String(active).toLowerCase() === 'true',
          tax_behavior: (tax_behavior || 'exclusive'),
          metadata: priceMetadata
        });
        console.log(`Updated price: ${price_lookup_key} (${price.id})`);
      }

      out.prices[price_lookup_key] = price.id;
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\nWrote ID map → ${OUT_PATH}`);
  console.log('Done.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
