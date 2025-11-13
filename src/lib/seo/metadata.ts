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
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

export function generateSEO(config: SEOConfig): SEOConfig {
  const title = `${config.title} | ${SITE_NAME}`;
  const description = config.description.slice(0, 160); // Truncate to 160 chars
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
