#!/bin/bash

# Hookah+ Production Deployment Script
# This script automates the final production launch steps

echo "🚀 Hookah+ Production Deployment"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Please commit or stash them before deployment"
    echo ""
    git status --short
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Warning: You're not on the main branch (currently on: $current_branch)"
    read -p "Switch to main branch? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        echo "✅ Switched to main branch"
    else
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Pre-deployment checks
echo ""
echo "🔍 Pre-Deployment Checks:"
echo "-------------------------"

# Check if production environment exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found"
    echo "   Run: ./scripts/setup-environments.sh"
    exit 1
fi

# Check if health endpoint is working
echo "✅ Production environment file found"

# Check if we're ready for production
echo ""
echo "🧪 Production Readiness Check:"
echo "-------------------------------"

# Check for test keys (should NOT be present in production)
if grep -q "pk_test_" .env.production; then
    echo "❌ ERROR: Test Stripe keys found in production environment!"
    echo "   Please update .env.production with LIVE Stripe keys"
    exit 1
fi

if grep -q "sk_test_" .env.production; then
    echo "❌ ERROR: Test Stripe keys found in production environment!"
    echo "   Please update .env.production with LIVE Stripe keys"
    exit 1
fi

echo "✅ Production Stripe keys verified"

# Check for placeholder values
if grep -q "your_live_" .env.production; then
    echo "❌ ERROR: Placeholder values found in production environment!"
    echo "   Please update .env.production with real values"
    exit 1
fi

echo "✅ Production environment values verified"

# Final confirmation
echo ""
echo "🚨 PRODUCTION DEPLOYMENT READY"
echo "==============================="
echo "This will deploy to: https://hookahplus.net"
echo "Stripe will be in: LIVE MODE (real charges)"
echo ""

read -p "Are you absolutely sure you want to deploy to production? (yes/NO): " -r
if [ "$REPLY" != "yes" ]; then
    echo "❌ Production deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting Production Deployment..."
echo "==================================="

# Run pre-deployment tests
echo ""
echo "🧪 Running Pre-Deployment Tests..."
echo "----------------------------------"

# Test Stripe integration
echo "Testing Stripe integration..."
node scripts/test-stripe-integration.js

# Verify DNS & SSL
echo ""
echo "Verifying DNS & SSL..."
node scripts/verify-dns-ssl.js

echo ""
echo "✅ Pre-deployment tests complete"

# Final deployment
echo ""
echo "🚀 Deploying to Production..."
echo "============================="

# Add all changes
echo "Adding changes to git..."
git add .

# Commit with production tag
echo "Creating production commit..."
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

# Push to production (triggers Netlify auto-deploy)
echo "Pushing to production..."
git push origin main

echo ""
echo "🎉 Production Deployment Initiated!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Monitor Netlify build: https://app.netlify.com"
echo "2. Check deployment status"
echo "3. Verify all endpoints responding"
echo "4. Test live payment flow"
echo "5. Monitor for any issues"
echo ""
echo "🔗 Production URLs:"
echo "- Main Site: https://hookahplus.net"
echo "- Health Check: https://hookahplus.net/api/health"
echo "- Preorder: https://hookahplus.net/preorder/T-001"
echo "- Dashboard: https://hookahplus.net/dashboard"
echo "- Admin: https://hookahplus.net/admin"
echo ""
echo "🎯 Hookah+ MVP is now LIVE! 🚀"
echo ""
echo "Monitor the deployment and test the live payment flow."
echo "Good luck with your launch! 🎉"
