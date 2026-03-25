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
});
