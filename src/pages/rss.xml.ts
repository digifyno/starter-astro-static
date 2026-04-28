import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  return rss({
    title: 'AstroStatic Blog',
    description: 'A content-heavy static site built with Astro and Tailwind CSS',
    site: context.site!,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    customData: '<language>en-us</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
      ...(post.data.author ? { customData: `<dc:creator>${post.data.author}</dc:creator>` } : {}),
      content: sanitizeHtml(marked.parse(post.body ?? '', { async: false }), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title', 'width', 'height'],
        },
      }),
    })),
  });
}
