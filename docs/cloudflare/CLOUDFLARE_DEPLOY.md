# Deploy to Cloudflare Pages - Quick Guide

Your website is now on GitHub and ready to deploy! 🚀

Repository: https://github.com/eddiguesti/jengu-website

---

## 🚀 Deploy to Cloudflare Pages (5 minutes)

### Step 1: Go to Cloudflare Pages
1. Visit https://dash.cloudflare.com
2. Log in to your Cloudflare account
3. Click **"Workers & Pages"** in the left sidebar
4. Click **"Create application"**
5. Click **"Pages"** tab
6. Click **"Connect to Git"**

### Step 2: Connect GitHub Repository
1. Click **"Connect GitHub"** (authorize if first time)
2. Select **"eddiguesti/jengu-website"** from the list
3. Click **"Begin setup"**

### Step 3: Configure Build Settings
Cloudflare should auto-detect Astro, but verify these settings:

**Project name:** `jengu-website` (or whatever you prefer)

**Production branch:** `main`

**Build settings:**
- **Framework preset:** Astro
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave empty)

**Environment variables:** (none needed for now)

### Step 4: Deploy
1. Click **"Save and Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Your site will be live at: `https://jengu-website.pages.dev`

---

## 🌐 Add Custom Domain (jengu.ai)

### Option A: Domain on Cloudflare DNS (Easiest)
1. After deployment, go to **Custom domains** tab
2. Click **"Set up a custom domain"**
3. Enter: `jengu.ai` and `www.jengu.ai`
4. Cloudflare will automatically configure DNS (if domain is on Cloudflare)
5. SSL certificate provisions automatically (5-10 minutes)

### Option B: Domain NOT on Cloudflare
1. Go to **Custom domains** tab
2. Click **"Set up a custom domain"**
3. Enter: `jengu.ai`
4. Cloudflare will provide DNS records to add:
   - **Type:** CNAME
   - **Name:** @ (or jengu.ai)
   - **Value:** jengu-website.pages.dev
5. Add records to your current DNS provider
6. Wait for DNS propagation (5 minutes - 48 hours)

---

## 📝 Update Site URLs After Custom Domain

Once your custom domain is live, update these files:

### 1. astro.config.mjs
```javascript
export default defineConfig({
  site: 'https://jengu.ai',  // Update this
  // ...
});
```

### 2. src/lib/seo/metadata.ts (line 6)
```typescript
const SITE_URL = 'https://jengu.ai';
```

### 3. src/lib/seo/jsonld.ts (line 4)
```typescript
const SITE_URL = 'https://jengu.ai';
```

### 4. src/pages/sitemap.xml.ts (line 3)
```typescript
const SITE_URL = 'https://jengu.ai';
```

### 5. src/pages/robots.txt.ts (line 3)
```typescript
const SITE_URL = 'https://jengu.ai';
```

### Commit and Push Changes
```bash
cd jengu-website-astro
git add .
git commit -m "Update site URLs to jengu.ai"
git push
```

Cloudflare will automatically rebuild and deploy (takes 2-3 minutes).

---

## ⚡ Cloudflare Pages Features

### Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Build history with rollback capability

### Performance
- Global CDN with 300+ locations
- Automatic HTTP/3 and Brotli compression
- Sub-50ms response times worldwide

### SSL/TLS
- Free automatic SSL certificates
- Always HTTPS (automatic redirects)
- TLS 1.3 support

### Analytics
- Free basic analytics included
- Real-time visitor data
- Performance metrics

---

## 🔧 Build Settings Reference

If you need to manually configure or troubleshoot:

```
Framework: Astro
Build command: npm run build
Build output directory: dist
Node version: 18 (or 20)
```

**Environment Variables:** (none required for static site)

---

## 🐛 Troubleshooting

### Build Fails
1. Check build logs in Cloudflare dashboard
2. Verify `package.json` has all dependencies
3. Try building locally: `npm run build`

### Images Not Loading
- Verify images are in `public/images/` folder
- Check image paths start with `/` (e.g., `/images/logo.png`)

### Calculator Not Working
- Ensure `calculator-ai-agents-2025.html` is in `public/` folder
- Check iframe src is `/calculator-ai-agents-2025.html`

### Custom Domain Not Working
- Wait up to 48 hours for DNS propagation
- Verify DNS records are correct
- Check SSL certificate status in Cloudflare

---

## 📊 Post-Deployment Checklist

After your site is live:

- [ ] Visit your site and test all pages
- [ ] Check footer links (Terms, Privacy)
- [ ] Test calculator modal
- [ ] Test contact form
- [ ] Verify images load correctly
- [ ] Test mobile responsiveness
- [ ] Check Lighthouse scores (aim for 90+)
- [ ] Submit sitemap to Google Search Console: `https://jengu.ai/sitemap.xml`
- [ ] Verify robots.txt: `https://jengu.ai/robots.txt`

---

## 🎉 You're Live!

Your website will be available at:
- **Cloudflare URL:** https://jengu-website.pages.dev
- **Custom Domain:** https://jengu.ai (after DNS setup)

**Repository:** https://github.com/eddiguesti/jengu-website

---

## 🔄 Making Updates

To update your website:

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
4. Cloudflare automatically rebuilds and deploys (2-3 minutes)

---

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for more options (Netlify, Vercel).
