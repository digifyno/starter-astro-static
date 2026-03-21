import { describe, it, expect } from 'vitest';

// Draft filtering predicates as used across pages:
//   rss.xml.ts:            ({ data }) => !data.draft          (always production)
//   blog/index.astro:      isDev || !data.draft               (dev shows all)
//   blog/tags/[tag].astro  isDev || !data.draft               (dev shows all)

type Post = { data: { draft?: boolean } };

const productionFilter = (post: Post) => !post.data.draft;
const buildFilter = (isDev: boolean) => (post: Post) => isDev || !post.data.draft;

describe('draft post filtering', () => {
  describe('production filter (used in RSS feed)', () => {
    it('includes posts with draft: false', () => {
      expect(productionFilter({ data: { draft: false } })).toBe(true);
    });

    it('includes posts with draft undefined (schema default is false)', () => {
      expect(productionFilter({ data: {} })).toBe(true);
    });

    it('excludes posts with draft: true', () => {
      expect(productionFilter({ data: { draft: true } })).toBe(false);
    });

    it('filters a mixed list to only published posts', () => {
      const posts: Post[] = [
        { data: { draft: false } },
        { data: { draft: true } },
        { data: {} },
        { data: { draft: true } },
        { data: { draft: false } },
      ];
      const published = posts.filter(productionFilter);
      expect(published).toHaveLength(3);
    });

    it('returns no posts when all are drafts', () => {
      const posts: Post[] = [
        { data: { draft: true } },
        { data: { draft: true } },
      ];
      expect(posts.filter(productionFilter)).toHaveLength(0);
    });

    it('returns all posts when none are drafts', () => {
      const posts: Post[] = [
        { data: { draft: false } },
        { data: {} },
      ];
      expect(posts.filter(productionFilter)).toHaveLength(2);
    });
  });

  describe('dev/prod filter (used in blog index and tag pages)', () => {
    describe('in production (isDev=false)', () => {
      const filter = buildFilter(false);

      it('excludes draft posts in production', () => {
        expect(filter({ data: { draft: true } })).toBe(false);
      });

      it('includes published posts in production', () => {
        expect(filter({ data: { draft: false } })).toBe(true);
        expect(filter({ data: {} })).toBe(true);
      });

      it('a draft leaking through would expose unpublished content — filter must return false', () => {
        const draftPost: Post = { data: { draft: true } };
        expect(filter(draftPost)).toBe(false);
      });
    });

    describe('in development (isDev=true)', () => {
      const filter = buildFilter(true);

      it('includes draft posts in dev mode', () => {
        expect(filter({ data: { draft: true } })).toBe(true);
      });

      it('includes all posts in dev mode regardless of draft status', () => {
        const posts: Post[] = [
          { data: { draft: false } },
          { data: { draft: true } },
          { data: {} },
        ];
        expect(posts.filter(filter)).toHaveLength(3);
      });
    });
  });
});
