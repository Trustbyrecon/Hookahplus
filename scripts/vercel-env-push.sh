#!/usr/bin/env bash
# Push apps/site/.env.local to Vercel
# Usage:
#   ./scripts/vercel-env-push.sh           # Push to production, preview, development
#   ./scripts/vercel-env-push.sh --prod   # Push to production only (for live Stripe deploy)
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../apps/site/.env.local"
cd "$SCRIPT_DIR/../apps/site"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Not found: $ENV_FILE"
  exit 1
fi

# Parse and dedupe: last occurrence wins
declare -A VARS
while IFS= read -r line; do
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    value="${value%"${value##*[![:space:]]}"}"  # trim trailing whitespace
    VARS["$key"]="$value"
  fi
done < "$ENV_FILE"

if [[ "$1" == "--prod" ]]; then
  ENVS=(production)
  echo "▶ Pushing to production only..."
else
  ENVS=(production preview development)
  echo "▶ Pushing to production, preview, development..."
fi

SENSITIVE_KEYS="STRIPE_SECRET_KEY STRIPE_TEST_SECRET_KEY"
for env in "${ENVS[@]}"; do
  echo "[$env]"
  for key in "${!VARS[@]}"; do
    value="${VARS[$key]}"
    [[ -z "$value" ]] && continue
    if [[ " $SENSITIVE_KEYS " == *" $key "* ]]; then
      printf '%s' "$value" | vercel env add "$key" "$env" --force --sensitive 2>/dev/null || true
    else
      printf '%s' "$value" | vercel env add "$key" "$env" --force 2>/dev/null || true
    fi
    echo "  ✓ $key"
  done
done
echo "✅ Done"
