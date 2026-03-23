import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Structural tests for src/pages/404.astro
//
// Since Astro components cannot be imported and rendered in Vitest, this file
// reads the .astro source as text and verifies the static structure: heading,
// description, home link, and BaseLayout usage.  These tests catch regressions
// where someone accidentally removes the link back to home or deletes the
// 404 heading entirely.
// ---------------------------------------------------------------------------

const PAGE_PATH = resolve(process.cwd(), 'src/pages/404.astro');
let pageSource: string;

try {
  pageSource = readFileSync(PAGE_PATH, 'utf-8');
} catch {
  pageSource = '';
}

describe('404 page source structure', () => {
  it('reads the 404.astro source file without error', () => {
    expect(pageSource.length).toBeGreaterThan(0);
  });

  it('uses BaseLayout for consistent nav/footer', () => {
    expect(pageSource).toContain('BaseLayout');
  });

  it('imports BaseLayout at the top of the frontmatter', () => {
    expect(pageSource).toMatch(/import\s+BaseLayout/);
  });

  it('passes a title prop to BaseLayout that mentions 404 or "not found"', () => {
    const titleMatch = pageSource.match(/title=["'][^"']*["']/i);
    expect(titleMatch).not.toBeNull();
    const titleContent = titleMatch![0].toLowerCase();
    expect(titleContent.includes('404') || titleContent.includes('not found')).toBe(true);
  });

  it('displays a "404" text for users to recognise the error', () => {
    expect(pageSource).toContain('404');
  });

  it('includes a heading that communicates "page not found"', () => {
    expect(pageSource.toLowerCase()).toMatch(/page\s+not\s+found/);
  });

  it('includes a link back to the home page', () => {
    // Must have href="/" (possibly with spaces around =) pointing to site root
    expect(pageSource).toMatch(/href=["']\/["']/);
  });

  it('the home link text is human-readable', () => {
    // The visible text should convey navigation back home
    const lower = pageSource.toLowerCase();
    expect(lower.includes('home') || lower.includes('go home') || lower.includes('back')).toBe(true);
  });

  it('contains an explanatory message for visitors', () => {
    // Should have some copy beyond just "404" and the heading
    const lower = pageSource.toLowerCase();
    const hasCopy =
      lower.includes('find') ||
      lower.includes('looking') ||
      lower.includes('exist') ||
      lower.includes('sorry');
    expect(hasCopy).toBe(true);
  });
});
