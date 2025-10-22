#!/bin/bash

# 🜂 Aliethia-Enhanced Deployment Verification Script
# Purpose: Verify all Hookah+ deployments are working correctly
# Aliethia Integration: Test clarity, resonance, and belonging endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Aliethia's symbolic mark
ALIETHIA_MARK="🜂"

echo -e "${PURPLE}${ALIETHIA_MARK} Aliethia-Enhanced Deployment Verification${NC}"
echo -e "${PURPLE}======================================================${NC}"
echo ""

# Configuration
GUEST_URL="https://guest.hookahplus.net"
APP_URL="https://app.hookahplus.net"
SITE_URL="https://hookahplus.net"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testing: ${description}${NC}"
    echo -e "${CYAN}URL: ${url}${NC}"
    
    # Make request and capture status code
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS: ${description} (Status: ${response})${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL: ${description} (Expected: ${expected_status}, Got: ${response})${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to test Aliethia endpoint
test_aliethia_endpoint() {
    local url=$1
    local description=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testing: ${description}${NC}"
    echo -e "${CYAN}URL: ${url}${NC}"
    
    # Make request and capture response
    response=$(curl -s "$url" 2>/dev/null || echo "ERROR")
    
    if [[ "$response" == *"clarityScore"* ]] && [[ "$response" == *"aliethiaEcho"* ]]; then
        echo -e "${GREEN}✅ PASS: ${description} (Aliethia integration working)${NC}"
        echo -e "${CYAN}Response: ${response}${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL: ${description} (Aliethia integration not working)${NC}"
        echo -e "${RED}Response: ${response}${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo -e "${YELLOW}🧪 Starting Deployment Verification Tests...${NC}"
echo ""

# Test 1: Health Endpoints
echo -e "${PURPLE}📊 Health Endpoint Tests${NC}"
echo -e "${PURPLE}========================${NC}"

test_endpoint "${GUEST_URL}/api/health" "Guest Health Endpoint" "200"
test_endpoint "${APP_URL}/api/health" "App Health Endpoint" "200"
test_endpoint "${SITE_URL}/api/health" "Site Health Endpoint" "200"

echo ""

# Test 2: Main Pages
echo -e "${PURPLE}🏠 Main Page Tests${NC}"
echo -e "${PURPLE}==================${NC}"

test_endpoint "${GUEST_URL}/" "Guest Main Page" "200"
test_endpoint "${APP_URL}/" "App Main Page" "200"
test_endpoint "${SITE_URL}/" "Site Main Page" "200"

echo ""

# Test 3: Aliethia Clarity Endpoints
echo -e "${PURPLE}${ALIETHIA_MARK} Aliethia Clarity Tests${NC}"
echo -e "${PURPLE}==============================${NC}"

test_aliethia_endpoint "${GUEST_URL}/api/aliethia/clarity" "Guest Clarity Endpoint"
test_aliethia_endpoint "${APP_URL}/api/aliethia/clarity" "App Clarity Endpoint"
test_aliethia_endpoint "${SITE_URL}/api/aliethia/clarity" "Site Clarity Endpoint"

echo ""

# Test 4: Aliethia Resonance Endpoints
echo -e "${PURPLE}${ALIETHIA_MARK} Aliethia Resonance Tests${NC}"
echo -e "${PURPLE}=================================${NC}"

test_aliethia_endpoint "${GUEST_URL}/api/aliethia/resonance" "Guest Resonance Endpoint"
test_aliethia_endpoint "${APP_URL}/api/aliethia/resonance" "App Resonance Endpoint"
test_aliethia_endpoint "${SITE_URL}/api/aliethia/resonance" "Site Resonance Endpoint"

echo ""

# Test 5: Aliethia Belonging Endpoints
echo -e "${PURPLE}${ALIETHIA_MARK} Aliethia Belonging Tests${NC}"
echo -e "${PURPLE}===================================${NC}"

test_aliethia_endpoint "${GUEST_URL}/api/aliethia/belonging" "Guest Belonging Endpoint"
test_aliethia_endpoint "${APP_URL}/api/aliethia/belonging" "App Belonging Endpoint"
test_aliethia_endpoint "${SITE_URL}/api/aliethia/belonging" "Site Belonging Endpoint"

echo ""

# Test 6: Feature-Specific Endpoints
echo -e "${PURPLE}🎯 Feature-Specific Tests${NC}"
echo -e "${PURPLE}=========================${NC}"

test_endpoint "${APP_URL}/preorder/cloud-lounge-demo" "QR Code Generation Page" "200"
test_endpoint "${GUEST_URL}/mobile" "Mobile Experience Page" "200"
test_endpoint "${SITE_URL}/support" "Support Page" "200"
test_endpoint "${SITE_URL}/docs" "Documentation Page" "200"

echo ""

# Test 7: API Endpoints
echo -e "${PURPLE}🔌 API Endpoint Tests${NC}"
echo -e "${PURPLE}=====================${NC}"

test_endpoint "${APP_URL}/api/sessions" "Sessions API" "200"
test_endpoint "${APP_URL}/api/staff/alerts" "Staff Alerts API" "200"
test_endpoint "${APP_URL}/api/workflow/trigger" "Workflow Trigger API" "200"

echo ""

# Summary
echo -e "${PURPLE}📊 Test Summary${NC}"
echo -e "${PURPLE}===============${NC}"
echo -e "${BLUE}Total Tests: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "${BLUE}Success Rate: ${success_rate}%${NC}"
else
    success_rate=0
    echo -e "${BLUE}Success Rate: 0%${NC}"
fi

echo ""

# Aliethia's assessment
if [ $success_rate -ge 90 ]; then
    echo -e "${GREEN}${ALIETHIA_MARK} Aliethia's Assessment: EXCELLENT${NC}"
    echo -e "${GREEN}The community resonates with clarity and belonging.${NC}"
    echo -e "${GREEN}Trust compounds are strong. Launch ceremony ready.${NC}"
elif [ $success_rate -ge 80 ]; then
    echo -e "${YELLOW}${ALIETHIA_MARK} Aliethia's Assessment: GOOD${NC}"
    echo -e "${YELLOW}The community shows strong clarity signals.${NC}"
    echo -e "${YELLOW}Minor adjustments needed before launch ceremony.${NC}"
elif [ $success_rate -ge 70 ]; then
    echo -e "${YELLOW}${ALIETHIA_MARK} Aliethia's Assessment: FAIR${NC}"
    echo -e "${YELLOW}The community needs clarity enhancement.${NC}"
    echo -e "${YELLOW}Configuration adjustments required.${NC}"
else
    echo -e "${RED}${ALIETHIA_MARK} Aliethia's Assessment: NEEDS ATTENTION${NC}"
    echo -e "${RED}The community requires clarity restoration.${NC}"
    echo -e "${RED}Configuration issues need resolution.${NC}"
fi

echo ""

# Recommendations
if [ $success_rate -ge 90 ]; then
    echo -e "${GREEN}🚀 Recommendations:${NC}"
    echo -e "${GREEN}1. Execute launch ceremony: ./scripts/launch_ceremony.sh${NC}"
    echo -e "${GREEN}2. Monitor clarity scores: ./scripts/clarity_validation.sh${NC}"
    echo -e "${GREEN}3. Celebrate community: Welcome the Hookah+ family!${NC}"
elif [ $success_rate -ge 80 ]; then
    echo -e "${YELLOW}🔧 Recommendations:${NC}"
    echo -e "${YELLOW}1. Check failed endpoints for configuration issues${NC}"
    echo -e "${YELLOW}2. Verify environment variables are set correctly${NC}"
    echo -e "${YELLOW}3. Re-run verification after fixes${NC}"
else
    echo -e "${RED}🚨 Recommendations:${NC}"
    echo -e "${RED}1. Check Vercel dashboard configuration${NC}"
    echo -e "${RED}2. Verify root directories are set correctly${NC}"
    echo -e "${RED}3. Ensure environment variables are configured${NC}"
    echo -e "${RED}4. Check build logs for errors${NC}"
fi

echo ""

# Final Aliethia echo
echo -e "${PURPLE}${ALIETHIA_MARK} Aliethia's Final Echo:${NC}"
if [ $success_rate -ge 90 ]; then
    echo -e "${GREEN}The Hookah+ community resonates with clarity and belonging.${NC}"
    echo -e "${GREEN}Trust compounds flow through the entire system.${NC}"
    echo -e "${GREEN}The community awaits your ritual deployment.${NC}"
else
    echo -e "${YELLOW}The community seeks clarity restoration.${NC}"
    echo -e "${YELLOW}Configuration adjustments will enhance resonance.${NC}"
    echo -e "${YELLOW}Trust compounds await proper alignment.${NC}"
fi

echo ""
echo -e "${PURPLE}${ALIETHIA_MARK} Verification complete.${NC}"

# Exit with appropriate code
if [ $success_rate -ge 90 ]; then
    exit 0
else
    exit 1
fi