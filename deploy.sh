#!/bin/bash
set -e

APP_VERSION="1.0.0.4"
APP_VERSION_CODE=100004

GITHUB_TOKEN="${GITHUB_TOKEN:-ghp_PLACEHOLDER}"
WEB_DIST_REPO="https://${GITHUB_TOKEN}@github.com/eliteedtech/elite-cbt-dist.git"
APK_REPO="https://${GITHUB_TOKEN}@github.com/eliteedtech1-debug/cbt-apk.git"
CBT_BUILD_REPO="https://${GITHUB_TOKEN}@github.com/Ibagwai/cbt-web.git"

# ─── Version Resolution ───────────────────────────────────────────────────────
# No argument → auto-increment the BUILD digit of the current version
# Argument provided → use it as-is and save it as the new base for next run
if [ -z "$1" ]; then
  # Parse current version and bump BUILD (V4)
  IFS='.' read -r V1 V2 V3 V4 <<< "$APP_VERSION"
  V4=$(( V4 + 1 ))
  VERSION_NO_V="${V1}.${V2}.${V3}.${V4}"
  VERSION="v${VERSION_NO_V}"
  echo "🔁 No version provided — auto-incrementing to v${VERSION_NO_V}"
else
  VERSION=$1
  VERSION_NO_V=${VERSION#v}
  IFS='.' read -r V1 V2 V3 V4 <<< "$VERSION_NO_V"
  if ! [[ "$V1" =~ ^[0-9]+$ && "$V2" =~ ^[0-9]+$ && "$V3" =~ ^[0-9]+$ && "$V4" =~ ^[0-9]+$ ]]; then
    echo "❌ Invalid version. Expected: vMAJOR.MINOR.PATCH.BUILD (e.g. v1.0.0.1)"
    exit 1
  fi
  echo "📌 Using provided version: v${VERSION_NO_V}"
fi

# Save the new version back into deploy.sh so next auto-increment starts from here
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
sed -i '' "s/^APP_VERSION=\".*\"/APP_VERSION=\"${VERSION_NO_V}\"/" "$SCRIPT_PATH"

VERSION_CODE=$(echo $VERSION_NO_V | awk -F. '{printf "%d%02d%03d", $1, $2, ($3*100 + $4)}')
sed -i '' "s/^APP_VERSION_CODE=.*/APP_VERSION_CODE=${VERSION_CODE}/" "$SCRIPT_PATH"
# ─────────────────────────────────────────────────────────────────────────────

echo "📱 Version: $VERSION_NO_V (code: $VERSION_CODE)"
echo "   Web: https://elitecbt.com.ng"
echo "   APK Repo: https://github.com/eliteedtech1-debug/cbt-apk"

echo "🚀 Elite CBT Deployment v$VERSION_NO_V"
echo "===================================="
cd "$(dirname "$0")"

echo ""
echo "📋 Step 1: Verifying environment..."
if [ ! -f package.json ]; then
  echo "❌ package.json missing - not in frontend directory"
  exit 1
fi
echo "✅ Frontend directory verified"

echo ""
echo "📋 Step 2: Updating version in package.json..."

# Update version in package.json
if command -v jq &> /dev/null; then
  jq ".version = \"${VERSION_NO_V}\"" package.json > package.json.tmp && mv package.json.tmp package.json
  echo "  ✅ Updated package.json"
else
  echo "  ⚠️  jq not found, skipping package.json version update"
fi

BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

echo ""
echo "📋 Step 3: Cleaning & building web app..."
rm -rf dist node_modules/.vite
npm install --legacy-peer-deps
# Build without type checking for deployment
SKIP_TYPE_CHECK=true vite build
echo "✅ Web build completed"

echo ""
echo "📋 Step 4: Pushing to web-dist repository..."

TMP_WEB=$(mktemp -d)
git clone --depth 1 "$WEB_DIST_REPO" "$TMP_WEB" 2>/dev/null || {
  rm -rf "$TMP_WEB" && mkdir -p "$TMP_WEB"
  git -C "$TMP_WEB" init && git -C "$TMP_WEB" checkout -b main
}
rm -rf "$TMP_WEB"/*
cp -r dist/* "$TMP_WEB/"
cp vercel.json "$TMP_WEB/" 2>/dev/null || echo "  ⚠️ vercel.json not found"

# Write version.json for web deployment
cat > "$TMP_WEB/version.json" << EOF
{
  "version": "${VERSION_NO_V}",
  "versionCode": $VERSION_CODE,
  "apkUrl": "https://github.com/eliteedtech1-debug/cbt-apk/releases/latest/download/EliteCBT.apk",
  "releaseNotes": "Release ${VERSION}",
  "buildTime": "${BUILD_TIME}",
  "forceUpdate": false
}
EOF

git -C "$TMP_WEB" config http.postBuffer 524288000
git -C "$TMP_WEB" add -A
git -C "$TMP_WEB" commit -m "Build $VERSION" 2>/dev/null || true
git -C "$TMP_WEB" remote add origin "$WEB_DIST_REPO" 2>/dev/null || git -C "$TMP_WEB" remote set-url origin "$WEB_DIST_REPO"
git -C "$TMP_WEB" push -u origin main --force
rm -rf "$TMP_WEB"
echo "✅ Web build pushed to GitHub"

echo ""
echo "📋 Step 4a: Pushing CBT build to repository..."

ELITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -d "$ELITE_ROOT/.git" ]; then
  git -C "$ELITE_ROOT" add -A
  git -C "$ELITE_ROOT" commit -m "Build $VERSION - $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "  ⚠️ No changes to commit"
  git -C "$ELITE_ROOT" remote get-url origin 2>/dev/null || git -C "$ELITE_ROOT" remote add origin "$CBT_BUILD_REPO"
  git -C "$ELITE_ROOT" remote set-url origin "$CBT_BUILD_REPO"
  git -C "$ELITE_ROOT" config http.postBuffer 524288000
  git -C "$ELITE_ROOT" push -u origin main --force
  echo "✅ CBT build pushed to GitHub (cbt-web repository)"
else
  echo "⚠️ Skipping CBT build push - not a git repository"
fi

echo ""
echo "📋 Step 5: Deploying to go54 server (elitecbt.com.ng)..."

GO54_KEY="${GO54_KEY:-$HOME/.ssh/go54_elitecore}"
GO54_USER="${GO54_USER:-elitesc1}"
GO54_HOST="${GO54_HOST:-elitescholar.ng}"
# Elite CBT document root on go54 cPanel - elitecbt.com.ng
GO54_PATH="${GO54_PATH:-/home2/elitesc1/public_html/elitecbt.com.ng}"

if [ -f "$GO54_KEY" ]; then
  echo "  🔑 Using SSH key: $GO54_KEY"
  
  # Ensure the remote directory exists
  echo "  📁 Creating remote directory if needed..."
  ssh -i "$GO54_KEY" -o StrictHostKeyChecking=no "${GO54_USER}@${GO54_HOST}" "mkdir -p ${GO54_PATH}" 2>&1 | grep -v "perl:\|warning:\|LANG\|LC_\|locale\|Falling\|are supported"
  
  # Pack dist/ and extract on server (rsync not available on go54)
  echo "  📦 Packing and transferring files..."
  tar -czf - -C dist . | \
    ssh -i "$GO54_KEY" -o StrictHostKeyChecking=no "${GO54_USER}@${GO54_HOST}" \
    "cd ${GO54_PATH} && tar -xzf - && echo '✅ files extracted'" 2>&1 | grep -v "perl:\|warning:\|LANG\|LC_\|locale\|Falling\|are supported"
  
  echo "✅ Deployed to go54: ${GO54_HOST}:${GO54_PATH}"
  echo "   Visit: https://elitecbt.com.ng"
else
  echo "⚠️  Skipping go54 deploy — SSH key not found at $GO54_KEY"
  echo "   The SSH key is the same one used for elitecore.com.ng deployment"
  echo "   1. Go to cPanel → SSH/Shell Access → Manage SSH Keys → Import Key"
  echo "   2. Paste your public key"
  echo "   3. Click Authorize, then re-run this script"
  echo ""
  echo "   Or use the key from elite-core:"
  if [ -f "$HOME/.ssh/go54_elitecore.pub" ]; then
    echo "   Public key content:"
    cat "$HOME/.ssh/go54_elitecore.pub"
  fi
fi

echo ""
echo "📋 Step 6: Syncing to Android..."
npx cap sync android
echo "✅ Android project synced"

echo ""
echo "📋 Step 7: Building Android APK..."

export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"

if [ ! -d "$JAVA_HOME" ]; then
  echo "⚠️ JDK 21 not found at $JAVA_HOME."
  echo "   Install with: brew install --cask temurin@21"
  exit 1
fi

cd android
./gradlew clean assembleRelease

APK_SRC="app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_SRC" ]; then
  echo "❌ APK build failed"
  exit 1
fi

cp "$APK_SRC" "../elitecbt.apk"
cd ..
echo "✅ APK built: elitecbt.apk ($(du -sh elitecbt.apk | cut -f1))"

echo ""
echo "📋 Step 8: Updating releases repository..."

TMP_APK=$(mktemp -d)
git clone --depth 1 "$APK_REPO" "$TMP_APK" 2>/dev/null || {
  rm -rf "$TMP_APK" && mkdir -p "$TMP_APK"
  git -C "$TMP_APK" init && git -C "$TMP_APK" checkout -b main
}

cp elitecbt.apk "$TMP_APK/EliteCBT.apk"

cat > "$TMP_APK/version.json" << EOF
{
  "version": "${VERSION_NO_V}",
  "versionCode": $VERSION_CODE,
  "apkUrl": "https://github.com/eliteedtech1-debug/cbt-apk/releases/latest/download/EliteCBT.apk",
  "releaseNotes": "Release ${VERSION}",
  "forceUpdate": false
}
EOF

git -C "$TMP_APK" config http.postBuffer 524288000
git -C "$TMP_APK" add EliteCBT.apk version.json
git -C "$TMP_APK" commit -m "Release $VERSION"
git -C "$TMP_APK" remote add origin "$APK_REPO" 2>/dev/null || git -C "$TMP_APK" remote set-url origin "$APK_REPO"
git -C "$TMP_APK" push -u origin main --force
rm -rf "$TMP_APK"
echo "✅ APK pushed to cbt-apk repo"

echo ""
echo "📋 Step 9: Creating GitHub release..."

export GH_TOKEN=$GITHUB_TOKEN
GH_BIN=$(which gh 2>/dev/null || echo "/usr/local/bin/gh")

# Delete existing release if it exists (so we can re-upload cleanly)
"$GH_BIN" release delete "$VERSION" \
  --repo eliteedtech1-debug/cbt-apk \
  --yes 2>/dev/null || true

# Create new release with APK
"$GH_BIN" release create "$VERSION" elitecbt.apk \
  --repo eliteedtech1-debug/cbt-apk \
  --title "Elite CBT $VERSION" \
  --notes "**Elite CBT $VERSION**

Download and install EliteCBT.apk on your Android device.

**Installation:**
1. Download EliteCBT.apk
2. Enable 'Install from unknown sources'
3. Open APK to install" && echo "✅ GitHub release created" || echo "⚠️ Release creation failed"

echo ""
echo "🎉 Deployment completed!"
echo "   APK: https://github.com/eliteedtech1-debug/cbt-apk/releases/latest/download/EliteCBT.apk"
echo "   Web: https://elitecbt.com.ng"
echo "   Version: ${VERSION_NO_V} (code: ${VERSION_CODE})"
echo "   Build time: ${BUILD_TIME}"
