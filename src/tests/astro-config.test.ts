import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Structural tests for astro.config.mjs
//
// Reads the config file as text and verifies the static CSP structure.
// These tests prevent silent regression of security-critical directives such
// as img-src, font-src, worker-src, and wasm-unsafe-eval.
// ---------------------------------------------------------------------------

const CONFIG_PATH = resolve(process.cwd(), 'astro.config.mjs');
let configSource: string;

try {
  configSource = readFileSync(CONFIG_PATH, 'utf-8');
} catch {
  configSource = '';
}

describe('astro.config.mjs CSP structure', () => {
  it('reads the astro.config.mjs source file without error', () => {
    expect(configSource.length).toBeGreaterThan(0);
  });

  it('defines a security.csp block', () => {
    expect(configSource).toContain('security');
    expect(configSource).toContain('csp');
  });

  it('uses SHA-256 as the CSP hashing algorithm', () => {
    expect(configSource).toContain('SHA-256');
  });

  it('includes default-src self directive', () => {
    expect(configSource).toContain("default-src 'self'");
  });

  it('includes img-src directive allowing self and data URIs', () => {
    expect(configSource).toContain("img-src 'self' data:");
  });

  it('includes font-src self directive', () => {
    expect(configSource).toContain("font-src 'self'");
  });

  it('includes worker-src self directive for Pagefind Web Worker', () => {
    expect(configSource).toContain("worker-src 'self'");
  });

  it('includes wasm-unsafe-eval in scriptDirective for Pagefind WebAssembly', () => {
    expect(configSource).toContain("'wasm-unsafe-eval'");
  });

  it('disables sourcemaps to prevent source exposure', () => {
    expect(configSource).toContain('sourcemap: false');
  });

  it('sitemap integration includes a serialize function for lastmod', () => {
    expect(configSource).toContain('serialize');
    expect(configSource).toContain('lastmod');
    expect(configSource).toContain('updatedDate');
  });
});
