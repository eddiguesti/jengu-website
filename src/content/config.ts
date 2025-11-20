import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    publishedOn: z.date(),
    updatedOn: z.date().optional(),
    mainImage: z.string().optional(),
    thumbnail: z.string().optional(),
    altText: z.string().optional(),
    draft: z.boolean().default(false),
    archived: z.boolean().default(false),
  }),
});

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    publishedOn: z.date(),
    updatedOn: z.date().optional(),
    mainImage: z.string().optional(),
    thumbnail: z.string().optional(),
    altTextThumbnail: z.string().optional(),
    altTextMainImage: z.string().optional(),
    source: z.string().optional(),
    newsDate: z.date().optional(),
    draft: z.boolean().default(false),
    archived: z.boolean().default(false),
  }),
});

export const collections = { blog, news };
