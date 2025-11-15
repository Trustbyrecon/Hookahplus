#!/bin/bash
# Vercel build script for site - only builds if site-related files changed
# This script should be used in Vercel's "Ignored Build Step" setting

set -e

# Get the list of changed files in this commit
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD 2>/dev/null || echo "")

# If no changed files detected (first commit or manual deploy), build anyway
if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files detected, building site..."
  exit 1  # Build (exit 1 = don't ignore)
fi

# Directories that should trigger site build
SITE_TRIGGER_PATTERNS=(
  "apps/site/"
  "apps/shared/"
  "packages/"
  "turbo.json"
  "package.json"
  "tsconfig.json"
)

# Check if any changed file matches site trigger patterns
for file in $CHANGED_FILES; do
  for pattern in "${SITE_TRIGGER_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      echo "Site-related file changed: $file"
      echo "Building site..."
      exit 1  # Build (exit 1 = don't ignore)
    fi
  done
done

# Check if only unrelated files changed
UNRELATED_PATTERNS=(
  "apps/app/"
  "apps/guest/"
  "apps/app/prisma/"
  "docs/"
  "*.md"
  ".gitignore"
  "README"
)

ONLY_UNRELATED=true
for file in $CHANGED_FILES; do
  MATCHED=false
  for pattern in "${UNRELATED_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      MATCHED=true
      break
    fi
  done
  if [ "$MATCHED" = false ]; then
    echo "Potentially site-related file changed: $file"
    echo "Building site to be safe..."
    exit 1  # Build
  fi
done

# Only unrelated files changed, skip build
echo "No site-related changes detected. Skipping build."
echo "Changed files: $CHANGED_FILES"
exit 0  # Ignore build (exit 0 = ignore)
