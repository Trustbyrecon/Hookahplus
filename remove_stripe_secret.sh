#!/bin/bash
# Script to remove Stripe secret from git history

# The secret to replace (use placeholder; real key only in .env.local)
OLD_SECRET="sk_test_***REDACTED***"
NEW_TEXT="sk_test_... (key stored in .env.local, not in git)"

# Check if file exists in this commit
if [ -f "apps/app/STRIPE_KEY_ADDED.md" ]; then
    # Replace the secret with placeholder
    sed -i "s|${OLD_SECRET}|${NEW_TEXT}|g" apps/app/STRIPE_KEY_ADDED.md
    git add apps/app/STRIPE_KEY_ADDED.md
fi

