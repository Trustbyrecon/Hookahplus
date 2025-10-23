#!/bin/bash

# Vercel Ignored Build Step for Site Build
# Exit 0 to skip, exit 1 to build

CHANGED_FILES=$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA")

# Check if any files relevant to Site build have changed
if echo "$CHANGED_FILES" | grep -Eq '^(apps/site/|packages/|turbo.json|package.json|pnpm-lock.yaml|yarn.lock|package-lock.json)$'; then
  echo "Site build relevant changes detected → building"
  exit 1  # build
else
  echo "No Site build relevant changes → skipping build"
  exit 0  # skip build
fi
