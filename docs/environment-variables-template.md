# Environment Variables Template

## 🔑 **Required Environment Variables**

### **For hookahplus-app**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51Q1234567890abcdef
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef

# App Configuration
NEXT_PUBLIC_SITE_URL=https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app
ADMIN_TEST_TOKEN=test-admin-token-123

# Optional Supabase (if needed)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **For hookahplus-guests**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51Q1234567890abcdef

# App Configuration
NEXT_PUBLIC_APP_URL=https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app
NEXT_PUBLIC_SITE_URL=https://guest-dwaynes-projects-1c5c280a.vercel.app
ADMIN_TEST_TOKEN=test-admin-token-123

# Optional Supabase (if needed)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **For hookahplus-site**
```bash
# App Configuration
NEXT_PUBLIC_SITE_URL=https://hookahplus-site-v2.vercel.app

# Optional Features
HPLUS_PRETTY_THEME=1
```

## 📋 **Setting Environment Variables in Vercel**

1. **Go to Project Settings**
   - Navigate to your Vercel project
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

2. **Add Each Variable**
   - Click "Add New"
   - Enter the variable name
   - Enter the variable value
   - Select environments (Production, Preview, Development)
   - Click "Save"

3. **Redeploy Project**
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Wait for deployment to complete

## 🧪 **Testing Environment Variables**

After setting the variables, test each app:

```bash
# Test health endpoints
curl https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/api/health
curl https://guest-dwaynes-projects-1c5c280a.vercel.app/api/health
curl https://hookahplus-site-v2.vercel.app/api/health

# Test Stripe endpoints
curl -X POST https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app/api/payments/live-test \
  -H "Content-Type: application/json" \
  -H "x-admin-token: test-admin-token-123" \
  -d '{"source": "vercel-test"}'

curl -X POST https://guest-dwaynes-projects-1c5c280a.vercel.app/api/payments/live-test \
  -H "Content-Type: application/json" \
  -H "x-admin-token: test-admin-token-123" \
  -d '{"source": "vercel-test"}'
```

## ⚠️ **Important Notes**

1. **Stripe Keys**: Use real Stripe test keys for actual testing
2. **Environment Scope**: Set variables for all environments (Production, Preview, Development)
3. **Security**: Never commit real API keys to the repository
4. **Testing**: Always test after setting environment variables

## 🔧 **Troubleshooting**

- **404 Errors**: Check root directory settings
- **500 Errors**: Check environment variables are set
- **Invalid API Key**: Verify Stripe secret key is correct
- **Build Failures**: Check install command includes `--no-frozen-lockfile`
