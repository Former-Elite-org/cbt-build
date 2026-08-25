#!/bin/bash
# Quick fix script to deploy vercel.json to ibagwai9/cbt-web

set -e

cd "$(dirname "$0")"

GITHUB_TOKEN="${GITHUB_TOKEN:-REMOVED_TOKEN}"
WEB_DIST_REPO="https://${GITHUB_TOKEN}@github.com/ibagwai9/cbt-web.git"

echo "🔧 Quick Fix: Deploying vercel.json to ibagwai9/cbt-web..."
echo ""

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
  echo "❌ vercel.json not found"
  exit 1
fi

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "⚠️  No dist folder found. Building..."
  npm install --legacy-peer-deps
  SKIP_TYPE_CHECK=true npm run build
  echo "✅ Build completed"
fi

echo ""
echo "📋 Pushing to ibagwai9/cbt-web repository..."

TMP_WEB=$(mktemp -d)
git clone --depth 1 "$WEB_DIST_REPO" "$TMP_WEB" 2>/dev/null || {
  rm -rf "$TMP_WEB" && mkdir -p "$TMP_WEB"
  git -C "$TMP_WEB" init && git -C "$TMP_WEB" checkout -b main
}

# Copy dist files
if [ -d "dist" ]; then
  cp -r dist/* "$TMP_WEB/"
  echo "✅ Copied dist files"
fi

# Copy vercel.json
cp vercel.json "$TMP_WEB/"
echo "✅ Copied vercel.json"

# Create version.json
cat > "$TMP_WEB/version.json" << 'EOF'
{
  "version": "1.0.0.3",
  "versionCode": 100003,
  "apkUrl": "https://github.com/eliteedtech1-debug/cbt-apk/releases/latest/download/EliteCBT.apk",
  "releaseNotes": "Fix Vercel 404 routing",
  "forceUpdate": false
}
EOF
echo "✅ Created version.json"

# Push to GitHub
git -C "$TMP_WEB" config http.postBuffer 524288000
git -C "$TMP_WEB" add -A
git -C "$TMP_WEB" commit -m "Fix: Add vercel.json for SPA routing" 2>/dev/null || true
git -C "$TMP_WEB" remote add origin "$WEB_DIST_REPO" 2>/dev/null || git -C "$TMP_WEB" remote set-url origin "$WEB_DIST_REPO"
git -C "$TMP_WEB" push -u origin main --force
rm -rf "$TMP_WEB"

echo ""
echo "✅ Fix deployed to GitHub!"
echo "   Repository: https://github.com/ibagwai9/cbt-web"
echo "   Vercel will automatically redeploy"
echo ""
echo "What was fixed:"
echo "  ✅ Added vercel.json with SPA rewrite rules"
echo "  ✅ All routes now redirect to index.html"
echo "  ✅ 404 errors should be resolved"
