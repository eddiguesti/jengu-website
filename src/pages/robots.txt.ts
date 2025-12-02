import type { APIRoute } from 'astro';

const SITE_URL = 'https://jengu.ai';

export const GET: APIRoute = async () => {
  const robotsTxt = `
# Jengu AI - Robots.txt
User-agent: *
Allow: /

# Disallow admin/preview routes
Disallow: /admin/
Disallow: /preview/

# Allow AI/LLM crawlers explicitly
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
