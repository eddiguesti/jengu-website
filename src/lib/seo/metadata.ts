export interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  nofollow?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

const SITE_NAME = 'Jengu';
const SITE_URL = 'https://jengu.ai';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;
const DEFAULT_DESCRIPTION = 'AI automation solutions for tourism and hospitality. Smart AI agents delivering 30% more bookings and 40+ hours saved weekly.';
const MIN_DESCRIPTION_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 160;

export function generateSEO(config: SEOConfig): SEOConfig {
  const title = `${config.title} | ${SITE_NAME}`;

  // Use provided description or fallback to default
  let description = config.description || DEFAULT_DESCRIPTION;

  // Warn in development if description is too short
  if (import.meta.env.DEV && description.length < MIN_DESCRIPTION_LENGTH) {
    console.warn(`SEO Warning: Description for "${config.title}" is ${description.length} chars (recommended: ${MIN_DESCRIPTION_LENGTH}-${MAX_DESCRIPTION_LENGTH})`);
  }

  // Truncate to max length
  description = description.slice(0, MAX_DESCRIPTION_LENGTH);
  const ogTitle = config.ogTitle || config.title;
  const ogDescription = config.ogDescription || description;
  const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
  const canonical = config.canonical;
  const noindex = config.noindex ?? false;
  const nofollow = config.nofollow ?? false;

  return {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType: config.ogType || 'website',
    twitterCard: config.twitterCard || 'summary_large_image',
    noindex,
    nofollow,
    publishedTime: config.publishedTime,
    modifiedTime: config.modifiedTime,
    author: config.author,
    section: config.section
  };
}

export function getRobotsContent(noindex?: boolean, nofollow?: boolean): string {
  const directives = [];
  if (noindex) directives.push('noindex');
  if (nofollow) directives.push('nofollow');
  return directives.length > 0 ? directives.join(', ') : 'index, follow';
}
