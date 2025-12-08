#!/bin/bash

# ManyChat Setup Automation Script
# This script automates the parts of ManyChat setup that can be done programmatically

set -e

echo "🚀 ManyChat Setup Automation"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Generate Secrets
echo -e "${BLUE}Step 1: Generating secure secrets...${NC}"

# Generate Webhook Secret
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✓ Generated MANYCHAT_WEBHOOK_SECRET${NC}"

# Generate Webhook API Key
WEBHOOK_API_KEY=$(openssl rand -hex 32)
echo -e "${GREEN}✓ Generated WEBHOOK_API_KEY${NC}"

# Set Verify Token (default)
VERIFY_TOKEN="hookahplus_manychat_verify"
echo -e "${GREEN}✓ Using MANYCHAT_VERIFY_TOKEN: ${VERIFY_TOKEN}${NC}"

echo ""
echo -e "${YELLOW}Generated Values:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MANYCHAT_WEBHOOK_SECRET=${WEBHOOK_SECRET}"
echo "MANYCHAT_VERIFY_TOKEN=${VERIFY_TOKEN}"
echo "WEBHOOK_API_KEY=${WEBHOOK_API_KEY}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Check if .env.local exists
ENV_FILE="apps/app/.env.local"
if [ -f "$ENV_FILE" ]; then
    echo -e "${BLUE}Step 2: Checking existing .env.local...${NC}"
    
    # Check if variables already exist
    if grep -q "MANYCHAT_WEBHOOK_SECRET=" "$ENV_FILE"; then
        echo -e "${YELLOW}⚠ MANYCHAT_WEBHOOK_SECRET already exists in .env.local${NC}"
        read -p "Do you want to update it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Update existing value
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|MANYCHAT_WEBHOOK_SECRET=.*|MANYCHAT_WEBHOOK_SECRET=${WEBHOOK_SECRET}|" "$ENV_FILE"
            else
                # Linux
                sed -i "s|MANYCHAT_WEBHOOK_SECRET=.*|MANYCHAT_WEBHOOK_SECRET=${WEBHOOK_SECRET}|" "$ENV_FILE"
            fi
            echo -e "${GREEN}✓ Updated MANYCHAT_WEBHOOK_SECRET${NC}"
        fi
    else
        echo "" >> "$ENV_FILE"
        echo "# ManyChat Integration" >> "$ENV_FILE"
        echo "MANYCHAT_WEBHOOK_SECRET=${WEBHOOK_SECRET}" >> "$ENV_FILE"
        echo -e "${GREEN}✓ Added MANYCHAT_WEBHOOK_SECRET to .env.local${NC}"
    fi
    
    if grep -q "MANYCHAT_VERIFY_TOKEN=" "$ENV_FILE"; then
        echo -e "${YELLOW}⚠ MANYCHAT_VERIFY_TOKEN already exists in .env.local${NC}"
    else
        echo "MANYCHAT_VERIFY_TOKEN=${VERIFY_TOKEN}" >> "$ENV_FILE"
        echo -e "${GREEN}✓ Added MANYCHAT_VERIFY_TOKEN to .env.local${NC}"
    fi
    
    if grep -q "WEBHOOK_API_KEY=" "$ENV_FILE"; then
        echo -e "${YELLOW}⚠ WEBHOOK_API_KEY already exists in .env.local${NC}"
        read -p "Do you want to update it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|WEBHOOK_API_KEY=.*|WEBHOOK_API_KEY=${WEBHOOK_API_KEY}|" "$ENV_FILE"
            else
                sed -i "s|WEBHOOK_API_KEY=.*|WEBHOOK_API_KEY=${WEBHOOK_API_KEY}|" "$ENV_FILE"
            fi
            echo -e "${GREEN}✓ Updated WEBHOOK_API_KEY${NC}"
        fi
    else
        echo "WEBHOOK_API_KEY=${WEBHOOK_API_KEY}" >> "$ENV_FILE"
        echo -e "${GREEN}✓ Added WEBHOOK_API_KEY to .env.local${NC}"
    fi
else
    echo -e "${BLUE}Step 2: Creating .env.local...${NC}"
    mkdir -p apps/app
    cat > "$ENV_FILE" << EOF
# ManyChat Integration
MANYCHAT_WEBHOOK_SECRET=${WEBHOOK_SECRET}
MANYCHAT_VERIFY_TOKEN=${VERIFY_TOKEN}

# Webhook API Key (for internal webhook calls to bypass auth in production)
WEBHOOK_API_KEY=${WEBHOOK_API_KEY}

# Calendly Integration (update with your actual URL)
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username/your-event-type
EOF
    echo -e "${GREEN}✓ Created .env.local with ManyChat variables${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Verifying API endpoints exist...${NC}"

# Check if webhook endpoint exists
if [ -f "apps/app/app/api/webhooks/manychat/route.ts" ]; then
    echo -e "${GREEN}✓ Webhook endpoint exists: /api/webhooks/manychat${NC}"
else
    echo -e "${YELLOW}⚠ Webhook endpoint not found${NC}"
fi

# Check if demo link API exists
if [ -f "apps/app/app/api/manychat/generate-demo-link/route.ts" ]; then
    echo -e "${GREEN}✓ Demo link API exists: /api/manychat/generate-demo-link${NC}"
else
    echo -e "${YELLOW}⚠ Demo link API not found${NC}"
fi

echo ""
echo -e "${GREEN}✅ Automated setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps (Manual):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Update NEXT_PUBLIC_CALENDLY_URL in .env.local with your actual Calendly URL"
echo "2. Add these same environment variables to Vercel (production)"
echo "3. In ManyChat Dashboard:"
echo "   - Go to Settings → Integrations → Webhooks"
echo "   - Add webhook with URL: https://app.hookahplus.net/api/webhooks/manychat"
echo "   - Verify Token: ${VERIFY_TOKEN}"
echo "   - Secret: ${WEBHOOK_SECRET}"
echo "   - Subscribe to: message, comment, story_reply, flow_started"
echo "4. Set up Instagram triggers in ManyChat (see guide)"
echo "5. Create the qualification flow in ManyChat (see guide)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
