# Stripe Seed Setup - Secure Configuration

## 🔐 **Security First**

**NEVER commit API keys to version control!**

## **Setup Steps**

### 1. Create Environment File
```bash
# In stripe-seed directory
cp .env.example .env
```

### 2. Add Your Test Keys
```bash
# Edit .env file (not committed)
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

### 3. Run Seeding
```bash
npm install
node seed.js
```

### 4. Update App Environment
The script will output `stripe_ids.out.json`. Copy the price IDs to your `.env.local`:

```bash
# In your app root .env.local
PRICE_SESSION=price_xxx_from_output
PRICE_FLAVOR_ADDON=price_xxx_from_output
PRICE_TIER_PRO=price_xxx_from_output
```

## **File Structure**
```
stripe-seed/
├── .env.example          # Template (committed)
├── .env                  # Your keys (NOT committed)
├── products.json         # Product definitions
├── seed.js              # Seeding script
└── package.json         # Dependencies
```

## **Security Checklist**
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` contains no real keys
- [ ] Only `NEXT_PUBLIC_*` variables are exposed to client
- [ ] Secret keys only exist in local `.env` files
