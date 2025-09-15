# HookahPlus MVP 🚀

**The Future of Hookah Lounge Management**

A production-ready monorepo with timed sessions, smart refills, reservation holds, and Stripe integration.

## 🏗️ Architecture

```
hookahplus/
├── apps/
│   ├── site/        # Marketing (hookahplus.net)
│   ├── app/         # Operator Dashboard (app.hookahplus.net)  
│   └── guest/       # Guest/QR Flows (guest.hookahplus.net)
├── packages/
│   ├── sdk/         # @hookahplus/sdk (typed client)
│   ├── ui/          # Shared UI components
│   ├── server/      # Server utils (stripe/supabase)
│   └── config/      # Shared configs
└── scripts/
    ├── stripe-catalog/  # Product seeding
    └── migrations/      # Database schemas
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp env.template .env.local

# Edit with your values
nano .env.local
```

### 2. Install & Build

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development servers
pnpm dev
```

### 3. Database Setup

1. Create Supabase project
2. Run SQL schema: `scripts/migrations/supabase-schema.sql`
3. Configure RLS policies

### 4. Stripe Setup

```bash
# Seed product catalog
pnpm stripe:seed

# Configure webhooks in Stripe Dashboard:
# - app.hookahplus.net/api/stripe/webhook
# - guest.hookahplus.net/api/stripe/webhook
```

### 5. Deploy

```bash
# Deploy all apps to Vercel
./scripts/deploy.sh
```

## 🔑 Environment Variables

| Key | Site | App | Guest | Description |
|-----|------|-----|-------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | ✅ | ✅ | Stripe publishable key |
| `STRIPE_SECRET_KEY` | ❌ | ✅ | ✅ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET_APP` | ❌ | ✅ | ❌ | App webhook secret |
| `STRIPE_WEBHOOK_SECRET_GUEST` | ❌ | ❌ | ✅ | Guest webhook secret |
| `DATABASE_URL` | ❌ | ✅ | ✅ | Supabase URL |
| `SUPABASE_URL` | ❌ | ✅ | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ❌ | ✅ | ✅ | Supabase anon key |

## 🎯 Core Features

### ✅ Timed Sessions
- Automated session management
- Precise timing controls
- Extension payments via QR

### ✅ Smart Refills  
- Intelligent refill workflow
- SLA tracking and alerts
- Staff assignment

### ✅ Reservation Holds
- Secure table reservations
- $10 payment holds
- No-show protection

### ✅ Stripe Integration
- B2C product catalog
- B2B subscription plans
- Webhook automation

## 🔒 Security

- **Secret Scanning**: Pre-commit hooks with `detect-secrets`
- **RLS Policies**: Multi-tenant data isolation
- **Idempotency**: All write operations protected
- **Audit Logs**: Complete event tracking

## 📊 API Endpoints

### Operator App (`app.hookahplus.net`)

- `POST /api/session/start` - Start new session
- `POST /api/session/extend/checkout` - Create extension checkout
- `POST /api/refill/request` - Request refill
- `POST /api/refill/complete` - Complete refill
- `POST /api/reserve/hold` - Create reservation hold
- `POST /api/stripe/webhook` - Stripe webhook handler

### Guest App (`guest.hookahplus.net`)

- `GET /extend` - Extension checkout page
- `POST /api/refill/request` - Request refill
- `POST /api/stripe/webhook` - Stripe webhook handler

## 🧪 Testing

### $1 Test Payment

```bash
# Create test product
node -e "
const s=require('stripe')(process.env.STRIPE_SECRET_KEY);
(async()=>{
  const p=await s.products.create({name:'Hookah+ $1 Test'});
  const pr=await s.prices.create({product:p.id, unit_amount:100, currency:'usd'});
  console.log('Price ID:', pr.id);
})();
"

# Test checkout
node -e "
const s=require('stripe')(process.env.STRIPE_SECRET_KEY);
(async()=>{
  const cs=await s.checkout.sessions.create({
    mode:'payment',
    line_items:[{price:'<PRICE_ID>', quantity:1}],
    success_url:'https://example.com/success',
    cancel_url:'https://example.com/cancel'
  });
  console.log('Checkout URL:', cs.url);
})();
"
```

## 📈 Monitoring

- **GhostLog**: Complete audit trail
- **SLA Tracking**: Refill response times
- **Revenue Metrics**: Session extensions
- **Staff Performance**: Completion rates

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase schema deployed
- [ ] Stripe catalog seeded
- [ ] Webhooks configured
- [ ] Custom domains set up
- [ ] $1 test payment successful
- [ ] All API endpoints responding
- [ ] RLS policies enforced

## 📞 Support

- **Documentation**: `/docs` endpoint
- **API Health**: `/api/health` endpoint
- **Stripe Status**: Stripe Dashboard
- **Database**: Supabase Dashboard

---

**Built with ❤️ for the future of hookah lounge management**