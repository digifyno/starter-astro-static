import { describe, it, expect } from 'vitest';

// Replicates JSON-LD schema-building logic from src/pages/blog/[id].astro
// Update these functions if the page implementation changes.

type PostData = {
  title: string;
  description: string;
  date: Date;
  tags: string[];
  author?: string;
  draft?: boolean;
  updatedDate?: Date;
};

function buildBlogPostingSchema(postData: PostData, postUrl: string, ogImageUrl: string, siteBase = 'https://example.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postData.title,
    description: postData.description,
    datePublished: postData.date.toISOString(),
    dateModified: (postData.updatedDate ?? postData.date).toISOString(),
    author: { '@type': 'Person', name: postData.author ?? 'Site Author' },
    publisher: {
      '@type': 'Organization',
      name: 'AstroStatic',
      url: new URL('/', siteBase).href,
    },
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    image: ogImageUrl,
    inLanguage: 'en-US',
    keywords: postData.tags.join(', '),
  };
}

function buildBreadcrumbSchema(siteBase: string, postTitle: string, postUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', siteBase).href },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: new URL('/blog', siteBase).href },
      { '@type': 'ListItem', position: 3, name: postTitle, item: postUrl },
    ],
  };
}

// Draft-post filter: mirrors how getCollection excludes drafts in production.
const isPublished = ({ data }: { data: { draft?: boolean } }) => !data.draft;

const SITE = 'https://example.com';
const OG_IMAGE_URL = `${SITE}/blog/hello-world/og.png`;

const publishedPost: PostData = {
  title: 'Hello World',
  description: 'An introductory post',
  date: new Date('2025-01-15T00:00:00.000Z'),
  tags: ['astro', 'web'],
  author: 'Jane Doe',
};

const minimalPost: PostData = {
  title: 'Minimal Post',
  description: 'A post with no optional fields',
  date: new Date('2024-06-01T00:00:00.000Z'),
  tags: [],
};

