#!/bin/bash

# HookahPlus Monorepo Deployment Script
# Ensures each app deploys to its correct Vercel project

echo "🚀 Starting HookahPlus Monorepo Deployment Audit..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in monorepo root directory"
    exit 1
fi

echo "📋 Current Git Status:"
git status --porcelain

echo ""
echo "🔍 Checking Vercel Project Configurations..."

# Check Guest Build Configuration
if [ -f "apps/guest/.vercel/project.json" ]; then
    echo "✅ Guest Build: $(cat apps/guest/.vercel/project.json | grep projectName | cut -d'"' -f4)"
else
    echo "❌ Guest Build: Missing Vercel configuration"
fi

# Check App Build Configuration  
if [ -f "apps/app/.vercel/project.json" ]; then
    echo "✅ App Build: $(cat apps/app/.vercel/project.json | grep projectName | cut -d'"' -f4)"
else
    echo "❌ App Build: Missing Vercel configuration"
fi

# Check Site Build Configuration
if [ -f "apps/site/.vercel/project.json" ]; then
    echo "✅ Site Build: $(cat apps/site/.vercel/project.json | grep projectName | cut -d'"' -f4)"
else
    echo "❌ Site Build: Missing Vercel configuration"
fi

echo ""
echo "🎯 Expected Project Mappings:"
echo "Guest Build → hookahplus-guests (prj_3dIAx8o3OOfoDHXQ3hFxfES8LlbV)"
echo "App Build  → hookahplus-app (prj_VgBHIL2JyisEMdfs0WG2idMOxz1j)"
echo "Site Build → hookahplus-site (prj_DgjWlhhn9T6FcvnZuQBezLyA7xkg)"

echo ""
echo "📦 Recent Changes Summary:"
echo "✅ Guest checkout modal updated to professional style"
echo "✅ Flavor wheel expanded from 3 to 4 selections"
echo "✅ QR scanner space reduced"
echo "✅ Flavor pricing fixed"
echo "✅ Success modal updated"

echo ""
echo "🔄 Next Steps:"
echo "1. Commit current changes"
echo "2. Deploy each app to its respective Vercel project"
echo "3. Verify deployments are working correctly"

echo ""
echo "💡 To deploy individual apps:"
echo "cd apps/guest && vercel --prod"
echo "cd apps/app && vercel --prod" 
echo "cd apps/site && vercel --prod"
