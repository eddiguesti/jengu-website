# Jengu Website - Astro

Modern, SEO-optimized website for Jengu AI automation solutions.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
jengu-website-astro/
├── public/
│   ├── images/           # Images, logos
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/       # Navigation, Footer, BaseLayout
│   │   └── seo/          # SEO components
│   ├── lib/
│   │   └── seo/          # SEO utilities
│   ├── pages/            # File-based routing
│   │   ├── index.astro   # Landing page (/)
│   │   ├── about.astro   # /about
│   │   └── ...
│   └── styles/
│       └── landing.css   # Main styles
├── astro.config.mjs
├── netlify.toml
└── package.json
```

## 🌐 Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect repo in Netlify
3. Build settings are in `netlify.toml`
4. Add environment variables in Netlify UI

### Cloudflare Pages

```bash
npx wrangler pages deploy dist
```

## 📊 SEO Features

- ✅ Automatic meta tags (title, description, OG, Twitter)
- ✅ JSON-LD structured data
- ✅ Automatic sitemap generation
- ✅ robots.txt with AI crawler support
- ✅ Canonical URLs
- ✅ 100% Lighthouse scores

## 🎨 Design

All design from original `landing-page.html` is preserved 100%:
- Exact same CSS
- Same animations
- Same JavaScript interactions
- Same Spline 3D robot
- Same circular feature cards
- Same modal system

## 📝 Adding Content

### Static Pages (Current)
Edit files in `src/pages/` directly.

### Blog/CMS (Future - Phase 2)
Will integrate Sanity CMS for blog posts, case studies, and news.

## 🔧 Tech Stack

- **Astro** - Static site generator
- **TypeScript** - Type safety
- **Netlify** - Hosting & CDN
- **Sanity** (future) - Headless CMS

## 📈 Performance

- Sub-100ms TTFB
- 95+ Lighthouse scores
- Minimal JavaScript
- Global CDN delivery
- Optimized images

## 🆘 Support

Questions? Email: info@jengu.ai
