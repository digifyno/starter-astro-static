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
// Pure helpers that mirror the logic used by index.astro.
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

/** Slice to the N most recent posts. Mirrors .slice(0, 3) on the homepage. */
function takeLatest(posts: BlogPost[], n = 3): BlogPost[] {
  return posts.slice(0, n);
}

// ---------------------------------------------------------------------------
// Sample fixtures
// ---------------------------------------------------------------------------

const post1: BlogPost = {
  id: 'post-one',
  data: {
    title: 'Post One',
    description: 'First post',
    date: new Date('2025-03-01'),
    tags: ['astro'],
  },
};

const post2: BlogPost = {
  id: 'post-two',
  data: {
    title: 'Post Two',
    description: 'Second post',
    date: new Date('2025-02-01'),
    tags: ['tailwind'],
  },
};

const post3: BlogPost = {
  id: 'post-three',
  data: {
    title: 'Post Three',
    description: 'Third post',
    date: new Date('2025-01-15'),
    tags: ['typescript'],
  },
};

const post4: BlogPost = {
  id: 'post-four',
  data: {
    title: 'Post Four',
    description: 'Fourth post',
    date: new Date('2025-01-01'),
    tags: ['astro'],
  },
};

const draftPost: BlogPost = {
  id: 'draft-post',
  data: {
    title: 'Draft Post',
    description: 'Work in progress',
    date: new Date('2025-03-15'),
    tags: ['wip'],
    draft: true,
  },
};

const allPosts = [post2, post4, draftPost, post1, post3];

// ---------------------------------------------------------------------------
// Draft filtering
// ---------------------------------------------------------------------------

describe('homepage draft exclusion (isDev || !data.draft)', () => {
  it('excludes draft posts in production', () => {
    const result = filterBlogPosts(allPosts, false);
    expect(result.map((p) => p.id)).not.toContain('draft-post');
  });

  it('a post with draft: true is not shown on the homepage in production', () => {
    const result = filterBlogPosts([draftPost], false);
    expect(result).toHaveLength(0);
  });

  it('includes draft posts in development', () => {
    const result = filterBlogPosts(allPosts, true);
    expect(result.map((p) => p.id)).toContain('draft-post');
  });

  it('includes all published posts in production', () => {
    const result = filterBlogPosts(allPosts, false);
    expect(result).toHaveLength(4);
  });

  it('treats a post without a draft field as published', () => {
    const result = filterBlogPosts([post1], false);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('post-one');
  });

  it('handles an empty post list', () => {
    expect(filterBlogPosts([], false)).toHaveLength(0);
    expect(filterBlogPosts([], true)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Date sort
// ---------------------------------------------------------------------------

describe('homepage date sort (newest first)', () => {
  it('places the newest post first', () => {
    const sorted = sortNewestFirst([post2, post1, post3]);
    expect(sorted[0].id).toBe('post-one');
  });

  it('places the oldest post last', () => {
    const sorted = sortNewestFirst([post1, post2, post3, post4]);
    expect(sorted[sorted.length - 1].id).toBe('post-four');
  });

  it('produces a monotonically non-increasing date sequence', () => {
    const sorted = sortNewestFirst([post1, post2, post3, post4]);
    const timestamps = sorted.map((p) => p.data.date.valueOf());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1]);
    }
  });

  it('does not mutate the input array', () => {
    const input = [post3, post1, post2];
    const original = input.map((p) => p.id);
    sortNewestFirst(input);
    expect(input.map((p) => p.id)).toEqual(original);
  });

  it('handles a single post without error', () => {
    expect(sortNewestFirst([post1])).toHaveLength(1);
  });

  it('handles an empty list', () => {
    expect(sortNewestFirst([])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Post count (slice to 3)
// ---------------------------------------------------------------------------

describe('homepage latest posts count (slice(0, 3))', () => {
  it('shows at most 3 posts', () => {
    const latest = takeLatest(sortNewestFirst(filterBlogPosts(allPosts, false)));
    expect(latest.length).toBeLessThanOrEqual(3);
  });

  it('shows exactly 3 when more than 3 posts are published', () => {
    // allPosts has 4 published + 1 draft; production mode returns 3
    const latest = takeLatest(sortNewestFirst(filterBlogPosts(allPosts, false)));
    expect(latest).toHaveLength(3);
  });

  it('shows fewer than 3 when fewer published posts exist', () => {
    const latest = takeLatest(sortNewestFirst([post1, post2]));
    expect(latest).toHaveLength(2);
  });

  it('the 3 shown are the most recent published posts', () => {
    // post1 (Mar), post2 (Feb), post3 (Jan 15) are newest; post4 (Jan 1) is 4th
    const latest = takeLatest(sortNewestFirst([post1, post2, post3, post4]));
    const ids = latest.map((p) => p.id);
    expect(ids).toContain('post-one');
    expect(ids).toContain('post-two');
    expect(ids).toContain('post-three');
    expect(ids).not.toContain('post-four');
  });

  it('the draft post does not count toward the 3 latest in production', () => {
    // draftPost has date 2025-03-15 (newest of all) but must be excluded
    const latest = takeLatest(sortNewestFirst(filterBlogPosts(allPosts, false)));
    expect(latest.map((p) => p.id)).not.toContain('draft-post');
  });

  it('handles an empty post list', () => {
    expect(takeLatest([])).toHaveLength(0);
  });
});
