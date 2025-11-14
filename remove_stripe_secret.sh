#!/bin/bash
# Script to remove Stripe secret from git history

# The secret to replace
OLD_SECRET="sk_test_51RZ0cpDHM3T5fq9re4ZGZMvwqTrYHkQ6ARyolebbtPdu6jThPA9TzV8VyzJtTrIrcOwwiJxkPZ67EJHKWf3PkOHH00ZX9JFBSt"
NEW_TEXT="sk_test_... (key stored in .env.local, not in git)"

# Check if file exists in this commit
if [ -f "apps/app/STRIPE_KEY_ADDED.md" ]; then
    # Replace the secret with placeholder
    sed -i "s|${OLD_SECRET}|${NEW_TEXT}|g" apps/app/STRIPE_KEY_ADDED.md
    git add apps/app/STRIPE_KEY_ADDED.md
fi