describe('JSON-LD schemas for blog post pages', () => {
  describe('BlogPosting schema', () => {
    it('@context is https://schema.org', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema['@context']).toBe('https://schema.org');
    });

    it('@type is BlogPosting', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema['@type']).toBe('BlogPosting');
    });

    it('headline maps to post title frontmatter', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.headline).toBe('Hello World');
    });

    it('description maps to post description frontmatter', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.description).toBe('An introductory post');
    });

    it('datePublished is an ISO 8601 string of the post date', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.datePublished).toBe('2025-01-15T00:00:00.000Z');
      // Must be parseable as a valid date
      expect(() => new Date(schema.datePublished)).not.toThrow();
      expect(new Date(schema.datePublished).toISOString()).toBe(schema.datePublished);
    });

    it('author.name maps to post author frontmatter when present', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.author.name).toBe('Jane Doe');
    });

    it('author.name falls back to "Site Author" when author frontmatter is absent', () => {
      const schema = buildBlogPostingSchema(minimalPost, `${SITE}/blog/minimal-post`, `${SITE}/blog/minimal-post/og.png`);
      expect(schema.author.name).toBe('Site Author');
    });

    it('author has @type Person', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.author['@type']).toBe('Person');
    });

    it('url is an absolute URL containing the post path', () => {
      const postUrl = `${SITE}/blog/hello-world`;
      const schema = buildBlogPostingSchema(publishedPost, postUrl, OG_IMAGE_URL);
      expect(schema.url).toMatch(/^https?:\/\//);
      expect(schema.url).toContain('/blog/hello-world');
    });

    it('image is the absolute OG image URL', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.image).toBe(OG_IMAGE_URL);
      expect(schema.image).toMatch(/^https?:\/\//);
    });

    it('keywords is a comma-separated string of post tags', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.keywords).toBe('astro, web');
    });

    it('keywords is an empty string when tags array is empty', () => {
      const schema = buildBlogPostingSchema(minimalPost, `${SITE}/blog/minimal-post`, `${SITE}/blog/minimal-post/og.png`);
      expect(schema.keywords).toBe('');
    });

    it('dateModified falls back to datePublished when updatedDate is absent', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.dateModified).toBe('2025-01-15T00:00:00.000Z');
      expect(new Date(schema.dateModified).toISOString()).toBe(schema.dateModified);
    });

    it('dateModified uses updatedDate when present', () => {
      const updatedPost: PostData = { ...publishedPost, updatedDate: new Date('2026-03-01T00:00:00.000Z') };
      const schema = buildBlogPostingSchema(updatedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.dateModified).toBe('2026-03-01T00:00:00.000Z');
      expect(schema.datePublished).toBe('2025-01-15T00:00:00.000Z');
    });

    it('publisher has @type Organization', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.publisher['@type']).toBe('Organization');
    });

    it('publisher name is AstroStatic', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.publisher.name).toBe('AstroStatic');
    });

    it('publisher url points to the site root', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL, SITE);
      expect(schema.publisher.url).toBe(`${SITE}/`);
    });

    it('mainEntityOfPage has @type WebPage', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.mainEntityOfPage['@type']).toBe('WebPage');
    });

    it('mainEntityOfPage @id matches the post URL', () => {
      const postUrl = `${SITE}/blog/hello-world`;
      const schema = buildBlogPostingSchema(publishedPost, postUrl, OG_IMAGE_URL);
      expect(schema.mainEntityOfPage['@id']).toBe(postUrl);
    });

    it('inLanguage is en-US', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      expect(schema.inLanguage).toBe('en-US');
    });

    it('schema is valid JSON (round-trips through JSON.parse)', () => {
      const schema = buildBlogPostingSchema(publishedPost, `${SITE}/blog/hello-world`, OG_IMAGE_URL);
      const parsed = JSON.parse(JSON.stringify(schema));
      expect(parsed['@type']).toBe('BlogPosting');
      expect(parsed.headline).toBe(publishedPost.title);
    });
  });

  describe('BreadcrumbList schema', () => {
    const postUrl = `${SITE}/blog/hello-world`;

    it('@context is https://schema.org', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      expect(schema['@context']).toBe('https://schema.org');
    });

    it('@type is BreadcrumbList', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      expect(schema['@type']).toBe('BreadcrumbList');
    });

    it('contains exactly three ListItem entries (Home → Blog → Post)', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      expect(schema.itemListElement).toHaveLength(3);
    });

    it('each entry has @type ListItem', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      for (const item of schema.itemListElement) {
        expect(item['@type']).toBe('ListItem');
      }
    });

    it('positions are 1, 2, 3 in order', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[2].position).toBe(3);
    });

    it('first item is Home pointing to the site root', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      const home = schema.itemListElement[0];
      expect(home.name).toBe('Home');
      expect(home.item).toBe(`${SITE}/`);
    });

    it('second item is Blog pointing to /blog', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      const blog = schema.itemListElement[1];
      expect(blog.name).toBe('Blog');
      expect(blog.item).toBe(`${SITE}/blog`);
    });

    it('third item is the post title linking to the post URL', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      const post = schema.itemListElement[2];
      expect(post.name).toBe('Hello World');
      expect(post.item).toBe(postUrl);
    });

    it('all item URLs are absolute (include site base URL)', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      for (const item of schema.itemListElement) {
        expect(item.item).toMatch(/^https?:\/\//);
        expect(item.item).toContain('example.com');
      }
    });

    it('item URLs are correct with a trailing-slash site base', () => {
      const schemaWithSlash = buildBreadcrumbSchema(`${SITE}/`, 'Hello World', postUrl);
      const schemaWithout = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      expect(schemaWithSlash.itemListElement[0].item).toBe(schemaWithout.itemListElement[0].item);
    });

    it('schema is valid JSON (round-trips through JSON.parse)', () => {
      const schema = buildBreadcrumbSchema(SITE, 'Hello World', postUrl);
      const parsed = JSON.parse(JSON.stringify(schema));
      expect(parsed['@type']).toBe('BreadcrumbList');
      expect(parsed.itemListElement).toHaveLength(3);
    });
  });

  describe('draft post exclusion', () => {
    it('includes posts where draft is false', () => {
      expect(isPublished({ data: { draft: false } })).toBe(true);
    });

    it('includes posts where draft is undefined', () => {
      expect(isPublished({ data: {} })).toBe(true);
    });

    it('excludes posts where draft is true', () => {
      expect(isPublished({ data: { draft: true } })).toBe(false);
    });

    it('filters a mixed list to only published posts', () => {
      const posts = [
        { id: 'pub-a', data: { draft: false } },
        { id: 'draft-b', data: { draft: true } },
        { id: 'pub-c', data: {} },
      ];
      const published = posts.filter(isPublished);
      expect(published).toHaveLength(2);
      expect(published.map((p) => p.id)).toEqual(['pub-a', 'pub-c']);
    });

    it('draft post data still builds a valid schema (schema itself is draft-agnostic)', () => {
      const draftPost: PostData = { ...minimalPost, draft: true };
      const schema = buildBlogPostingSchema(draftPost, `${SITE}/blog/draft-post`, `${SITE}/blog/draft-post/og.png`);
      // The schema itself has no concept of draft; exclusion happens at getStaticPaths level
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBe(draftPost.title);
    });
  });
});
