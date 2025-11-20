# Blog Posting Instructions for Jengu.ai

This document explains how to add new blog posts and news articles to the Jengu.ai website.

## Quick Start

1. **Copy the template file** from `src/content/blog/_template.md`
2. **Rename it** using lowercase-with-hyphens (e.g., `my-new-blog-post.md`)
3. **Update the frontmatter** (the section between `---` marks)
4. **Write your content** in Markdown
5. **Save the file** in the appropriate folder
6. **Restart dev server** (or just refresh - Astro auto-detects new files)

## Where to Place Files

- **Blog posts**: `src/content/blog/your-post-name.md`
- **News articles**: `src/content/news/your-news-article.md`

## Required Frontmatter Fields

### For Blog Posts (`src/content/blog/`)

```yaml
---
title: "Your Blog Post Title Here"
subtitle: "Optional subtitle"
description: "A short description for SEO and previews (150-160 characters recommended)"
publishedOn: 2025-01-20
updatedOn: 2025-01-20
mainImage: "/images/blog/your-image.jpg"
thumbnail: "/images/blog/your-thumbnail.jpg"
altText: "Description of the image for accessibility"
draft: false
archived: false
---
```

### For News Articles (`src/content/news/`)

```yaml
---
title: "Your News Article Title"
subtitle: "Optional subtitle"
description: "A short description for SEO and previews"
publishedOn: 2025-01-20
updatedOn: 2025-01-20
mainImage: "/images/news/your-image.jpg"
thumbnail: "/images/news/your-thumbnail.jpg"
altTextThumbnail: "Description for thumbnail"
altTextMainImage: "Description for main image"
source: "Source name or URL"
newsDate: 2025-01-20
draft: false
archived: false
---
```

## Field Explanations

- **title**: Main headline (required)
- **subtitle**: Secondary headline (optional)
- **description**: Used for SEO meta tags and article previews. Keep it 150-160 characters for optimal SEO
- **publishedOn**: Publication date in YYYY-MM-DD format (required)
- **updatedOn**: Last update date in YYYY-MM-DD format (optional, defaults to publishedOn)
- **mainImage**: Path to main article image (optional, e.g., `/images/blog/article.jpg`)
- **thumbnail**: Path to thumbnail for listings (optional)
- **altText**: Accessibility description for images (optional but recommended)
- **draft**: Set to `true` to hide from site, `false` to publish (default: false)
- **archived**: Set to `true` to archive (hides from listings), `false` to show (default: false)

## Markdown Content Guidelines

After the closing `---`, write your content using Markdown:

```markdown
# Main Heading

Your introduction paragraph goes here.

## Section Heading

Content with **bold text** and *italic text*.

### Subsection

- Bullet point 1
- Bullet point 2

1. Numbered list item
2. Another item

[Link text](https://example.com)

![Image description](/images/blog/image.jpg)

> Blockquote for emphasis or quotes

```javascript
// Code blocks with syntax highlighting
const example = "code";
```
```

## Supported Markdown Features

- **Headings**: `#`, `##`, `###` (H1, H2, H3)
- **Bold**: `**text**` or `__text__`
- **Italic**: `*text*` or `_text_`
- **Links**: `[text](url)`
- **Images**: `![alt text](path)`
- **Lists**: `-` or `*` for bullets, `1.` for numbered
- **Blockquotes**: `> quote text`
- **Code**: `` `inline` `` or ` ```language ` for blocks
- **Line breaks**: Two spaces at end of line or blank line

## File Naming Conventions

- Use **lowercase** letters only
- Use **hyphens** (`-`) instead of spaces or underscores
- Keep it **short but descriptive**
- Match the general topic of the article

**Good examples**:
- `ai-automation-trends-2025.md`
- `hotel-booking-optimization.md`
- `case-study-luxury-resort.md`

**Bad examples**:
- `My New Blog Post.md` (spaces, capital letters)
- `blog_post_1.md` (underscores, not descriptive)
- `Article.md` (too vague)

## Images

1. **Save images** in the appropriate folder:
   - Blog images: `public/images/blog/`
   - News images: `public/images/news/`

2. **Reference images** using absolute paths from `/public`:
   ```markdown
   ![Description](/images/blog/my-image.jpg)
   ```

3. **Image guidelines**:
   - Use JPG for photos, PNG for graphics/screenshots
   - Optimize images before uploading (recommended max width: 1200px)
   - Always include descriptive alt text for accessibility

## SEO Best Practices

1. **Title**: Keep under 60 characters for optimal search display
2. **Description**: 150-160 characters, include target keywords naturally
3. **Headings**: Use H2 (`##`) for main sections, H3 (`###`) for subsections
4. **Internal Links**: Link to related blog posts and site pages
5. **Images**: Always include alt text with relevant keywords

