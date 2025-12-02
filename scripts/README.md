# Scripts Directory

Build scripts and automation tools for the project.

## 📜 Scripts

### `cloudflare-api-setup.mjs`
Automated Cloudflare API configuration script.
- Sets up Cloudflare Pages integration
- Configures build settings
- Manages environment variables

**Usage:**
```bash
node scripts/cloudflare-api-setup.mjs
```

### `create-index.mjs`
Generates sitemap index files for multilingual support.
- Creates main sitemap index
- Generates language-specific sitemaps (en, es, fr)

**Usage:**
```bash
node scripts/create-index.mjs
```

### `optimize-images.mjs`
Image optimization script for production builds.
- Compresses images
- Generates responsive image variants
- Optimizes for web performance

**Usage:**
```bash
node scripts/optimize-images.mjs
```

## 🔧 Requirements

- Node.js 18+
- npm or pnpm package manager
