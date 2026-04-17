import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const prerender = true;

const fontRegular = readFileSync(resolve(process.cwd(), 'node_modules/inter-font/ttf/Inter-Regular.ttf'));
const fontBold    = readFileSync(resolve(process.cwd(), 'node_modules/inter-font/ttf/Inter-Bold.ttf'));

export const getStaticPaths: GetStaticPaths = async () => {
  const isDev = import.meta.env.DEV;
  const posts = await getCollection('blog', ({ data }) => isDev || !data.draft);
  return posts.map((post) => ({ params: { id: post.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === params.id);
  if (!post) return new Response('Not found', { status: 404 });

  const siteUrl = import.meta.env.SITE_URL ?? 'https://example.com';
  const hostname = new URL(siteUrl).hostname;

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
              style: {
                fontSize: 22,
                color: '#cbd5e1',
                margin: '8px 0',
                fontWeight: 400,
                lineHeight: 1.4,
              },
              children: post.data.description.length > 120
                ? post.data.description.slice(0, 117) + '…'
                : post.data.description,
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

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