## Publishing Workflow

### To Publish a New Post:

1. Set `draft: false` in frontmatter
2. Set `archived: false` in frontmatter
3. Save file in `src/content/blog/` or `src/content/news/`
4. Restart dev server or wait for hot reload

### To Hide a Post (Draft):

1. Set `draft: true` in frontmatter
2. Post will not appear on blog listing or be accessible via URL

### To Archive a Post:

1. Set `archived: true` in frontmatter
2. Post will be hidden from listings but URL may still be accessible

## How Astro Auto-Detection Works

Astro uses **Content Collections** which automatically:

1. **Scans** the `src/content/blog/` and `src/content/news/` folders
2. **Validates** frontmatter against the schema (defined in `src/content/config.ts`)
3. **Generates** static pages at build time using the `[...slug].astro` template
4. **Creates URLs** automatically:
   - Blog: `/blog/your-file-name/`
   - News: `/news/your-file-name/`

You don't need to manually create routes or update any configuration files.

## Troubleshooting

### Post not showing up?

- Check that `draft: false` and `archived: false`
- Verify frontmatter has all required fields
- Restart the dev server: `npm run dev`
- Check console for validation errors

### Frontmatter validation errors?

- Ensure dates are in `YYYY-MM-DD` format
- Check that boolean fields are `true` or `false` (not "true" in quotes)
- Verify all required fields are present (title, description, publishedOn)

### Images not loading?

- Verify image path starts with `/images/`
- Check that image file exists in `public/images/blog/` or `public/images/news/`
- Use forward slashes (`/`) not backslashes (`\`)

## Example Complete Blog Post

```markdown
---
title: "How AI Automation Saves Hotels 40% on Customer Service Costs"
subtitle: "A comprehensive guide to implementing AI agents in hospitality"
description: "Discover how leading hotels are using AI automation to reduce customer service costs by 40% while improving guest satisfaction scores."
publishedOn: 2025-01-20
updatedOn: 2025-01-20
mainImage: "/images/blog/ai-hotel-automation.jpg"
thumbnail: "/images/blog/ai-hotel-automation-thumb.jpg"
altText: "Modern hotel lobby with digital check-in kiosks and AI-powered concierge"
draft: false
archived: false
---

# How AI Automation Saves Hotels 40% on Customer Service Costs

The hospitality industry is experiencing a revolution in customer service efficiency. Leading hotels worldwide are implementing AI automation to handle routine inquiries, freeing up staff to focus on high-value guest interactions.

## The Challenge: Rising Costs, Increasing Expectations

Hotels face a dual challenge: labor costs continue to rise while guest expectations for instant, 24/7 service increase. Traditional staffing models can't keep pace without significant budget increases.

## The Solution: AI-Powered Customer Service

AI agents can handle:

- **Booking inquiries**: Instant responses to availability questions
- **FAQ responses**: Common questions about amenities, check-in times, local attractions
- **Multilingual support**: Communicate in guests' native languages
- **24/7 availability**: No more missed inquiries during off-hours

### Real Results from Leading Properties

> "Since implementing Jengu's AI agents, we've reduced our customer service labor costs by 42% while our guest satisfaction scores improved by 15%." - Director of Operations, Luxury Resort Group

## Implementation Timeline

1. **Week 1-2**: Assessment and planning
2. **Week 3-4**: AI agent training and customization
3. **Week 5**: Pilot launch with monitoring
4. **Week 6+**: Full rollout and optimization

## Calculate Your Savings

Want to see how much your property could save? Use our [Free ROI Analysis](/calculator) to get a personalized estimate in just 2 minutes.

## Next Steps

Ready to explore AI automation for your hotel? [Book a free consultation](/contact) with our hospitality technology experts.
```

## For AI Assistants (ChatGPT, Claude, etc.)

When asked to create a blog post:

1. **Ask for**: Title, main topic, key points to cover, target word count
2. **Use the template**: Start with `src/content/blog/_template.md`
3. **Generate frontmatter**: Fill in all required fields with appropriate values
4. **Write content**: Use proper Markdown formatting with H2/H3 headings
5. **Include CTAs**: Link to `/calculator` or `/contact` where relevant
6. **Optimize for SEO**: Include target keywords naturally in title, description, and headings
7. **Save with proper filename**: lowercase-with-hyphens.md

The file will automatically be detected and published when saved in `src/content/blog/` or `src/content/news/`.
