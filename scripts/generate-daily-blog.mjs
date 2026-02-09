#!/usr/bin/env node
/**
 * Daily Blog Post Generator for Jengu
 *
 * Uses Claude API to generate SEO-optimized blog posts about AI in hospitality
 * Run manually: node scripts/generate-daily-blog.mjs
 * Or via GitHub Actions on schedule
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

// SEO Keywords and Topics for Hotels, Campsites, and Hospitality AI
const SEO_TOPICS = [
  // Hotel AI Keywords
  { keyword: "AI chatbot for hotels", topic: "How AI chatbots are revolutionizing hotel guest communication and booking experiences" },
  { keyword: "hotel automation software", topic: "The complete guide to hotel automation software: features, benefits, and ROI" },
  { keyword: "AI concierge service", topic: "AI concierge services: transforming guest experiences in modern hotels" },
  { keyword: "smart hotel technology", topic: "Smart hotel technology trends that are reshaping the hospitality industry" },
  { keyword: "hotel revenue management AI", topic: "How AI-powered revenue management is maximizing hotel profits" },
  { keyword: "automated hotel check-in", topic: "Self-service and automated check-in systems for hotels: a complete guide" },
  { keyword: "AI guest experience", topic: "Personalizing guest experiences with AI: strategies for hotels and resorts" },
  { keyword: "hotel booking AI", topic: "AI-powered booking systems: increasing direct reservations for hotels" },
  { keyword: "hospitality AI solutions", topic: "Top AI solutions transforming the hospitality industry in 2025" },
  { keyword: "hotel customer service automation", topic: "Automating hotel customer service without losing the human touch" },

  // Campsite & Outdoor Hospitality Keywords
  { keyword: "campsite booking software", topic: "Best campsite booking software: features every campground owner needs" },
  { keyword: "campground management AI", topic: "How AI is transforming campground management and operations" },
  { keyword: "glamping automation", topic: "Automation strategies for glamping sites and luxury camping experiences" },
  { keyword: "RV park management software", topic: "RV park management software: streamlining operations with AI" },
  { keyword: "outdoor hospitality technology", topic: "Technology trends in outdoor hospitality: from campsites to glamping" },
  { keyword: "campsite reservation system", topic: "Building the perfect campsite reservation system with AI integration" },
  { keyword: "holiday park automation", topic: "Automating holiday park operations: a comprehensive guide" },
  { keyword: "caravan park software", topic: "Caravan park software solutions: modernizing guest management" },

  // Resort & Tourism Keywords
  { keyword: "resort AI automation", topic: "AI automation strategies for resorts: from booking to checkout" },
  { keyword: "tourism AI tools", topic: "Essential AI tools for tourism businesses in 2025" },
  { keyword: "vacation rental automation", topic: "Vacation rental automation: scaling your property management with AI" },
  { keyword: "AI for bed and breakfast", topic: "How B&Bs and boutique hotels can leverage AI for growth" },
  { keyword: "hospitality chatbot", topic: "Building an effective hospitality chatbot: best practices and examples" },
  { keyword: "AI housekeeping management", topic: "AI-powered housekeeping management for hotels and resorts" },
  { keyword: "guest feedback AI", topic: "Using AI to analyze and act on guest feedback in hospitality" },
  { keyword: "AI pricing optimization hotel", topic: "Dynamic pricing with AI: maximizing revenue for hotels and resorts" },

  // General Hospitality Tech Keywords
  { keyword: "hospitality digital transformation", topic: "Digital transformation in hospitality: a roadmap for 2025" },
  { keyword: "AI staff scheduling hotel", topic: "AI-powered staff scheduling: reducing costs while improving service" },
  { keyword: "hotel energy management AI", topic: "Smart energy management with AI: reducing hotel operating costs" },
  { keyword: "contactless hospitality", topic: "Contactless hospitality solutions: what guests expect in 2025" },
  { keyword: "hospitality CRM AI", topic: "AI-enhanced CRM for hospitality: building lasting guest relationships" },
  { keyword: "multi-property hotel management", topic: "Managing multiple properties with AI: tools and strategies" },
  { keyword: "AI upselling hotels", topic: "AI-powered upselling strategies that increase hotel revenue" },
  { keyword: "hotel marketing automation", topic: "Marketing automation for hotels: driving bookings with AI" },
  { keyword: "voice AI hospitality", topic: "Voice AI in hospitality: from room controls to concierge services" },
  { keyword: "predictive maintenance hotels", topic: "Predictive maintenance with AI: preventing hotel equipment failures" },

  // Specific Use Cases
  { keyword: "WhatsApp hotel booking", topic: "WhatsApp for hotel bookings: setting up automated guest communication" },
  { keyword: "AI front desk hotel", topic: "AI at the front desk: transforming hotel reception operations" },
  { keyword: "restaurant AI ordering", topic: "AI ordering systems for hotel restaurants and room service" },
  { keyword: "spa booking automation", topic: "Automating spa and wellness bookings in hotels and resorts" },
  { keyword: "event venue AI management", topic: "AI tools for managing hotel event spaces and conferences" },
  { keyword: "loyalty program AI", topic: "Building smarter hotel loyalty programs with AI personalization" },
  { keyword: "AI translation hospitality", topic: "Breaking language barriers: AI translation tools for international guests" },
  { keyword: "occupancy prediction AI", topic: "AI occupancy prediction: better forecasting for hotels and campsites" },
];

/**
 * Get a random topic that hasn't been used recently
 */
