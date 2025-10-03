#!/bin/bash
# Build script for Hookah+ app
# This script bypasses Vercel's cached build commands

echo "Starting Hookah+ build process..."
echo "Current directory: $(pwd)"
echo "Contents: $(ls -la)"

# Install dependencies
echo "Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build the app using pnpm filter
echo "Building app with pnpm filter..."
pnpm --filter @hookahplus/app run build

echo "Build completed successfully!"
