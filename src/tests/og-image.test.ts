import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OG_PATH = resolve(process.cwd(), 'src/pages/blog/[id]/og.png.ts');
let source: string;
try {
  source = readFileSync(OG_PATH, 'utf-8');
} catch {
  source = '';
}

describe('og.png.ts GET handler structure', () => {
  it('reads og.png.ts without error', () => {
    expect(source.length).toBeGreaterThan(0);
  });

  it('sets Content-Type to image/png', () => {
    expect(source).toContain("'Content-Type'");
    expect(source).toContain('image/png');
  });

  it('uses Satori for SVG generation', () => {
    expect(source).toContain('satori');
  });

  it('renders at 1200x630 dimensions', () => {
    expect(source).toContain('1200');
    expect(source).toContain('630');
  });

  it('loads fonts from inter-font package', () => {
    expect(source).toContain('inter-font');
  });

  it('renders the post title in the template', () => {
    expect(source).toContain('post.data.title');
  });

  it('renders the post date in the template', () => {
    expect(source).toContain('post.data.date');
  });

  it('uses Resvg to convert SVG to PNG', () => {
    expect(source).toContain('Resvg');
  });

  it('returns a Response with the PNG buffer', () => {
    expect(source).toContain('new Response(');
  });
});