async function selectTopic() {
  // Read existing blog posts to avoid duplicates
  const files = await fs.readdir(BLOG_DIR);
  const existingSlugs = files
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => f.replace('.md', '').toLowerCase());

  // Filter out topics that might already have posts
  const availableTopics = SEO_TOPICS.filter(t => {
    const potentialSlug = t.keyword.toLowerCase().replace(/\s+/g, '-');
    return !existingSlugs.some(s => s.includes(potentialSlug) || potentialSlug.includes(s.split('-').slice(0, 3).join('-')));
  });

  if (availableTopics.length === 0) {
    // If all topics used, pick random one
    return SEO_TOPICS[Math.floor(Math.random() * SEO_TOPICS.length)];
  }

  // Pick a random available topic
  return availableTopics[Math.floor(Math.random() * availableTopics.length)];
}

/**
 * Generate a blog post using Claude API
 */
async function generateBlogPost(topic) {
  const client = new Anthropic();

  const today = new Date().toISOString().split('T')[0];

  const prompt = `You are an expert content writer for Jengu, an AI automation company specializing in the hospitality industry (hotels, campsites, resorts, vacation rentals).

Write a comprehensive, SEO-optimized blog post about: "${topic.topic}"

Target keyword: "${topic.keyword}"

Requirements:
1. Write in a natural, conversational but professional tone
2. Include the target keyword naturally 3-5 times throughout the article
3. Use proper heading hierarchy (H2, H3) - DO NOT include H1 as the title is separate
4. Include practical examples and actionable advice
5. Write 1200-1800 words
6. Include a compelling introduction that hooks the reader
7. End with a clear conclusion and subtle call-to-action mentioning Jengu's services
8. Use bullet points and numbered lists where appropriate
9. Include relevant statistics or data points (you can use realistic estimates if needed)
10. Write for hotel managers, campsite owners, and hospitality professionals

Format the output as valid Markdown (not HTML). Use:
- ## for main sections
- ### for subsections
- **bold** for emphasis
- - for bullet points
- > for important quotes or callouts

Do NOT include any frontmatter - just the article content starting with the first heading.

Remember: This is for Jengu (jengu.ai) - an AI automation company that helps hospitality businesses automate guest communication, bookings, and operations.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = response.content[0].text;

  // Generate title from topic
  const titlePrompt = `Generate a compelling, SEO-friendly blog title for an article about: "${topic.topic}"
Target keyword: "${topic.keyword}"

Requirements:
- 50-60 characters ideal
- Include the main keyword naturally
- Make it compelling and clickable
- Don't use clickbait

Return ONLY the title, nothing else.`;

  const titleResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: titlePrompt }]
  });

  const title = titleResponse.content[0].text.trim().replace(/^["']|["']$/g, '');

  // Generate description
  const descPrompt = `Write a meta description for a blog post titled: "${title}"
About: ${topic.topic}
Target keyword: ${topic.keyword}

Requirements:
- 150-160 characters exactly
- Include the target keyword
- Compelling and informative
- Encourage clicks from search results

Return ONLY the description, nothing else.`;

  const descResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: descPrompt }]
  });

  const description = descResponse.content[0].text.trim().replace(/^["']|["']$/g, '');

  return {
    title,
    description,
    content,
    keyword: topic.keyword,
    publishedOn: today
  };
}

/**
 * Create the markdown file
 */
async function saveBlogPost(post) {
  // Generate slug from title
  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');

  const filename = `${slug}.md`;
  const filepath = path.join(BLOG_DIR, filename);

  // Check if file already exists
  try {
    await fs.access(filepath);
    // File exists, add date suffix
    const newFilename = `${slug}-${Date.now()}.md`;
    const newFilepath = path.join(BLOG_DIR, newFilename);
    await writePost(newFilepath, post);
    return newFilename;
  } catch {
    // File doesn't exist, create it
    await writePost(filepath, post);
    return filename;
  }
}

async function writePost(filepath, post) {
  const frontmatter = `---
title: "${post.title}"
subtitle: "Expert insights on ${post.keyword} for hospitality businesses"
description: "${post.description}"
publishedOn: ${post.publishedOn}
mainImage: ""
thumbnail: ""
altText: "${post.title}"
draft: false
archived: false
---

`;

  const fullContent = frontmatter + post.content;
  await fs.writeFile(filepath, fullContent, 'utf-8');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Jengu Daily Blog Generator');
  console.log('============================\n');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable not set');
    console.log('\nSet it with: export ANTHROPIC_API_KEY=your-key-here');
    process.exit(1);
  }

  try {
    // Select topic
    console.log('📋 Selecting topic...');
    const topic = await selectTopic();
    console.log(`   Selected: "${topic.keyword}"`);
    console.log(`   Topic: ${topic.topic}\n`);

    // Generate post
    console.log('✍️  Generating blog post with Claude...');
    const post = await generateBlogPost(topic);
    console.log(`   Title: ${post.title}`);
    console.log(`   Description: ${post.description.substring(0, 50)}...\n`);

    // Save post
    console.log('💾 Saving blog post...');
    const filename = await saveBlogPost(post);
    console.log(`   Saved: src/content/blog/${filename}\n`);

    console.log('✅ Blog post generated successfully!');
    console.log(`\nNext steps:`);
    console.log(`1. Review the post: src/content/blog/${filename}`);
    console.log(`2. Add images if desired`);
    console.log(`3. Run 'npm run dev' to preview`);
    console.log(`4. Commit and push to deploy`);

    // Return filename for GitHub Actions
    return filename;

  } catch (error) {
    console.error('❌ Error generating blog post:', error.message);
    process.exit(1);
  }
}

main();
