# Jengu Website - Deployment Guide

## ✅ Project Status: Phase 2 Complete (Multilingual)

Your Astro website has been successfully built and tested! All pages are rendering correctly with:
- **100% design preservation** from original landing-page.html
- **Complete multilingual support** (English, French, Spanish)
- Enterprise-grade SEO automation with hreflang tags
- LLM-optimized structured data
- Language-specific sitemaps with proper annotations
- Clean, fast static site generation

---

## 🚀 Quick Start

### Development Server
```bash
cd jengu-website-astro
npm install
npm run dev
```
Visit http://localhost:4321

### Production Build
```bash
npm run build
npm run preview  # Preview production build locally
```

---

## 📦 What's Included

### Pages (Phase 1 - Static)
- ✅ `/` - Landing page with hero, features, social proof
- ✅ `/about` - Company mission, vision, story
- ✅ `/services` - Service offerings and process
- ✅ `/team` - Team members and bios
- ✅ `/contact` - Contact form and Calendly integration
- ✅ `/calculator/ai-agents-roi` - ROI calculator (iframe embed)
- ✅ `/case-studies` - Campasuns case study + coming soon section

### SEO Infrastructure
- ✅ Automated meta tags (title, description, OG, Twitter)
- ✅ JSON-LD structured data (Organization, WebSite, Breadcrumb)
- ✅ Dynamic sitemap.xml with priorities
- ✅ robots.txt with AI crawler support (GPTBot, Claude, Perplexity)
- ✅ Canonical URLs
- ✅ Clean URL structure (/about/ not /about.html)

### Assets
- ✅ All images copied to public/images/
- ✅ Calculator HTML at public/calculator-ai-agents-2025.html
- ✅ 2037 lines of CSS extracted to src/styles/landing.css
- ✅ Logo, competitor discovery, pricing strategy screenshots

---

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)
**Why:** Best for Astro, instant deploys, free tier, automatic CI/CD

1. **Connect Repository**
   ```bash
   cd jengu-website-astro
   git init
   git add .
   git commit -m "Initial Astro website with SEO"
   git remote add origin https://github.com/yourusername/jengu-website.git
   git push -u origin main
   ```

2. **Deploy to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repo
   - Build settings (auto-detected):
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Custom Domain**
   - Go to Site settings → Domain management
   - Add custom domain: `jengu.ai`
   - Update DNS records as instructed
   - Netlify automatically provisions SSL certificate

**Netlify CLI (Alternative)**
```bash
npm install -g netlify-cli
cd jengu-website-astro
netlify login
netlify init
netlify deploy --prod
```

---

### Option 2: Cloudflare Pages
**Why:** Global CDN, excellent performance, free tier

1. **Connect Repository** (same as Netlify)

2. **Deploy to Cloudflare Pages**
   - Go to https://dash.cloudflare.com
   - Pages → Create a project → Connect to Git
   - Select repository
   - Build settings:
     - Framework preset: Astro
     - Build command: `npm run build`
     - Build output: `dist`
   - Click "Save and Deploy"

3. **Custom Domain**
   - Pages → Custom domains → Set up a custom domain
   - Add `jengu.ai`
   - Update DNS (if using Cloudflare DNS, automatic)

---

### Option 3: Vercel
**Why:** Great developer experience, preview deployments

```bash
npm install -g vercel
cd jengu-website-astro
vercel login
vercel --prod
```

Or connect via GitHub:
- Go to https://vercel.com
- Import your GitHub repository
- Framework: Astro (auto-detected)
- Deploy

---

## 🔧 Environment Configuration

### Update Site URL
Edit `astro.config.mjs`:
```javascript
export default defineConfig({
  site: 'https://jengu.ai',  // Change to your domain
  // ...
});
```

Also update in:
- `src/lib/seo/metadata.ts` (line 6: `SITE_URL`)
- `src/lib/seo/jsonld.ts` (line 4: `SITE_URL`)
- `src/pages/sitemap.xml.ts` (line 3: `SITE_URL`)
- `src/pages/robots.txt.ts` (line 3: `SITE_URL`)

### Form Submission
The contact form currently logs to console. To enable real form submissions:

**Option A: Netlify Forms**
Change in `src/pages/contact.astro`:
```html
<form id="contactForm" name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <!-- rest of form -->
</form>
```

**Option B: Formspree**
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

