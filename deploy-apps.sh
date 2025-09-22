#!/bin/bash

# Deploy HookahPlus Apps to Vercel
echo "🚀 Deploying HookahPlus Apps to Vercel..."

# Deploy Site App
echo "📱 Deploying Site App..."
cd apps/site
vercel --prod --name hookahplus-site --yes
echo "✅ Site deployed: https://hookahplus-site.vercel.app"

# Deploy Guest App  
echo "👥 Deploying Guest App..."
cd ../guest
vercel --prod --name hookahplus-guest --yes
echo "✅ Guest deployed: https://hookahplus-guest.vercel.app"

# Deploy App Dashboard
echo "📊 Deploying App Dashboard..."
cd ../app
vercel --prod --name hookahplus-app --yes
echo "✅ App deployed: https://hookahplus-app.vercel.app"

echo "🎉 All apps deployed successfully!"
echo ""
echo "🌐 Working URLs:"
echo "Site: https://hookahplus-site.vercel.app"
echo "Guest: https://hookahplus-guest.vercel.app" 
echo "App: https://hookahplus-app.vercel.app"
