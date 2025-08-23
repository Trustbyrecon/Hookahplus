#!/bin/bash

# Fire Session API Test Script
# This script demonstrates the complete hookah session workflow

BASE_URL="http://localhost:3000"
SESSION_ID="test_session_$(date +%s)"

echo "🔥 Testing Fire Session API"
echo "=========================="
echo "Session ID: $SESSION_ID"
echo "Base URL: $BASE_URL"
echo ""

# Function to make API calls and show results
test_command() {
    local cmd=$1
    local actor=${2:-"system"}
    local data=${3:-"{}"}
    
    echo "🔄 Testing: $cmd (Actor: $actor)"
    
    response=$(curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/command" \
        -H "Content-Type: application/json" \
        -d "{\"cmd\":\"$cmd\",\"actor\":\"$actor\",\"data\":$data}")
    
    if echo "$response" | grep -q '"ok":true'; then
        echo "✅ Success: $cmd"
        echo "   Response: $response" | jq '.' 2>/dev/null || echo "   Response: $response"
    else
        echo "❌ Failed: $cmd"
        echo "   Response: $response"
    fi
    echo ""
}

# Test the complete workflow
echo "🚀 Starting complete session workflow test..."
echo ""

# 1. Payment confirmed (system)
test_command "PAYMENT_CONFIRMED" "system"

# 2. BOH claims prep
test_command "CLAIM_PREP" "boh"

# 3. BOH starts heating
test_command "HEAT_UP" "boh"

# 4. BOH marks ready for delivery
test_command "READY_FOR_DELIVERY" "boh"

# 5. FOH starts delivery
test_command "DELIVER_NOW" "foh"

# 6. FOH marks delivered
test_command "MARK_DELIVERED" "foh"

# 7. FOH starts active session
test_command "START_ACTIVE" "foh"

# 8. FOH closes session
test_command "CLOSE_SESSION" "foh"

echo "🎯 Testing additional commands..."

# Test remake command
test_command "REMAKE" "boh" '{"reason":"Test remake from BOH"}'

# Test staff hold
test_command "STAFF_HOLD" "foh" '{"reason":"Test hold from FOH"}'

# Test unhold
test_command "UNHOLD" "boh"

echo "🏁 Workflow test completed!"
echo ""
echo "📊 Final session state:"
curl -s "$BASE_URL/api/sessions/$SESSION_ID/command" \
    -H "Content-Type: application/json" \
    -d '{"cmd":"PAYMENT_CONFIRMED","actor":"system"}' | jq '.session.state' 2>/dev/null || echo "Could not retrieve final state"

echo ""
echo "📝 To view the full dashboard, visit: $BASE_URL/fire-session-dashboard"
echo "🧪 To test interactively, visit: $BASE_URL/test-fire-session"
