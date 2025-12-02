# Jengu Website - Setup Instructions

## Quick Start

### 1. Copy Your Existing Files

Before running any commands, you need to copy some files from your current setup:

**Copy your landing page CSS:**
```bash
# From calculator folder, copy the <style> content from landing-page.html
# to jengu-website-astro/src/styles/landing.css
# (Remove the <style> and </style> tags, keep only the CSS content)
```

**Copy your images:**
```bash
# Copy all images from calculator/images/
# to jengu-website-astro/public/images/
cp -r ../images/* public/images/
```

**Copy your calculator:**
```bash
# Copy calculator-ai-agents-2025.html
# to jengu-website-astro/public/calculator-ai-agents-2025.html
cp ../calculator-ai-agents-2025.html public/
```

### 2. Install Dependencies

```bash
cd jengu-website-astro
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:4321

### 4. Build for Production

```bash
npm run build
```

The static site will be in `dist/` folder.

### 5. Deploy to Netlify

**Option A: Via GitHub**
1. Push this folder to GitHub
2. Connect repo in Netlify
3. Netlify will auto-detect settings from `netlify.toml`

**Option B: Manual Deploy**
```bash
npm run build
# Drag & drop the `dist` folder to Netlify

```

## File Structure

```
jengu-website-astro/
├── src/
│   ├── components/      # Reusable components
│   ├── layouts/         # Page layouts
│   ├── lib/             # Utilities (SEO, etc.)
│   ├── pages/           # Routes (file-based routing)
│   └── styles/          # CSS files
├── public/              # Static assets
│   ├── images/          # Your images go here
│   └── calculator-ai-agents-2025.html  # Your calculator
└── dist/                # Built site (after npm run build)
```

## Important Notes

1. **Design is 100% preserved** - All your CSS, animations, and JavaScript are kept exactly as-is
2. **Logo** - Make sure `public/images/logo.png` exists
3. **Calculator** - The calculator page embeds your existing calculator HTML
4. **SEO** - All pages now have proper meta tags, JSON-LD, and sitemaps automatically

## Next Steps

After the site is working:

### Phase 2: Add Blog CMS
- Set up Sanity Studio
- Connect blog pages to CMS
- Add webhook for auto-deploy

### Phase 3: Add Case Studies CMS
- Add case study schema to Sanity
- Create case study template pages
- Populate with client stories

## Troubleshooting

**Port already in use:**
```bash
npm run dev -- --port 3000
```

**Missing images:**
- Check that images are in `public/images/`
- In Astro, reference as `/images/filename.png`

**CSS not loading:**
- Verify `src/styles/landing.css` exists
- Check import in BaseLayout.astro

## Support

Questions? Check the README.md or contact: info@jengu.ai
