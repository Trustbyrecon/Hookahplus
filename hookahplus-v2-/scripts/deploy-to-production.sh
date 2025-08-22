#!/bin/bash

# Hookah+ Production Deployment Script
# Deploys to hookahplus.net via Netlify

set -e

echo "🚀 Hookah+ Production Deployment"
echo "================================="
echo "Target: https://hookahplus.net"
echo ""

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ ERROR: Must be on main branch to deploy to production"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Please checkout main: git checkout main"
    exit 1
fi

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ ERROR: You have uncommitted changes"
    echo "Please commit or stash them before deploying"
    git status --short
    exit 1
fi

# Check if we have a remote origin
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ ERROR: No remote origin configured"
    echo "Please add your GitHub remote: git remote add origin <your-repo-url>"
    exit 1
fi

# Verify production environment
echo "🔍 Verifying production environment..."
if [ ! -f ".env.production" ]; then
    echo "⚠️  WARNING: .env.production not found"
    echo "Please create it from env.production.template"
    echo "cp env.production.template .env.production"
    echo ""
    read -p "Continue anyway? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check for test keys in production
if grep -q "sk_test_" .env.production 2>/dev/null; then
    echo "❌ ERROR: Test Stripe keys found in production environment!"
    echo "Please update .env.production with LIVE Stripe keys"
    exit 1
fi

if grep -q "pk_test_" .env.production 2>/dev/null; then
    echo "❌ ERROR: Test Stripe keys found in production environment!"
    echo "Please update .env.production with LIVE Stripe keys"
    exit 1
fi

echo "✅ Production environment verified"

# Run pre-deployment tests
echo ""
echo "🧪 Running pre-deployment tests..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Final confirmation
echo ""
echo "🚨 PRODUCTION DEPLOYMENT READY"
echo "==============================="
echo "This will deploy to: https://hookahplus.net"
echo "Stripe will be in: LIVE MODE (real charges)"
echo "Netlify will auto-deploy from main branch"
echo ""

read -p "Are you absolutely sure you want to deploy to production? (yes/NO): " -r
if [ "$REPLY" != "yes" ]; then
    echo "❌ Production deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting Production Deployment..."
echo "==================================="

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git commit -m "🚀 Production Launch - Hookah+ MVP v1.0.0

- Live Stripe integration
- Production environment configured
- Mobile responsive design
- Analytics tracking enabled
- Trust-Lock security active
- MVP Agent Consensus System
- Admin Control Center
- End-to-end payment flow

Deploying to: https://hookahplus.net
Stripe Mode: LIVE
Launch Date: $(date)"
else
    echo "ℹ️  No changes to commit"
fi

# Push to production (triggers Netlify auto-deploy)
echo "🚀 Pushing to production..."
git push origin main

echo ""
echo "✅ Production deployment initiated!"
echo "=================================="
echo ""
echo "📋 Deployment Status:"
echo "1. ✅ Code pushed to main branch"
echo "2. 🔄 Netlify auto-deploy triggered"
echo "3. 🌐 Deploying to hookahplus.net"
echo "4. 🔒 Live Stripe integration active"
echo ""
echo "📊 Monitor deployment at:"
echo "   https://app.netlify.com/sites/your-site/deploys"
echo ""
echo "🧪 Next Steps:"
echo "1. Wait for Netlify deployment to complete"
echo "2. Verify site is live at https://hookahplus.net"
echo "3. Run live mode verification tests"
echo "4. Complete $1 transaction test"
echo "5. Launch MVP to customers"
echo ""
echo "🎉 Hookah+ is going live! 🚀"
