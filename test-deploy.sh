#!/bin/bash
# Test script for Step 4a - CBT Build Push

set -e

VERSION="v1.0.0.3"
GITHUB_TOKEN="${GITHUB_TOKEN:-REMOVED_TOKEN}"
CBT_BUILD_REPO="https://${GITHUB_TOKEN}@github.com/ibagwai9/cbt-web.git"

echo "🧪 Testing Step 4a: Pushing CBT build to repository..."
echo ""

# Navigate to elite-cbt directory
cd "$(dirname "$0")"

ELITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "📁 Elite root directory: $ELITE_ROOT"

if [ -d "$ELITE_ROOT/.git" ]; then
  echo "✅ Git repository detected"
  echo ""
  
  echo "📊 Current git status:"
  git -C "$ELITE_ROOT" status --short | head -10
  echo ""
  
  echo "🔗 Current remote:"
  git -C "$ELITE_ROOT" remote -v | head -2
  echo ""
  
  echo "📝 Staging all changes..."
  git -C "$ELITE_ROOT" add -A
  echo "✅ Changes staged"
  echo ""
  
  echo "📦 Creating commit..."
  git -C "$ELITE_ROOT" commit -m "Build $VERSION - $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "  ⚠️ No changes to commit"
  echo ""
  
  echo "🔧 Ensuring remote is set correctly..."
  git -C "$ELITE_ROOT" remote get-url origin 2>/dev/null || git -C "$ELITE_ROOT" remote add origin "$CBT_BUILD_REPO"
  git -C "$ELITE_ROOT" remote set-url origin "$CBT_BUILD_REPO"
  echo "✅ Remote configured: $CBT_BUILD_REPO"
  echo ""
  
  echo "🚀 Ready to push (skipping actual push in test mode)"
  echo "   Would execute: git push -u origin main --force"
  echo ""
  echo "✅ Step 4a test completed successfully!"
else
  echo "❌ Not a git repository"
  exit 1
fi
