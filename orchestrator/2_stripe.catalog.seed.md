# Task 2 — billing.catalog.seed
**Role:** Seed Stripe (TEST mode) with MVP catalog, emit IDs, wire to env.

## Objective
Create products/prices for Sessions, Flavor Add-ons, and Trust Core tier. Output IDs → `stripe_ids.out.json`. Do TEST first.

## Inputs
- `STRIPE_SECRET_KEY=sk_test_...` (in `stripe-seed/.env`)
- Node 18+

## Deliverables
- `stripe-seed/products.json`
- `stripe-seed/seed.js`
- `stripe-seed/.env` (not committed)
- `stripe_ids.out.json`
- Env wiring PR (`.env.local` entries like `PRICE_SESSION`, `PRICE_FLAVOR_ADDON`, `PRICE_TIER_PRO`)

## Checklist
- [ ] Create `stripe-seed/` folder
- [ ] Add `products.json` (MVP catalog)
- [ ] Add `seed.js` and run
- [ ] Verify in Stripe Dashboard (TEST)
- [ ] Write IDs to `.env.local` (Next.js)

## Files & Commands

**products.json**
```json
{
  "currency": "usd",
  "products": [
    { "name": "Hookah Session", "type": "one_time", "unit_amount": 3000, "lookup_key": "hookah_session" },
    { "name": "Flavor Add-on", "type": "one_time", "unit_amount": 150, "lookup_key": "flavor_addon_150" },
    { "name": "Trust Core (Pro)", "type": "recurring", "unit_amount": 24900, "interval": "month", "lookup_key": "trust_core_pro_mo" }
  ]
}
```

**seed.js**
```javascript
#!/usr/bin/env node
const fs = require('fs');
require('dotenv').config();
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) { 
  console.error('Missing STRIPE_SECRET_KEY'); 
  process.exit(1); 
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const src = JSON.parse(fs.readFileSync('./products.json','utf8'));

(async () => {
  const out = { products:{}, prices:{} };
  
  for (const p of src.products) {
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
    console.log(`${p.name}: ${product.id} / ${price.id}`);
  }
  
  fs.writeFileSync('../stripe_ids.out.json', JSON.stringify(out, null, 2));
  console.log('Wrote ../stripe_ids.out.json');
})();
```

**.env (TEST)**
```
STRIPE_SECRET_KEY=sk_test_***
```

**Run**
```bash
mkdir -p stripe-seed && cd stripe-seed
npm init -y && npm i stripe dotenv
printf "%s" "STRIPE_SECRET_KEY=sk_test_xxx" > .env
printf "%s" '{ "currency":"usd","products":[{"name":"Hookah Session","type":"one_time","unit_amount":3000,"lookup_key":"hookah_session"},{"name":"Flavor Add-on","type":"one_time","unit_amount":150,"lookup_key":"flavor_addon_150"},{"name":"Trust Core (Pro)","type":"recurring","unit_amount":24900,"interval":"month","lookup_key":"trust_core_pro_mo"}] }' > products.json
node seed.js
cd ..
```

**Wire IDs to app**
Append to `.env.local` (values from `stripe_ids.out.json`):
```
NEXT_PUBLIC_SITE_URL=https://hookahplus.net
PRICE_SESSION=price_xxx
PRICE_FLAVOR_ADDON=price_xxx
PRICE_TIER_PRO=price_xxx
```

## Acceptance
- Products/prices visible in Stripe (TEST)
- `stripe_ids.out.json` exists and valid
- `.env.local` updated with price IDs

## Guardrails
- Do not run against LIVE without explicit approval and separate `.env`
- Never commit secrets

## Reflex Score
- +0.5 valid IDs file
- +0.3 dashboard verified
- +0.2 env wiring PR
