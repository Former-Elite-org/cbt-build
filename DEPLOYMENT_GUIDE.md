# Elite CBT Deployment Guide

## Overview
This deployment script automates the deployment of the Elite CBT web application to the production server at **elitecbt.com.ng**.

## Architecture
- **Frontend**: React + Vite application (elite-cbt)
- **Backend API**: Node.js + Express (elite-cbt-api)
- **Mobile App**: Capacitor-based Android APK
- **Production Server**: go54 cPanel hosting (elitescholar.ng)
- **Deployment Path**: `/home2/elitesc1/public_html/elitecbt.com.ng`
- **APK Repository**: https://github.com/eliteedtech/elitecbt.app

## Prerequisites

### 1. SSH Key Setup
The deployment uses the same SSH key as elite-core (`~/.ssh/go54_elitecore`).

If you don't have it set up:
```bash
# Generate SSH key (if needed)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/go54_elitecore -C "your_email@example.com"

# Copy public key
cat ~/.ssh/go54_elitecore.pub
```

Then add it to cPanel:
1. Log in to cPanel at elitescholar.ng
2. Go to: SSH/Shell Access → Manage SSH Keys → Import Key
3. Paste your public key
4. Click "Authorize"

### 2. GitHub Token
The deployment script uses a GitHub token for pushing to the distribution repository. Update the token in the script if needed:
```bash
GITHUB_TOKEN="your_github_token_here"
```

### 3. Required Tools
- Node.js (v18+)
- npm
- git
- JDK 21 (for Android builds)
  ```bash
  brew install --cask temurin@21  # macOS
  ```
- jq (optional, for package.json version updates)
  ```bash
  brew install jq  # macOS
  ```
- GitHub CLI (gh) - for creating releases
  ```bash
  brew install gh  # macOS
  ```

## Deployment Process

### Quick Deployment
From the `elite-cbt` directory:
```bash
./deploy.sh
```
This will auto-increment the build version and deploy.

### Deploy with Specific Version
```bash
./deploy.sh v1.0.0.5
```

## What the Script Does

1. **Version Management**: Auto-increments or uses provided version
2. **Build Frontend**: 
   - Cleans previous builds
   - Installs dependencies
   - Builds production bundle with Vite
3. **Push to GitHub**: Pushes build to `elite-cbt-dist` repository
4. **Deploy to Server**: 
   - Connects via SSH to go54 server
   - Creates deployment directory if needed
   - Transfers files using tar over SSH
   - Extracts directly on server
5. **Sync Capacitor**: Syncs web assets to Android project
6. **Build APK**:
   - Verifies JDK 21 installation
   - Runs Gradle build for release APK
   - Signs APK (if keystore configured)
7. **Push APK**: Uploads APK to GitHub repository
8. **Create Release**: Creates GitHub release with downloadable APK

## Environment Configuration

### Frontend (.env)
Located in `elite-cbt/` - configure API endpoints and app settings.

### API (.env)
Located in `elite-cbt-api/` - configure database and API settings.

## Directory Structure

```
/home2/elitesc1/
└── public_html/
    ├── elitecore.com.ng/     # Elite Core app
    └── elitecbt.com.ng/      # Elite CBT app (this deployment)
```

## API Deployment

The API (elite-cbt-api) needs to be deployed separately:

### Option 1: Manual PM2 Deployment
```bash
# SSH into server
ssh -i ~/.ssh/go54_elitecore elitesc1@elitescholar.ng

# Navigate to API directory
cd /home2/elitesc1/elite-cbt-api

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart with PM2
pm2 restart elite-cbt-api
```

### Option 2: Automated API Deploy (Future Enhancement)
Consider adding API deployment to the script if needed.

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/go54_elitecore elitesc1@elitescholar.ng

# Check SSH key permissions
chmod 600 ~/.ssh/go54_elitecore
```

### Build Failures
```bash
# Clear caches
rm -rf node_modules dist
npm install
npm run build
```

### Server Issues
Check cPanel error logs:
- cPanel → Metrics → Errors

Check file permissions on server:
```bash
ssh -i ~/.ssh/go54_elitecore elitesc1@elitescholar.ng
cd /home2/elitesc1/public_html/elitecbt.com.ng
ls -la
```

## Rollback Procedure

If deployment fails, you can rollback:
1. Access the GitHub repository: `elite-cbt-dist`
2. Check previous commits
3. Revert and force push
4. Re-run deploy script

## Version History

The script maintains version history in:
- `deploy.sh` - Current version stored in script
- GitHub releases - Tagged releases
- `version.json` - Deployed with each build

## Post-Deployment Checklist

- [ ] Verify website loads: https://elitecbt.com.ng
- [ ] Check console for errors (F12)
- [ ] Test login functionality
- [ ] Verify API connectivity
- [ ] Check mobile responsiveness
- [ ] Download and test APK: https://github.com/eliteedtech/elitecbt.app/releases/latest
- [ ] Verify APK installs and runs on Android device
- [ ] Check app version in APK matches deployment
- [ ] Clear browser cache if needed

## Security Notes

- Keep SSH keys secure and never commit them
- Rotate GitHub tokens periodically
- Keep .env files out of version control
- Use environment variables for sensitive data

## Support

For issues or questions:
- Check logs: cPanel → Metrics → Errors
- Review deployment output
- Contact system administrator
