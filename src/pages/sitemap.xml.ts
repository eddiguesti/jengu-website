import type { APIRoute } from 'astro';

const SITE_URL = 'https://jengu.ai';

function generateSitemapEntry(url: string, lastmod?: string, changefreq?: string, priority?: string) {
  return `
  <url>
    <loc>${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`;
}

export const GET: APIRoute = async () => {
  // Static routes with SEO priorities
  const staticPages = [
    { url: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { url: `${SITE_URL}/services`, priority: '0.9', changefreq: 'monthly' },
    { url: `${SITE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
    { url: `${SITE_URL}/team`, priority: '0.7', changefreq: 'monthly' },
    { url: `${SITE_URL}/contact`, priority: '0.8', changefreq: 'monthly' },
    { url: `${SITE_URL}/calculator/ai-agents-roi`, priority: '0.9', changefreq: 'monthly' },
    { url: `${SITE_URL}/case-studies`, priority: '0.9', changefreq: 'weekly' },
    { url: `${SITE_URL}/terms`, priority: '0.3', changefreq: 'yearly' },
    { url: `${SITE_URL}/privacy`, priority: '0.3', changefreq: 'yearly' }
  ];

  const entries = staticPages.map(page =>
    generateSitemapEntry(page.url, new Date().toISOString(), page.changefreq, page.priority)
  ).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${entries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
