#!/bin/bash
set -e

echo "🚀 Setting up Sentry Alerts with Terraform"
echo ""

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it first."
    echo "   Visit: https://www.terraform.io/downloads"
    echo ""
    echo "   macOS: brew install terraform"
    echo "   Linux: See https://www.terraform.io/downloads"
    exit 1
fi

echo "✅ Terraform is installed: $(terraform version | head -n 1)"
echo ""

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "📝 Creating terraform.tfvars from example..."
    cp terraform.tfvars.example terraform.tfvars
    echo "✅ Created terraform.tfvars"
    echo "⚠️  Please edit terraform.tfvars and add your Sentry auth token"
    echo ""
    echo "   Get your token from: https://sentry.io/settings/account/api/auth-tokens/"
    exit 0
fi

# Check if token is set
if grep -q "your-sentry-auth-token-here" terraform.tfvars 2>/dev/null; then
    echo "⚠️  Please edit terraform.tfvars and add your Sentry auth token"
    echo "   Get your token from: https://sentry.io/settings/account/api/auth-tokens/"
    exit 1
fi

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init

echo ""
echo "📋 Planning changes..."
echo ""

# Plan changes
terraform plan

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask for confirmation
read -p "Apply these changes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ Applying configuration..."
    terraform apply
    echo ""
    echo "🎉 Sentry alerts configured!"
    echo ""
    echo "📊 View alerts at: https://sentry.io/organizations/hookahplusnet/alerts/rules/"
else
    echo ""
    echo "❌ Cancelled - no changes applied"
fi

