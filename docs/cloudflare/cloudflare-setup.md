# Cloudflare Pages Setup Guide

## Current Status
- ✅ Project built and ready to deploy
- ✅ Static site optimized with WebP images
- ✅ Lazy loading implemented
- ✅ Multilingual support (EN/FR/ES)
- ⏳ Cloudflare Pages deployment pending

---

## Step 1: Create Cloudflare Pages Project

### Via Cloudflare Dashboard (Recommended)

1. **Log into Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to **Pages** in the left sidebar

2. **Connect GitHub Repository**
   - Click **Create a project**
   - Click **Connect to Git**
   - Authorize Cloudflare to access your GitHub account
   - Select repository: `eddiguesti/jengu-website`
   - Click **Begin setup**

3. **Configure Build Settings**
   ```
   Production branch: main
   Framework preset: Astro
   Build command: npm run build
   Build output directory: dist
   Root directory: / (leave blank)
   ```

4. **Environment Variables** (None required for now)

5. **Click "Save and Deploy"**
   - First deployment will take 2-5 minutes
   - You'll get a URL like: `jengu-website.pages.dev`

### Via Wrangler CLI (Alternative)

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create Pages project
wrangler pages project create jengu-website --production-branch=main

# Deploy
npm run build
wrangler pages deploy dist --project-name=jengu-website
```

---

## Step 2: Optimize Cloudflare Settings

### A. Performance Settings (Can be done on *.pages.dev)

1. **Enable Brotli Compression**
   - Go to **Speed** → **Optimization**
   - Enable **Brotli** compression
   - ✅ Reduces file sizes by 15-20% vs gzip

2. **Auto Minify**
   - Go to **Speed** → **Optimization**
   - Enable Auto Minify for:
     - ✅ HTML
     - ✅ CSS
     - ✅ JavaScript
   - Note: Astro already minifies, but this adds extra layer

3. **Enable HTTP/3**
   - Go to **Network** → **HTTP/3**
   - Toggle **HTTP/3 (with QUIC)** to ON
   - ✅ Faster performance on modern browsers

4. **Rocket Loader** (Optional - Test First)
   - Go to **Speed** → **Optimization**
   - Consider enabling **Rocket Loader**
   - ⚠️ Test thoroughly - can break some JS

### B. Caching Rules

Cloudflare Pages automatically caches assets based on `_headers` file (already created).

To add custom rules via Dashboard:
1. Go to **Caching** → **Cache Rules**
2. Create rule for static assets:
   ```
   If URI Path matches: /images/*
   Then: Cache level: Standard, Edge TTL: 1 month
   ```

### C. Security Settings

1. **Always Use HTTPS**
   - Go to **SSL/TLS** → **Edge Certificates**
   - Enable **Always Use HTTPS**
   - ✅ Automatically enabled on Pages

2. **Automatic HTTPS Rewrites**
   - Go to **SSL/TLS** → **Edge Certificates**
   - Enable **Automatic HTTPS Rewrites**

3. **Security Headers** (Already configured in `_headers` file)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block

---

## Step 3: Set Up Analytics (Works on *.pages.dev)

### A. Cloudflare Web Analytics

1. **Add Web Analytics**
   - Go to **Analytics** → **Web Analytics**
   - Click **Add a site**
   - Enter your Pages URL: `jengu-website.pages.dev`
   - Click **Begin setup**

2. **Get Beacon Script**
   - Copy the provided script tag:
   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
           data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'></script>
   ```

3. **Add to BaseLayout**
   - Edit `src/components/layout/BaseLayout.astro`
   - Add script before closing `</head>` tag

### B. Microsoft Clarity (Optional)

1. **Sign up at https://clarity.microsoft.com**
2. **Create new project**
3. **Get tracking code**
4. **Add to BaseLayout** before closing `</head>`

---

## Step 4: Set Up Custom 404 Page

Already handled by Astro! The 404.astro page will automatically work on Cloudflare Pages.

If you need a custom one:
1. Create `src/pages/404.astro`
2. Style it to match your brand
3. Add helpful navigation links

---

## Step 5: Test Everything on *.pages.dev

### Performance Testing

1. **Google PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Test: `https://jengu-website.pages.dev`
   - Target: 90+ scores on all metrics

2. **WebPageTest**
   - https://webpagetest.org/
   - Test from multiple locations
   - Check: TTFB, LCP, CLS

3. **Lighthouse (Chrome DevTools)**
   - Open DevTools → Lighthouse tab
   - Run audit on all pages
   - Fix any issues before domain launch

### SEO Testing

1. **Check Meta Tags**
   - View page source
   - Verify `<title>`, `<meta description>`
   - Verify Open Graph tags
   - Verify hreflang tags

2. **Test Sitemaps**
   - Visit: `https://jengu-website.pages.dev/sitemap-index.xml`
   - Verify all URLs are correct
   - Verify hreflang annotations

3. **Test robots.txt**
   - Visit: `https://jengu-website.pages.dev/robots.txt`
   - Ensure it's not blocking important pages

### Multilingual Testing

1. **Test Language Switcher**
   - Navigate through all pages
   - Switch between EN/FR/ES
   - Verify URLs change correctly
   - Verify content translates

2. **Test All Routes**
   - `/` → English homepage
   - `/fr/` → French homepage
   - `/es/` → Spanish homepage
   - All sub-pages in each language

---

## Step 6: Prepare for Domain Connection

### A. Update URLs in Code (Already Done)

Ensure all canonical URLs and hreflang tags use `https://jengu.ai/...`
- ✅ Already configured in `astro.config.mjs`
- ✅ Already configured in SEO metadata

### B. Prepare DNS Records

When ready to connect `jengu.ai`:

**Option 1: Using Cloudflare Nameservers (Recommended)**
1. Add `jengu.ai` to Cloudflare
2. Update nameservers at your registrar
3. Cloudflare handles everything automatically

**Option 2: External DNS (CNAME only)**
```
CNAME: jengu.ai → jengu-website.pages.dev
CNAME: www.jengu.ai → jengu-website.pages.dev
```

### C. SSL Certificate

- ✅ Cloudflare automatically provisions SSL
- ✅ Takes 5-15 minutes after DNS propagation
- ✅ Supports both apex (jengu.ai) and www

---

## Step 7: Cloudflare Pages Settings (via API or Dashboard)

### Deploy Settings

```json
{
  "build": {
    "command": "npm run build",
    "destination": "dist",
    "root_dir": "",
    "env_vars": {}
  },
  "preview": {
    "branch_preview_enabled": true,
    "deployment_config": "preview"
  },
  "production": {
    "branch": "main",
    "deployment_config": "production"
  }
}
```

### Branch Deployments

Every git branch automatically gets a preview URL:
- `main` → `jengu-website.pages.dev`
- `feature-xyz` → `feature-xyz.jengu-website.pages.dev`

---

## Step 8: Post-Deployment Checklist

### Immediate Actions
- [ ] Verify site loads on *.pages.dev
- [ ] Test all navigation links
- [ ] Test language switcher
- [ ] Test contact form (if active)
- [ ] Test calculator modal
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit
- [ ] Check WebP images load correctly

### SEO Prep (Do NOT add until domain is live)
- [ ] ~~Google Search Console~~ (Wait for domain)
- [ ] ~~Google Analytics~~ (Wait for domain)
- [ ] ~~Bing Webmaster Tools~~ (Wait for domain)

### Analytics (Can do now on *.pages.dev)
- [x] Cloudflare Web Analytics
- [x] Microsoft Clarity
- [ ] Test event tracking

---

## Step 9: Domain Go-Live Checklist

When ready to launch on `jengu.ai`:

### Pre-Launch
1. [ ] Test everything thoroughly on *.pages.dev
2. [ ] Fix all Lighthouse issues
3. [ ] Verify all translations complete
4. [ ] Test on mobile devices
5. [ ] Backup current DNS settings

### Launch Day
1. [ ] Add `jengu.ai` to Cloudflare Pages custom domains
2. [ ] Update DNS (if not using Cloudflare nameservers)
3. [ ] Wait for SSL certificate (5-15 min)
4. [ ] Test https://jengu.ai loads correctly
5. [ ] Submit sitemap to Google Search Console
6. [ ] Update analytics to track real domain

### Post-Launch
1. [ ] Monitor analytics for traffic
2. [ ] Check Google Search Console for errors
3. [ ] Monitor Cloudflare analytics
4. [ ] Set up uptime monitoring (e.g., UptimeRobot)

---

## Troubleshooting

### Build Fails
```bash
# Check build locally first
npm run build

# Check Cloudflare Pages logs
wrangler pages deployment list --project-name=jengu-website
wrangler pages deployment tail --project-name=jengu-website
```

### Site Not Loading
1. Check Cloudflare Pages deployment status
2. Verify DNS propagation: `dig jengu.ai`
3. Check SSL certificate status
4. Clear browser cache

### Images Not Loading
1. Check `public/images/` directory exists in build
2. Verify paths start with `/` not `./`
3. Check CORS headers in `_headers` file

---

## Performance Targets

After all optimizations, aim for:

**Lighthouse Scores:**
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Other Metrics:**
- TTFB (Time to First Byte): < 600ms
- Total Page Size: < 1MB
- Total Requests: < 50

---

## Next Steps

1. **Deploy to Cloudflare Pages** (Step 1)
2. **Enable performance optimizations** (Step 2)
3. **Add analytics** (Step 3)
4. **Test thoroughly** (Step 5)
5. **Prepare for domain launch** (Step 6)

Once everything works perfectly on `*.pages.dev`, you're ready to flip DNS and go live on `jengu.ai`!

---

## Useful Commands

```bash
# Build locally
npm run build

# Preview production build
npm run preview

# Deploy via Wrangler
wrangler pages deploy dist --project-name=jengu-website

# Check deployment status
wrangler pages deployment list --project-name=jengu-website

# Tail deployment logs
wrangler pages deployment tail --project-name=jengu-website
```

---

## Support Resources

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Astro Deployment Guide: https://docs.astro.build/en/guides/deploy/cloudflare/
- Cloudflare Community: https://community.cloudflare.com/
