#!/bin/bash

# Verify Vercel Deployments Script
# This script tests all deployed apps to ensure they're working correctly

set -e

echo "🔍 Verifying Vercel Deployments..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs
APP_URL="https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app"
GUESTS_URL="https://guest-dwaynes-projects-1c5c280a.vercel.app"
SITE_URL="https://hookahplus-site-v2.vercel.app"

# Function to test URL
test_url() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name ($url)... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK (200)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED ($response)${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api() {
    local url=$1
    local endpoint=$2
    local name=$3
    
    echo -n "Testing $name API ($url$endpoint)... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url$endpoint")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK (200)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED ($response)${NC}"
        return 1
    fi
}

# Function to test Stripe endpoint
test_stripe() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name Stripe endpoint... "
    
    response=$(curl -s -X POST "$url/api/payments/live-test" \
        -H "Content-Type: application/json" \
        -H "x-admin-token: test-admin-token-123" \
        -d '{"source": "vercel-test"}' \
        -w "%{http_code}")
    
    # Extract status code (last 3 characters)
    status_code="${response: -3}"
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ OK (200)${NC}"
        return 0
    elif [ "$status_code" = "500" ]; then
        echo -e "${YELLOW}⚠️  Stripe Key Issue (500)${NC}"
        return 1
    else
        echo -e "${RED}❌ FAILED ($status_code)${NC}"
        return 1
    fi
}

# Test main pages
echo "📄 Testing Main Pages..."
test_url "$APP_URL" "App"
test_url "$GUESTS_URL" "Guests"
test_url "$SITE_URL" "Site"

echo ""

# Test health endpoints
echo "🏥 Testing Health Endpoints..."
test_api "$APP_URL" "/api/health" "App"
test_api "$GUESTS_URL" "/api/health" "Guests"
test_api "$SITE_URL" "/api/health" "Site"

echo ""

# Test Stripe endpoints
echo "💳 Testing Stripe Endpoints..."
test_stripe "$APP_URL" "App"
test_stripe "$GUESTS_URL" "Guests"

echo ""

# Summary
echo "📊 Deployment Verification Summary:"
echo "=================================="

# Count successes
success_count=0
total_tests=8

# Re-run tests silently to count successes
if test_url "$APP_URL" "App" > /dev/null 2>&1; then ((success_count++)); fi
if test_url "$GUESTS_URL" "Guests" > /dev/null 2>&1; then ((success_count++)); fi
if test_url "$SITE_URL" "Site" > /dev/null 2>&1; then ((success_count++)); fi
if test_api "$APP_URL" "/api/health" "App" > /dev/null 2>&1; then ((success_count++)); fi
if test_api "$GUESTS_URL" "/api/health" "Guests" > /dev/null 2>&1; then ((success_count++)); fi
if test_api "$SITE_URL" "/api/health" "Site" > /dev/null 2>&1; then ((success_count++)); fi
if test_stripe "$APP_URL" "App" > /dev/null 2>&1; then ((success_count++)); fi
if test_stripe "$GUESTS_URL" "Guests" > /dev/null 2>&1; then ((success_count++)); fi

echo "✅ Successful: $success_count/$total_tests"

if [ "$success_count" -eq "$total_tests" ]; then
    echo -e "${GREEN}🎉 All deployments are working correctly!${NC}"
    exit 0
elif [ "$success_count" -ge 6 ]; then
    echo -e "${YELLOW}⚠️  Most deployments are working, but some issues remain.${NC}"
    exit 1
else
    echo -e "${RED}❌ Multiple deployment issues detected.${NC}"
    exit 1
fi
