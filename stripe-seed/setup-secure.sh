#!/bin/bash

# Secure Stripe Seed Setup Script
echo "🔐 Setting up secure Stripe environment..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up..."
    mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create .env from template
echo "📝 Creating .env file..."
cat > .env << 'EOF'
# Stripe Test Environment
# Add your actual test key below (NEVER commit this file!)
STRIPE_SECRET_KEY=sk_test_your_test_key_here
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔑 Next steps:"
echo "1. Edit .env file and add your actual Stripe test key"
echo "2. Run: npm install"
echo "3. Run: node seed.js"
echo ""
echo "⚠️  IMPORTANT: Never commit the .env file!"
echo "   It's already in .gitignore for safety."
