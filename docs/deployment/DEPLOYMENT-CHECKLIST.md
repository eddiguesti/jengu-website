# 🚀 Cloudflare Pages Deployment Checklist

## Current Status: Repo Connected ✅

Since your GitHub repo is already connected to Cloudflare Pages, deployments happen automatically on every push to `main`.

---

## Immediate Next Steps

### 1. Check Current Deployment

Visit your Cloudflare Pages dashboard:
1. Go to https://dash.cloudflare.com
2. Navigate to **Pages**
3. Click on your **jengu-website** project
4. Check the **Deployments** tab

You should see a deployment in progress or completed with the latest commit:
- **Commit**: "Add comprehensive Cloudflare Pages deployment configuration"
- **Branch**: main
- **Status**: Should be "Success" or "Building"

### 2. Get Your Live URL

Once deployment succeeds, you'll have a URL like:
- Production: `https://jengu-website.pages.dev`
- Or: `https://jengu-website-[random].pages.dev`

Copy this URL - you'll use it for testing!

---

## Performance Optimizations (Do These Now)

### A. Enable Brotli Compression

1. In Cloudflare Dashboard, go to your **domain** (not Pages)
   - If you haven't added jengu.ai yet, these settings apply to any domain
2. Navigate to **Speed** → **Optimization**
3. Toggle **Brotli** to **ON**
   - ✅ Reduces file sizes by 15-20%

### B. Enable Auto Minify

Still in **Speed** → **Optimization**:
1. Enable **Auto Minify**:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML
   - Note: Astro already minifies, but this adds compression

### C. Enable HTTP/3

1. Go to **Network** tab
2. Toggle **HTTP/3 (with QUIC)** to **ON**
   - ✅ Better performance on modern browsers
   - ✅ Faster connection establishment

### D. Verify Pages Settings

1. Go back to **Pages** → Your project
2. Click **Settings** tab
3. Verify build configuration:
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: / (or blank)
   Node version: 18 or higher
   ```

---

## Testing Your Live Site

### Test These URLs (replace with your actual *.pages.dev URL):

1. **Homepage (English)**
   - https://your-site.pages.dev/
   - ✅ Spline robot loads
   - ✅ Language switcher visible
   - ✅ All sections visible

2. **French Homepage**
   - https://your-site.pages.dev/fr/
   - ✅ Content in French
   - ✅ Language switcher shows FR active

3. **Spanish Homepage**
   - https://your-site.pages.dev/es/
   - ✅ Content in Spanish
   - ✅ Language switcher shows ES active

4. **Services Page**
   - https://your-site.pages.dev/services
   - https://your-site.pages.dev/fr/services
   - https://your-site.pages.dev/es/services

5. **Case Studies** (Test WebP images)
   - https://your-site.pages.dev/case-studies
   - ✅ Images load (check Network tab for .webp)
   - ✅ Click images to open modal
   - ✅ Lazy loading works

6. **FAQ Page**
   - https://your-site.pages.dev/faq
   - ✅ Accordion opens/closes
   - ✅ All questions visible

7. **Sitemaps**
   - https://your-site.pages.dev/sitemap-index.xml
   - https://your-site.pages.dev/sitemap-en.xml
   - https://your-site.pages.dev/sitemap-fr.xml
   - https://your-site.pages.dev/sitemap-es.xml

8. **Robots.txt**
   - https://your-site.pages.dev/robots.txt

---

## Run Lighthouse Audit

### Using Chrome DevTools:

1. Open your site in Chrome
2. Right-click → **Inspect**
3. Go to **Lighthouse** tab
4. Select:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. Click **Generate report**

### Target Scores:
- **Performance**: 90+ (aim for 95+)
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Common Issues to Fix:
- ❌ **Low Performance**: Usually images or JavaScript
  - Check if WebP images are loading
  - Check if Brotli is enabled

- ❌ **SEO Issues**: Missing meta tags
  - Check each page has title and description
  - Verify hreflang tags are present

---

## Add Analytics (Optional - But Recommended)

### Cloudflare Web Analytics

1. In Cloudflare Dashboard, go to **Analytics** → **Web Analytics**
2. Click **Add a site**
3. Enter your Pages URL: `your-site.pages.dev`
4. Copy the beacon script provided
5. Add to `src/components/layout/BaseLayout.astro` before `</head>`:

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'></script>
```

### Microsoft Clarity (Optional)

1. Go to https://clarity.microsoft.com
2. Create new project
3. Get tracking code
4. Add to BaseLayout before `</head>`

---

## Verify Headers & Caching

### Test Cache Headers:

Open Chrome DevTools:
1. Go to **Network** tab
2. Reload your page
3. Click on any image file (e.g., `logo.webp`)
4. Check **Headers** tab
5. Verify you see:
   ```
   cache-control: public, max-age=31536000, immutable
   content-type: image/webp
   ```

### Test Security Headers:

Check any HTML page:
1. Look for **Response Headers**
2. Should see:
   ```
   x-frame-options: DENY
   x-content-type-options: nosniff
   x-xss-protection: 1; mode=block
   ```

---

## Mobile Testing

