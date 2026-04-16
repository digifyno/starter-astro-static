import { describe, it, expect } from 'vitest';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { GET } from '../pages/rss.xml.js';

// Draft filter predicate from rss.xml.ts: getCollection('blog', ({ data }) => !data.draft)
const isDraftExcluded = ({ data }: { data: { draft?: boolean } }) => !data.draft;

// Sort comparator from rss.xml.ts
const sortNewestFirst = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.valueOf() - a.data.date.valueOf();

// Item mapper from rss.xml.ts
const toRssItem = (post: { id: string; data: { title: string; description: string; date: Date }; body?: string }) => ({
  title: post.data.title,
  pubDate: post.data.date,
  description: post.data.description,
  link: `/blog/${post.id}/`,
  content: sanitizeHtml(marked.parse(post.body ?? '') as string, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
  }),
});

describe('rss feed logic', () => {
  describe('draft filter', () => {
    it('includes posts where draft is false', () => {
      expect(isDraftExcluded({ data: { draft: false } })).toBe(true);
    });

    it('includes posts where draft is undefined', () => {
      expect(isDraftExcluded({ data: {} })).toBe(true);
    });

    it('excludes posts where draft is true', () => {
      expect(isDraftExcluded({ data: { draft: true } })).toBe(false);
    });

    it('filters a mixed list to only published posts', () => {
      const posts = [
        { id: 'a', data: { draft: false, date: new Date(), title: 'A', description: '' } },
        { id: 'b', data: { draft: true, date: new Date(), title: 'B', description: '' } },
        { id: 'c', data: {}, date: new Date(), title: 'C', description: '' } as any,
      ];
      const published = posts.filter(isDraftExcluded);
      expect(published).toHaveLength(2);
      expect(published.map((p) => p.id)).toEqual(['a', 'c']);
    });
  });

  describe('date sort', () => {
    it('sorts newest post first', () => {
      const posts = [
        { data: { date: new Date('2024-01-01') } },
        { data: { date: new Date('2025-06-15') } },
        { data: { date: new Date('2023-03-10') } },
      ];
      const sorted = [...posts].sort(sortNewestFirst);
      expect(sorted[0].data.date.getFullYear()).toBe(2025);
      expect(sorted[1].data.date.getFullYear()).toBe(2024);
      expect(sorted[2].data.date.getFullYear()).toBe(2023);
    });

    it('treats equal dates as equal', () => {
      const d = new Date('2025-01-01');
      expect(sortNewestFirst({ data: { date: d } }, { data: { date: d } })).toBe(0);
    });
  });

  describe('item mapping', () => {
    it('maps post to correct RSS item shape', () => {
      const post = {
        id: 'hello-world',
        data: { title: 'Hello World', description: 'A great post', date: new Date('2025-01-15') },
      };
      const item = toRssItem(post);
      expect(item.title).toBe('Hello World');
      expect(item.description).toBe('A great post');
      expect(item.pubDate).toBeInstanceOf(Date);
      expect(item.link).toBe('/blog/hello-world/');
    });

    it('item link combines with SITE_URL to correct absolute URL', () => {
      const siteUrl = 'https://example.com';
      const post = { id: 'my-post', data: { title: 'T', description: 'D', date: new Date() } };
      const item = toRssItem(post);
      expect(new URL(item.link, siteUrl).href).toBe(`${siteUrl}/blog/my-post/`);
    });

    it('pubDate is a Date with the correct value', () => {
      const date = new Date('2025-03-21');
      const item = toRssItem({ id: 'x', data: { title: 'X', description: 'D', date } });
      expect(item.pubDate.toISOString()).toBe(date.toISOString());
    });

    it('content field is populated from post body as HTML', () => {
      const post = {
        id: 'rich-post',
        data: { title: 'Rich', description: 'D', date: new Date() },
        body: '# Heading\n\nSome **bold** text.',
      };
      const item = toRssItem(post);
      expect(item.content).toBeTruthy();
      expect(item.content).toContain('<h1');
      expect(item.content).toContain('<strong>bold</strong>');
    });

    it('content field is empty string when body is undefined', () => {
      const post = {
        id: 'no-body',
        data: { title: 'No Body', description: 'D', date: new Date() },
      };
      const item = toRssItem(post);
      expect(item.content).toBe('');
    });

    it('content field is empty string when body is empty', () => {
      const post = {
        id: 'empty-body',
        data: { title: 'Empty', description: 'D', date: new Date() },
        body: '',
      };
      const item = toRssItem(post);
      expect(item.content).toBe('');
    });

    it('strips script tags from content', () => {
      const post = {
        id: 'xss-post',
        data: { title: 'XSS', description: 'D', date: new Date() },
        body: 'Safe text\n\n<script>alert("xss")</script>',
      };
      const item = toRssItem(post);
      expect(item.content).not.toContain('<script');
      expect(item.content).toContain('Safe text');
    });

    it('allows img tags with src and alt attributes', () => {
      const post = {
        id: 'img-post',
        data: { title: 'Image', description: 'D', date: new Date() },
        body: '![Cover image](./cover.png)',
      };
      const item = toRssItem(post);
      expect(item.content).toContain('<img');
      expect(item.content).toContain('src=');
      expect(item.content).toContain('alt=');
    });
  });
});

describe('rss.xml GET handler (real endpoint)', () => {
  it('returns a Response with RSS XML content-type', async () => {
    const ctx = { site: new URL('https://example.com') };
    const response = await GET(ctx as never);
    expect(response).toBeInstanceOf(Response);
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('xml');
  });

  it('returns RSS feed with correct title and metadata', async () => {
    const ctx = { site: new URL('https://example.com') };
    const response = await GET(ctx as never);
    const text = await response.text();
    expect(text).toContain('AstroStatic Blog');
    expect(text).toContain('<language>en-us</language>');
  });
});
