#!/bin/bash
# Script to set Sentry DSNs in Vercel for app and guest projects

# App DSN
APP_DSN="https://9ccf63cd4d007820a02decc75cf47b36@o4510619153858560.ingest.us.sentry.io/4510624294109184"

# Guest DSN
GUEST_DSN="https://d3f813910bcf9752c23d4a2b17fe1ae8@o4510619153858560.ingest.us.sentry.io/4510624346603520"

echo "Setting Sentry DSNs in Vercel..."
echo ""

# Set for app project - Production
echo "Setting NEXT_PUBLIC_SENTRY_DSN for hookahplus-app (production)..."
echo "$APP_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN production hookahplus-app

# Set for app project - Preview
echo "Setting NEXT_PUBLIC_SENTRY_DSN for hookahplus-app (preview)..."
echo "$APP_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN preview hookahplus-app

# Set for app project - Development
echo "Setting NEXT_PUBLIC_SENTRY_DSN for hookahplus-app (development)..."
echo "$APP_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN development hookahplus-app

echo ""
echo "Setting NEXT_PUBLIC_SENTRY_DSN for hookahplus-guests (production)..."
echo "$GUEST_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN production hookahplus-guests

echo "Setting NEXT_PUBLIC_SENTRY_DSN for hookahplus-guests (preview)..."
echo "$GUEST_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN preview hookahplus-guests

echo "Setting NEXT_PUBLIC_SENTRY_DSN for hookahplus-guests (development)..."
echo "$GUEST_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN development hookahplus-guests

echo ""
echo "✅ Done! Environment variables set."
echo ""
echo "Next steps:"
echo "1. Verify in Vercel dashboard: https://vercel.com/dwaynes-projects-1c5c280a/hookahplus-app/settings/environment-variables"
echo "2. Redeploy your projects to pick up the new environment variables"
echo "3. Test Sentry by visiting /api/test-sentry endpoints"

