# Step 1: Schema Markup Implementation

## Why This Matters

> **61% of ChatGPT-cited pages have schema markup** vs only 25% of Google top results.
> — AirOps Study, 2025

Schema markup turns your pages into machine-readable formats that AI can easily parse. It's the single most impactful technical change for LLM visibility.

## Current State Analysis

**Jengu.ai Currently Has:**
- [ ] Organization schema
- [ ] LocalBusiness schema
- [ ] FAQPage schema
- [ ] Article schema on blogs
- [ ] Service schema
- [ ] BreadcrumbList schema

## Implementation Checklist

### 1. Organization Schema (Homepage)

Add to `src/layouts/BaseLayout.astro`:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Jengu.ai",
  "url": "https://jengu.ai",
  "logo": "https://jengu.ai/images/logo.webp",
  "description": "AI Automation for Tourism & Hospitality. Smart AI agents for hotels, resorts, and travel businesses.",
  "foundingDate": "2024",
  "sameAs": [
    "https://www.linkedin.com/company/jengu-ai",
    "https://twitter.com/jenguai"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@jengu.ai",
    "contactType": "sales"
  },
  "areaServed": ["GB", "EU", "US"],
  "serviceType": ["AI Automation", "Hospitality Technology", "Hotel Chatbots"]
}
```

### 2. FAQPage Schema (FAQ Pages)

Add to `src/pages/faq.astro`, `src/pages/es/faq.astro`, `src/pages/fr/faq.astro`:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Jengu.ai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Jengu.ai builds custom AI automation solutions for the tourism and hospitality industry, including AI chatbots, voice bots, and dynamic pricing systems."
      }
    },
    {
      "@type": "Question",
      "name": "How much does AI automation cost for hotels?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pricing varies based on complexity. Most hotels see 300-500% ROI within the first year. Contact us for a personalized quote."
      }
    }
  ]
}
```

### 3. Article Schema (All 52 Blog Posts)

Add to blog post template:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{title}}",
  "description": "{{description}}",
  "image": "{{featuredImage}}",
  "author": {
    "@type": "Organization",
    "name": "Jengu.ai"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Jengu.ai",
    "logo": {
      "@type": "ImageObject",
      "url": "https://jengu.ai/images/logo.webp"
    }
  },
  "datePublished": "{{publishDate}}",
  "dateModified": "{{modifiedDate}}"
}
```

### 4. Service Schema (Services Page)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "AI Automation for Hospitality",
  "provider": {
    "@type": "Organization",
    "name": "Jengu.ai"
  },
  "areaServed": "Worldwide",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "AI Solutions",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "AI Guest Communication"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "AI Voice & Booking Bots"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Dynamic Pricing Engine"
        }
      }
    ]
  }
}
```

### 5. SoftwareApplication Schema (Calculator)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Jengu ROI Calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### 6. BreadcrumbList Schema (All Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://jengu.ai"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://jengu.ai/blog"
    }
  ]
}
```

## Validation Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [JSON-LD Playground](https://json-ld.org/playground/)

## Priority Order

1. **HIGH:** FAQPage schema (direct LLM impact)
2. **HIGH:** Article schema on blogs
3. **MEDIUM:** Organization schema
4. **MEDIUM:** Service schema
5. **LOW:** BreadcrumbList schema

## Files to Modify

- `src/layouts/BaseLayout.astro` - Add Organization schema
- `src/pages/faq.astro` - Add FAQPage schema
- `src/pages/es/faq.astro` - Add FAQPage schema
- `src/pages/fr/faq.astro` - Add FAQPage schema
- `src/layouts/BlogPost.astro` - Add Article schema
- `src/pages/services.astro` - Add Service schema
- `src/pages/calculator.astro` - Add SoftwareApplication schema

## Estimated Time: 4-6 hours
