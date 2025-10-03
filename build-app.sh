#!/bin/bash
# Build script for Hookah+ app
echo "Starting Hookah+ build process..."

# Install root dependencies
echo "Installing root dependencies..."
yarn install

# Navigate to app directory
echo "Navigating to apps/app..."
cd apps/app

# Install app dependencies
echo "Installing app dependencies..."
yarn install

# Run the build
echo "Running vercel-build..."
yarn run vercel-build

echo "Build completed successfully!"
