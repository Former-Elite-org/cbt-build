# APK Distribution Repository Setup

This guide helps you set up the GitHub repository for Elite CBT APK distribution.

## Repository Information

- **Repository Name**: `elitecbt.app`
- **Organization**: `eliteedtech`
- **Full URL**: https://github.com/eliteedtech/elitecbt.app
- **Purpose**: Host Android APK releases and version information

## Setup Steps

### 1. Create the Repository

```bash
# Option A: Using GitHub CLI
gh repo create eliteedtech/elitecbt.app --public --description "Elite CBT Android App Distribution"

# Option B: Via GitHub Web UI
# Go to: https://github.com/organizations/eliteedtech/repositories/new
# Repository name: elitecbt.app
# Description: Elite CBT Android App Distribution
# Visibility: Public (or Private if preferred)
```

### 2. Initialize the Repository

```bash
# Clone the new repository
git clone https://github.com/eliteedtech/elitecbt.app.git
cd elitecbt.app

# Create README
cat > README.md << 'EOF'
# Elite CBT - Android App

Download the latest Elite CBT Android app.

## Latest Release

[Download Elite CBT APK](https://github.com/eliteedtech/elitecbt.app/releases/latest/download/EliteCBT.apk)

## Installation Instructions

1. Download the APK file from the link above
2. On your Android device, go to **Settings → Security**
3. Enable **Install from Unknown Sources** (or **Unknown Sources**)
4. Open the downloaded APK file
5. Follow the installation prompts

## Requirements

- Android 5.0 (Lollipop) or higher
- ~30 MB free storage space

## Version History

See [Releases](https://github.com/eliteedtech/elitecbt.app/releases) for version history and changelogs.

## Support

For issues or support, contact: support@elitecbt.com.ng

---

**Website**: https://elitecbt.com.ng
EOF

# Create initial version.json
cat > version.json << 'EOF'
{
  "version": "1.0.0.1",
  "versionCode": 100001,
  "apkUrl": "https://github.com/eliteedtech/elitecbt.app/releases/latest/download/EliteCBT.apk",
  "releaseNotes": "Initial release",
  "forceUpdate": false
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# macOS
.DS_Store

# Editor
.vscode/
.idea/

# Temporary files
*.tmp
*.log
EOF

# Commit and push
git add .
git commit -m "Initial repository setup"
git push origin main
```

### 3. Configure Repository Settings

#### Branch Protection (Optional)
```bash
# Using GitHub CLI
gh repo edit eliteedtech/elitecbt.app --enable-wiki=false --enable-projects=false
```

Or via GitHub Web UI:
1. Go to repository **Settings → Branches**
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging (optional)
   - ✅ Require status checks to pass (optional)

#### GitHub Pages (Optional)
Enable GitHub Pages to serve version.json:
1. Go to **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)**
4. Save

This makes version.json accessible at:
https://eliteedtech.github.io/elitecbt.app/version.json

### 4. Verify Setup

```bash
# Test clone
git clone https://github.com/eliteedtech/elitecbt.app.git test-clone
cd test-clone
ls -la

# Should see:
# - README.md
# - version.json
# - .gitignore
```

### 5. Test First Deployment

After setting up the repository, run the deployment script:

```bash
cd /Users/ishaqibrahim/Downloads/apps/elite/elite-cbt
./deploy.sh v1.0.0.1
```

This will:
1. Build the web app
2. Build the Android APK
3. Push APK to the repository
4. Create a GitHub release

### 6. Verify Release

Check that the release was created:
```bash
# Using GitHub CLI
gh release list --repo eliteedtech/elitecbt.app

# Or visit:
# https://github.com/eliteedtech/elitecbt.app/releases
```

## Repository Structure

After deployment, the repository will contain:

```
elitecbt.app/
├── README.md                 # Documentation
├── version.json              # Latest version info
├── EliteCBT.apk             # Latest APK file
└── .gitignore               # Git ignore rules
```

## Accessing the APK

Users can download the APK via:

1. **Direct Link** (latest version):
   ```
   https://github.com/eliteedtech/elitecbt.app/releases/latest/download/EliteCBT.apk
   ```

2. **Releases Page**:
   ```
   https://github.com/eliteedtech/elitecbt.app/releases
   ```

3. **QR Code**: Generate a QR code pointing to the download URL for easy mobile access

## Automated Updates

The deploy.sh script automatically:
- Updates version.json with new version info
- Pushes the new APK
- Creates a GitHub release with the APK attached
- Updates the APK file in the repository

## Security Notes

### Public vs Private Repository

**Public Repository** (Recommended for open distribution):
- ✅ Anyone can download the APK
- ✅ Direct download links work
- ✅ Good for beta testing and public releases

**Private Repository** (For restricted access):
- ❌ Requires authentication to download
- ❌ Direct links won't work without token
- ✅ Better for internal testing

### APK Signing

Current setup creates **unsigned/debug** APKs. For production:

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore elite-cbt-release.keystore \
     -alias elite-cbt -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Configure signing in `android/app/build.gradle`

3. Store keystore securely (never commit to git)

## Troubleshooting

### Release creation fails
```bash
# Ensure gh CLI is authenticated
gh auth status
gh auth login

# Check permissions
gh repo view eliteedtech/elitecbt.app
```

### Push fails
```bash
# Check GitHub token has push access
gh auth refresh -s write:packages,public_repo

# Or update GITHUB_TOKEN in deploy.sh
```

### APK not accessible
- Verify repository is public
- Check release was created successfully
- Ensure APK was uploaded to release

## Next Steps

1. ✅ Create repository
2. ✅ Initialize with README and version.json
3. ✅ Configure settings
4. ✅ Test first deployment
5. ✅ Verify APK downloads correctly
6. 📱 Test installation on Android device
7. 🔐 Set up production signing (optional)
8. 📊 Monitor download statistics

---

**Created**: 2026-08-06  
**For**: Elite CBT Deployment
