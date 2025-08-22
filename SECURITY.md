# 🔐 Hookah+ Security Guide

## **API Key Protection**

### **Never Commit These Files:**
- `.env`
- `.env.local`
- `.env.production`
- `stripe-seed/.env`
- Any file containing `sk_test_` or `sk_live_` keys

### **Safe to Commit:**
- `.env.example` (templates only)
- `stripe_ids.out.json` (contains only public price IDs)
- Configuration files with placeholder values

## **Environment Setup**

### **1. Stripe Seeding (Secure)**
```bash
cd stripe-seed
# Windows
setup-secure.bat

# Mac/Linux
chmod +x setup-secure.sh
./setup-secure.sh

# Add your test key to .env file
# Run seeding
npm install
npm run seed
```

### **2. App Environment**
```bash
# In your app root, create .env.local
NEXT_PUBLIC_SITE_URL=https://hookahplus.net
PRICE_SESSION=price_xxx_from_seed_output
PRICE_FLAVOR_ADDON=price_xxx_from_seed_output
PRICE_TIER_PRO=price_xxx_from_seed_output
```

## **Security Checklist**

- [ ] `.env` files are in `.gitignore`
- [ ] Only `NEXT_PUBLIC_*` variables are exposed to client
- [ ] Test keys start with `sk_test_`
- [ ] Production keys are never in development
- [ ] API keys are rotated regularly
- [ ] Access logs are monitored

## **Emergency Response**

If you accidentally commit API keys:

1. **Immediate**: Revoke the exposed keys
2. **Git**: Remove from history with `git filter-branch`
3. **Audit**: Check all commits for exposed secrets
4. **Rotate**: Generate new keys
5. **Monitor**: Watch for unauthorized usage

## **Best Practices**

- Use environment variables for all secrets
- Implement key rotation schedules
- Monitor API usage patterns
- Use least-privilege access
- Regular security audits
