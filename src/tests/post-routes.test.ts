import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Structural tests for draft exclusion in blog post route files.
//
// These source-level tests lock in the draft-filtering behaviour of:
//   - src/pages/blog/[id].astro       (blog post page getStaticPaths)
//   - src/pages/blog/[id]/og.png.ts   (per-post OG image getStaticPaths)
//
// Astro components cannot be imported and rendered in Vitest, so each test
// reads the source file as text and verifies the filtering logic is present.
// This prevents future refactors from silently re-exposing draft post URLs
// or draft OG image endpoints in production.
// ---------------------------------------------------------------------------

const ID_ASTRO_PATH = resolve(process.cwd(), 'src/pages/blog/[id].astro');
const OG_PNG_PATH = resolve(process.cwd(), 'src/pages/blog/[id]/og.png.ts');

let idAstroSource: string;
let ogPngSource: string;

try {
  idAstroSource = readFileSync(ID_ASTRO_PATH, 'utf-8');
} catch {
  idAstroSource = '';
}

try {
  ogPngSource = readFileSync(OG_PNG_PATH, 'utf-8');
} catch {
  ogPngSource = '';
}

// ---------------------------------------------------------------------------
// [id].astro — blog post page
// ---------------------------------------------------------------------------

describe('[id].astro draft exclusion in getStaticPaths', () => {
  it('reads the [id].astro source file without error', () => {
    expect(idAstroSource.length).toBeGreaterThan(0);
  });

  it('exports a getStaticPaths function', () => {
    expect(idAstroSource).toMatch(/export\s+(async\s+)?function\s+getStaticPaths/);
  });

  it('passes a filter callback to getCollection to exclude draft posts', () => {
    // The filter is implemented as a second argument to getCollection, e.g.:
    //   getCollection('blog', ({ data }) => isDev || !data.draft)
    // This prevents draft posts from receiving a URL slug in production builds.
    expect(idAstroSource).toMatch(/getCollection\s*\(\s*['"]blog['"]/);
    // The callback must reference 'draft' to exclude unpublished content
    expect(idAstroSource).toMatch(/!data\.draft/);
  });

  it('guards draft exclusion with an isDev check so drafts are visible in development', () => {
    // The pattern isDev || !data.draft allows local preview of draft posts
    expect(idAstroSource).toMatch(/isDev\s*\|\|\s*!data\.draft/);
  });

  it('does not call getCollection without any draft filtering', () => {
    // An unfiltered call — getCollection('blog') with no second argument — would
    // expose all draft posts as accessible URLs in production builds.
    // If getCollection is called with only one argument, a subsequent .filter()
    // that checks draft status must also be present.
    const hasFilterCallback = /getCollection\s*\(\s*['"]blog['"],/.test(idAstroSource);
    const hasSeparateFilter =
      idAstroSource.includes('.filter(') && idAstroSource.includes('draft');
    expect(hasFilterCallback || hasSeparateFilter).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// og.png.ts — per-post OG image endpoint
// ---------------------------------------------------------------------------

describe('og.png.ts draft exclusion in getStaticPaths', () => {
  it('reads the og.png.ts source file without error', () => {
    expect(ogPngSource.length).toBeGreaterThan(0);
  });

  it('exports a getStaticPaths function', () => {
    expect(ogPngSource).toMatch(
      /export\s+(async\s+)?function\s+getStaticPaths|export\s+const\s+getStaticPaths/,
    );
  });

  it('passes a filter callback to getCollection to exclude draft posts', () => {
    // The OG image endpoint must not generate image URLs for draft posts.
    // Without this filter, /blog/<draft-id>/og.png would be a valid URL that
    // leaks the existence (and title) of unpublished content.
    expect(ogPngSource).toMatch(/getCollection\s*\(\s*['"]blog['"]/);
    expect(ogPngSource).toMatch(/!data\.draft/);
  });

  it('guards draft exclusion with an isDev check so drafts are visible in development', () => {
    expect(ogPngSource).toMatch(/isDev\s*\|\|\s*!data\.draft/);
  });

  it('does not expose draft posts via getStaticPaths without filtering', () => {
    // Verifies that any getCollection call in getStaticPaths includes a filter argument
    // or that a separate .filter() with draft checking follows.
    const hasFilterCallback = /getCollection\s*\(\s*['"]blog['"],/.test(ogPngSource);
    const hasSeparateFilter =
      ogPngSource.includes('.filter(') && ogPngSource.includes('draft');
    expect(hasFilterCallback || hasSeparateFilter).toBe(true);
  });
});
