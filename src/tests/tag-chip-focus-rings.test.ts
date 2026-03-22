import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = process.cwd();

describe('tag chip focus ring accessibility', () => {
  it('blog/index.astro tag chips have explicit focus-visible:outline for visible focus ring', () => {
    const source = readFileSync(resolve(root, 'src/pages/blog/index.astro'), 'utf8');
    expect(source).toContain('focus-visible:outline focus-visible:outline-2');
  });

  it('blog/[id].astro tag chips have explicit focus-visible:outline for visible focus ring', () => {
    const source = readFileSync(resolve(root, 'src/pages/blog/[id].astro'), 'utf8');
    expect(source).toContain('focus-visible:outline focus-visible:outline-2');
  });

  it('blog/tags/index.astro tag chips have explicit focus-visible:outline for visible focus ring', () => {
    const source = readFileSync(resolve(root, 'src/pages/blog/tags/index.astro'), 'utf8');
    expect(source).toContain('focus-visible:outline focus-visible:outline-2');
  });

  it('blog/tags/[tag].astro tag chips use outline pattern consistent with other pages', () => {
    const source = readFileSync(resolve(root, 'src/pages/blog/tags/[tag].astro'), 'utf8');
    expect(source).toContain('focus-visible:outline focus-visible:outline-2');
  });
});
