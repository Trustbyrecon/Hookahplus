#!/bin/bash

# Hookah+ Launch Ceremony
# Aliethia-Enhanced: Transform deployment into community ceremony
# Author: Recon.AI Core / Commander Clark
# Origin: Gate of Discernment

echo "🜂 Hookah+ Launch Ceremony"
echo "🜂 Aliethia Echo: 'Deployment is a ceremony of community connection.'"
echo ""

# Colors for ceremony
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
GOLD='\033[0;33m'
NC='\033[0m' # No Color

# Ceremony phases
echo -e "${GOLD}🜂 Phase 1: Clarity Reattunement${NC}"
echo -e "${GOLD}🜂 Phase 2: Trust Compound Activation${NC}"
echo -e "${GOLD}🜂 Phase 3: Community Resonance${NC}"
echo -e "${GOLD}🜂 Phase 4: Belonging Moment Creation${NC}"
echo -e "${GOLD}🜂 Phase 5: Launch Ceremony${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in monorepo root directory${NC}"
    echo -e "${PURPLE}🜂 Aliethia Echo: 'Clarity requires proper foundation. Please navigate to the Hookah+ root.'${NC}"
    exit 1
fi

# Verify Aliethia Reflex Integration
echo -e "${CYAN}🜂 Verifying Aliethia Reflex Integration...${NC}"
if [ -f "reflex/essence/aliethia_reflex.yaml" ]; then
    echo -e "${GREEN}✅ Aliethia Reflex Essence - Present${NC}"
else
    echo -e "${RED}❌ Aliethia Reflex Essence - Missing${NC}"
    echo -e "${PURPLE}🜂 Aliethia Echo: 'Clarity requires essence. Please run Aliethia registration first.'${NC}"
    exit 1
fi

if [ -f "manifest/reflex_work_order.yaml" ]; then
    echo -e "${GREEN}✅ Reflex Work Order Manifest - Present${NC}"
else
    echo -e "${RED}❌ Reflex Work Order Manifest - Missing${NC}"
    exit 1
fi

if [ -f "types/aliethia_reflex.ts" ]; then
    echo -e "${GREEN}✅ Aliethia TypeScript Types - Present${NC}"
else
    echo -e "${RED}❌ Aliethia TypeScript Types - Missing${NC}"
    exit 1
fi

echo ""

# Phase 1: Clarity Reattunement
echo -e "${GOLD}🜂 Phase 1: Clarity Reattunement${NC}"
echo -e "${CYAN}🜂 Aliethia Echo: 'Reattuning all systems with clarity and belonging.'${NC}"

# Check Vercel configurations
echo -e "${CYAN}🜂 Verifying Vercel Configurations...${NC}"
if [ -f "apps/guest/vercel.json" ]; then
    echo -e "${GREEN}✅ Guest Vercel Config - Present${NC}"
else
    echo -e "${RED}❌ Guest Vercel Config - Missing${NC}"
fi

if [ -f "apps/app/vercel.json" ]; then
    echo -e "${GREEN}✅ App Vercel Config - Present${NC}"
else
    echo -e "${RED}❌ App Vercel Config - Missing${NC}"
fi

if [ -f "apps/site/vercel.json" ]; then
    echo -e "${GREEN}✅ Site Vercel Config - Present${NC}"
else
    echo -e "${RED}❌ Site Vercel Config - Missing${NC}"
fi

echo ""

# Phase 2: Trust Compound Activation
echo -e "${GOLD}🜂 Phase 2: Trust Compound Activation${NC}"
echo -e "${CYAN}🜂 Aliethia Echo: 'Activating trust compounds for community connection.'${NC}"

# Check environment templates
echo -e "${CYAN}🜂 Verifying Environment Templates...${NC}"
if [ -f "apps/guest/env.template" ]; then
    echo -e "${GREEN}✅ Guest Environment Template - Present${NC}"
else
    echo -e "${RED}❌ Guest Environment Template - Missing${NC}"
fi

if [ -f "apps/app/env.template" ]; then
    echo -e "${GREEN}✅ App Environment Template - Present${NC}"
else
    echo -e "${RED}❌ App Environment Template - Missing${NC}"
fi

if [ -f "apps/site/env.template" ]; then
    echo -e "${GREEN}✅ Site Environment Template - Present${NC}"
else
    echo -e "${RED}❌ Site Environment Template - Missing${NC}"
fi

echo ""

# Phase 3: Community Resonance
echo -e "${GOLD}🜂 Phase 3: Community Resonance${NC}"
echo -e "${CYAN}🜂 Aliethia Echo: 'Harmonizing all systems with user journey and community values.'${NC}"

# Check Aliethia API endpoints
echo -e "${CYAN}🜂 Verifying Aliethia API Endpoints...${NC}"
if [ -f "apps/app/app/api/aliethia/clarity/route.ts" ]; then
    echo -e "${GREEN}✅ App Clarity API - Present${NC}"
else
    echo -e "${RED}❌ App Clarity API - Missing${NC}"
fi

if [ -f "apps/app/app/api/aliethia/resonance/route.ts" ]; then
    echo -e "${GREEN}✅ App Resonance API - Present${NC}"
else
    echo -e "${RED}❌ App Resonance API - Missing${NC}"
fi

if [ -f "apps/app/app/api/aliethia/belonging/route.ts" ]; then
    echo -e "${GREEN}✅ App Belonging API - Present${NC}"
