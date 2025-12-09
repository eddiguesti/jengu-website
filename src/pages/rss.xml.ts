import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://jengu.ai';
const SITE_NAME = 'Jengu';
const SITE_DESCRIPTION = 'AI automation insights for tourism and hospitality. Learn about chatbots, workflow automation, and digital transformation.';

export const GET: APIRoute = async () => {
  // Fetch all published blog posts
  const blogPosts = await getCollection('blog', ({ data }) => {
    return data.draft !== true && data.archived !== true;
  });

  // Sort blogs by date (newest first)
  const sortedBlogs = blogPosts.sort((a, b) =>
    new Date(b.data.publishedOn).getTime() - new Date(a.data.publishedOn).getTime()
  );

  // Take most recent 50 posts for RSS
  const recentPosts = sortedBlogs.slice(0, 50);

  const items = recentPosts.map(post => {
    const pubDate = new Date(post.data.publishedOn).toUTCString();
    const description = post.data.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const title = post.data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `    <item>
      <title>${title}</title>
      <link>${SITE_URL}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}/</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>info@jengu.ai (${post.data.author || 'Jengu Team'})</author>
      <category>AI &amp; Automation</category>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <description>${SITE_DESCRIPTION}</description>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro</generator>
    <copyright>Copyright ${new Date().getFullYear()} Jengu. All rights reserved.</copyright>
    <managingEditor>info@jengu.ai (Jengu Team)</managingEditor>
    <webMaster>info@jengu.ai (Jengu Team)</webMaster>
    <image>
      <url>${SITE_URL}/images/logo.png</url>
      <title>${SITE_NAME} Blog</title>
      <link>${SITE_URL}/blog</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
