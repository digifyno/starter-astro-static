import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the blog collection schema using plain Zod
// (content.config.ts uses astro:content virtual modules unavailable outside builds)
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  author: z.string().optional(),
});

describe('blog content schema', () => {
  it('accepts valid frontmatter with all required fields', () => {
    const result = blogSchema.safeParse({
      title: 'Hello World',
      description: 'A test post',
      date: '2025-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects frontmatter missing title', () => {
    const result = blogSchema.safeParse({
      description: 'A test post',
      date: '2025-01-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects frontmatter missing description', () => {
    const result = blogSchema.safeParse({
      title: 'Hello World',
      date: '2025-01-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects frontmatter missing date', () => {
    const result = blogSchema.safeParse({
      title: 'Hello World',
      description: 'A test post',
    });
    expect(result.success).toBe(false);
  });

  it('accepts draft: true', () => {
    const result = blogSchema.safeParse({
      title: 'Draft Post',
      description: 'Not published yet',
      date: '2025-01-15',
      draft: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(true);
    }
  });

  it('rejects an invalid date string', () => {
    const result = blogSchema.safeParse({
      title: 'Hello World',
      description: 'A test post',
      date: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('defaults tags to empty array when not provided', () => {
    const result = blogSchema.safeParse({
      title: 'Hello World',
      description: 'A test post',
      date: '2025-01-15',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it('defaults draft to false when not provided', () => {
    const result = blogSchema.safeParse({
      title: 'Hello World',
      description: 'A test post',
      date: '2025-01-15',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(false);
    }
  });
});
