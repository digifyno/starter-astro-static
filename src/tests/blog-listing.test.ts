import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Minimal types mirroring the Astro blog content collection structure.
// Intentionally avoids importing Astro modules so tests run without a build.
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
};

// ---------------------------------------------------------------------------
// Pure helpers that mirror the logic used by blog/index.astro.
// Keeping them here documents exactly what behaviour the page implements.
// ---------------------------------------------------------------------------

/** Exclude draft posts in production; show all in development. */
function filterBlogPosts(posts: BlogPost[], isDev: boolean): BlogPost[] {
  return posts.filter(({ data }) => isDev || !data.draft);
}

/** Sort posts newest-first. Mirrors: (a, b) => b.data.date.valueOf() - a.data.date.valueOf() */
function sortNewestFirst(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Resolve a post's reading time. Mirrors: minutesRead ?? '1 min read' */
function resolveReadingTime(minutesRead: string | undefined): string {
  return minutesRead ?? '1 min read';
}

/** Build the /blog/<id> permalink for a post card. */
function postLinkHref(post: BlogPost): string {
  return `/blog/${post.id}`;
}

/** Build the /blog/tags/<tag> href for a tag chip on the listing page. */
function tagChipHref(tag: string): string {
  return `/blog/tags/${tag}`;
}

// ---------------------------------------------------------------------------
// Sample fixtures
// ---------------------------------------------------------------------------

const newest: BlogPost = {
  id: 'release-notes',
  data: {
    title: 'Release Notes',
    description: 'What changed in this release',
    date: new Date('2025-03-01'),
    tags: ['astro', 'changelog'],
  },
};

const middle: BlogPost = {
  id: 'tailwind-tips',
  data: {
    title: 'Tailwind Tips',
    description: 'Useful Tailwind utilities',
    date: new Date('2025-02-15'),
    tags: ['tailwind', 'css'],
  },
};

const oldest: BlogPost = {
  id: 'hello-astro',
  data: {
    title: 'Hello Astro',
    description: 'Getting started with Astro',
    date: new Date('2025-01-10'),
    tags: ['astro'],
  },
};

const draftPost: BlogPost = {
  id: 'unreleased-guide',
  data: {
    title: 'Unreleased Guide',
    description: 'Work in progress',
    date: new Date('2025-02-20'),
    tags: ['draft-only'],
    draft: true,
  },
};

const allPosts = [middle, newest, oldest, draftPost];

// ---------------------------------------------------------------------------
// Draft filtering
// ---------------------------------------------------------------------------

describe('blog listing draft filter (isDev || !data.draft)', () => {
  it('excludes draft posts in production', () => {
    const result = filterBlogPosts(allPosts, false);
    expect(result.map((p) => p.id)).not.toContain('unreleased-guide');
  });

  it('includes only published posts in production', () => {
    const result = filterBlogPosts(allPosts, false);
    expect(result).toHaveLength(3);
  });

  it('includes all posts in development', () => {
    const result = filterBlogPosts(allPosts, true);
    expect(result).toHaveLength(4);
    expect(result.map((p) => p.id)).toContain('unreleased-guide');
  });

  it('keeps posts without a draft field in production', () => {
    const result = filterBlogPosts(allPosts, false);
    expect(result.map((p) => p.id)).toContain('hello-astro');
    expect(result.map((p) => p.id)).toContain('tailwind-tips');
    expect(result.map((p) => p.id)).toContain('release-notes');
  });

  it('a draft post leaking through would expose unpublished content — filter must exclude it', () => {
    const result = filterBlogPosts([draftPost], false);
    expect(result).toHaveLength(0);
  });

  it('handles an empty post list', () => {
    expect(filterBlogPosts([], false)).toHaveLength(0);
    expect(filterBlogPosts([], true)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Date sort
// ---------------------------------------------------------------------------

describe('blog listing date sort (newest first)', () => {
  it('places the newest post first', () => {
    const sorted = sortNewestFirst([oldest, newest, middle]);
    expect(sorted[0].id).toBe('release-notes');
  });

  it('places the oldest post last', () => {
    const sorted = sortNewestFirst([oldest, newest, middle]);
    expect(sorted[sorted.length - 1].id).toBe('hello-astro');
  });

  it('produces a monotonically non-increasing date sequence', () => {
    const sorted = sortNewestFirst([middle, oldest, newest]);
    const timestamps = sorted.map((p) => p.data.date.valueOf());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1]);
    }
  });

  it('is stable under different input orderings', () => {
    const orders = [
      [newest, middle, oldest],
      [oldest, middle, newest],
      [middle, newest, oldest],
    ];
    const expected = ['release-notes', 'tailwind-tips', 'hello-astro'];
    for (const order of orders) {
      expect(sortNewestFirst(order).map((p) => p.id)).toEqual(expected);
    }
  });

  it('does not mutate the input array', () => {
    const input = [oldest, newest, middle];
    const original = [...input];
    sortNewestFirst(input);
    expect(input.map((p) => p.id)).toEqual(original.map((p) => p.id));
  });

  it('handles a single post without error', () => {
    expect(sortNewestFirst([newest])).toHaveLength(1);
  });

  it('handles an empty list', () => {
    expect(sortNewestFirst([])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Reading time fallback
// ---------------------------------------------------------------------------

describe('reading time fallback ("1 min read")', () => {
  it('returns the provided reading time when present', () => {
    expect(resolveReadingTime('5 min read')).toBe('5 min read');
  });

  it('falls back to "1 min read" when minutesRead is undefined', () => {
    expect(resolveReadingTime(undefined)).toBe('1 min read');
  });

  it('does not fall back when minutesRead is an empty string', () => {
    // empty string is falsy but not undefined — mirrors ?? (nullish) not || (falsy)
    expect(resolveReadingTime('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Post card link URLs
// ---------------------------------------------------------------------------

describe('post card link hrefs', () => {
  it('post permalink is /blog/<id>', () => {
    expect(postLinkHref(newest)).toBe('/blog/release-notes');
    expect(postLinkHref(oldest)).toBe('/blog/hello-astro');
  });

  it('post ID is preserved as-is in the URL', () => {
    const post: BlogPost = { id: 'my-post-2025', data: { title: '', description: '', date: new Date(), tags: [] } };
    expect(postLinkHref(post)).toBe('/blog/my-post-2025');
  });
});

// ---------------------------------------------------------------------------
// Tag chip link URLs
// ---------------------------------------------------------------------------

describe('tag chip hrefs', () => {
  it('tag chip href is /blog/tags/<tag>', () => {
    expect(tagChipHref('astro')).toBe('/blog/tags/astro');
    expect(tagChipHref('typescript')).toBe('/blog/tags/typescript');
  });

  it('special characters in tags are passed through unchanged', () => {
    // URL encoding of special chars is handled by the browser, not the template
    expect(tagChipHref('web-dev')).toBe('/blog/tags/web-dev');
  });
});

// ---------------------------------------------------------------------------
// Post card data completeness
// ---------------------------------------------------------------------------

describe('post card data requirements', () => {
  it('every published post has a non-empty title', () => {
    const published = filterBlogPosts(allPosts, false);
    for (const post of published) {
      expect(post.data.title.length).toBeGreaterThan(0);
    }
  });

  it('every published post has a non-empty description', () => {
    const published = filterBlogPosts(allPosts, false);
    for (const post of published) {
      expect(post.data.description.length).toBeGreaterThan(0);
    }
  });

  it('every published post has a valid date', () => {
    const published = filterBlogPosts(allPosts, false);
    for (const post of published) {
      expect(post.data.date).toBeInstanceOf(Date);
      expect(isNaN(post.data.date.valueOf())).toBe(false);
    }
  });

  it('every published post has a tags array (possibly empty)', () => {
    const published = filterBlogPosts(allPosts, false);
    for (const post of published) {
      expect(Array.isArray(post.data.tags)).toBe(true);
    }
  });
});
