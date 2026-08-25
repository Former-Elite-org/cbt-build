#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Elite CBT Deployment Script v2.0
# ═══════════════════════════════════════════════════════════════════════════
# Enhanced version with improved error handling, logging, and deployment modes
# 
# Usage:
#   ./deploy.sh                    # Full deployment with auto-increment
#   ./deploy.sh v1.0.0.5          # Full deployment with specific version
#   ./deploy.sh --apk-only        # Build and release APK only (skip web)
#   ./deploy.sh --web-only        # Deploy web only (skip APK)
#   ./deploy.sh --help            # Show help
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error
set -o pipefail  # Catch errors in pipes

APP_VERSION="1.0.0.4"
APP_VERSION_CODE=100004

# ─── Color output for better readability ──────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# ─── Logging functions ────────────────────────────────────────────────────
log_info() { echo -e "${BLUE}ℹ${NC}  $1"; }
log_success() { echo -e "${GREEN}✅${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠️${NC}  $1"; }
log_error() { echo -e "${RED}❌${NC} $1"; }
log_step() { echo -e "\n${CYAN}━━━${NC} ${MAGENTA}$1${NC} ${CYAN}━━━${NC}"; }

# ─── Error handler ────────────────────────────────────────────────────────
trap 'log_error "Deployment failed at line $LINENO. Check logs above."; exit 1' ERR

# ─── Configuration ────────────────────────────────────────────────────────
GITHUB_TOKEN="${GITHUB_TOKEN:-REMOVED_TOKEN}"
WEB_DIST_REPO="https://${GITHUB_TOKEN}@github.com/ibagwai9/cbt-web.git"
APK_REPO="https://${GITHUB_TOKEN}@github.com/eliteedtech1-debug/cbt-apk.git"
CBT_BUILD_REPO="https://${GITHUB_TOKEN}@github.com/ibagwai9/cbt-web.git"

GO54_KEY="${GO54_KEY:-$HOME/.ssh/go54_elitecore}"
GO54_USER="${GO54_USER:-elitesc1}"
GO54_HOST="${GO54_HOST:-elitescholar.ng}"
GO54_PATH="${GO54_PATH:-/home2/elitesc1/public_html/elitecbt.com.ng}"

export JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home}"

# ─── Deployment modes ─────────────────────────────────────────────────────
DEPLOY_WEB=true
DEPLOY_APK=true
DEPLOY_SERVER=true
SKIP_CONFIRMATION=false

# ─── Show help ────────────────────────────────────────────────────────────
show_help() {
  cat << EOF
${CYAN}═══════════════════════════════════════════════════════════════${NC}
  ${MAGENTA}Elite CBT Deployment Script v2.0${NC}
${CYAN}═══════════════════════════════════════════════════════════════${NC}

${GREEN}USAGE:${NC}
  ./deploy.sh [OPTIONS] [VERSION]

${GREEN}OPTIONS:${NC}
  -h, --help              Show this help message
  --apk-only              Build and release APK only (skip web deployment)
  --web-only              Deploy web only (skip APK build)
  --skip-server           Skip go54 server deployment
  -y, --yes               Skip confirmation prompts
  --version <ver>         Specify version (e.g., v1.0.0.5)

${GREEN}EXAMPLES:${NC}
  ./deploy.sh                    # Full deployment with auto-increment
  ./deploy.sh v1.0.0.5          # Full deployment with specific version
  ./deploy.sh --apk-only        # Build APK only (fast iteration)
  ./deploy.sh --web-only        # Deploy web only
  ./deploy.sh -y                # Skip confirmation prompt

${GREEN}ENVIRONMENT VARIABLES:${NC}
  GITHUB_TOKEN    GitHub personal access token
  GO54_KEY        SSH key path for go54 server ($GO54_KEY)
  GO54_USER       SSH username (default: elitesc1)
  GO54_HOST       SSH hostname (default: elitescholar.ng)
  GO54_PATH       Deployment path on server
  JAVA_HOME       Java JDK home directory

${GREEN}VERSION FORMAT:${NC}
  vMAJOR.MINOR.PATCH.BUILD (e.g., v1.0.0.5)
  
  If no version specified, BUILD number auto-increments.

EOF
  exit 0
}

