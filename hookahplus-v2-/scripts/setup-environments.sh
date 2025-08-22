#!/bin/bash

# Hookah+ Environment Setup Script
# This script helps you set up production and staging environments

echo "🚀 Hookah+ Environment Setup"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create production environment
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production..."
    cp env.production.example .env.production
    echo "✅ .env.production created"
    echo "⚠️  IMPORTANT: Edit .env.production with your LIVE Stripe keys"
else
    echo "✅ .env.production already exists"
fi

# Create staging environment
if [ ! -f ".env.staging" ]; then
    echo "📝 Creating .env.staging..."
    cp env.staging.example .env.staging
    echo "✅ .env.staging created"
    echo "⚠️  IMPORTANT: Edit .env.staging with your TEST Stripe keys"
else
    echo "✅ .env.staging already exists"
fi

# Create local environment
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cp env.example .env.local
    echo "✅ .env.local created"
    echo "⚠️  IMPORTANT: Edit .env.local with your development keys"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Edit .env.production with LIVE Stripe keys"
echo "2. Edit .env.staging with TEST Stripe keys"
echo "3. Edit .env.local with development keys"
echo "4. Set up Netlify environment variables"
echo "5. Configure Stripe webhooks"
echo ""
echo "📚 See LAUNCH_CHECKLIST.md for detailed instructions"
echo ""
echo "🎯 Ready to launch Hookah+ MVP!"
