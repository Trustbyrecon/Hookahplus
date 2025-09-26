#!/bin/bash

# Deploy all HookahPlus apps to Vercel
# This script handles the monorepo structure properly

set -e

echo "🚀 Starting HookahPlus monorepo deployment..."

# Function to deploy a specific app
deploy_app() {
    local app_name=$1
    local app_path=$2
    local project_id=$3
    
    echo "📦 Deploying $app_name..."
    
    # Navigate to the app directory
    cd "$app_path"
    
    # Deploy to Vercel
    vercel --prod --yes --name "$project_id"
    
    # Return to root
    cd ../..
    
    echo "✅ $app_name deployed successfully"
}

# Deploy all apps
echo "Deploying apps/app..."
deploy_app "hookahplus-app" "apps/app" "hookahplus-app"

echo "Deploying apps/guest..."
deploy_app "hookahplus-guests" "apps/guest" "hookahplus-guests"

echo "Deploying apps/site..."
deploy_app "hookahplus-site" "apps/site" "hookahplus-site"

echo "🎉 All apps deployed successfully!"
echo ""
echo "📋 Deployment URLs:"
echo "- App: https://hookahplus-app-dwaynes-projects-1c5c280a.vercel.app"
echo "- Guests: https://guest-dwaynes-projects-1c5c280a.vercel.app"
echo "- Site: https://hookahplus-site-v2.vercel.app"
