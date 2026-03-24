import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Regression guard for draft-post exclusion in the blog post detail route.
//
// `src/pages/blog/[id].astro` must filter out draft posts in production builds
// (matching the pattern used in og.png.ts, blog/index.astro, and
// blog/tags/[tag].astro).  Reading and asserting on the source text catches
// future regressions where the filter is accidentally removed.
// ---------------------------------------------------------------------------

const PAGE_PATH = resolve(process.cwd(), 'src/pages/blog/[id].astro');
let pageSource: string;

try {
  pageSource = readFileSync(PAGE_PATH, 'utf-8');
} catch {
  pageSource = '';
}

describe('[id].astro draft-post exclusion', () => {
  it('reads the [id].astro source file without error', () => {
    expect(pageSource.length).toBeGreaterThan(0);
  });

  it('getStaticPaths filters draft posts using !data.draft predicate', () => {
    expect(pageSource).toMatch(/!data\.draft/);
  });

  it('uses isDev guard so drafts remain visible in development', () => {
    expect(pageSource).toMatch(/isDev\s*\|\|\s*!data\.draft/);
  });

  it('sets isDev from import.meta.env.DEV', () => {
    expect(pageSource).toMatch(/import\.meta\.env\.DEV/);
  });
});
