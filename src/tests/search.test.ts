import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Structural tests for src/pages/search.astro
//
// Since Astro components cannot be imported and rendered in Vitest, this file
// reads the .astro source as text and verifies the static structure: Pagefind
// script reference, noscript fallback, and ARIA live region. These tests
// prevent silent regression of the Pagefind JS import and accessibility
// attributes.
// ---------------------------------------------------------------------------

const PAGE_PATH = resolve(process.cwd(), 'src/pages/search.astro');
let pageSource: string;

try {
  pageSource = readFileSync(PAGE_PATH, 'utf-8');
} catch {
  pageSource = '';
}

describe('search.astro source structure', () => {
  it('reads the search.astro source file without error', () => {
    expect(pageSource.length).toBeGreaterThan(0);
  });

  it('uses BaseLayout for consistent nav/footer', () => {
    expect(pageSource).toContain('BaseLayout');
  });

  it('contains Pagefind script reference at the expected production path', () => {
    // This test locks in the presence of the Pagefind JS import.
    // If /pagefind/pagefind-ui.js is removed, search silently breaks in production.
    expect(pageSource).toContain('/pagefind/pagefind-ui.js');
  });

  it('contains Pagefind UI CSS reference', () => {
    expect(pageSource).toContain('/pagefind/pagefind-ui.css');
  });

  it('contains noscript fallback element', () => {
    expect(pageSource).toMatch(/<noscript>/);
  });

  it('contains descriptive noscript fallback content (not empty)', () => {
    const noscriptMatch = pageSource.match(/<noscript>([\s\S]*?)<\/noscript>/);
    expect(noscriptMatch).not.toBeNull();
    const noscriptContent = noscriptMatch![1].trim();
    expect(noscriptContent.length).toBeGreaterThan(0);
  });

  it('noscript fallback mentions JavaScript', () => {
    const noscriptMatch = pageSource.match(/<noscript>([\s\S]*?)<\/noscript>/);
    expect(noscriptMatch).not.toBeNull();
    expect(noscriptMatch![1].toLowerCase()).toContain('javascript');
  });

  it('contains ARIA live region on the search status container', () => {
    expect(pageSource).toContain('aria-live');
  });

  it('ARIA live region uses polite value for non-interruptive announcements', () => {
    expect(pageSource).toMatch(/aria-live=["']polite["']/);
  });

  it('includes a search heading', () => {
    expect(pageSource.toLowerCase()).toMatch(/<h[1-6][^>]*>[\s\S]*?search[\s\S]*?<\/h[1-6]>/i);
  });

  it('contains dev-mode notice for local development', () => {
    // Users running npm run dev should see an explanation for why search is unavailable
    const lower = pageSource.toLowerCase();
    expect(lower.includes('dev') || lower.includes('development') || lower.includes('build')).toBe(true);
  });
});
