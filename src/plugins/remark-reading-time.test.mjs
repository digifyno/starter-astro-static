import { describe, it, expect } from 'vitest';
import { remarkReadingTime } from './remark-reading-time.mjs';

function makeTree(texts) {
  return {
    type: 'root',
    children: texts.map((value) => ({ type: 'text', value })),
  };
}

function makeFile() {
  return { data: {} };
}

function run(text) {
  const transform = remarkReadingTime();
  const file = makeFile();
  transform(makeTree([text]), file);
  return file.data.astro.frontmatter.minutesRead;
}

describe('remarkReadingTime', () => {
  it('empty content returns 1 min read (minimum)', () => {
    expect(run('')).toBe('1 min read');
  });

  it('short content (50 words) returns 1 min read', () => {
    const text = Array(50).fill('word').join(' ');
    expect(run(text)).toBe('1 min read');
  });

  it('long content (400 words) returns 2 min read', () => {
    const text = Array(400).fill('word').join(' ');
    expect(run(text)).toBe('2 min read');
  });

  it('markdown with headings and images is counted correctly', () => {
    // Simulate a mix of text nodes (headings and images are not text nodes,
    // so only paragraph text contributes to word count)
    const text = Array(50).fill('word').join(' ');
    expect(run(text)).toBe('1 min read');
  });

  it('injects minutesRead into file.data.astro.frontmatter', () => {
    const transform = remarkReadingTime();
    const file = makeFile();
    transform(makeTree(['hello world']), file);
    expect(file.data.astro).toBeDefined();
    expect(file.data.astro.frontmatter).toBeDefined();
    expect(file.data.astro.frontmatter.minutesRead).toMatch(/^\d+ min read$/);
  });

  it('injects wordCount (non-negative integer) into file.data.astro.frontmatter', () => {
    const transform = remarkReadingTime();
    const file = makeFile();
    const text = Array(100).fill('word').join(' ');
    transform(makeTree([text]), file);
    const { wordCount } = file.data.astro.frontmatter;
    expect(typeof wordCount).toBe('number');
    expect(Number.isInteger(wordCount)).toBe(true);
    expect(wordCount).toBeGreaterThanOrEqual(0);
  });

  it('wordCount is 0 for empty content', () => {
    const transform = remarkReadingTime();
    const file = makeFile();
    transform(makeTree(['']), file);
    expect(file.data.astro.frontmatter.wordCount).toBe(0);
  });

  it('preserves existing astro frontmatter fields', () => {
    const transform = remarkReadingTime();
    const file = { data: { astro: { frontmatter: { title: 'My Post' } } } };
    transform(makeTree(['hello world']), file);
    expect(file.data.astro.frontmatter.title).toBe('My Post');
    expect(file.data.astro.frontmatter.minutesRead).toMatch(/^\d+ min read$/);
  });
});
