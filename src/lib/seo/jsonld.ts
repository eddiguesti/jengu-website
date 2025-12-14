const SITE_NAME = 'Jengu';
const SITE_URL = 'https://jengu.ai';

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
  };
}

export function generateOrganizationSchema(): OrganizationSchema & Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: 'Jengu AI Ltd',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.webp`,
    description: 'AI automation for tourism and hospitality. Smart AI agents for hotels, resorts, and travel businesses delivering 30% more bookings, 40+ hours saved weekly, and 24/7 guest response.',
    foundingDate: '2024',
    slogan: 'AI Automation for Tourism & Hospitality',
    knowsAbout: [
      'AI Automation',
      'Hotel Technology',
      'Hospitality AI',
      'Chatbots for Hotels',
      'Dynamic Pricing',
      'Guest Communication',
      'Property Management Systems',
      'Tourism Technology',
      'WhatsApp Business for Hotels',
      'Voice Bots'
    ],
    sameAs: [
      'https://www.linkedin.com/company/jengu',
      'https://twitter.com/jenguai'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      email: 'hello@jengu.ai',
      availableLanguage: ['English', 'Spanish', 'French']
    },
    areaServed: ['GB', 'ES', 'FR', 'EU', 'US'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'AI Solutions for Hospitality',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Guest Communication' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Voice & Booking Bots' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dynamic Pricing Engine' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'PMS Integrations' } }
      ]
    }
  };
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article' | 'BlogPosting' | 'NewsArticle';
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export function generateArticleSchema(data: {
  type?: 'Article' | 'BlogPosting' | 'NewsArticle';
  headline: string;
  description?: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  authorUrl?: string;
  url: string;
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': data.type || 'BlogPosting',
    headline: data.headline,
    description: data.description,
    image: data.image,
    datePublished: data.publishedAt,
    dateModified: data.updatedAt || data.publishedAt,
    author: {
      '@type': 'Person',
      name: data.authorName,
      url: data.authorUrl
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url
    }
  };
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
}

export function generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}

export interface FAQSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]): FAQSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export interface ServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'Service';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  serviceType?: string;
  areaServed?: string;
}

export function generateServiceSchema(services: { name: string; description: string }[]): ServiceSchema[] {
  return services.map(service => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    },
    serviceType: 'AI Automation',
    areaServed: 'Worldwide'
  }));
}

export interface SoftwareApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication' | 'WebApplication';
  name: string;
  description?: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  provider?: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
}

export function generateSoftwareApplicationSchema(data: {
  name: string;
  description?: string;
  category?: string;
  isFree?: boolean;
  url?: string;
}): SoftwareApplicationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: data.name,
    description: data.description,
    applicationCategory: data.category || 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: data.isFree !== false ? '0' : 'Contact for pricing',
      priceCurrency: 'USD'
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    }
  };
}
