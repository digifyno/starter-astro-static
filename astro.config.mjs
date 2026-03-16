import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  output: 'static',
  integrations: [sitemap()],
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
    build: {
      // Explicitly disable sourcemaps to prevent .map file exposure (CVE-2024-56159 defense-in-depth)
      // Sourcemaps in dist/ can expose server source code to unauthenticated attackers.
      sourcemap: false,
    },
  },
  csp: {
    algorithm: 'SHA-256',
    directives: {
      'default-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'font-src': ["'self'"],
    },
  },
});
