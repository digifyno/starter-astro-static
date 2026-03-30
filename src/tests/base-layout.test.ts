import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('BaseLayout', () => {
  const source = readFileSync('src/layouts/BaseLayout.astro', 'utf-8');

  it('includes a skip navigation link for WCAG 2.4.1', () => {
    expect(source).toMatch(/href="#main-content"/);
    expect(source).toMatch(/Skip to main content/i);
  });

  it('nav contains all expected links: Home, Blog, Tags, Search', () => {
    expect(source).toMatch(/href="\/"/);
    expect(source).toContain('/blog');
    expect(source).toContain('/blog/tags');
    expect(source).toContain('/search');
  });

  it('applies focus-visible ring styles on interactive elements', () => {
    expect(source).toMatch(/focus-visible/);
  });

  it('includes dark mode support', () => {
    expect(source).toMatch(/dark:/);
  });

  it('BaseLayout includes lang attribute for WCAG 3.1.1', () => {
    expect(source).toMatch(/lang=["']en["']/);
  });

  describe('article meta tags', () => {
    it('conditionally renders article:published_time meta tag', () => {
      // BaseLayout.astro:45-47 — only rendered when type=article and articleMeta.publishedTime is set
      expect(source).toContain('article:published_time');
      expect(source).toContain('articleMeta?.publishedTime');
    });

    it('conditionally renders article:author meta tag', () => {
      // BaseLayout.astro:48-50
      expect(source).toContain('article:author');
      expect(source).toContain('articleMeta?.author');
    });

    it('conditionally renders article:tag meta tags', () => {
      // BaseLayout.astro:51-53 — one meta tag per tag
      expect(source).toContain('article:tag');
      expect(source).toContain('articleMeta?.tags');
    });

    it('gates article meta on type === article check', () => {
      // All three blocks must be guarded by type === article to avoid polluting non-article pages
      const articleBlocks = (source.match(/type === .article./g) || []).length;
      expect(articleBlocks).toBeGreaterThanOrEqual(3);
    });
  });
});