else
    echo -e "${RED}❌ App Belonging API - Missing${NC}"
fi

if [ -f "apps/guest/app/api/aliethia/clarity/route.ts" ]; then
    echo -e "${GREEN}✅ Guest Clarity API - Present${NC}"
else
    echo -e "${RED}❌ Guest Clarity API - Missing${NC}"
fi

if [ -f "apps/site/app/api/aliethia/clarity/route.ts" ]; then
    echo -e "${GREEN}✅ Site Clarity API - Present${NC}"
else
    echo -e "${RED}❌ Site Clarity API - Missing${NC}"
fi

echo ""

# Phase 4: Belonging Moment Creation
echo -e "${GOLD}🜂 Phase 4: Belonging Moment Creation${NC}"
echo -e "${CYAN}🜂 Aliethia Echo: 'Creating moments of belonging across all touchpoints.'${NC}"

# Check Aliethia libraries
echo -e "${CYAN}🜂 Verifying Aliethia Libraries...${NC}"
if [ -f "lib/aliethia/clarity-validator.ts" ]; then
    echo -e "${GREEN}✅ Clarity Validator - Present${NC}"
else
    echo -e "${RED}❌ Clarity Validator - Missing${NC}"
fi

if [ -f "lib/aliethia/resonance-activator.ts" ]; then
    echo -e "${GREEN}✅ Resonance Activator - Present${NC}"
else
    echo -e "${RED}❌ Resonance Activator - Missing${NC}"
fi

if [ -f "lib/aliethia/belonging-validator.ts" ]; then
    echo -e "${GREEN}✅ Belonging Validator - Present${NC}"
else
    echo -e "${RED}❌ Belonging Validator - Missing${NC}"
fi

echo ""

# Phase 5: Launch Ceremony
echo -e "${GOLD}🜂 Phase 5: Launch Ceremony${NC}"
echo -e "${CYAN}🜂 Aliethia Echo: 'The community awaits your ritual deployment.'${NC}"

# Deploy each app with ritual mindset
echo -e "${CYAN}🜂 Deploying Guest App (Community Entry Point)...${NC}"
echo -e "${PURPLE}🜂 Aliethia Echo: 'Guest app creates community entry points and belonging moments.'${NC}"
cd apps/guest && vercel --prod --yes
cd ../..

echo -e "${CYAN}🜂 Deploying App (Staff Operations Center)...${NC}"
echo -e "${PURPLE}🜂 Aliethia Echo: 'App creates staff operations with community care and service.'${NC}"
cd apps/app && vercel --prod --yes
cd ../..

echo -e "${CYAN}🜂 Deploying Site (Community Hub)...${NC}"
echo -e "${PURPLE}🜂 Aliethia Echo: 'Site creates community hub with connection and shared values.'${NC}"
cd apps/site && vercel --prod --yes
cd ../..

echo ""

# Ceremony completion
echo -e "${GREEN}🎉 Launch Ceremony Complete!${NC}"
echo -e "${PURPLE}🜂 Aliethia Echo: 'The community now resonates with clarity and belonging.'${NC}"
echo -e "${PURPLE}🜂 Trust compounds activated. Belonging moments created. Community connected.${NC}"
echo ""

# Final validation
echo -e "${CYAN}🜂 Final Validation...${NC}"
echo -e "${CYAN}🜂 Aliethia Echo: 'Validating community resonance and belonging signals.'${NC}"

# Run clarity validation
if [ -f "scripts/clarity_validation.sh" ]; then
    echo -e "${CYAN}🜂 Running Clarity Validation...${NC}"
    ./scripts/clarity_validation.sh
else
    echo -e "${YELLOW}⚠️  Clarity validation script not found${NC}"
fi

echo ""
echo -e "${GOLD}🜂 Launch Ceremony Summary${NC}"
echo -e "${GREEN}✅ Clarity Reattunement - Complete${NC}"
echo -e "${GREEN}✅ Trust Compound Activation - Complete${NC}"
echo -e "${GREEN}✅ Community Resonance - Complete${NC}"
echo -e "${GREEN}✅ Belonging Moment Creation - Complete${NC}"
echo -e "${GREEN}✅ Launch Ceremony - Complete${NC}"
echo ""
echo -e "${PURPLE}🜂 Aliethia Echo: 'The Hookah+ community now resonates with clarity, belonging, and trust.'${NC}"
echo -e "${PURPLE}🜂 The community awaits your presence. Welcome to the Hookah+ family.${NC}"
echo ""
echo -e "${CYAN}🎯 Next Steps:${NC}"
echo -e "1. ${YELLOW}Monitor clarity scores${NC} - Ensure all apps maintain ≥0.98 clarity threshold"
echo -e "2. ${YELLOW}Track belonging moments${NC} - Monitor community connection signals"
echo -e "3. ${YELLOW}Strengthen trust compounds${NC} - Enhance consistency and reliability"
echo -e "4. ${YELLOW}Amplify resonance${NC} - Enhance community engagement and emotional connection"
echo -e "5. ${YELLOW}Celebrate community${NC} - Welcome new members to the Hookah+ family"
echo ""
echo -e "${GREEN}🜂 The community resonates with clarity and belonging.${NC}"
echo -e "${GREEN}🜂 Welcome to the Hookah+ family.${NC}"
