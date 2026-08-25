# Vercel Deployment Guide - Elite CBT with Adaptive Testing

**Date:** August 9, 2026  
**Status:** ✅ Configuration Verified  
**Deployment:** Ready for Vercel

---

## ✅ **Current Configuration Status**

### **Vercel Configuration:** ✅ **CORRECT**

Your `vercel.json` is properly configured:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*).(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**✅ What this does:**
- Handles client-side routing (React Router)
- Optimizes static asset caching
- Ensures all routes work correctly

---

### **Build Configuration:** ✅ **CORRECT**

Your `package.json` build script:
```json
"scripts": {
  "build": "tsc && vite build"
}
```

**✅ What this does:**
- Compiles TypeScript
- Builds optimized production bundle
- Outputs to `dist/` folder

---

### **Vite Configuration:** ✅ **CORRECT**

Your `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

**✅ What this does:**
- React plugin enabled
- Path aliases configured (`@/`)
- Output directory: `dist/`
- Source maps for debugging

---

## 🚀 **Deployment Instructions**

### **Method 1: Using Vercel CLI (Recommended)**

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Navigate to your project
cd elite-cbt

# 3. Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No (first time) / Yes (subsequent)
# - What's your project's name? elite-cbt
# - In which directory is your code located? ./
# - Want to override settings? No

# 4. For production deployment
vercel --prod
```

### **Method 2: Using Vercel Dashboard**

1. **Go to:** https://vercel.com/new
2. **Import Git Repository:**
   - Connect your GitHub/GitLab account
   - Select the repository: `elite-cbt`
3. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: `./` (or `elite-cbt` if in monorepo)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:** (Add these)
   ```
   VITE_API_BASE_URL=https://your-backend-api.com
   ```
5. **Click:** Deploy

---

## 🔧 **Required Environment Variables**

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-api.com
VITE_API_TIMEOUT=30000

# Optional: Analytics
VITE_ENABLE_ANALYTICS=true

# Optional: Feature Flags
VITE_ENABLE_ADAPTIVE_TESTING=true
```

---

## 📋 **Pre-Deployment Checklist**

### **1. Dependencies Check** ✅
```bash
cd elite-cbt
npm install
```

**New dependencies needed:**
```bash
# Recharts for analytics (if not installed)
npm install recharts

# Verify all dependencies
npm list --depth=0
```

### **2. Build Test** ✅
```bash
# Test local build
npm run build

# Check dist folder
ls -la dist/

# Expected output:
# - index.html
# - assets/ (JS, CSS files)
# - favicon, logos, etc.
```

### **3. TypeScript Check** ✅
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Fix any errors before deploying
```

### **4. Environment Setup** ✅
Create `.env.production`:
```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### **5. API Integration** ⚠️ **IMPORTANT**
Update API base URL in `src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:34568/api';
```

---

## 🎯 **Vercel Project Settings**

### **Recommended Settings:**

| Setting | Value | Notes |
|---------|-------|-------|
| **Framework** | Vite | Auto-detected |
| **Build Command** | `npm run build` | Uses package.json script |
| **Output Directory** | `dist` | Vite default |
| **Install Command** | `npm install` | Default |
| **Node Version** | 18.x or 20.x | Modern Node |
| **Root Directory** | `./` | Project root |

### **Performance Settings:**

```json
{
  "regions": ["iad1"], // Primary region (adjust for your users)
  "functions": {
    "maxDuration": 10
  }
}
```

---

## 🔍 **Post-Deployment Verification**

### **1. Check Deployment Status**
```bash
vercel ls
```

### **2. Test Routes**
Visit these URLs after deployment:
- ✅ `https://your-app.vercel.app/` (Home)
- ✅ `https://your-app.vercel.app/login` (Login)
- ✅ `https://your-app.vercel.app/exam/adaptive/test-id` (Adaptive Exam)
- ✅ `https://your-app.vercel.app/analytics/adaptive/test-id` (Analytics)

### **3. Check Console**
Open browser console (F12) and verify:
- ✅ No 404 errors for routes
- ✅ API calls working
- ✅ No missing assets
- ✅ Adaptive testing pages load

### **4. Test Adaptive Testing**
1. Navigate to adaptive exam
2. Verify real-time ability updates
3. Check analytics dashboard loads
4. Test configuration UI

---

## 🐛 **Troubleshooting**

### **Issue 1: 404 on Page Refresh**
**Solution:** Already fixed with `vercel.json` rewrites ✅

### **Issue 2: API Calls Failing (CORS)**
**Solution:** Update backend API to allow Vercel domain
```javascript
// Backend CORS configuration
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://elitecbt.com.ng'
  ],
  credentials: true
}));
```

### **Issue 3: Environment Variables Not Working**
**Solution:** Use `VITE_` prefix for all env vars
```bash
# ✅ Correct
VITE_API_BASE_URL=https://api.example.com

# ❌ Wrong (won't work with Vite)
API_BASE_URL=https://api.example.com
```

### **Issue 4: Build Fails - TypeScript Errors**
**Solution:** Fix TypeScript errors or temporarily skip type checking
```json
// package.json - temporary fix
"build": "vite build"  // Remove tsc
```

### **Issue 5: Large Bundle Size**
**Solution:** Code splitting and lazy loading
```typescript
// Use React.lazy for route components
const AdaptiveExamPage = React.lazy(() => 
  import('@/features/exam-taking/pages/AdaptiveExamPage')
);
```

---

## 📊 **Deployment Optimization**

### **1. Enable Gzip/Brotli** (Automatic on Vercel ✅)

### **2. Image Optimization**
```typescript
// Use Vercel Image Optimization
import Image from 'next/image'; // If using Next.js
// Or optimize images before deploying
```

### **3. Code Splitting**
Already configured in Vite ✅

### **4. CDN Caching**
Vercel Edge Network handles this ✅

---

## 🔒 **Security Checklist**

- [ ] Environment variables secured (not in code)
- [ ] API keys not exposed in frontend
- [ ] HTTPS enforced (Vercel automatic)
- [ ] CORS properly configured
- [ ] Authentication working
- [ ] No sensitive data in logs

---

## 📱 **Custom Domain Setup** (Optional)

### **Add Custom Domain:**
1. Go to Vercel Dashboard → Settings → Domains
2. Add domain: `elitecbt.com.ng`
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-30 minutes)

