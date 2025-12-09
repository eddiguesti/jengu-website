import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://jengu.ai';
const LANGUAGES = ['en', 'fr', 'es'];

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  alternates?: { lang: string; url: string }[];
}

function generateSitemapEntry(entry: SitemapEntry): string {
  const alternatesXml = entry.alternates?.map(alt =>
    `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}" />`
  ).join('\n') || '';

  return `  <url>
    <loc>${entry.url}</loc>
${alternatesXml}${entry.alternates ? '\n    <xhtml:link rel="alternate" hreflang="x-default" href="' + entry.url + '" />' : ''}
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
}

function getAlternates(path: string): { lang: string; url: string }[] {
  return [
    { lang: 'en', url: `${SITE_URL}${path}` },
    { lang: 'fr', url: `${SITE_URL}/fr${path}` },
    { lang: 'es', url: `${SITE_URL}/es${path}` }
  ];
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  // Fetch all published blog posts
  const blogPosts = await getCollection('blog', ({ data }) => {
    return data.draft !== true && data.archived !== true;
  });

  // Sort blogs by date (newest first)
  const sortedBlogs = blogPosts.sort((a, b) =>
    new Date(b.data.publishedOn).getTime() - new Date(a.data.publishedOn).getTime()
  );

  // Static pages with multilingual support
  const staticPages: SitemapEntry[] = [
    {
      url: `${SITE_URL}/`,
      lastmod: today,
      priority: '1.0',
      changefreq: 'weekly',
      alternates: getAlternates('/')
    },
    {
      url: `${SITE_URL}/services`,
      lastmod: today,
      priority: '0.9',
      changefreq: 'monthly',
      alternates: getAlternates('/services')
    },
    {
      url: `${SITE_URL}/about`,
      lastmod: today,
      priority: '0.8',
      changefreq: 'monthly',
      alternates: getAlternates('/about')
    },
    {
      url: `${SITE_URL}/team`,
      lastmod: today,
      priority: '0.7',
      changefreq: 'monthly',
      alternates: getAlternates('/team')
    },
    {
      url: `${SITE_URL}/contact`,
      lastmod: today,
      priority: '0.8',
      changefreq: 'monthly',
      alternates: getAlternates('/contact')
    },
    {
      url: `${SITE_URL}/calculator/ai-agents-roi`,
      lastmod: today,
      priority: '0.9',
      changefreq: 'monthly',
      alternates: getAlternates('/calculator/ai-agents-roi')
    },
    {
      url: `${SITE_URL}/case-studies`,
      lastmod: today,
      priority: '0.9',
      changefreq: 'weekly',
      alternates: getAlternates('/case-studies')
    },
    {
      url: `${SITE_URL}/faq`,
      lastmod: today,
      priority: '0.7',
      changefreq: 'monthly',
      alternates: getAlternates('/faq')
    },
    {
      url: `${SITE_URL}/blog`,
      lastmod: today,
      priority: '0.9',
      changefreq: 'daily'
    },
    {
      url: `${SITE_URL}/terms`,
      lastmod: '2025-01-01',
      priority: '0.3',
      changefreq: 'yearly'
    },
    {
      url: `${SITE_URL}/privacy`,
      lastmod: '2025-01-01',
      priority: '0.3',
      changefreq: 'yearly'
    }
  ];

  // Generate blog post entries with actual publish dates
  const blogEntries: SitemapEntry[] = sortedBlogs.map(post => {
    const lastmod = post.data.updatedOn
      ? new Date(post.data.updatedOn).toISOString().split('T')[0]
      : new Date(post.data.publishedOn).toISOString().split('T')[0];

    return {
      url: `${SITE_URL}/blog/${post.slug}/`,
      lastmod,
      priority: '0.7',
      changefreq: 'weekly'
    };
  });

  // Combine all entries
  const allEntries = [...staticPages, ...blogEntries];

  const entriesXml = allEntries.map(entry => generateSitemapEntry(entry)).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entriesXml}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
