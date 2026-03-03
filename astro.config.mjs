import { defineConfig } from 'astro/config';
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
