#!/usr/bin/env node
/**
 * Seed Stripe with SaaS subscription tiers for /pricing checkout.
 * Creates products and prices for Starter ($79), Pro ($249), Trust+ ($499).
 * Run from repo root: node scripts/seed-stripe-saas-tiers.js
 *
 * Requires: STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY in .env.local
 * Output: stripe_saas_tiers.out.json + env snippet for apps/site
 */
const fs = require('fs');
const path = require('path');

// Load .env.local from apps/site (preferred) or repo root
const envPaths = [
  path.join(__dirname, '../apps/site/.env.local'),
  path.join(__dirname, '../.env.local'),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    });
    break;
  }
}

const Stripe = require('stripe');
const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY;

if (!key) {
  console.error('❌ Missing STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY in .env.local');
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: '2024-06-20' });
const isTest = key.startsWith('sk_test_');
console.log(`🔐 Using Stripe ${isTest ? 'TEST' : 'LIVE'} mode\n`);

// Match pricing page: apps/site/app/pricing/page.tsx
const TIERS = [
  { key: 'starter', name: 'Hookah+ Starter', monthly: 7900, annual: 79000 },
  { key: 'pro', name: 'Hookah+ Pro', monthly: 24900, annual: 249000 },
  { key: 'trust_plus', name: 'Hookah+ Trust+', monthly: 49900, annual: 499000 },
];

// Add-ons (fixed pricing). agentic_commerce_usage is metered - create manually in Stripe.
const ADDONS = [
  { key: 'flavor_intelligence', name: 'Flavor Intelligence', monthly: 2900, annual: 29000 },
  { key: 'advanced_analytics', name: 'Advanced Analytics', monthly: 4900, annual: 49000 },
  { key: 'staff_performance', name: 'Staff Performance Suite', monthly: 3900, annual: 39000 },
  { key: 'custom_integrations', name: 'Custom Integrations', monthly: 9900, annual: 99000 },
  { key: 'agentic_commerce', name: 'Agentic Commerce', monthly: 4900, annual: 49000 },
  { key: 'priority_support', name: 'Priority Support', monthly: 4900, annual: 49000 },
];

async function ensureProduct(name, metadata = {}) {
  const existing = await stripe.products.list({ limit: 100 });
  const match = existing.data.find((p) => p.name === name);
  if (match) {
    await stripe.products.update(match.id, { metadata, active: true });
    return match.id;
  }
  const created = await stripe.products.create({ name, metadata, active: true });
  return created.id;
}

async function ensurePrice(productId, amount, interval, nickname) {
  const existing = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const match = existing.data.find(
    (p) =>
      p.unit_amount === amount &&
      p.recurring?.interval === interval
  );
  if (match) return match.id;
  const created = await stripe.prices.create({
    product: productId,
    currency: 'usd',
    unit_amount: amount,
    nickname,
    recurring: { interval },
  });
  return created.id;
}

function toEnvKey(key) {
  return key === 'trust_plus' ? 'TRUST_PLUS' : key.split('_').map((s) => s.toUpperCase()).join('_');
}

async function main() {
  const out = { tiers: {}, addons: {}, env: [] };

  for (const tier of TIERS) {
    console.log(`📦 ${tier.name}...`);
    const productId = await ensureProduct(tier.name, { tier: tier.key });
    const monthlyId = await ensurePrice(
      productId,
      tier.monthly,
      'month',
      `${tier.name} $${tier.monthly / 100}/mo`
    );
    const annualId = await ensurePrice(
      productId,
      tier.annual,
      'year',
      `${tier.name} $${tier.annual / 100}/yr`
    );
    out.tiers[tier.key] = { productId, monthlyId, annualId };
    console.log(`   Monthly: ${monthlyId}`);
    console.log(`   Annual:  ${annualId}`);

    const envKey = toEnvKey(tier.key);
    out.env.push(`PRICE_TIER_${envKey}=${monthlyId}`);
    out.env.push(`PRICE_TIER_${envKey}_ANNUAL=${annualId}`);
  }

  console.log('');
  for (const addon of ADDONS) {
    console.log(`📦 Add-on: ${addon.name}...`);
    const productId = await ensureProduct(addon.name, { addon: addon.key });
    const monthlyId = await ensurePrice(
      productId,
      addon.monthly,
      'month',
      `${addon.name} $${addon.monthly / 100}/mo`
    );
    const annualId = await ensurePrice(
      productId,
      addon.annual,
      'year',
      `${addon.name} $${addon.annual / 100}/yr`
    );
    out.addons[addon.key] = { productId, monthlyId, annualId };
    console.log(`   Monthly: ${monthlyId}`);
    console.log(`   Annual:  ${annualId}`);

    const envKey = toEnvKey(addon.key);
    out.env.push(`PRICE_ADDON_${envKey}=${monthlyId}`);
    out.env.push(`PRICE_ADDON_${envKey}_ANNUAL=${annualId}`);
  }

  const outputPath = path.join(__dirname, '../stripe_saas_tiers.out.json');
  fs.writeFileSync(outputPath, JSON.stringify({ tiers: out.tiers, addons: out.addons }, null, 2));

  console.log('\n✅ Done. Output:', outputPath);
  console.log('\n📋 Add these to apps/site .env.local or Vercel:\n');
  out.env.forEach((line) => console.log(line));
  console.log('\n💡 agentic_commerce_usage is metered - create manually in Stripe if needed');
  console.log('💡 Restart the site app and test checkout on /pricing');
}

main().catch((err) => {
  console.error('❌', err.message);
  if (err.type === 'StripeAuthenticationError') {
    console.error('   Check STRIPE_SECRET_KEY in .env.local');
  }
  process.exit(1);
});
