#!/bin/bash

# Robust build script for Vercel
# Handles NPM registry connectivity issues with fallback strategies

set -e

echo "🚀 Starting Hookah+ build process..."

# Set NPM configuration for better reliability
export NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
export NPM_CONFIG_FETCH_RETRIES=3
export NPM_CONFIG_FETCH_RETRY_FACTOR=2
export NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=10000
export NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=60000

# Function to retry commands
retry_command() {
    local max_attempts=3
    local delay=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Attempt $attempt of $max_attempts: $1"
        
        if eval "$1"; then
            echo "✅ Command succeeded on attempt $attempt"
            return 0
        else
            echo "❌ Command failed on attempt $attempt"
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Waiting $delay seconds before retry..."
                sleep $delay
                delay=$((delay * 2))  # Exponential backoff
            fi
            attempt=$((attempt + 1))
        fi
    done
    
    echo "💥 Command failed after $max_attempts attempts"
    return 1
}

# Try pnpm first, fallback to npm if it fails
echo "📦 Installing dependencies..."

if retry_command "pnpm install --no-frozen-lockfile"; then
    echo "✅ pnpm install succeeded"
    PACKAGE_MANAGER="pnpm"
else
    echo "⚠️ pnpm failed, trying npm..."
    if retry_command "npm install"; then
        echo "✅ npm install succeeded"
        PACKAGE_MANAGER="npm"
    else
        echo "💥 Both pnpm and npm failed"
        exit 1
    fi
fi

# Build the application
echo "🔨 Building application..."
cd apps/app

if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    retry_command "pnpm run build"
else
    retry_command "npm run build"
fi

echo "🎉 Build completed successfully!"
