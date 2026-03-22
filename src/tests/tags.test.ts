import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Minimal types mirroring the Astro blog content collection structure.
// These intentionally avoid importing Astro modules so the tests run without
// a build step or running server.
// ---------------------------------------------------------------------------

type PostData = {
  title: string;
  description: string;
  date: Date;
  tags: string[];
  author?: string;
  draft?: boolean;
};

type BlogPost = {
  id: string;
  data: PostData;
  remarkPluginFrontmatter?: {
    minutesRead: string;
  };
};

// ---------------------------------------------------------------------------
// Pure helpers that mirror the logic used by [tag].astro and tags/index.astro.
// Keeping them here (rather than importing from a utility file) lets the tests
// document *exactly* what behaviour the pages are expected to implement.
// ---------------------------------------------------------------------------

/** Exclude draft posts in production; include all in development. */
function filterDrafts(posts: BlogPost[], isDev = false): BlogPost[] {
  if (isDev) return posts;
  return posts.filter((p) => p.data.draft !== true);
}

/** Return only posts that carry a given tag. */
function filterByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter((p) => p.data.tags.includes(tag));
}

/** Build a map of { tag → postCount } from the supplied post list. */
function buildTagCounts(posts: BlogPost[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Sample fixtures
// ---------------------------------------------------------------------------

const published1: BlogPost = {
  id: 'hello-astro',
  data: {
    title: 'Hello Astro',
    description: 'Getting started with Astro',
    date: new Date('2025-01-10'),
    tags: ['astro', 'typescript'],
  },
  remarkPluginFrontmatter: { minutesRead: '3 min read' },
};

const published2: BlogPost = {
  id: 'tailwind-tips',
  data: {
    title: 'Tailwind Tips',
    description: 'Useful Tailwind utilities',
    date: new Date('2025-02-15'),
    tags: ['astro', 'tailwind'],
  },
  remarkPluginFrontmatter: { minutesRead: '5 min read' },
};

const draftPost: BlogPost = {
  id: 'unreleased-guide',
  data: {
    title: 'Unreleased Guide',
    description: 'Work in progress',
    date: new Date('2025-03-01'),
    tags: ['typescript', 'draft-only'],
    draft: true,
  },
  remarkPluginFrontmatter: { minutesRead: '2 min read' },
};

const allPosts = [published1, published2, draftPost];

// ---------------------------------------------------------------------------
// filterByTag
// ---------------------------------------------------------------------------

describe('filterByTag', () => {
  it('returns only posts that include the given tag', () => {
    const result = filterByTag(allPosts, 'astro');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toContain('hello-astro');
    expect(result.map((p) => p.id)).toContain('tailwind-tips');
  });

  it('includes draft posts (draft exclusion is a separate concern)', () => {
    const result = filterByTag(allPosts, 'typescript');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toContain('hello-astro');
    expect(result.map((p) => p.id)).toContain('unreleased-guide');
  });

  it('returns an empty array when no posts match the tag', () => {
    expect(filterByTag(allPosts, 'nonexistent')).toHaveLength(0);
  });

  it('returns an empty array when passed an empty post list', () => {
    expect(filterByTag([], 'astro')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterDrafts  (behaviour as used by tag pages and the blog index)
// ---------------------------------------------------------------------------

describe('filterDrafts on tag pages', () => {
  it('excludes posts with draft: true in production (isDev=false)', () => {
    const result = filterDrafts(allPosts, false);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).not.toContain('unreleased-guide');
  });

  it('includes all posts in development (isDev=true)', () => {
    const result = filterDrafts(allPosts, true);
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.id)).toContain('unreleased-guide');
  });

  it('keeps posts without a draft field in production', () => {
    const result = filterDrafts(allPosts, false);
    expect(result.map((p) => p.id)).toContain('hello-astro');
    expect(result.map((p) => p.id)).toContain('tailwind-tips');
  });

  it('defaults to production mode when isDev is omitted', () => {
    const result = filterDrafts(allPosts);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).not.toContain('unreleased-guide');
  });
});

describe('filterDrafts + filterByTag combined (tag page in production)', () => {
  it('excludes a draft post that shares a tag with published posts', () => {
    const published = filterDrafts(allPosts, false);
    const typescriptPosts = filterByTag(published, 'typescript');
    expect(typescriptPosts).toHaveLength(1);
    expect(typescriptPosts[0].id).toBe('hello-astro');
  });

  it('includes the draft post when in development', () => {
    const all = filterDrafts(allPosts, true);
    const typescriptPosts = filterByTag(all, 'typescript');
    expect(typescriptPosts).toHaveLength(2);
  });

  it('a tag that only appears on draft posts returns no posts in production', () => {
    const published = filterDrafts(allPosts, false);
    expect(filterByTag(published, 'draft-only')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// buildTagCounts  (used by the tag index page)
// ---------------------------------------------------------------------------

describe('buildTagCounts (tag index page)', () => {
  it('counts occurrences of each tag across the supplied posts', () => {
    const counts = buildTagCounts(allPosts);
    expect(counts['astro']).toBe(2);
    expect(counts['typescript']).toBe(2);
    expect(counts['tailwind']).toBe(1);
    expect(counts['draft-only']).toBe(1);
  });

  it('lists only published tags when given published posts', () => {
    const published = filterDrafts(allPosts, false);
    const counts = buildTagCounts(published);
    expect(Object.keys(counts)).toContain('astro');
    expect(Object.keys(counts)).toContain('typescript');
    expect(Object.keys(counts)).toContain('tailwind');
    expect(Object.keys(counts)).not.toContain('draft-only');
  });

  it('gives the correct count for a tag shared across multiple posts', () => {
    const published = filterDrafts(allPosts, false);
    expect(buildTagCounts(published)['astro']).toBe(2);
  });

  it('gives a count of 1 for a tag that appears on exactly one published post', () => {
    const published = filterDrafts(allPosts, false);
    expect(buildTagCounts(published)['tailwind']).toBe(1);
  });

  it('returns an empty object for an empty post list', () => {
    expect(buildTagCounts([])).toEqual({});
  });

  it('includes draft-only tags when in development', () => {
    const counts = buildTagCounts(allPosts);
    expect('draft-only' in counts).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Reading time on tag pages
// The remark-reading-time plugin injects minutesRead into remarkPluginFrontmatter.
// These tests verify the shape of that value as consumed by [tag].astro.
// ---------------------------------------------------------------------------

describe('reading time (minutesRead) on tag page post entries', () => {
  it('every sample post has minutesRead as a string', () => {
    for (const post of allPosts) {
      expect(typeof post.remarkPluginFrontmatter?.minutesRead).toBe('string');
    }
  });

  it('minutesRead matches the expected format "N min read"', () => {
    const pattern = /^\d+ min read$/;
    for (const post of allPosts) {
      expect(post.remarkPluginFrontmatter?.minutesRead).toMatch(pattern);
    }
  });

  it('all published posts on a tag page have minutesRead defined', () => {
    const published = filterDrafts(allPosts, false);
    const astroPosts = filterByTag(published, 'astro');
    expect(astroPosts.length).toBeGreaterThan(0);
    for (const post of astroPosts) {
      expect(post.remarkPluginFrontmatter?.minutesRead).toBeDefined();
    }
  });

  it('minutesRead is non-empty for every post', () => {
    for (const post of allPosts) {
      expect(post.remarkPluginFrontmatter?.minutesRead).toBeTruthy();
    }
  });
});