# ─── Parse arguments ──────────────────────────────────────────────────────
VERSION_ARG=""
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      ;;
    --apk-only)
      DEPLOY_WEB=false
      DEPLOY_SERVER=false
      log_info "Mode: APK only"
      shift
      ;;
    --web-only)
      DEPLOY_APK=false
      log_info "Mode: Web only"
      shift
      ;;
    --skip-server)
      DEPLOY_SERVER=false
      shift
      ;;
    -y|--yes)
      SKIP_CONFIRMATION=true
      shift
      ;;
    --version)
      VERSION_ARG="$2"
      shift 2
      ;;
    v*.*.*.*)
      VERSION_ARG="$1"
      shift
      ;;
    *)
      log_error "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# ─── Change to script directory ──────────────────────────────────────────
cd "$(dirname "$0")"

# ─── Verify environment ───────────────────────────────────────────────────
log_step "Environment Verification"

if [ ! -f package.json ]; then
  log_error "package.json not found - not in elite-cbt directory"
  exit 1
fi
log_success "elite-cbt directory verified"

if [ "$DEPLOY_APK" = true ]; then
  if [ ! -d "$JAVA_HOME" ]; then
    log_error "JDK 21 not found at $JAVA_HOME"
    log_info "Install with: brew install --cask temurin@21"
    exit 1
  fi
  log_success "Java JDK 21 found"
fi

# ─── Version Resolution ───────────────────────────────────────────────────
log_step "Version Resolution"

if [ -z "$VERSION_ARG" ]; then
  IFS='.' read -r V1 V2 V3 V4 <<< "$APP_VERSION"
  V4=$(( V4 + 1 ))
  VERSION_NO_V="${V1}.${V2}.${V3}.${V4}"
  VERSION="v${VERSION_NO_V}"
  log_info "Auto-incrementing version to: ${GREEN}v${VERSION_NO_V}${NC}"
