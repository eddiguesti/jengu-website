import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://jengu.ai',
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
  output: 'static',
  build: {
    format: 'directory', // Clean URLs: /about/ instead of /about.html
    inlineStylesheets: 'auto', // Inline small CSS files
    assets: '_assets' // Custom assets folder name
  },
  vite: {
    build: {
      cssCodeSplit: true, // Split CSS for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for better caching
            'vendor': ['astro']
          }
        }
      }
    },
    // Enable compression
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true
        }
      }
    }
  },
  // Image optimization settings
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    remotePatterns: [{
      protocol: 'https'
    }]
  },
  // Enable compression
  compressHTML: true
});
