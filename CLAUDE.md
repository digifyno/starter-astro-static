# Astro Static Site Starter

## Project Overview

Content-heavy static site built with Astro 6, Tailwind CSS 4, and TypeScript. Outputs pre-rendered HTML with zero JavaScript by default.

Includes `@astrojs/rss` (RSS feed at `/rss.xml`), `@astrojs/sitemap` (auto-generated sitemap), and `@tailwindcss/typography` (prose styling for blog posts).

## Project Structure

```
src/
  components/
    SEO.astro          # Open Graph, Twitter Card, and canonical meta (added to all pages)
  plugins/
    remark-reading-time.mjs  # Custom remark plugin: injects minutesRead (string, e.g. "5 min read") into remarkPluginFrontmatter — access via (await render(post)).remarkPluginFrontmatter.minutesRead
    remark-reading-time.test.mjs  # Unit tests for the reading-time remark plugin (co-located, .mjs to match plugin format)
  content.config.ts     # Content collection schemas (blog)
  content.schema.test.ts  # Unit tests for content collection schema (Zod validation)
  draft-filter.test.ts    # Unit tests for draft post filtering logic
  content/blog/         # Markdown blog posts (frontmatter: title, description, date, tags)
  layouts/
    BaseLayout.astro    # Base HTML layout with nav (Home, Blog, Tags, Search), footer, dark mode support, skip navigation link for WCAG 2.4.1 compliance, and focus-visible ring styles on interactive elements
  pages/
    index.astro         # Landing page (hero, features grid, latest posts)
    404.astro           # Custom 404 error page
    rss.xml.ts          # RSS feed endpoint (/rss.xml)
    robots.txt.ts       # Dynamic robots.txt with sitemap URL
    search.astro        # Pagefind full-text search page (/search); requires production build (shows dev-mode notice in dev); ARIA live region for screen reader result announcements
    blog/
      index.astro       # Blog listing page
      [id].astro        # Individual blog post with JSON-LD BlogPosting + BreadcrumbList schemas (dynamic route)
      [id]/
        og.png.ts       # Per-post OG image generation via Satori + Resvg; draft posts excluded in production builds
      tags/
        index.astro     # Tags index page listing all tags with post counts
        [tag].astro     # Posts filtered by a single tag (with reading time display)
  styles/
    global.css          # Tailwind CSS import
  utils/
    format-date.ts      # Shared date formatting utility (used by blog listing, tag pages, post pages)
    date.test.ts        # Unit tests for date formatting utility
  tests/
    rss.test.ts         # Unit tests for RSS feed generation
    robots.test.ts      # Unit tests for robots.txt generation
public/
  favicon.svg           # Site favicon
  og-default.png        # Default OG image (fallback for non-post pages)
astro.config.mjs        # Astro config (static output, Tailwind vite plugin, Inter+FiraCode fonts via @astrojs/fonts (Astro 6 Fonts API), sourcemaps disabled)
tsconfig.json           # TypeScript config (strict mode)
vitest.config.ts        # Vitest configuration (includes src/**/*.test.ts and src/**/*.test.mjs; coverage via v8 provider)
```

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to dist/ AND run Pagefind search indexing
npm run preview   # Preview built site locally
npm test          # Run unit tests (vitest)
```


## Testing

### File placement convention
- **Unit tests** (utilities, schemas, pure functions): co-located `.test.ts` (or `.test.mjs` for ESM-only modules) next to the file under test.
  - `src/utils/date.test.ts` — tests `format-date.ts`
  - `src/content.schema.test.ts` — tests the content collection schema
  - `src/draft-filter.test.ts` — tests draft filtering logic
  - `src/plugins/remark-reading-time.test.mjs` — tests the reading-time remark plugin
- **Integration tests** (routes, endpoints, multi-module flows): `src/tests/`
  - `src/tests/rss.test.ts` — tests the RSS feed endpoint
  - `src/tests/robots.test.ts` — tests the robots.txt endpoint
  - `src/tests/jsonld.test.ts` — tests JSON-LD BlogPosting and BreadcrumbList schema structure for blog post pages
  - `src/tests/og-image.test.ts` — tests OG image `getStaticPaths` draft filtering (excludes drafts in production, includes in dev)
  - `src/tests/seo.test.ts` — tests SEO component canonical URL normalisation, OG image URL resolution, og:type mapping, and default prop values

### Running tests

```bash
npm test                    # Run all tests (vitest)
npm test -- --coverage      # Run tests with v8 coverage report
```

## Environment Variables

| Variable   | Default               | Purpose |
|------------|-----------------------|---------|
| `SITE_URL` | `https://example.com` | Canonical base URL used in sitemap, OG tags, and canonical `<link>`. Set to your production domain before deploying. |

## Content Collections

Blog posts live in `src/content/blog/` as Markdown files. Each post requires frontmatter:

```yaml
---
title: "Post Title"
description: "Brief description"
date: 2025-01-15
tags: ["tag1", "tag2"]
author: "Author Name"        # optional — used in JSON-LD
image: ./cover.png           # optional — co-located image for OG and post header
draft: false                 # optional — hides from production builds
---
```

The schema is defined in `src/content.config.ts` using Zod validation.

## Adding New Pages

Create `.astro` files in `src/pages/`. File-based routing:
- `src/pages/about.astro` → `/about`
- `src/pages/docs/intro.astro` → `/docs/intro`

Use `BaseLayout` for consistent nav/footer:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page Title">
  <section class="mx-auto max-w-5xl px-4 py-16">
    <!-- content -->
  </section>
</BaseLayout>
```

## Adding Blog Posts

Create a new `.md` file in `src/content/blog/` with the required frontmatter. It will automatically appear in the blog listing and get its own page at `/blog/<filename>`.

Tags in frontmatter automatically generate tag pages:
- `/blog/tags` — index of all tags with post counts (published posts only)
- `/blog/tags/<tag>` — posts filtered by that tag (published posts only)
- Tag chips on the blog listing and individual post pages link to these routes.
- Draft posts are visible in all tag pages during dev (`npm run dev`) but excluded in production builds.

## Styling

Tailwind CSS 4 is configured via the `@tailwindcss/vite` plugin in `astro.config.mjs`. Global styles are in `src/styles/global.css`. Dark mode uses the `dark:` variant with system preference detection.

## Build Output

`npm run build` produces static HTML in `dist/`. Deploy to any static hosting (Nginx, CDN, etc.).

## Health Probes

- **Post-build**: `dist/index.html` must exist
- **Type check**: `ASTRO_TELEMETRY_DISABLED=1 npx astro check` (warning only)

## Content Security Policy

CSP is configured in `astro.config.mjs` via Astro 6's `security.csp` option (not a `<meta>` tag). Current policy: `default-src 'self'` with `wasm-unsafe-eval` added to `script-src` to support Pagefind's WebAssembly search runtime.

To extend the policy, edit the `security.csp` block in `astro.config.mjs`:

```js
security: {
  csp: {
    algorithm: 'SHA-256',
    directives: ["default-src 'self'", "img-src 'self' data:", "font-src 'self'"],
    scriptDirective: {
      resources: ["'self'", "'wasm-unsafe-eval'"],
      // add further resource origins here
    },
  },
},
```
