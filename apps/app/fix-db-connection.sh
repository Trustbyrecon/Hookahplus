#!/bin/bash
# Fix Database Connection Script
# This script stops the dev server, regenerates Prisma client, and restarts

echo "🔧 Fixing Database Connection..."
echo ""

# Step 1: Check if dev server is running
echo "📋 Step 1: Checking for running processes..."
if pgrep -f "next dev" > /dev/null; then
    echo "⚠️  Dev server is running. Please stop it with Ctrl+C first."
    exit 1
fi

# Step 2: Verify .env.local exists
echo "📋 Step 2: Verifying .env.local exists..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    exit 1
fi

# Step 3: Check DATABASE_URL
echo "📋 Step 3: Checking DATABASE_URL..."
if grep -q "DATABASE_URL" .env.local; then
    echo "✅ DATABASE_URL found in .env.local"
    grep "DATABASE_URL" .env.local | head -1
else
    echo "❌ DATABASE_URL not found in .env.local"
    exit 1
fi

# Step 4: Regenerate Prisma Client
echo ""
echo "📋 Step 4: Regenerating Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client regenerated successfully"
else
    echo "❌ Failed to regenerate Prisma client"
    echo "💡 Try closing all terminals and VS Code/Cursor, then run again"
    exit 1
fi

# Step 5: Test connection
echo ""
echo "📋 Step 5: Testing database connection..."
npx prisma db pull --schema=prisma/schema.prisma 2>&1 | head -5

echo ""
echo "✅ Setup complete! You can now run: npm run dev"