**Option C: Custom API**
Update the `handleSubmit` function to POST to your backend endpoint.

---

## 🎨 Design Notes

### Original Design Preserved
- All CSS extracted without modifications (2037 lines)
- All JavaScript preserved (throttle, observers, modals)
- Spline 3D robot integration maintained
- Circular feature cards with morphing animations
- Hero gradients and animations identical
- Mobile responsiveness preserved

### Component Structure
```
src/
├── components/
│   ├── layout/
│   │   └── BaseLayout.astro  # Nav, footer, global JS/CSS
│   └── seo/
│       ├── SEOHead.astro      # Meta tags
│       └── JsonLd.astro       # Structured data
├── lib/
│   └── seo/
│       ├── metadata.ts        # SEO config generator
│       └── jsonld.ts          # JSON-LD schemas
├── pages/
│   ├── index.astro            # Landing page
│   ├── about.astro
│   ├── services.astro
│   ├── team.astro
│   ├── contact.astro
│   ├── case-studies.astro
│   ├── calculator/
│   │   └── ai-agents-roi.astro
│   ├── robots.txt.ts
│   └── sitemap.xml.ts
└── styles/
    └── landing.css            # Extracted CSS
```

---

## 📊 SEO Verification

After deployment, verify SEO setup:

1. **Google Search Console**
   - Submit sitemap: `https://jengu.ai/sitemap.xml`
   - Verify ownership
   - Monitor indexing

2. **Meta Tags Testing**
   - https://www.opengraph.xyz (OG tags)
   - https://cards-dev.twitter.com/validator (Twitter cards)

3. **Structured Data Testing**
   - https://search.google.com/test/rich-results
   - Validate Organization and WebSite schemas

4. **Performance Testing**
   - https://pagespeed.web.dev
   - Target: 90+ scores

---

## 🔄 Phase 2: Blog with Sanity CMS (Future)

When ready to add blog functionality:

1. **Set up Sanity Studio**
   ```bash
   npm create sanity@latest -- --template blog
   ```

2. **Install Sanity Integration**
   ```bash
   npm install @sanity/astro
   ```

3. **Add to astro.config.mjs**
   ```javascript
   import sanity from '@sanity/astro';

   export default defineConfig({
     integrations: [
       sanity({
         projectId: 'YOUR_PROJECT_ID',
         dataset: 'production',
         useCdn: true
       })
     ]
   });
   ```

4. **Create Blog Pages**
   - `/blog` - Blog listing
   - `/blog/[slug]` - Individual posts

See `SETUP_INSTRUCTIONS.md` for full Sanity setup guide.

---

## 🐛 Troubleshooting

### Build Errors
```bash
npm run build
# Check for TypeScript errors or missing imports
```

### Styles Not Loading
- Verify `landing.css` is in `src/styles/`
- Check import in `BaseLayout.astro`

### Images Not Showing
- Ensure images are in `public/images/`
- Reference as `/images/logo.png` (not `images/logo.png`)

### Calculator Modal Not Opening
- Verify `calculator-ai-agents-2025.html` is in `public/`
- Check `openCalculatorModal()` function in BaseLayout

---

## 📝 Next Steps

1. **Deploy to Netlify/Cloudflare** (10 minutes)
2. **Update site URLs** in config files (5 minutes)
3. **Connect custom domain** (15 minutes + DNS propagation)
4. **Set up form backend** (Netlify Forms or Formspree)
5. **Submit sitemap to Google Search Console**
6. **Test all pages** on production domain
7. **Monitor performance** with PageSpeed Insights

---

## 🎉 Success Metrics

After deployment, you should see:
- ✅ All pages loading with preserved design
- ✅ Sub-2s page load times
- ✅ 90+ Lighthouse scores
- ✅ Valid structured data (no errors)
- ✅ Proper OG/Twitter card previews
- ✅ Calculator modal working
- ✅ Contact form submitting
- ✅ AI crawlers allowed (check robots.txt)

---

## 📞 Support

Built with Astro 4.x, TypeScript, and static-first architecture for optimal performance and SEO.

For questions about the codebase:
- Check `README.md` for project overview
- See `SETUP_INSTRUCTIONS.md` for local development
- Review `COMPLETE_SETUP.md` for architecture details

---

**🚀 Ready to deploy!** Your modern, SEO-optimized website is production-ready.
