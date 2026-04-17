import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  output: 'static',
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  integrations: [
    sitemap({
      serialize: (() => {
        /** @type {Map<string, string> | null} */
        let postDates = null;

        return (item) => {
          if (!postDates) {
            const contentDir = resolve(__dirname, 'src', 'content', 'blog');
            const files = readdirSync(contentDir).filter((f) => f.endsWith('.md'));
            postDates = new Map();
            for (const file of files) {
              const content = readFileSync(join(contentDir, file), 'utf-8');
              const { data } = matter(content);
              if (data.draft === true) continue;
              const rawDate = data.updatedDate ?? data.date;
              if (!rawDate) continue;
              const id = basename(file, '.md');
              postDates.set(`/blog/${id}/`, new Date(rawDate).toISOString());
            }
          }

          const path = new URL(item.url).pathname;
          const date = postDates.get(path);
          if (date) item.lastmod = date;
          return item;
        };
      })(),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Fira Code',
      cssVariable: '--font-mono',
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['@resvg/resvg-js'],
    },
    build: {
      // Explicitly disable sourcemaps to prevent .map file exposure (CVE-2024-56159 defense-in-depth)
      // Sourcemaps in dist/ can expose server source code to unauthenticated attackers.
      sourcemap: false,
    },
  },
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "worker-src 'self'",
      ],
      scriptDirective: {
        resources: ["'self'", "'wasm-unsafe-eval'"],
      },
    },
  },
});
