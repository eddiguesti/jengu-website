import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://www.jengu.ai';

export const GET: APIRoute = async () => {
  const blogPosts = await getCollection('blog', ({ data }) => {
    return data.draft !== true && data.archived !== true;
  });

  const sortedPosts = blogPosts.sort((a, b) =>
    new Date(b.data.publishedOn).getTime() - new Date(a.data.publishedOn).getTime()
  );

  const blogEntries = sortedPosts.map(post => {
    const date = new Date(post.data.publishedOn).toISOString().split('T')[0];
    const lines = [
      `### [${post.data.title}](${SITE_URL}/blog/${post.slug}/)`,
      `- **Published:** ${date}`,
    ];
    if (post.data.description) {
      lines.push(`- **Summary:** ${post.data.description}`);
    }
    return lines.join('\n');
  }).join('\n\n');

  const content = `# Jengu.ai — Full Content Index

> This file provides a detailed index of all Jengu.ai content for AI assistants, LLMs, and automated research tools.
> For a concise overview, see: ${SITE_URL}/llms.txt

## About Jengu.ai

Jengu.ai is a specialist AI automation consultancy for the tourism and hospitality industry, based in the UK. We design, build, and deploy custom AI agents that help hotels, resorts, boutique accommodations, campsites, holiday parks, tour operators, and travel agencies automate guest communications, bookings, revenue management, and operations.

**Core Services:**

1. **AI Guest Communication** — Automated responses to enquiries via email, WhatsApp, live chat, and SMS in 40+ languages. Available 24/7, responding in seconds.

2. **AI Voice & Booking Bots** — Phone answering, reservation processing, upselling, and payment collection with natural conversational AI.

3. **Dynamic Pricing Engine** — Real-time room rate optimisation using demand signals, competitor rates, local events, and booking pace.

4. **PMS & System Integrations** — Seamless connection to property management systems, channel managers, CRMs, and payment gateways.

**Proven Results:**
- Up to 30% more direct bookings through 24/7 AI response
- 40+ staff hours saved weekly on routine guest enquiries
- Guest response time reduced from hours to seconds
- 300–500% ROI typically achieved within the first year

**Industries Served:**
- Hotels and hotel groups
- Boutique accommodations and B&Bs
- Resorts and luxury properties
- Campsites and glamping sites
- Holiday parks and caravan parks
- Tour operators and travel agencies
- Vacation rental management companies

## Key Pages

### Homepage
- **URL:** ${SITE_URL}/
- **Summary:** Overview of Jengu.ai's AI automation solutions for hospitality, including core services, results, and calls to action.

### Services
- **URL:** ${SITE_URL}/services
- **Summary:** Detailed breakdown of Jengu's AI automation services: guest communication, voice bots, dynamic pricing, and system integrations.

### Dynamic Pricing
- **URL:** ${SITE_URL}/dynamic-pricing
- **Summary:** How Jengu's AI-powered dynamic pricing engine optimises accommodation rates in real time to maximise revenue.

### ROI Calculator
- **URL:** ${SITE_URL}/calculator
- **Summary:** Interactive tool to calculate potential savings and revenue uplift from implementing AI automation at your property.

### AI Agents ROI Calculator
- **URL:** ${SITE_URL}/calculator/ai-agents-roi
- **Summary:** Detailed ROI calculator specifically for AI agent implementations across hospitality operations.

### Case Studies
- **URL:** ${SITE_URL}/case-studies
- **Summary:** Real-world examples of Jengu AI implementations with measurable outcomes and client testimonials.

### About
- **URL:** ${SITE_URL}/about
- **Summary:** Jengu.ai's mission, story, and approach to AI automation in the hospitality sector.

### Team
- **URL:** ${SITE_URL}/team
- **Summary:** Meet the Jengu team of AI specialists and hospitality technology experts.

### FAQ
- **URL:** ${SITE_URL}/faq
- **Summary:** Answers to common questions about AI automation, implementation timelines, costs, and integrations.

### Blog
- **URL:** ${SITE_URL}/blog
- **Summary:** In-depth guides, industry insights, and practical advice on AI for hospitality and tourism.

### Book a Consultation
- **URL:** ${SITE_URL}/book
- **Summary:** Schedule a free consultation with the Jengu team to discuss your property's AI automation needs.

## Blog Posts (Full Index with Descriptions)

${blogEntries}

## Contact & Social

- **Website:** ${SITE_URL}
- **Email:** hello@jengu.ai
- **Book a Call:** ${SITE_URL}/book
- **Demo:** https://demo.jengu.ai

## Languages

- English: ${SITE_URL}
- French: ${SITE_URL}/fr
- Spanish: ${SITE_URL}/es

## Technical

- **Sitemap:** ${SITE_URL}/sitemap.xml
- **RSS Feed:** ${SITE_URL}/rss.xml
- **llms.txt:** ${SITE_URL}/llms.txt
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