Test on actual devices:
1. **iPhone/iPad**: Safari and Chrome
2. **Android**: Chrome and Samsung Internet
3. **Different screen sizes**: 13", 15", mobile

Check:
- ✅ Navigation works
- ✅ Language switcher works
- ✅ Images load properly
- ✅ Text is readable (not too small)
- ✅ Buttons are tappable
- ✅ Spline robot performs well (or gracefully degrades)

---

## Language Switcher Testing

On each page, test switching between languages:

1. Start on English page: `/services`
2. Click language switcher → **FR**
3. Should go to: `/fr/services`
4. Click **ES**
5. Should go to: `/es/services`
6. Click **EN**
7. Should go to: `/services`

Verify URLs change correctly and content translates.

---

## Check Build Logs (If Issues)

If deployment fails:

1. Go to Cloudflare Pages dashboard
2. Click on the failed deployment
3. View **Build logs**
4. Common issues:
   - Missing dependencies: Run `npm install` locally
   - Build errors: Run `npm run build` locally
   - Node version: Ensure Node 18+ in Pages settings

---

## Pre-Domain Launch Checklist

Before connecting `jengu.ai`:

- [ ] All pages load correctly on *.pages.dev
- [ ] Language switcher works perfectly
- [ ] Images load (WebP with PNG fallback)
- [ ] Lighthouse scores are 90+
- [ ] Mobile experience is smooth
- [ ] Forms work (if applicable)
- [ ] Calculator modal works
- [ ] No console errors
- [ ] All translations complete
- [ ] SEO meta tags present on all pages
- [ ] Sitemaps accessible and correct
- [ ] Analytics tracking codes added

---

## Domain Connection (When Ready)

### Step 1: Add Custom Domain in Cloudflare Pages

1. Go to **Pages** → Your project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `jengu.ai`
5. Click **Continue**

### Step 2: DNS Configuration

Cloudflare will provide DNS records. Typically:

**If using Cloudflare for DNS:**
- ✅ Automatic - just confirm
- SSL certificate auto-provisions

**If using external DNS:**
```
CNAME: jengu.ai → your-site.pages.dev
```

### Step 3: Wait for SSL

- Takes 5-15 minutes
- Cloudflare auto-provisions certificate
- Check **SSL/TLS** tab for status

### Step 4: Test Domain

1. Visit https://jengu.ai
2. Verify SSL works (green padlock)
3. Test all pages again
4. Submit to Google Search Console

---

## Monitoring & Maintenance

### Set Up Monitoring

1. **Uptime Monitoring**: UptimeRobot (free)
   - Monitor: https://jengu.ai
   - Alert if site goes down

2. **Performance Monitoring**: Cloudflare Analytics
   - Check daily visitors
   - Monitor performance metrics

3. **Error Tracking**: Cloudflare Workers (optional)
   - Track 404s
   - Monitor errors

### Regular Checks

Weekly:
- [ ] Check Cloudflare Analytics
- [ ] Review deployment logs
- [ ] Test critical pages

Monthly:
- [ ] Run Lighthouse audit
- [ ] Check Google Search Console
- [ ] Review Core Web Vitals
- [ ] Update content as needed

---

## Troubleshooting

### Site Not Loading

1. Check Cloudflare Pages deployment status
2. Check build logs for errors
3. Verify DNS propagation: `nslookup jengu.ai`
4. Clear browser cache

### Images Not Showing

1. Check image paths start with `/` not `./`
2. Verify images exist in `public/images/`
3. Check browser Network tab for 404s
4. Verify WebP fallback works

### Language Switcher Not Working

1. Check browser console for errors
2. Verify JavaScript loaded
3. Test in incognito mode
4. Check language detection logic

### Performance Issues

1. Enable Brotli compression
2. Verify image lazy loading
3. Check if WebP images are serving
4. Review Lighthouse recommendations

---

## Success Metrics

After deployment, track:

### Performance
- ✅ Lighthouse Performance: 95+
- ✅ Page load time: < 2 seconds
- ✅ TTFB: < 600ms
- ✅ LCP: < 2.5s

### SEO
- ✅ Google Search Console indexed pages
- ✅ No crawl errors
- ✅ Sitemaps submitted
- ✅ Core Web Vitals green

### User Experience
- ✅ Bounce rate < 50%
- ✅ Average session > 1 minute
- ✅ Mobile traffic > 40%
- ✅ No JavaScript errors

---

## Next Deployment

Future deployments are automatic:

1. Make changes locally
2. Commit: `git add . && git commit -m "Your message"`
3. Push: `git push origin main`
4. Cloudflare auto-deploys (takes 1-3 minutes)
5. Check deployment status in dashboard

Branch deployments:
- Every branch gets a preview URL
- Test features before merging to main
- Perfect for staging/testing

---

## 🎉 You're Ready to Launch!

Current Status:
- ✅ Repository connected
- ✅ Latest code pushed
- ✅ Cloudflare config files ready
- ✅ Images optimized
- ✅ Multilingual support complete
- ✅ SEO ready

Just deploy, test, and when everything looks perfect on *.pages.dev, connect your domain!

**Need Help?**
- Cloudflare Community: https://community.cloudflare.com/
- Astro Discord: https://astro.build/chat
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
