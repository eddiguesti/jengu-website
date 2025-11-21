import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://jengu.ai',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false
  }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/preview/'),
      serialize(item) {
        // Customize priority and changefreq based on page type
        if (item.url.includes('/blog/')) {
          item.changefreq = 'weekly';
          item.priority = 0.7;
        }
        if (item.url.includes('/case-studies/')) {
          item.changefreq = 'monthly';
          item.priority = 0.8;
        }
        if (item.url.endsWith('/')) {
          item.priority = 0.9;
        }
        return item;
      }
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    })
  ],
  output: 'hybrid', // Enable server endpoints for API routes
  build: {
    format: 'directory', // Clean URLs: /about/ instead of /about.html
    inlineStylesheets: 'auto', // Inline small CSS files
    assets: '_assets' // Custom assets folder name
  },
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['astro']
          }
        }
      }
    }
  },
  // Image optimization settings - use noop for Cloudflare
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop'
    },
    remotePatterns: [{
      protocol: 'https'
    }]
  },
  // Enable compression
  compressHTML: true
});
