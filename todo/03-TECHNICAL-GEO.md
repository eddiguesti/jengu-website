# Step 3: Technical GEO (Generative Engine Optimization)

## Why This Matters

> "If it needs JavaScript to display, AI can't read it. Fix this or stay invisible."
> — Strapi GEO Guide

Technical GEO ensures AI crawlers can access and understand your content.

## Current Technical Audit

### Check These Items:

- [ ] Server-side rendering (SSR) enabled
- [ ] JavaScript content accessible without JS
- [ ] robots.txt allows AI bots
- [ ] Sitemap up to date
- [ ] Page speed < 2 seconds
- [ ] Mobile-friendly
- [ ] HTTPS everywhere
- [ ] No broken links

## AI Bot Access Configuration

### Update robots.txt

Current location: `/public/robots.txt`

**Add these rules to ALLOW AI crawlers:**

```txt
# Allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Bytespider
Allow: /

User-agent: cohere-ai
Allow: /

# Standard crawlers
User-agent: *
Allow: /

# Sitemap
Sitemap: https://jengu.ai/sitemap.xml

# LLMs.txt
# See https://jengu.ai/llms.txt for AI-readable content map
```

### AI Crawler Reference

| Bot | Company | Purpose |
|-----|---------|---------|
| GPTBot | OpenAI | ChatGPT training & search |
| ChatGPT-User | OpenAI | Real-time browsing |
| ClaudeBot | Anthropic | Claude training |
| PerplexityBot | Perplexity | Perplexity search |
| Google-Extended | Google | Gemini/AI training |
| Amazonbot | Amazon | Alexa/AI services |

## Page Speed Optimization

### Target Metrics:
- **Time to First Byte (TTFB):** < 200ms
- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1

### Quick Fixes:

1. **Compress Images**
   - Convert all images to WebP
   - Use responsive images
   - Lazy load below-fold images

2. **Minimize JavaScript**
   - Defer non-critical JS
   - Remove unused code
   - Lazy load Spline 3D viewer

3. **Enable Caching**
   - Set cache headers
   - Use Cloudflare caching
   - Cache API responses

4. **Optimize Fonts**
   - Use font-display: swap
   - Preload critical fonts
   - Limit font weights

## Semantic HTML Structure

### Replace Generic Divs

**Before:**
```html
<div class="article">
  <div class="title">...</div>
  <div class="content">...</div>
</div>
```

**After:**
```html
<article>
  <header>
    <h1>...</h1>
  </header>
  <main>...</main>
  <footer>...</footer>
</article>
```

### Use Proper HTML5 Elements

| Element | Use For |
|---------|---------|
| `<article>` | Blog posts, news items |
| `<section>` | Thematic groupings |
| `<nav>` | Navigation links |
| `<aside>` | Sidebars, related content |
| `<header>` | Introductory content |
| `<footer>` | Footer content |
| `<main>` | Main content area |
| `<figure>` | Images with captions |

## Sitemap Optimization

### Current: `/public/sitemap.xml`

**Ensure it includes:**
- All 13 main pages
- All 52 blog posts
- All language versions (EN, ES, FR)
- Last modified dates
- Priority hints

**Example structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jengu.ai/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://jengu.ai/blog/whatsapp-chatbots-for-hotels</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Meta Tags for AI

### Essential Meta Tags

```html
<head>
  <!-- Standard SEO -->
  <title>AI Automation for Hotels | Jengu.ai</title>
  <meta name="description" content="Smart AI agents for hospitality. Automate guest communications, bookings, and operations. 30% more bookings, 40+ hours saved weekly.">

  <!-- Open Graph -->
  <meta property="og:title" content="AI Automation for Hotels | Jengu.ai">
  <meta property="og:description" content="...">
  <meta property="og:image" content="https://jengu.ai/images/og-image.jpg">
  <meta property="og:url" content="https://jengu.ai">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="...">

  <!-- AI-specific (experimental) -->
  <meta name="ai-content-declaration" content="original">
  <link rel="alternate" type="text/plain" href="/llms.txt">
</head>
```

## Canonical URLs

Ensure every page has a canonical URL to prevent duplicate content issues:

```html
<link rel="canonical" href="https://jengu.ai/blog/whatsapp-chatbots-for-hotels">
```

For language versions:
```html
<link rel="alternate" hreflang="en" href="https://jengu.ai/services">
<link rel="alternate" hreflang="es" href="https://jengu.ai/es/services">
<link rel="alternate" hreflang="fr" href="https://jengu.ai/fr/services">
<link rel="alternate" hreflang="x-default" href="https://jengu.ai/services">
```

## Testing Tools

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Rich Results Test](https://search.google.com/test/rich-results)

## Priority Actions

1. **Update robots.txt** with AI bot rules (15 mins)
2. **Audit page speed** and fix critical issues (2-4 hours)
3. **Add semantic HTML** to blog template (1-2 hours)
4. **Verify sitemap** is complete and updated (30 mins)
5. **Add canonical URLs** to all pages (1 hour)

## Estimated Time: 6-10 hours
