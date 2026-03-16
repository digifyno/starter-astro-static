import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

export const prerender = true;

// Load Inter fonts from inter-font package (TTF format required by satori)
function loadFont(weight: 'Light' | 'Regular' | 'Bold'): Buffer {
  // Walk up from this file's location to find node_modules
  const here = dirname(fileURLToPath(import.meta.url));
  // In prerender context, cwd() is the project root
  return readFileSync(
    resolve(process.cwd(), `node_modules/inter-font/ttf/Inter-${weight}.ttf`)
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { id: post.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === params.id);
  if (!post) return new Response('Not found', { status: 404 });

  const siteUrl = import.meta.env.SITE_URL ?? 'https://example.com';
  const hostname = new URL(siteUrl).hostname;

  const fontRegular = loadFont('Regular');
  const fontBold = loadFont('Bold');

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'p',
            props: {
              style: { fontSize: 24, color: '#94a3b8', margin: '0 0 8px 0', fontWeight: 400 },
              children: hostname,
            },
          },
          {
            type: 'h1',
            props: {
              style: {
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.2,
                margin: '16px 0',
              },
              children: post.data.title,
            },
          },
          {
            type: 'p',
            props: {
              style: { fontSize: 20, color: '#94a3b8', margin: '0', fontWeight: 400 },
              children: post.data.date.toLocaleDateString('en-US', {
                dateStyle: 'medium',
              }),
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
