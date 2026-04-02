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
  imageAlt: z.string().optional(),
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

// ---------------------------------------------------------------------------
// Optional field edge cases (added to expand coverage)
// ---------------------------------------------------------------------------

describe('blog content schema — optional fields', () => {
  it('accepts a post with an author field', () => {
    const result = blogSchema.safeParse({
      title: 'Authored Post',
      description: 'Written by someone',
      date: '2025-06-01',
      author: 'Jane Doe',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author).toBe('Jane Doe');
    }
  });

  it('accepts a post without an author field (author is optional)', () => {
    const result = blogSchema.safeParse({
      title: 'Authorless Post',
      description: 'No author specified',
      date: '2025-06-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author).toBeUndefined();
    }
  });

  it('rejects an author field that is not a string', () => {
    const result = blogSchema.safeParse({
      title: 'Bad Author',
      description: 'Author is a number',
      date: '2025-06-01',
      author: 42,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a post with an explicit empty tags array', () => {
    const result = blogSchema.safeParse({
      title: 'No Tags Post',
      description: 'Post with explicitly empty tags',
      date: '2025-06-01',
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it('accepts a post with multiple tags', () => {
    const result = blogSchema.safeParse({
      title: 'Tagged Post',
      description: 'Post with several tags',
      date: '2025-06-01',
      tags: ['astro', 'typescript', 'tailwind'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toHaveLength(3);
    }
  });

  it('rejects tags that contain non-string values', () => {
    const result = blogSchema.safeParse({
      title: 'Bad Tags Post',
      description: 'Tags contain a number',
      date: '2025-06-01',
      tags: ['valid-tag', 123],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a post with an imageAlt string', () => {
    const result = blogSchema.safeParse({
      title: 'Post With Alt',
      description: 'Has image alt',
      date: '2025-06-01',
      imageAlt: 'A scenic mountain view',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageAlt).toBe('A scenic mountain view');
    }
  });

  it('accepts a post without imageAlt (imageAlt is optional)', () => {
    const result = blogSchema.safeParse({
      title: 'No Alt Post',
      description: 'No image alt text',
      date: '2025-06-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageAlt).toBeUndefined();
    }
  });

  it('rejects imageAlt that is not a string', () => {
    const result = blogSchema.safeParse({
      title: 'Bad Alt Post',
      description: 'Alt is a number',
      date: '2025-06-01',
      imageAlt: 42,
    });
    expect(result.success).toBe(false);
  });

  it('accepts draft: false explicitly', () => {
    const result = blogSchema.safeParse({
      title: 'Published Post',
      description: 'Explicitly not a draft',
      date: '2025-06-01',
      draft: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(false);
    }
  });
});
