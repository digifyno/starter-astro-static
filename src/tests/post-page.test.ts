import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Structural tests for src/pages/blog/[id].astro
//
// Since Astro components cannot be imported and rendered in Vitest, this file
// reads the .astro source as text and verifies the static structure: reading
// time display, tag chip links, JSON-LD script tags, cover image alt text
// binding, and back-to-blog navigation. These tests prevent silent regression
// of post-page features during future refactors.
// ---------------------------------------------------------------------------

const PAGE_PATH = resolve(process.cwd(), 'src/pages/blog/[id].astro');
let pageSource: string;

try {
  pageSource = readFileSync(PAGE_PATH, 'utf-8');
} catch {
  pageSource = '';
}

describe('[id].astro source structure', () => {
  it('reads the [id].astro source file without error', () => {
    expect(pageSource.length).toBeGreaterThan(0);
  });

  it('uses BaseLayout for consistent nav/footer', () => {
    expect(pageSource).toContain('BaseLayout');
  });

  // -------------------------------------------------------------------------
  // 1. Reading time
  // -------------------------------------------------------------------------

  it('references remarkPluginFrontmatter to extract reading time', () => {
    // The remark-reading-time plugin injects minutesRead into remarkPluginFrontmatter.
    // This asserts that [id].astro destructures it from the render() result.
    expect(pageSource).toContain('remarkPluginFrontmatter');
  });

  it('renders minutesRead on the page', () => {
    // minutesRead must be referenced in the template to be displayed to readers.
    expect(pageSource).toContain('minutesRead');
  });

  it('provides a fallback value for minutesRead when not set', () => {
    // Without a fallback, posts processed without the remark plugin would show undefined.
    expect(pageSource).toMatch(/minutesRead[^\n]*\?\?[^\n]*min read/);
  });

  // -------------------------------------------------------------------------
  // 2. Tag chip links
  // -------------------------------------------------------------------------

  it('renders tag chips that link to /blog/tags/', () => {
    // Each tag chip must link to its tag page so readers can explore related posts.
    expect(pageSource).toContain('/blog/tags/');
  });

  it('tag chip href is constructed from the tag value', () => {
    // The href must be dynamic — built from the tag string — not a hardcoded path.
    expect(pageSource).toMatch(/\/blog\/tags\/.*tag/);
  });

  it('tag chips carry focus-visible outline styles for WCAG keyboard focus', () => {
    // Tag chips must be keyboard-accessible with a visible focus indicator.
    expect(pageSource).toMatch(/focus-visible/);
  });

  // -------------------------------------------------------------------------
  // 3. JSON-LD script tag
  // -------------------------------------------------------------------------

  it('includes a JSON-LD script tag', () => {
    // Structured data enables rich search results (article date, author, breadcrumb).
    expect(pageSource).toContain('application/ld+json');
  });

  it('JSON-LD includes a BlogPosting schema', () => {
    expect(pageSource).toContain('BlogPosting');
  });

  it('JSON-LD includes a BreadcrumbList schema', () => {
    expect(pageSource).toContain('BreadcrumbList');
  });

  it('JSON-LD script uses set:html to inject serialised JSON', () => {
    // set:html prevents Astro from HTML-escaping the JSON string.
    expect(pageSource).toContain('set:html={JSON.stringify');
  });

  // -------------------------------------------------------------------------
  // 4. Cover image alt text binding
  // -------------------------------------------------------------------------

  it('renders cover image only when post.data.image is set', () => {
    // The Image component must be conditionally rendered to avoid broken images.
    expect(pageSource).toContain('post.data.image');
  });

  it('binds imageAlt to the cover image alt attribute', () => {
    // alt text must reference the imageAlt frontmatter field for accessibility.
    expect(pageSource).toContain('imageAlt');
  });

  it('cover image alt falls back to empty string when imageAlt is not set', () => {
    // An empty alt marks the image as decorative when no description is provided.
    expect(pageSource).toMatch(/imageAlt[^\n]*\?\?[^\n]*['"]{2}/);
  });

  // -------------------------------------------------------------------------
  // 5. imageAlt forwarding to BaseLayout
  // -------------------------------------------------------------------------

  it('forwards post.data.imageAlt to BaseLayout for twitter:image:alt', () => {
    // Without this, twitter:image:alt silently uses description instead of the
    // author-provided image alt text — even when imageAlt is set in frontmatter.
    expect(pageSource).toMatch(/imageAlt=\{post\.data\.imageAlt\}/);
  });

  // -------------------------------------------------------------------------
  // 6. modifiedTime forwarding to BaseLayout
  // -------------------------------------------------------------------------

  it('forwards updatedDate as modifiedTime to BaseLayout for article:modified_time', () => {
    expect(pageSource).toContain('modifiedTime');
    expect(pageSource).toMatch(/updatedDate.*toISOString|toISOString.*updatedDate/);
  });

  // -------------------------------------------------------------------------
  // 7. Back-to-blog navigation
  // -------------------------------------------------------------------------

  it('contains a back-to-blog link pointing to /blog', () => {
    // Readers should be able to navigate back to the blog listing from any post.
    expect(pageSource).toMatch(/href=["']\/blog["']/);
  });

  it('back-to-blog link contains descriptive text', () => {
    // The link text must be meaningful for screen reader users.
    const lower = pageSource.toLowerCase();
    expect(lower.includes('back to blog') || lower.includes('&larr;')).toBe(true);
  });
});
