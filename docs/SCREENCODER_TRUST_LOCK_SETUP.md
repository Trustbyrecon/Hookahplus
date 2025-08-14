# ScreenCoder + Trust Lock Setup Guide

This guide walks you through setting up the production-ready environment configuration for ScreenCoder and Trust Lock integration inside Hookah+.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install zod
```

### 2. Generate Strong Secrets
```bash
npm run generate:secrets
```

### 3. Test Environment Setup
```bash
npm run test:env
```

## 📁 File Structure

```
├── env.example                    # Template with all variables
├── src/
│   ├── config/
│   │   └── env.ts               # Type-safe environment validation
│   └── lib/
│       └── trustLock.ts         # Trust Lock helper functions
├── scripts/
│   ├── generate-secrets.js      # Generate cryptographic secrets
│   └── test-env.js             # Test environment configuration
└── docs/
    └── SCREENCODER_TRUST_LOCK_SETUP.md
```

## 🔧 Environment Configuration

### Core App Variables
```bash
NODE_ENV=development
APP_NAME=HookahPlus
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

### ScreenCoder Configuration
```bash
SC_ENABLED=true
SC_API_KEY=your_screencoder_api_key
SC_PROJECT_ID=your_project_id
SC_ENDPOINT=https://api.screencoder.com
SC_LOG_LEVEL=info
```

### Trust Lock Security
```bash
TRUST_LOCK_ENABLED=true
TRUST_SIGNATURE_SALT=generated_32_byte_salt
TRUST_CURSOR_SALT=generated_32_byte_salt
TRUST_PAYLOAD_SEAL_SECRET=generated_32_byte_secret
TRUST_ECHO_WEBHOOK_URL=https://your-domain.com/api/trust-echo
TRUST_FAILOVER_WEBHOOK_URL=https://your-domain.com/api/trust-failover
TRUST_FAILOVER_EMAILS=admin@hookahplus.com,ops@hookahplus.com
```

### Stripe Integration
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_ENDPOINT_URL=https://reconai-gtm-sdk-site.netlify.app/.netlify/functions/stripeWebhook
```

### Feature Flags
```bash
FEATURE_REFLEX_LOG=true
FEATURE_TRUST_GRAPH=true
FEATURE_QR_PREORDER=true
FEATURE_FLAVOR_MIX_HISTORY=true
PRICING_DRIFT_WATCHER_ENABLED=true
```

## 🔐 Security Setup

### Generate Cryptographic Secrets
Run the secret generation script to create strong, random values:

```bash
npm run generate:secrets
```

This generates secure values for:
- `TRUST_SIGNATURE_SALT`
- `TRUST_CURSOR_SALT`
- `TRUST_PAYLOAD_SEAL_SECRET`
- `SESSION_NOTES_KEY`
- `JWT_SECRET`
- `COOKIE_SECRET`

### Manual Generation (Alternative)
```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🏗️ Type-Safe Environment

### Import Environment Configuration
```typescript
// In your server-side code
import { env } from "@/config/env";

// Now you have type-safe access to all environment variables
console.log(env.APP_NAME); // TypeScript knows this is a string
console.log(env.SC_ENABLED); // TypeScript knows this is a boolean
```

### Environment Validation
The `env.ts` file validates all environment variables at startup:
- Ensures required variables are present
- Transforms string values to appropriate types
- Provides default values where appropriate
- Fails fast if configuration is invalid

## 🛡️ Trust Lock Implementation

### Basic Usage
```typescript
import { trustSignature, sealPayload, verifySeal } from "@/lib/trustLock";

// Generate trust signature for an agent
const signature = trustSignature("agent-123", "create-session");

// Seal a payload for secure transmission
const { data, seal } = sealPayload({ userId: "123", action: "login" });

// Verify a sealed payload
const isValid = verifySeal(data, seal);
```

