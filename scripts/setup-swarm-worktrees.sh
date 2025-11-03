#!/bin/bash
# Swarm Worktree Setup Script
# Run this from the repo root: bash scripts/setup-swarm-worktrees.sh

set -e

echo "🚀 Setting up Hookah+ Swarm Worktrees..."

# Check if we're in the repo root
if [ ! -f "package.json" ] && [ ! -d ".git" ]; then
    echo "❌ Error: Must run from repo root"
    exit 1
fi

# Create worktrees
echo "📁 Creating worktrees..."

git worktree add ./wt-pos main 2>/dev/null || echo "⚠️  wt-pos already exists"
git worktree add ./wt-ledger main 2>/dev/null || echo "⚠️  wt-ledger already exists"
git worktree add ./wt-sdk main 2>/dev/null || echo "⚠️  wt-sdk already exists"
git worktree add ./wt-ui main 2>/dev/null || echo "⚠️  wt-ui already exists"
git worktree add ./wt-tests main 2>/dev/null || echo "⚠️  wt-tests already exists"

echo ""
echo "✅ Worktrees created:"
git worktree list

echo ""
echo "📋 Agent Worktrees:"
echo "  - wt-pos    → Noor (POS Spine)"
echo "  - wt-ledger → Jules (Loyalty Ledger)"
echo "  - wt-sdk    → Lumi (REM Schema & SDK)"
echo "  - wt-ui     → 6 (Operator UI)"
echo "  - wt-tests  → EchoPrime (E2E & EP Gates)"
echo ""
echo "🎯 Next steps:"
echo "  1. Navigate to each worktree: cd wt-pos"
echo "  2. Review mission files: cat wt-pos/NOOR_MISSION.md"
echo "  3. Start agent work on feature branches"
echo ""

