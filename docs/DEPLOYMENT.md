# Deployment Guide - Vercel 🚀

This guide walks you through deploying the CFS Interactive Member Portal to Vercel.

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All features are complete and tested
- ✅ No console errors or warnings
- ✅ All images are optimized
- ✅ Build command works locally: `npm run build`
- ✅ Preview works locally: `npm run preview`
- ✅ Git repository is clean (no secrets committed)
- ✅ README.md is up to date

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your Git provider
   - Choose the repository
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for build completion
   - Your site is live! 🎉

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Deploy to preview
   vercel
   
   # Deploy to production
   vercel --prod
   ```

## ⚙️ Configuration Files

### vercel.json (Optional)

Create `vercel.json` in the root for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
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

### Environment Variables (if needed)

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add any required variables:
   ```
   VITE_API_URL=https://api.example.com
   VITE_ANALYTICS_ID=UA-XXXXXXXXX
   ```

## 🔄 Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

## 🌐 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (can take up to 48 hours)

Example DNS configuration:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 🔍 Monitoring & Analytics

### Vercel Analytics (Built-in)
- Automatically enabled
- View in Dashboard → Analytics tab
- Shows Core Web Vitals, traffic, etc.

### Custom Analytics
If you want to add Google Analytics:

1. Add to `index.html`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXXX"></script>
   ```

2. Add environment variable:
   ```
   VITE_GA_ID=UA-XXXXXXXXX
   ```

## 🐛 Troubleshooting

### Build Fails

**Problem**: Build fails with errors

**Solution**:
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### 404 Errors on Refresh

**Problem**: Direct URL navigation shows 404

**Solution**: Add `vercel.json` with rewrites (see configuration above)

### Slow Initial Load

**Problem**: First load takes too long

**Solutions**:
- Code splitting is already implemented (React.lazy)
- Check bundle size: `npm run build` and review dist folder
- Optimize images (use WebP format)
- Enable compression in Vercel (automatic)

### CSS Not Loading

**Problem**: Styles not appearing

**Solution**:
- Check import order in `main.tsx`
- Verify TailwindCSS config
- Check browser console for errors

## 📊 Performance Optimization

### Already Implemented ✅
- Code splitting with React.lazy
- Tree shaking (Vite default)
- CSS purging (TailwindCSS)
- Asset optimization

### Vercel Optimizations (Automatic)
- Gzip/Brotli compression
- HTTP/2 support
- Global CDN
- Edge caching
- Image optimization (if using Vercel Image API)

## 🔒 Security

### Headers Configuration

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 📱 Testing Production Build

Before deploying:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Test on different devices
# - Desktop browsers (Chrome, Firefox, Safari, Edge)
# - Mobile devices (iOS Safari, Android Chrome)
# - Tablet devices (iPad Safari)
```

## 🎯 Post-Deployment Checklist

After deployment:

- ✅ Visit deployed URL and test all pages
- ✅ Check mobile responsiveness
- ✅ Test all interactive features
- ✅ Run Lighthouse audit (target >90 all categories)
- ✅ Test keyboard navigation
- ✅ Verify error pages (404, error boundary)
- ✅ Check console for errors
- ✅ Test on different browsers

## 📈 Lighthouse Scores Target

Aim for:
- **Performance**: >90
- **Accessibility**: 100
- **Best Practices**: >95
- **SEO**: >90

Run Lighthouse:
```bash
# Chrome DevTools
Open DevTools → Lighthouse tab → Generate report

# CLI
npm install -g lighthouse
lighthouse https://your-site.vercel.app
```

## 🆘 Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev
- **React Documentation**: https://react.dev

---

**Deployment Complete! 🎉**

Your CFS Interactive Member Portal is now live and accessible worldwide!
