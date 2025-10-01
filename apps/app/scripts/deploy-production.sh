#!/bin/bash

# Production Deployment Script for Hookah+ App
# This script deploys to Vercel production with optimized regional settings

echo "🚀 Starting Hookah+ Production Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Vercel CLI ready"

# Deploy to production
echo "🌍 Deploying to Vercel Production (multiple regions)..."

vercel --prod --yes

if [ $? -eq 0 ]; then
    echo "✅ Production deployment successful!"
    echo ""
    echo "🔍 Testing Stripe connectivity..."
    
    # Get the production URL
    PROD_URL=$(vercel ls | grep "hookahplus" | head -1 | awk '{print $2}')
    
    if [ ! -z "$PROD_URL" ]; then
        echo "🌐 Production URL: https://$PROD_URL"
        echo ""
        echo "🧪 Running Stripe health check..."
        curl -s "https://$PROD_URL/api/stripe-health" | jq .
        echo ""
        echo "💳 Testing $1 smoke test..."
        curl -s -X POST "https://$PROD_URL/api/payments/live-test" \
             -H "Content-Type: application/json" \
             -d '{"cartTotal":0,"itemsCount":0}' | jq .
    fi
    
    echo ""
    echo "🎯 Deployment complete! Check Vercel dashboard for regional performance."
else
    echo "❌ Production deployment failed!"
    exit 1
fi
