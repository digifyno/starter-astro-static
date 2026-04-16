import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { collections } from './content.config.js';

// Verify the real content.config.ts exports a blog collection
describe('content.config.ts exports', () => {
  it('exports a collections object with a blog key', () => {
    expect(collections).toBeDefined();
    expect(collections).toHaveProperty('blog');
  });
});

// Replicate the blog collection schema using plain Zod
// (content.config.ts uses astro:content virtual modules unavailable outside builds)
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  author: z.string().optional(),
  image: z.string().optional(),   // simplified — actual uses image() helper, but string() covers the optional contract
  imageAlt: z.string().optional(),
  updatedDate: z.coerce.date().optional(),
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

  it('accepts a post with imageAlt field', () => {
    const result = blogSchema.safeParse({
      title: 'Post With Image',
      description: 'Has alt text',
      date: '2025-06-01',
      imageAlt: 'A photo of mountains',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageAlt).toBe('A photo of mountains');
    }
  });

  it('accepts a post without imageAlt (imageAlt is optional)', () => {
    const result = blogSchema.safeParse({
      title: 'Post Without Image',
      description: 'No image alt',
      date: '2025-06-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageAlt).toBeUndefined();
    }
  });

  it('rejects imageAlt that is not a string', () => {
    const result = blogSchema.safeParse({
      title: 'Bad imageAlt',
      description: 'imageAlt is a number',
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

  it('accepts a post without updatedDate (updatedDate is optional)', () => {
    const result = blogSchema.safeParse({
      title: 'No Updated Date',
      description: 'No updatedDate field',
      date: '2025-06-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updatedDate).toBeUndefined();
    }
  });

  it('accepts updatedDate as a date string and coerces it to Date', () => {
    const result = blogSchema.safeParse({
      title: 'Updated Post',
      description: 'Has an updated date',
      date: '2025-01-01',
      updatedDate: '2025-06-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updatedDate).toBeInstanceOf(Date);
      expect(result.data.updatedDate?.toISOString().startsWith('2025-06-01')).toBe(true);
    }
  });

  it('allows updatedDate before date (no ordering constraint)', () => {
    const result = blogSchema.safeParse({
      title: 'Backdated Revision',
      description: 'updatedDate is before date',
      date: '2025-06-01',
      updatedDate: '2025-01-01',
    });
    expect(result.success).toBe(true);
  });
});
