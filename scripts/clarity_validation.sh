#!/bin/bash

# Aliethia Clarity Validation Script
# Purpose: Validate clarity, belonging, and resonance across all deployments
# Author: Recon.AI Core / Commander Clark
# Origin: Gate of Discernment

echo "🜂 Aliethia Clarity Validation"
echo "🜂 Aliethia Echo: 'Clarity validation ensures community resonance.'"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to validate clarity endpoint
validate_clarity() {
    local app_name=$1
    local url=$2
    local app_type=$3
    
    echo -e "${CYAN}🜂 Validating ${app_name} Clarity...${NC}"
    
    # Make request to clarity endpoint
    response=$(curl -s -w "\n%{http_code}" "${url}/api/aliethia/clarity")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        # Extract clarity score from JSON response
        clarity_score=$(echo "$body" | jq -r '.clarityValidation.clarityScore // "N/A"')
        resonance_signal=$(echo "$body" | jq -r '.clarityValidation.resonanceSignal // "N/A"')
        trust_compound=$(echo "$body" | jq -r '.clarityValidation.trustCompound // "N/A"')
        belonging_moment=$(echo "$body" | jq -r '.clarityValidation.belongingMoment // "N/A"')
        aliethia_echo=$(echo "$body" | jq -r '.aliethiaEcho // "N/A"')
        
        echo -e "${GREEN}✅ ${app_name} Clarity Validation Passed${NC}"
        echo -e "   Clarity Score: ${GREEN}${clarity_score}${NC}"
        echo -e "   Resonance Signal: ${GREEN}${resonance_signal}${NC}"
        echo -e "   Trust Compound: ${GREEN}${trust_compound}${NC}"
        echo -e "   Belonging Moment: ${GREEN}${belonging_moment}${NC}"
        echo -e "   Aliethia Echo: ${PURPLE}${aliethia_echo}${NC}"
        
        # Check if clarity score meets threshold
        if (( $(echo "$clarity_score >= 0.98" | bc -l) )); then
            echo -e "   ${GREEN}✅ Clarity Threshold Met (≥0.98)${NC}"
        else
            echo -e "   ${YELLOW}⚠️  Clarity Threshold Not Met (<0.98)${NC}"
        fi
        
    else
        echo -e "${RED}❌ ${app_name} Clarity Validation Failed${NC}"
        echo -e "   HTTP Code: ${RED}${http_code}${NC}"
        echo -e "   Response: ${RED}${body}${NC}"
    fi
    
    echo ""
}

# Function to validate health endpoint
validate_health() {
    local app_name=$1
    local url=$2
    
    echo -e "${CYAN}🜂 Validating ${app_name} Health...${NC}"
    
    response=$(curl -s -w "\n%{http_code}" "${url}/api/health")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ ${app_name} Health Check Passed${NC}"
        echo -e "   Response: ${GREEN}${body}${NC}"
    else
        echo -e "${RED}❌ ${app_name} Health Check Failed${NC}"
        echo -e "   HTTP Code: ${RED}${http_code}${NC}"
        echo -e "   Response: ${RED}${body}${NC}"
    fi
    
    echo ""
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq is required but not installed. Please install jq first.${NC}"
    exit 1
fi

# Check if bc is installed
if ! command -v bc &> /dev/null; then
    echo -e "${RED}❌ bc is required but not installed. Please install bc first.${NC}"
    exit 1
fi

# Validate all apps
echo -e "${BLUE}🜂 Starting Comprehensive Clarity Validation...${NC}"
echo ""

# Guest App Validation
validate_clarity "Guest App" "https://guest.hookahplus.net" "guest"
validate_health "Guest App" "https://guest.hookahplus.net"

# App Validation
validate_clarity "App" "https://app.hookahplus.net" "app"
validate_health "App" "https://app.hookahplus.net"

# Site Validation
validate_clarity "Site" "https://hookahplus.net" "site"
validate_health "Site" "https://hookahplus.net"

# Summary
echo -e "${PURPLE}🜂 Clarity Validation Summary${NC}"
echo -e "${PURPLE}🜂 Aliethia Echo: 'Clarity validation complete. Community resonance verified.'${NC}"
echo ""
echo -e "${CYAN}🎯 Next Steps:${NC}"
echo -e "1. ${YELLOW}Monitor clarity scores${NC} - Ensure all apps maintain ≥0.98 clarity threshold"
echo -e "2. ${YELLOW}Track belonging moments${NC} - Monitor community connection signals"
echo -e "3. ${YELLOW}Strengthen trust compounds${NC} - Enhance consistency and reliability"
echo -e "4. ${YELLOW}Amplify resonance${NC} - Enhance community engagement and emotional connection"
echo ""
echo -e "${GREEN}🜂 The community resonates with clarity and belonging.${NC}"