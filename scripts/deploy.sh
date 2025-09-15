#!/bin/bash

# HookahPlus MVP Deployment Script
echo "🚀 Deploying HookahPlus MVP..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Please run this script from the root directory"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build all packages
echo "🔨 Building packages..."
pnpm build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."

# Deploy site (marketing)
echo "Deploying site..."
cd apps/site
vercel --prod --name hookahplus-site
cd ../..

# Deploy app (operator dashboard)  
echo "Deploying operator app..."
cd apps/app
vercel --prod --name hookahplus-app
cd ../..

# Deploy guest (QR flows)
echo "Deploying guest app..."
cd apps/guest
vercel --prod --name hookahplus-guest
cd ../..

echo "✅ Deployment complete!"
echo ""
echo "🌐 URLs:"
echo "  Site: https://hookahplus-site.vercel.app"
echo "  App:  https://hookahplus-app.vercel.app" 
echo "  Guest: https://hookahplus-guest.vercel.app"
echo ""
echo "📋 Next steps:"
echo "  1. Configure custom domains in Vercel"
echo "  2. Set up environment variables"
echo "  3. Run Stripe catalog seed"
echo "  4. Test $1 payment flow"