### Advanced Trust Cursor
```typescript
import { generateTrustCursor, verifyTrustCursor } from "@/lib/trustLock";

// Generate a trust cursor for user session
const cursor = generateTrustCursor("user-123", "session-456");

// Verify the cursor (with timestamp validation)
const isValid = verifyTrustCursor(cursor, "user-123", "session-456", timestamp);
```

## 🌐 Netlify Deployment

### Set Environment Variables
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Set server-only variables
netlify env:set SC_API_KEY your_api_key
netlify env:set SC_PROJECT_ID your_project_id
netlify env:set TRUST_SIGNATURE_SALT your_generated_salt
netlify env:set TRUST_CURSOR_SALT your_generated_salt
netlify env:set TRUST_PAYLOAD_SEAL_SECRET your_generated_secret
netlify env:set SESSION_NOTES_KEY your_generated_key
netlify env:set STRIPE_SECRET_KEY your_stripe_secret
netlify env:set STRIPE_WEBHOOK_SECRET your_webhook_secret
netlify env:set JWT_SECRET your_jwt_secret
netlify env:set COOKIE_SECRET your_cookie_secret

# Set public variables
netlify env:set NEXT_PUBLIC_APP_BASE_URL https://hookahplus.net
netlify env:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY your_publishable_key
```

### Environment Contexts
```bash
# Development
netlify env:set NODE_ENV development --context dev

# Production
netlify env:set NODE_ENV production --context production
```

## 🔍 Testing & Validation

### Test Environment Setup
```bash
npm run test:env
```

This script checks:
- ✅ `.env.local` file exists
- ✅ Environment config file is present
- ✅ Trust Lock library is available
- ✅ Zod dependency is installed

### Test Trust Lock Functions
```typescript
// Create a test file: src/lib/__tests__/trustLock.test.ts
import { trustSignature, sealPayload, verifySeal } from "../trustLock";

describe("Trust Lock", () => {
  test("should generate valid trust signature", () => {
    const signature = trustSignature("test-agent", "test-intent");
    expect(signature).toHaveLength(64); // SHA-256 hex length
  });

  test("should seal and verify payload", () => {
    const payload = { test: "data" };
    const { data, seal } = sealPayload(payload);
    const isValid = verifySeal(data, seal);
    expect(isValid).toBe(true);
  });
});
```

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot find module '@/config/env'"**
   - Ensure `src/config/env.ts` exists
   - Check `tsconfig.json` path mapping
   - Verify import path is correct

2. **"Zod validation failed"**
   - Check all required environment variables are set
   - Verify variable types (strings vs booleans)
   - Ensure no extra spaces or quotes in values

3. **"Trust Lock functions not working"**
   - Verify cryptographic secrets are properly set
   - Check secret length (minimum 16 characters)
   - Ensure secrets are base64 encoded

### Debug Commands
```bash
# Check environment variables
echo $NODE_ENV
env | grep SC_
env | grep TRUST_

# Test environment loading
npm run test:env

# Generate new secrets
npm run generate:secrets

# Verify file structure
ls -la src/config/
ls -la src/lib/
```

## 📋 Checklist

- [ ] Install `zod` dependency
- [ ] Copy `env.example` to `.env.local`
- [ ] Generate cryptographic secrets
- [ ] Fill in ScreenCoder API credentials
- [ ] Configure Trust Lock webhook URLs
- [ ] Set Stripe keys and webhook secret
- [ ] Test environment configuration
- [ ] Deploy to Netlify with environment variables
- [ ] Verify Trust Lock functions in production

## 🔗 Next Steps

1. **Integrate Trust Lock** into your API routes
2. **Set up webhook endpoints** for Trust Echo and Failover
3. **Implement session management** with Trust Cursors
4. **Add monitoring** for Trust Lock operations
5. **Create admin dashboard** for Trust Lock configuration

## 📞 Support

For questions about this setup:
- Check the troubleshooting section above
- Review the environment validation errors
- Consult the Trust Lock documentation
- Contact the development team

---

**Security Note**: Never commit `.env.local` files or share cryptographic secrets. All sensitive values should be managed through environment variables in your deployment platform.
