#!/bin/bash

# HookahPlus UI Testing Setup Script

echo "🚀 Setting up HookahPlus UI Testing Suite..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install

# Create test artifacts directory
echo "📁 Creating test artifacts directory..."
mkdir -p test-artifacts

# Set up environment variables
echo "🔧 Setting up environment variables..."
if [ ! -f .env ]; then
    cat > .env << EOF
# HookahPlus UI Testing Environment
BASE_URL=http://localhost:3000
STRIPE_TEST_MODE=true
DEBUG_MODE=false

# Optional: Override for different environments
# BASE_URL=https://your-domain.vercel.app
# BASE_URL=https://staging.hookahplus.net
EOF
    echo "✅ Created .env file with default values"
else
    echo "✅ .env file already exists"
fi

# Verify setup
echo "🔍 Verifying setup..."
if npx playwright --version &> /dev/null; then
    echo "✅ Playwright installed successfully"
else
    echo "❌ Playwright installation failed"
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now run tests with:"
echo "   npm test                    # Run all tests"
echo "   npm run test:ui            # Run with UI mode"
echo "   npm run test:headed        # Run with visible browser"
echo "   npm run test:debug         # Run in debug mode"
echo ""
echo "📝 Don't forget to:"
echo "   1. Update BASE_URL in .env for your environment"
echo "   2. Add data-testid attributes to your UI components"
echo "   3. Start your HookahPlus app before running tests"
echo ""
echo "🔗 For more information, see tests/README.md"
