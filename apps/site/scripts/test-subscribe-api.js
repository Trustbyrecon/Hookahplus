#!/usr/bin/env node
/**
 * Test /api/subscribe logic locally to capture Stripe errors.
 * Run from apps/site: node scripts/test-subscribe-api.js
 */
const fs = require('fs');
const path = require('path');

// Load .env.local from apps/site
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

async function test() {
  const Stripe = require('stripe');
  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY;
  if (!key) {
    console.error('❌ No Stripe key');
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: '2024-06-20' });
  const priceId = process.env.PRICE_TIER_PRO;
  console.log('Key:', key.substring(0, 12) + '...');
  console.log('Price ID:', priceId);
  console.log('');

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: 'test@example.com',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://hookahplus.net/thank-you?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://hookahplus.net/pricing',
    });
    console.log('✅ Success! Session URL:', session.url?.substring(0, 50) + '...');
  } catch (err) {
    console.error('❌ Stripe Error:');
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('  Type:', err.type);
    if (err.raw) console.error('  Raw:', JSON.stringify(err.raw, null, 2).slice(0, 500));
    process.exit(1);
  }
}

test();
