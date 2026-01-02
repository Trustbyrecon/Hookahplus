#!/bin/bash
# Script to set DIRECT_URL in Vercel
# Usage: ./scripts/set-direct-url.sh [PASSWORD]

PASSWORD="${1}"
PROJECT_REF="hsypmyqtlxjwpnkkacmo"
REGION="us-east-2"

if [ -z "$PASSWORD" ]; then
  echo "Usage: ./scripts/set-direct-url.sh [SUPABASE_PASSWORD]"
  echo ""
  echo "Get your password from:"
  echo "https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
  exit 1
fi

DIRECT_URL="postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-${REGION}.pooler.supabase.com:5432/postgres?sslmode=require"

echo "Setting DIRECT_URL for all environments..."
echo ""

# Set for Production
vercel env add DIRECT_URL production <<< "$DIRECT_URL"

# Set for Preview  
vercel env add DIRECT_URL preview <<< "$DIRECT_URL"

# Set for Development
vercel env add DIRECT_URL development <<< "$DIRECT_URL"

echo ""
echo "✅ DIRECT_URL set successfully!"
echo ""
echo "Verify with: vercel env ls"

