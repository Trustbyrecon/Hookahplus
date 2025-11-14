#!/bin/bash
# Vercel build script for app - only builds if app-related files changed
# This script should be used in Vercel's "Ignored Build Step" setting

set -e

# Get the list of changed files in this commit
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD 2>/dev/null || echo "")

# If no changed files detected (first commit or manual deploy), build anyway
if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files detected, building app..."
  exit 1  # Build (exit 1 = don't ignore)
fi

# Directories that should trigger app build
APP_TRIGGER_PATTERNS=(
  "apps/app/"
  "apps/shared/"
  "packages/"
  "prisma/"
  "turbo.json"
  "package.json"
  "tsconfig.json"
  ".env"
  "lib/"
)

# Check if any changed file matches app trigger patterns
for file in $CHANGED_FILES; do
  for pattern in "${APP_TRIGGER_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      echo "App-related file changed: $file"
      echo "Building app..."
      exit 1  # Build (exit 1 = don't ignore)
    fi
  done
done

# Check if only unrelated files changed (docs, other apps, etc.)
UNRELATED_PATTERNS=(
  "apps/guest/"
  "apps/site/"
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
    # Found a file that's not in unrelated patterns
    # Could be app-related, so build
    echo "Potentially app-related file changed: $file"
    echo "Building app to be safe..."
    exit 1  # Build
  fi
done

# Only unrelated files changed, skip build
echo "No app-related changes detected. Skipping build."
echo "Changed files: $CHANGED_FILES"
exit 0  # Ignore build (exit 0 = ignore)
