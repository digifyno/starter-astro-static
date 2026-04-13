import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    image: image().optional(),         // co-located image for display and OG; use a relative path like ./cover.png
    imageAlt: z.string().optional(),   // alt text for the cover image (recommended when image is set)
    draft: z.boolean().default(false), // exclude from production builds
    author: z.string().optional(),     // used in JSON-LD BlogPosting schema
    updatedDate: z.coerce.date().optional(), // when content was last meaningfully revised
  }),
});

export const collections = { blog };
