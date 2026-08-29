#!/bin/bash
# Manual push of dist with vercel.json to cbt-build for testing

set -e

cd "$(dirname "$0")"

echo "🚀 Pushing dist with vercel.json to cbt-build..."
echo ""

# Check dist exists
if [ ! -d "dist" ]; then
  echo "❌ No dist folder"
  exit 1
fi

# Check vercel.json is in dist
if [ ! -f "dist/vercel.json" ]; then
  echo "❌ vercel.json not in dist"
  exit 1
fi

echo "✅ dist folder found"
echo "✅ vercel.json found in dist"
echo ""

# List what's in dist
echo "📦 Contents of dist:"
ls -la dist/ | grep -v "^total" | tail -10
echo ""

echo "📋 vercel.json content:"
cat dist/vercel.json
echo ""

read -p "Push to GitHub? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

# Create a temporary directory for the dist repo
TEMP_DIR=$(mktemp -d)
echo "📁 Created temp dir: $TEMP_DIR"

# Initialize git in temp directory
cd "$TEMP_DIR"
git init
git checkout -b main

# Copy dist contents
cp -r ~/Downloads/apps/elite/elite-cbt/dist/* .

echo "✅ Copied dist contents"
echo ""

# Show what we're about to commit
echo "📦 Files to commit:"
ls -la | head -15
echo ""

# Commit
git add -A
git commit -m "Manual deployment with vercel.json fix"

# Add remote and push
GITHUB_TOKEN="${GITHUB_TOKEN:-ghp_PLACEHOLDER}"
REPO="https://${GITHUB_TOKEN}@github.com/eliteedtech1-debug/cbt-build.git"

git remote add origin "$REPO"
git config http.postBuffer 524288000
git push -u origin main --force

echo ""
echo "✅ Pushed successfully!"
echo "   Repository: https://github.com/eliteedtech1-debug/cbt-build"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard"
echo "2. Trigger a new deployment"
echo "3. Test the URLs"

# Cleanup
cd ~
rm -rf "$TEMP_DIR"
echo ""
echo "✅ Cleanup done"
