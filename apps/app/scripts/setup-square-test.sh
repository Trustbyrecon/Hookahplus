#!/bin/bash

# Quick Square Test Setup Script
# This script helps you set up Square for testing

echo "🔧 Square Test Setup"
echo "===================="
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating it..."
    touch .env.local
fi

# Check for TRUSTLOCK_SECRET
if ! grep -q "TRUSTLOCK_SECRET" .env.local; then
    echo "🔑 Generating TRUSTLOCK_SECRET..."
    TRUSTLOCK_VALUE=$(openssl rand -hex 32)
    {
      echo "# Trust lock secret (generated)"
      printf '%s=%s\n' "TRUSTLOCK_SECRET" "$TRUSTLOCK_VALUE"
    } >> .env.local
    echo "✅ Added TRUSTLOCK_SECRET to .env.local"
else
    echo "✅ TRUSTLOCK_SECRET already exists"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "Option 1: Connect via OAuth (Recommended)"
echo "  1. Start dev server: npm run dev"
echo "  2. Go to: http://localhost:3002/square/connect?loungeId=test_venue"
echo "  3. Complete OAuth flow"
echo "  4. Run test: npm run test:square test_venue"
echo ""
echo "Option 2: Use Environment Variables"
echo "  1. Get Square Sandbox Access Token from: https://developer.squareup.com/apps"
echo "  2. Add to .env.local:"
echo "     SQUARE_ACCESS_TOKEN=EAAA_sandbox_your_token"
echo "     SQUARE_LOCATION_ID=your_location_id"
echo "  3. Run test: npm run test:square test_venue"
echo ""
echo "✅ Setup complete! Choose an option above."