else
  VERSION=$VERSION_ARG
  VERSION_NO_V=${VERSION#v}
  IFS='.' read -r V1 V2 V3 V4 <<< "$VERSION_NO_V"
  if ! [[ "$V1" =~ ^[0-9]+$ && "$V2" =~ ^[0-9]+$ && "$V3" =~ ^[0-9]+$ && "$V4" =~ ^[0-9]+$ ]]; then
    log_error "Invalid version format. Expected: vMAJOR.MINOR.PATCH.BUILD (e.g. v1.0.0.1)"
    exit 1
  fi
  log_info "Using specified version: ${GREEN}v${VERSION_NO_V}${NC}"
fi

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
sed -i '' "s/^APP_VERSION=\".*\"/APP_VERSION=\"${VERSION_NO_V}\"/" "$SCRIPT_PATH" 2>/dev/null || true

VERSION_CODE=$(echo $VERSION_NO_V | awk -F. '{printf "%d%02d%03d", $1, $2, ($3*100 + $4)}')
sed -i '' "s/^APP_VERSION_CODE=.*/APP_VERSION_CODE=${VERSION_CODE}/" "$SCRIPT_PATH" 2>/dev/null || true

BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

log_success "Version: ${GREEN}$VERSION_NO_V${NC} (code: $VERSION_CODE)"
log_info "Build time: $BUILD_TIME"

# ─── Deployment Plan ──────────────────────────────────────────────────────
log_step "Deployment Plan"
echo ""
echo "  ${CYAN}┌─────────────────────────────────────────┐${NC}"
echo "  ${CYAN}│${NC}  ${MAGENTA}Elite CBT v${VERSION_NO_V}${NC}                  ${CYAN}│${NC}"
echo "  ${CYAN}├─────────────────────────────────────────┤${NC}"
echo "  ${CYAN}│${NC}  Web Build:    $([ "$DEPLOY_WEB" = true ] && echo "${GREEN}✓ Enabled${NC}" || echo "${YELLOW}✗ Skip${NC}")            ${CYAN}│${NC}"
echo "  ${CYAN}│${NC}  APK Build:    $([ "$DEPLOY_APK" = true ] && echo "${GREEN}✓ Enabled${NC}" || echo "${YELLOW}✗ Skip${NC}")            ${CYAN}│${NC}"
echo "  ${CYAN}│${NC}  go54 Deploy:  $([ "$DEPLOY_SERVER" = true ] && echo "${GREEN}✓ Enabled${NC}" || echo "${YELLOW}✗ Skip${NC}")            ${CYAN}│${NC}"
echo "  ${CYAN}└─────────────────────────────────────────┘${NC}"
echo ""
echo "  ${BLUE}Web:${NC}  https://elitecbt.com.ng"
echo "  ${BLUE}APK:${NC}  https://github.com/eliteedtech1-debug/cbt-apk"
echo ""

if [ "$SKIP_CONFIRMATION" = false ]; then
  read -p "Continue with deployment? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Deployment cancelled by user"
    exit 0
  fi
fi

# ─── Web Build ────────────────────────────────────────────────────────────
if [ "$DEPLOY_WEB" = true ]; then
  log_step "Web Build"
  
  log_info "Cleaning previous build..."
  rm -rf dist node_modules/.vite
  
  log_info "Installing dependencies..."
  npm install --legacy-peer-deps --silent
  
  log_info "Building web application..."
  SKIP_TYPE_CHECK=true vite build
  
  log_success "Web build completed ($(du -sh dist | cut -f1))"
  
  # Update version in package.json
  if command -v jq &> /dev/null; then
    jq ".version = \"${VERSION_NO_V}\"" package.json > package.json.tmp && mv package.json.tmp package.json
    log_success "Updated package.json version"
  fi
fi

# ─── Push to Web Dist Repository ─────────────────────────────────────────
if [ "$DEPLOY_WEB" = true ]; then
  log_step "Web Distribution Repository"
  
  TMP_WEB=$(mktemp -d)
  log_info "Cloning web-dist repository..."
  git clone --depth 1 "$WEB_DIST_REPO" "$TMP_WEB" 2>/dev/null || {
    rm -rf "$TMP_WEB" && mkdir -p "$TMP_WEB"
    git -C "$TMP_WEB" init && git -C "$TMP_WEB" checkout -b main
  }
  
  rm -rf "$TMP_WEB"/*
  cp -r dist/* "$TMP_WEB/"
  cp vercel.json "$TMP_WEB/" 2>/dev/null || log_warning "vercel.json not found"
  
  cat > "$TMP_WEB/version.json" << EOF
{
  "version": "${VERSION_NO_V}",
  "versionCode": $VERSION_CODE,
  "apkUrl": "https://github.com/eliteedtech1-debug/cbt-apk/releases/latest/download/EliteCBT.apk",
  "releaseNotes": "Elite CBT ${VERSION}",
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
  
  log_success "Web dist pushed to cbt-web (Vercel repo)"
fi

# ─── Push CBT Build Repository ───────────────────────────────────────────
if [ "$DEPLOY_WEB" = true ]; then
  log_step "CBT Build Repository"
  
  ELITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  if [ -d "$ELITE_ROOT/.git" ]; then
    git -C "$ELITE_ROOT" add -A
    git -C "$ELITE_ROOT" commit -m "Build $VERSION - $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || log_info "No changes to commit"
    git -C "$ELITE_ROOT" remote get-url origin 2>/dev/null || git -C "$ELITE_ROOT" remote add origin "$CBT_BUILD_REPO"
    git -C "$ELITE_ROOT" remote set-url origin "$CBT_BUILD_REPO"
    git -C "$ELITE_ROOT" config http.postBuffer 524288000
    git -C "$ELITE_ROOT" push -u origin main --force
    log_success "CBT build pushed to cbt-web"
  else
    log_warning "Skipping CBT build push - not a git repository"
  fi
fi

# ─── Deploy to go54 Server ────────────────────────────────────────────────
if [ "$DEPLOY_SERVER" = true ] && [ "$DEPLOY_WEB" = true ]; then
  log_step "go54 Server Deployment (elitecbt.com.ng)"
  
  if [ -f "$GO54_KEY" ]; then
    log_info "Using SSH key: $GO54_KEY"
    
    log_info "Creating remote directory..."
    ssh -i "$GO54_KEY" -o StrictHostKeyChecking=no "${GO54_USER}@${GO54_HOST}" \
      "mkdir -p ${GO54_PATH}" 2>&1 | grep -v "perl:\|warning:\|LANG\|LC_\|locale\|Falling\|are supported" || true
    
    log_info "Transferring files..."
    tar -czf - -C dist . | \
      ssh -i "$GO54_KEY" -o StrictHostKeyChecking=no "${GO54_USER}@${GO54_HOST}" \
      "cd ${GO54_PATH} && tar -xzf -" 2>&1 | grep -v "perl:\|warning:\|LANG\|LC_\|locale\|Falling\|are supported" || true
    
    log_success "Deployed to: ${GREEN}https://elitecbt.com.ng${NC}"
  else
    log_warning "SSH key not found at $GO54_KEY - skipping go54 deployment"
    log_info "Generate key with: ssh-keygen -t rsa -b 4096 -f $GO54_KEY"
  fi
fi

# ─── Android APK Build ────────────────────────────────────────────────────
if [ "$DEPLOY_APK" = true ]; then
  log_step "Android APK Build"
  
  log_info "Syncing Capacitor..."
  npx cap sync android
  
  log_info "Building Android APK with Gradle..."
  cd android
  ./gradlew clean assembleRelease
  
  APK_SRC="app/build/outputs/apk/release/app-release.apk"
  if [ ! -f "$APK_SRC" ]; then
    log_error "APK build failed - output not found"
    exit 1
  fi
  
  cp "$APK_SRC" "../elitecbt.apk"
  cd ..
  
  APK_SIZE=$(du -sh elitecbt.apk | cut -f1)
  log_success "APK built: ${GREEN}elitecbt.apk${NC} ($APK_SIZE)"
fi

# ─── Push APK to Releases Repository ──────────────────────────────────────
if [ "$DEPLOY_APK" = true ]; then
  log_step "APK Releases Repository"
  
  TMP_APK=$(mktemp -d)
  log_info "Cloning APK repository..."
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
  "releaseNotes": "Elite CBT ${VERSION}",
  "buildTime": "${BUILD_TIME}",
  "forceUpdate": false
}
EOF
  
  git -C "$TMP_APK" config http.postBuffer 524288000
  git -C "$TMP_APK" add EliteCBT.apk version.json
  git -C "$TMP_APK" commit -m "Release $VERSION"
  git -C "$TMP_APK" remote add origin "$APK_REPO" 2>/dev/null || git -C "$TMP_APK" remote set-url origin "$APK_REPO"
  git -C "$TMP_APK" push -u origin main --force
  rm -rf "$TMP_APK"
  
  log_success "APK pushed to repository"
fi

# ─── Create GitHub Release ────────────────────────────────────────────────
if [ "$DEPLOY_APK" = true ]; then
  log_step "GitHub Release"
  
  export GH_TOKEN=$GITHUB_TOKEN
  GH_BIN=$(which gh 2>/dev/null || echo "/usr/local/bin/gh")
  
  if command -v "$GH_BIN" &> /dev/null; then
    "$GH_BIN" release delete "$VERSION" \
      --repo eliteedtech1-debug/cbt-apk \
      --yes 2>/dev/null || true
    
    "$GH_BIN" release create "$VERSION" elitecbt.apk \
      --repo eliteedtech1-debug/cbt-apk \
      --title "Elite CBT $VERSION" \
      --notes "**Elite CBT $VERSION**

📱 **Download and Install:**
1. Download EliteCBT.apk
2. Enable 'Install from unknown sources' in Android settings
3. Open APK file to install

🆕 **What's New:**
- Enhanced deployment script with better logging
- Improved error handling and recovery
- Adaptive Testing preparation (Phase 3)

📊 **Build Info:**
- Version: ${VERSION_NO_V}
- Version Code: ${VERSION_CODE}
- Build Time: ${BUILD_TIME}

🔗 **Web Version:**
https://elitecbt.com.ng" && log_success "GitHub release created" || log_warning "Release creation failed (gh CLI may not be installed)"
  else
    log_warning "GitHub CLI (gh) not found - skipping release creation"
    log_info "Install with: brew install gh"
  fi
fi

# ─── Deployment Summary ───────────────────────────────────────────────────
log_step "Deployment Summary"
echo ""
echo "  ${GREEN}✓${NC} Deployment completed successfully!"
echo ""
echo "  ${CYAN}┌─────────────────────────────────────────┐${NC}"
echo "  ${CYAN}│${NC}  ${MAGENTA}Elite CBT v${VERSION_NO_V}${NC}                  ${CYAN}│${NC}"
echo "  ${CYAN}├─────────────────────────────────────────┤${NC}"
if [ "$DEPLOY_WEB" = true ]; then
  echo "  ${CYAN}│${NC}  ${GREEN}✓${NC} Web:  https://elitecbt.com.ng      ${CYAN}│${NC}"
fi
if [ "$DEPLOY_APK" = true ]; then
  echo "  ${CYAN}│${NC}  ${GREEN}✓${NC} APK:  github.com/...cbt-apk        ${CYAN}│${NC}"
fi
echo "  ${CYAN}└─────────────────────────────────────────┘${NC}"
echo ""
if [ "$DEPLOY_APK" = true ]; then
  echo "  ${BLUE}Download APK:${NC}"
  echo "  https://github.com/eliteedtech1-debug/cbt-apk/releases/latest/download/EliteCBT.apk"
  echo ""
fi
echo "  ${GREEN}Build: $VERSION_NO_V (code: $VERSION_CODE)${NC}"
echo "  ${BLUE}Time:  $BUILD_TIME${NC}"
echo ""
