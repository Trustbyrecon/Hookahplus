#!/bin/bash

# Vercel Ignored Build Step for App Build
# Exit 0 to skip, exit 1 to build

CHANGED_FILES=$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA")

# Check if any files relevant to App build have changed
if echo "$CHANGED_FILES" | grep -Eq '^(apps/app/|packages/|turbo.json|package.json|pnpm-lock.yaml|yarn.lock|package-lock.json)$'; then
  echo "App build relevant changes detected → building"
  exit 1  # build
else
  echo "No App build relevant changes → skipping build"
  exit 0  # skip build
fi
