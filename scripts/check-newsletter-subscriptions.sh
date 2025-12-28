#!/bin/bash

# Newsletter Subscription Checker
# Queries the CTA tracking API to see newsletter signups

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get API URL from environment or use default
API_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3002}"

# Default to 30 days if not specified
DAYS="${1:-30}"

echo -e "${BLUE}📧 Newsletter Subscription Checker${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "API URL: $API_URL"
echo "Time Period: Last $DAYS days"
echo ""

# Query newsletter signups
echo -e "${YELLOW}Fetching newsletter signups...${NC}"
echo ""

RESPONSE=$(curl -s "${API_URL}/api/cta/track?type=newsletter_signup&days=${DAYS}")

# Check if curl was successful
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}❌ Error: Could not connect to API${NC}"
    echo ""
    echo "Possible issues:"
    echo "  1. App build server not running (start with: cd apps/app && npm run dev)"
    echo "  2. Wrong API URL (set NEXT_PUBLIC_APP_URL environment variable)"
    echo "  3. API endpoint not accessible"
    echo ""
    exit 1
fi

# Parse JSON response (requires jq, but fallback to basic parsing)
if command -v jq &> /dev/null; then
    # Use jq for pretty formatting
    echo "$RESPONSE" | jq '.'
    
    # Extract key stats
    TOTAL=$(echo "$RESPONSE" | jq -r '.stats.total // 0')
    BY_SOURCE=$(echo "$RESPONSE" | jq -r '.stats.bySource // {}')
    BY_DAY=$(echo "$RESPONSE" | jq -r '.stats.byDay // {}')
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📊 Summary${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Total Signups: ${GREEN}$TOTAL${NC}"
    echo ""
    
    if [ "$TOTAL" -gt 0 ]; then
        echo "By Source:"
        echo "$BY_SOURCE" | jq -r 'to_entries | .[] | "  \(.key): \(.value)"'
        echo ""
        echo "By Day (last 7 days):"
        echo "$BY_DAY" | jq -r 'to_entries | sort_by(.key) | reverse | .[0:7] | .[] | "  \(.key): \(.value)"'
        echo ""
        echo "Recent Signups (last 5):"
        echo "$RESPONSE" | jq -r '.events[0:5] | .[] | "  \(.createdAt) - \(.payload | fromjson | .data.email // "no email")"'
    else
        echo -e "${YELLOW}No newsletter signups found in the last $DAYS days${NC}"
    fi
else
    # Fallback: just show raw JSON
    echo "$RESPONSE" | python -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo -e "${YELLOW}💡 Tip: Install 'jq' for better formatting:${NC}"
    echo "   macOS: brew install jq"
    echo "   Linux: sudo apt-get install jq"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

