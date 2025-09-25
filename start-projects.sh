#!/bin/bash

# HookahPlus Project Manager
# This script helps you start different projects on separate ports

echo "🚀 HookahPlus Project Manager"
echo "=============================="
echo ""
echo "Available projects:"
echo "1. Guest Portal (Pre-order system) - Port 3001"
echo "2. Operator App (Staff dashboard) - Port 3002" 
echo "3. Marketing Site (Main website) - Port 3003"
echo "4. Start all projects"
echo "5. Stop all projects"
echo ""

read -p "Select project (1-5): " choice

case $choice in
    1)
        echo "Starting Guest Portal on port 3001..."
        cd apps/guest && pnpm run dev
        ;;
    2)
        echo "Starting Operator App on port 3002..."
        cd apps/app && pnpm run dev
        ;;
    3)
        echo "Starting Marketing Site on port 3003..."
        cd apps/site && pnpm run dev
        ;;
    4)
        echo "Starting all projects..."
        echo "Guest Portal: http://localhost:3001"
        echo "Operator App: http://localhost:3002"
        echo "Marketing Site: http://localhost:3003"
        echo ""
        echo "Starting in background..."
        cd apps/guest && pnpm run dev &
        cd ../app && pnpm run dev &
        cd ../site && pnpm run dev &
        wait
        ;;
    5)
        echo "Stopping all Next.js processes..."
        pkill -f "next dev" 2>/dev/null || echo "No processes found"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        ;;
esac
