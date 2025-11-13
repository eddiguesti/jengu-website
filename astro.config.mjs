import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
    })
  ],
  output: 'static',
  build: {
    format: 'directory' // Clean URLs: /about/ instead of /about.html
  }
});
