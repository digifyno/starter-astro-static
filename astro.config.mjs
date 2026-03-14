import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Explicitly disable sourcemaps to prevent .map file exposure (CVE-2024-56159 defense-in-depth)
      // Sourcemaps in dist/ can expose server source code to unauthenticated attackers.
      sourcemap: false,
    },
  },
});
