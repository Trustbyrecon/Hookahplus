#!/bin/bash

# Vercel Ignored Build Step for Guest App
# Exit 0 to skip, exit 1 to build

CHANGED_FILES=$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA")

# Check if any files relevant to Guest app have changed
if echo "$CHANGED_FILES" | grep -Eq '^(apps/guest/|packages/|turbo.json|package.json|pnpm-lock.yaml|yarn.lock|package-lock.json)$'; then
  echo "Guest app relevant changes detected → building"
  exit 1  # build
else
  echo "No Guest app relevant changes → skipping build"
  exit 0  # skip build
fi
