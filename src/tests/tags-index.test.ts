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
  draft?: boolean;
};

type BlogPost = {
  id: string;
  data: PostData;
};

// ---------------------------------------------------------------------------
// Pure helpers that mirror the logic used by blog/tags/index.astro.
//
// The page implementation:
//   const tagCounts = posts
//     .flatMap((p) => p.data.tags)
//     .reduce((acc, tag) => { acc[tag] = (acc[tag] || 0) + 1; return acc; }, {});
//   const tags = Object.entries(tagCounts)
//     .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
// ---------------------------------------------------------------------------

/** Exclude draft posts in production; show all in development. */
function filterTagsIndexPosts(posts: BlogPost[], isDev: boolean): BlogPost[] {
  return posts.filter(({ data }) => isDev || !data.draft);
}

/**
 * Build a map of { tag → postCount } from the supplied post list.
 * Mirrors the flatMap + reduce used in tags/index.astro.
 */
function buildTagCounts(posts: BlogPost[]): Record<string, number> {
  return posts
    .flatMap((p) => p.data.tags)
    .reduce((acc: Record<string, number>, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
}

/**
 * Sort tag entries by count descending, then alphabetically.
 * Mirrors: sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
 */
function sortTagEntries(entries: [string, number][]): [string, number][] {
  return [...entries].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Build the tag page href for a tag chip on the index page. */
function tagPageHref(tag: string): string {
  return `/blog/tags/${tag}`;
}

// ---------------------------------------------------------------------------
// Sample fixtures
// ---------------------------------------------------------------------------

const post1: BlogPost = {
  id: 'hello-astro',
  data: {
    title: 'Hello Astro',
    description: 'Getting started',
    date: new Date('2025-01-10'),
    tags: ['astro', 'typescript'],
  },
};

const post2: BlogPost = {
  id: 'tailwind-tips',
  data: {
    title: 'Tailwind Tips',
    description: 'CSS utilities',
    date: new Date('2025-02-15'),
    tags: ['astro', 'tailwind'],
  },
};

const post3: BlogPost = {
  id: 'release-notes',
  data: {
    title: 'Release Notes',
    description: 'Changelog',
    date: new Date('2025-03-01'),
    tags: ['changelog'],
  },
};

const draftPost: BlogPost = {
  id: 'wip-guide',
  data: {
    title: 'Work In Progress',
    description: 'Unreleased',
    date: new Date('2025-02-20'),
    tags: ['astro', 'draft-only'],
    draft: true,
  },
};

const allPosts = [post1, post2, post3, draftPost];

// ---------------------------------------------------------------------------
// Draft filtering for tag index
// ---------------------------------------------------------------------------

describe('tags index draft filter (isDev || !data.draft)', () => {
  it('excludes draft posts in production', () => {
    const result = filterTagsIndexPosts(allPosts, false);
    expect(result.map((p) => p.id)).not.toContain('wip-guide');
    expect(result).toHaveLength(3);
  });

  it('includes all posts in development', () => {
    const result = filterTagsIndexPosts(allPosts, true);
    expect(result).toHaveLength(4);
    expect(result.map((p) => p.id)).toContain('wip-guide');
  });

  it('excludes tags belonging exclusively to draft posts in production', () => {
    const published = filterTagsIndexPosts(allPosts, false);
    const counts = buildTagCounts(published);
    expect(Object.keys(counts)).not.toContain('draft-only');
  });

  it('includes draft-only tags in development', () => {
    const all = filterTagsIndexPosts(allPosts, true);
    const counts = buildTagCounts(all);
    expect('draft-only' in counts).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tag count building
// ---------------------------------------------------------------------------

describe('buildTagCounts (flatMap + reduce)', () => {
  it('counts each tag correctly', () => {
    const counts = buildTagCounts([post1, post2, post3]);
    expect(counts['astro']).toBe(2);
    expect(counts['typescript']).toBe(1);
    expect(counts['tailwind']).toBe(1);
    expect(counts['changelog']).toBe(1);
  });

  it('returns an empty object for an empty post list', () => {
    expect(buildTagCounts([])).toEqual({});
  });

  it('a tag shared across all posts has the full count', () => {
    const posts: BlogPost[] = [
      { id: 'a', data: { title: '', description: '', date: new Date(), tags: ['shared'] } },
      { id: 'b', data: { title: '', description: '', date: new Date(), tags: ['shared'] } },
      { id: 'c', data: { title: '', description: '', date: new Date(), tags: ['shared', 'other'] } },
    ];
    const counts = buildTagCounts(posts);
    expect(counts['shared']).toBe(3);
    expect(counts['other']).toBe(1);
  });

  it('a post with no tags contributes nothing to counts', () => {
    const noTagPost: BlogPost = { id: 'x', data: { title: '', description: '', date: new Date(), tags: [] } };
    expect(buildTagCounts([noTagPost])).toEqual({});
  });

  it('draft post tags inflate counts when included', () => {
    const counts = buildTagCounts(allPosts); // includes draftPost
    expect(counts['astro']).toBe(3); // post1, post2, draftPost
  });

  it('draft post tags do not appear when only published posts are supplied', () => {
    const published = filterTagsIndexPosts(allPosts, false);
    const counts = buildTagCounts(published);
    expect(counts['astro']).toBe(2); // only post1, post2
    expect('draft-only' in counts).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tag sort: by count descending, then alphabetically
// ---------------------------------------------------------------------------

describe('sortTagEntries (count desc, then alpha)', () => {
  it('places the highest-count tag first', () => {
    const entries: [string, number][] = [['b', 1], ['a', 3], ['c', 2]];
    const sorted = sortTagEntries(entries);
    expect(sorted[0][0]).toBe('a');
    expect(sorted[0][1]).toBe(3);
  });

  it('sorts ties alphabetically', () => {
    const entries: [string, number][] = [['zebra', 2], ['apple', 2], ['mango', 2]];
    const sorted = sortTagEntries(entries);
    expect(sorted.map(([t]) => t)).toEqual(['apple', 'mango', 'zebra']);
  });

  it('mixed counts and ties: count takes priority over alphabetical', () => {
    const entries: [string, number][] = [
      ['astro', 2],
      ['tailwind', 1],
      ['changelog', 1],
      ['typescript', 1],
    ];
    const sorted = sortTagEntries(entries);
    expect(sorted[0][0]).toBe('astro');
    expect(sorted.slice(1).map(([t]) => t)).toEqual(['changelog', 'tailwind', 'typescript']);
  });

  it('does not mutate the input array', () => {
    const entries: [string, number][] = [['b', 1], ['a', 2]];
    const original = [...entries];
    sortTagEntries(entries);
    expect(entries).toEqual(original);
  });

  it('handles a single tag', () => {
    expect(sortTagEntries([['solo', 5]])).toEqual([['solo', 5]]);
  });

  it('handles an empty list', () => {
    expect(sortTagEntries([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Tag page link URLs
// ---------------------------------------------------------------------------

describe('tag page hrefs', () => {
  it('tag href is /blog/tags/<tag>', () => {
    expect(tagPageHref('astro')).toBe('/blog/tags/astro');
    expect(tagPageHref('typescript')).toBe('/blog/tags/typescript');
  });

  it('hyphenated tags produce valid hrefs', () => {
    expect(tagPageHref('web-dev')).toBe('/blog/tags/web-dev');
  });

  it('special characters are passed through unchanged (browser handles encoding)', () => {
    expect(tagPageHref('c++')).toBe('/blog/tags/c++');
  });
});

// ---------------------------------------------------------------------------
// Integrated: filter + count + sort (full tags index pipeline)
// ---------------------------------------------------------------------------

describe('full tags index pipeline in production', () => {
  it('produces the correct tag list sorted by count then alphabetically', () => {
    const published = filterTagsIndexPosts(allPosts, false);
    const counts = buildTagCounts(published);
    const sorted = sortTagEntries(Object.entries(counts));

    // astro: 2, changelog/tailwind/typescript: 1 each
    expect(sorted[0]).toEqual(['astro', 2]);
    const singles = sorted.slice(1).map(([t]) => t);
    expect(singles).toEqual(['changelog', 'tailwind', 'typescript']); // alpha order
  });

  it('tag count for astro drops when draft post is excluded', () => {
    const published = filterTagsIndexPosts(allPosts, false);
    expect(buildTagCounts(published)['astro']).toBe(2);
  });

  it('all published tags are present in the output', () => {
    const published = filterTagsIndexPosts(allPosts, false);
    const counts = buildTagCounts(published);
    const tags = Object.keys(counts);
    expect(tags).toContain('astro');
    expect(tags).toContain('typescript');
    expect(tags).toContain('tailwind');
    expect(tags).toContain('changelog');
  });
});
