import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),      // relative path or URL for per-post OG image
    draft: z.boolean().default(false), // exclude from production builds
    author: z.string().optional(),     // used in JSON-LD BlogPosting schema
  }),
});

export const collections = { blog };
