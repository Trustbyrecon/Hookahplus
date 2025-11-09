#!/bin/bash
# Fix Database Connection and Restart Servers

echo "🔧 Fixing Database Connection..."
echo ""

# Step 1: Verify .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    exit 1
fi

# Step 2: Check DATABASE_URL
echo "📋 Checking DATABASE_URL..."
if grep -q "DATABASE_URL.*postgresql" .env.local; then
    echo "✅ PostgreSQL connection string found"
    grep "DATABASE_URL" .env.local | head -1
else
    echo "❌ DATABASE_URL not found or incorrect"
    exit 1
fi

# Step 3: Regenerate Prisma Client
echo ""
echo "📋 Regenerating Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client regenerated successfully"
else
    echo "❌ Failed to regenerate Prisma client"
    echo "💡 Make sure all dev servers are stopped"
    exit 1
fi

echo ""
echo "✅ Setup complete! You can now restart the dev server:"
echo "   npm run dev"
echo ""
echo "Or restart all servers from root:"
echo "   cd ../.. && npm run dev:all"

