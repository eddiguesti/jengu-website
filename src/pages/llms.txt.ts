import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://jengu.ai';

const BLOG_CATEGORIES: Record<string, string[]> = {
  'Hotel & Hospitality AI': [
    'voice-ai-hotels',
    'ai-concierge-hotels',
    'predictive-guest-analytics',
    'ai-revenue-management-hotels',
    'sustainable-tourism-ai',
    'omnichannel-ai-communication-hotels',
    'whatsapp-chatbot-hotels',
    'ai-email-automation-hotels',
    'hotel-pms-integration',
    'best-ai-consultants-for-hospitality',
    'how-to-choose-ai-consultant-for-hotels',
    'ai-transformation-hospitality',
    'using-ai-to-streamline-customer-service',
    'streamlining-customer-service-with-ai',
    'role-of-ai-in-hotel-security',
    'ai-powered-upselling-hotels',
    'contactless-check-in-hotels',
    'ai-review-management-hotels',
    'hotel-fb-operations-ai',
    'ai-for-boutique-hotels',
    'ai-loyalty-programs-hotels',
    'hotel-staff-scheduling-ai',
    'ai-guest-feedback-analysis-hotels',
    'ai-reduce-hotel-no-shows',
    'hotel-chatbots-complete-guide',
  ],
  'AI Travel & Tourism': [
    'claude-opus',
    'ai-travel-agents-vs-human',
    'gemini',
    'time-launches-ai-platform',
  ],
  'Business Process Automation': [
    'workflow-automation',
    'process-mapping',
    'ai-automation',
    'jenguai',
    'automate-business',
    'sales',
    'ai-agents-simplify',
    'streamline-operations',
    'manufacturing',
  ],
  'AI for Business': [
    'ai-can-help-your-business',
    'future-of-ai-in-business',
    'ai-for-small-businesses',
    'how-to-use-ai-in-your-business',
    'ai-powered-solutions',
    'workflow-optimization-in-finance',
    'future-of-workflow-optimization',
    'role-of-ai-in-improving-business',
    'top-ai-tools',
    'ai-engineer-pack',
  ],
  'AI in Banking & Privacy': [
    'banking',
    'privacy',
    'financial',
  ],
  'Dynamic Pricing & E-Commerce': [
    'dynamic-pricing',
    'e-commerce',
  ],
};

function categorizePosts(posts: { slug: string; data: { title: string } }[]) {
  const categorized: Record<string, typeof posts> = {};
  const used = new Set<string>();

  for (const [category, keywords] of Object.entries(BLOG_CATEGORIES)) {
    categorized[category] = posts.filter(p => {
      if (used.has(p.slug)) return false;
      const matches = keywords.some(kw => p.slug.includes(kw));
      if (matches) used.add(p.slug);
      return matches;
    });
  }

  // Remaining uncategorized posts
  const remaining = posts.filter(p => !used.has(p.slug));
  if (remaining.length > 0) {
    categorized['General AI Insights'] = remaining;
  }

  return categorized;
}

export const GET: APIRoute = async () => {
  const blogPosts = await getCollection('blog', ({ data }) => {
    return data.draft !== true && data.archived !== true;
  });

  const sortedPosts = blogPosts.sort((a, b) =>
    new Date(b.data.publishedOn).getTime() - new Date(a.data.publishedOn).getTime()
  );

  const categorized = categorizePosts(sortedPosts);

  const blogSections = Object.entries(categorized)
    .filter(([, posts]) => posts.length > 0)
    .map(([category, posts]) => {
      const links = posts.map(p => `- [${p.data.title}](${SITE_URL}/blog/${p.slug}/)`).join('\n');
      return `### ${category}\n\n${links}`;
    })
    .join('\n\n');

  const content = `# Jengu.ai

> AI Automation for Tourism & Hospitality. Smart AI agents that deliver better operations and higher revenue for hotels, resorts, campsites, and travel businesses.

## About Jengu

Jengu.ai builds custom AI automation solutions specifically for the tourism and hospitality industry. We help hotels, resorts, boutique accommodations, campsites, holiday parks, tour operators, and travel agencies automate guest communications, bookings, and operations.

**What We Do:**
- AI Guest Communication (email, WhatsApp, live chat in 40+ languages)
- AI Voice & Booking Bots (phone answering, reservation processing, payments)
- Dynamic Pricing Engine (real-time rate optimization)
- PMS & System Integrations (booking engines, CRM, payment systems)

**Key Results:**
- Up to 30% more bookings with 24/7 AI response
- 40+ hours saved weekly on routine inquiries
- Response time reduced from hours to seconds
- 300-500% ROI within first year

## Main Pages

- [Homepage](${SITE_URL}/): AI automation for tourism and hospitality
- [Services](${SITE_URL}/services): Our AI automation services and solutions
- [Dynamic Pricing](${SITE_URL}/dynamic-pricing): AI-powered dynamic pricing for accommodations
- [ROI Calculator](${SITE_URL}/calculator): Calculate your potential savings with AI automation
- [AI Agents ROI Calculator](${SITE_URL}/calculator/ai-agents-roi): Detailed AI agents ROI calculator
- [Case Studies](${SITE_URL}/case-studies): Success stories and client results
- [About](${SITE_URL}/about): About Jengu.ai and our mission
- [Team](${SITE_URL}/team): Meet our team
- [Blog](${SITE_URL}/blog): AI automation insights and guides
- [FAQ](${SITE_URL}/faq): Frequently asked questions
- [Contact](${SITE_URL}/contact): Get in touch
- [Book Consultation](${SITE_URL}/book): Schedule a free consultation

## Blog Posts

${blogSections}

## Contact

- **Website:** ${SITE_URL}
- **Email:** hello@jengu.ai
- **Book a Call:** ${SITE_URL}/book
- **Demo:** https://demo.jengu.ai

## Languages

Available in English, Spanish (jengu.ai/es), and French (jengu.ai/fr)
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
