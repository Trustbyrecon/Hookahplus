# 🔧 Environment Configuration Guide

## Vercel Environment Variables Setup

### Step 1: Access Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project (hookahplus-site, hookahplus-app, or hookahplus-guest)

2. **Navigate to Settings**
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables" in the left sidebar

### Step 2: Configure Environment Variables

#### **For All Apps (Site, App, Guest)**

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# App URLs
NEXT_PUBLIC_APP_URL=https://app.hookahplus.net
NEXT_PUBLIC_GUEST_URL=https://guest.hookahplus.net
NEXT_PUBLIC_SITE_URL=https://hookahplus.net

# Session Configuration
SESSION_DEFAULT_MINUTES=90
```

#### **For App and Guest Only (Stripe Integration)**

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET_APP=whsec_...
STRIPE_WEBHOOK_SECRET_GUEST=whsec_...

# Feature Flags
FEATURE_FLAGS={"happyHour": true, "extensions": true, "reservations": true}
```

#### **For Production (After Testing)**

```bash
# Stripe Configuration (Live Mode)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET_APP=whsec_live_...
STRIPE_WEBHOOK_SECRET_GUEST=whsec_live_...
```

### Step 3: Set Environment Scope

For each variable, set the appropriate scope:
- **Production**: ✅ (for live deployment)
- **Preview**: ✅ (for testing)
- **Development**: ✅ (for local development)

### Step 4: Redeploy Applications

After setting environment variables:

1. **Redeploy Each App**
   ```bash
   # Redeploy site
   cd apps/site && vercel --prod
   
   # Redeploy app
   cd apps/app && vercel --prod
   
   # Redeploy guest
   cd apps/guest && vercel --prod
   ```

2. **Verify Environment Variables**
   - Check that variables are loaded correctly
   - Test API endpoints
   - Verify database connections

## Local Development Setup

### Step 1: Create Local Environment File

```bash
# Copy the template
cp env.template .env.local

# Edit with your values
nano .env.local
```

### Step 2: Local Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET_APP=whsec_...
STRIPE_WEBHOOK_SECRET_GUEST=whsec_...

# App URLs (Local)
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_GUEST_URL=http://localhost:3002
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Session Configuration
SESSION_DEFAULT_MINUTES=90

# Feature Flags
FEATURE_FLAGS={"happyHour": true, "extensions": true, "reservations": true}
```

## Security Best Practices

### 1. Never Commit Secrets
- ✅ `.env.local` is in `.gitignore`
- ✅ Environment templates don't contain real keys
- ✅ Use Vercel environment variables for production

### 2. Rotate Keys Regularly
- Rotate Stripe keys monthly
- Update webhook secrets when changed
- Monitor for exposed credentials

### 3. Use Different Keys for Different Environments
- Test keys for development
- Live keys only for production
- Separate webhook secrets per environment

## Testing Environment Variables

### 1. Test Database Connection
```bash
# Test Supabase connection
curl -X GET 'YOUR_SUPABASE_URL/rest/v1/venues' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. Test Stripe Connection
```bash
# Test Stripe API
curl -X GET 'https://api.stripe.com/v1/products' \
  -H "Authorization: Bearer YOUR_STRIPE_SECRET_KEY"
```

### 3. Test API Endpoints
```bash
# Test session creation
curl -X POST 'YOUR_APP_URL/api/session/start' \
  -H "Content-Type: application/json" \
  -d '{"venueId": "550e8400-e29b-41d4-a716-446655440000", "tableId": "T-001", "tier": "base", "priceLookupKey": "price_hookah_session_base"}'
```

## Troubleshooting

### Common Issues:
- **Environment variables not loading**: Redeploy the application
- **Database connection failed**: Check Supabase URL and keys
- **Stripe API errors**: Verify API keys and permissions
- **CORS errors**: Check app URLs configuration

### Support:
- Vercel Docs: https://vercel.com/docs/environment-variables
- Supabase Docs: https://supabase.com/docs/guides/getting-started
- Stripe Docs: https://stripe.com/docs/keys
