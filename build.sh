#!/bin/bash

# Robust build script for Vercel
# Handles NPM registry connectivity issues

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

# Install dependencies with retry logic
echo "📦 Installing dependencies..."
retry_command "pnpm install --no-frozen-lockfile"

# Build the application
echo "🔨 Building application..."
cd apps/app
retry_command "pnpm run build"

echo "🎉 Build completed successfully!"