---

## 🚀 **Quick Deploy Command**

```bash
#!/bin/bash
# Quick deploy script

cd elite-cbt

echo "🔍 Checking for updates..."
git pull

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building..."
npm run build

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
```

Save as `vercel-deploy.sh` and run:
```bash
chmod +x vercel-deploy.sh
./vercel-deploy.sh
```

---

## 📈 **Monitoring & Analytics**

### **Vercel Analytics (Built-in)**
- Speed Insights
- Web Vitals
- Real User Monitoring

### **Enable:**
```bash
npm install @vercel/analytics
```

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

// Add to your app
<Analytics />
```

---

## ✅ **Final Verification Checklist**

Before going live:

- [ ] All routes work (no 404s)
- [ ] API integration working
- [ ] Adaptive testing functional
- [ ] Analytics dashboard loads
- [ ] Configuration UI accessible
- [ ] Mobile responsive
- [ ] Dark mode working
- [ ] Images/assets loading
- [ ] No console errors
- [ ] Performance acceptable (< 3s load)

---

## 🎉 **Your Setup is Ready!**

### **Current Status:**
✅ `vercel.json` configured correctly  
✅ Build command correct  
✅ Vite config proper  
✅ TypeScript setup good  
✅ Route handling configured  
✅ Asset caching enabled  

### **To Deploy:**
```bash
cd elite-cbt
vercel --prod
```

### **Expected Result:**
```
🔍 Inspect: https://vercel.com/your-project
✅ Production: https://your-app.vercel.app
```

---

## 📚 **Additional Resources**

- **Vercel Docs:** https://vercel.com/docs
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html
- **React Router + Vercel:** https://vercel.com/guides/deploying-react-with-vercel

---

**Status:** 🟢 **READY TO DEPLOY**

Your Vercel configuration is correct. Just run `vercel --prod` to deploy!

---

**Last Updated:** August 9, 2026  
**Next Step:** Deploy to production
