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
    remark-reading-time.mjs  # Custom remark plugin: injects minutesRead (string, e.g. "5 min read") into remarkPluginFrontmatter — access via (await render(post)).remarkPluginFrontmatter.minutesRead. Imports `reading-time` and `unist-util-visit` directly (both declared as devDependencies); the `remark-reading-time` npm package is NOT used.
    remark-reading-time.test.mjs  # Unit tests for the reading-time remark plugin (co-located, .mjs to match plugin format)
  content.config.ts     # Content collection schemas (blog)
  content.schema.test.ts  # Unit tests for content collection schema (Zod validation); covers required fields, optional fields (author, image, imageAlt), defaults, and type rejection
  draft-filter.test.ts    # Unit tests for draft post filtering logic
  content/blog/         # Markdown blog posts (frontmatter: title, description, date, tags)
  layouts/
    BaseLayout.astro    # Base HTML layout with nav (Home, Blog, Tags, Search), footer, dark mode support, skip navigation link for WCAG 2.4.1 compliance, focus-visible ring styles on interactive elements, and lang="en" on the html element for WCAG 3.1.1 compliance
  pages/
    index.astro         # Landing page (hero, features grid, latest posts)
    404.astro           # Custom 404 error page
    rss.xml.ts          # RSS feed endpoint (/rss.xml)
    robots.txt.ts       # Dynamic robots.txt with sitemap URL
    search.astro        # Pagefind full-text search page (/search); requires production build (shows dev-mode notice in dev); ARIA live region for screen reader result announcements
    blog/
      index.astro       # Blog listing page
      [id].astro        # Individual blog post with JSON-LD BlogPosting + BreadcrumbList schemas (dynamic route); passes Satori-generated og.png URL as image={ogImageUrl} to BaseLayout
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
    rss.test.ts                   # Unit tests for RSS feed generation
    robots.test.ts                # Unit tests for robots.txt generation
    jsonld.test.ts                # Unit tests for JSON-LD BlogPosting and BreadcrumbList schema structure for blog post pages
    seo.test.ts                   # Unit tests for SEO component canonical URL normalisation, OG image URL resolution, og:type mapping, and default prop values
    tags.test.ts                  # Integration tests: draft filtering, tag filtering, tag count building, tag sorting, reading-time display for tag pages
    tag-chip-focus-rings.test.ts  # Integration tests: tag chips carry focus-visible:outline styles for WCAG keyboard focus
    blog-listing.test.ts          # Integration tests: blog listing draft filter, date sort (newest first), reading-time fallback, post/tag link hrefs, post card data completeness
    tags-index.test.ts            # Integration tests: tags index draft filter, tag count building, tag sort (count desc then alpha), tag href generation
    404.test.ts                   # Integration tests: 404 page structure, BaseLayout usage, heading, home link, explanatory copy
    index.test.ts                 # Integration tests: homepage latest-posts draft exclusion (prod filter), newest-first date sort, slice to 3
    search.test.ts                # Source-level structural tests: Pagefind script/CSS references, noscript fallback, ARIA live region (aria-live="polite"), dev-mode notice
    base-layout.test.ts           # Source-level structural tests: skip navigation link (WCAG 2.4.1), nav completeness (Home, Blog, Tags, Search), focus-visible ring styles, dark mode support
    post-routes.test.ts           # Source-level structural tests: [id].astro and og.png.ts exclude draft posts in getStaticPaths (prevents draft URL/OG image leakage in production)
    post-page.test.ts              # Source-level structural tests: reading time display (minutesRead), tag chip links to /blog/tags/, JSON-LD BlogPosting + BreadcrumbList presence, and cover image alt text binding
    astro-config.test.ts          # Source-level structural tests: CSP directives (default-src, img-src, font-src, worker-src), wasm-unsafe-eval for Pagefind WebAssembly, SHA-256 algorithm, sourcemap disabled
    og-image.test.ts              # Source-level structural tests: og.png.ts GET handler — Content-Type, Satori dimensions (1200x630), font loading, post title/date rendering, Resvg PNG output
public/
  favicon.svg           # Site favicon
  og-default.png        # Default OG image (fallback for non-post pages)
astro.config.mjs        # Astro config (static output, Tailwind vite plugin, Inter+FiraCode fonts via Astro 6 Fonts API (fontProviders.fontsource() from astro/config; Font component from astro:assets), sourcemaps disabled)
tsconfig.json           # TypeScript config (strict mode)
vitest.config.ts        # Vitest configuration (includes src/**/*.test.ts and src/**/*.test.mjs; coverage via v8 provider; enforces coverage thresholds: statements 21%, branches 23%, functions 20%, lines 21%)
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
  - `src/content.schema.test.ts` — tests the content collection schema (required fields, optional fields including `image` and `imageAlt`, defaults, type rejection)
  - `src/draft-filter.test.ts` — tests draft filtering logic
  - `src/plugins/remark-reading-time.test.mjs` — tests the reading-time remark plugin
- **Integration tests** (routes, endpoints, multi-module flows): `src/tests/`
  - `src/tests/rss.test.ts` — tests the RSS feed endpoint
  - `src/tests/robots.test.ts` — tests the robots.txt endpoint
  - `src/tests/jsonld.test.ts` — tests JSON-LD BlogPosting and BreadcrumbList schema structure for blog post pages
  - `src/tests/seo.test.ts` — tests SEO component canonical URL normalisation, OG image URL resolution, og:type mapping, and default prop values
  - `src/tests/tags.test.ts` — tests draft filtering, tag filtering, tag count building, tag sorting, and reading-time display for tag pages
  - `src/tests/tag-chip-focus-rings.test.ts` — tests that tag chips on all pages carry `focus-visible:outline` styles for WCAG keyboard focus
  - `src/tests/blog-listing.test.ts` — tests blog listing draft filter, date sort (newest first), reading-time fallback, post/tag link hrefs, and post card data completeness
  - `src/tests/tags-index.test.ts` — tests tags index draft filter, tag count building (flatMap+reduce), tag sort (count desc then alpha), tag href generation, and the full pipeline
  - `src/tests/404.test.ts` — tests 404 page source structure: BaseLayout usage, heading, home link, and explanatory copy
  - `src/tests/index.test.ts` — tests homepage (index.astro) latest-posts draft exclusion, newest-first date sort, and slice-to-3 count
  - `src/tests/search.test.ts` — source-level structural tests for search.astro: Pagefind script/CSS references, noscript fallback, ARIA live region (`aria-live="polite"`), and dev-mode notice
  - `src/tests/post-routes.test.ts` — source-level structural tests: `[id].astro` and `og.png.ts` both exclude draft posts in `getStaticPaths` (prevents draft URLs and OG image endpoints from being exposed in production)
  - `src/tests/post-page.test.ts` — source-level structural tests for `[id].astro`: reading time display, tag chip links to `/blog/tags/`, JSON-LD BlogPosting + BreadcrumbList presence, and cover image alt text binding
  - `src/tests/astro-config.test.ts` — source-level structural tests for `astro.config.mjs`: CSP directives (`default-src`, `img-src`, `font-src`, `worker-src`), `wasm-unsafe-eval` for Pagefind WebAssembly, SHA-256 algorithm, and sourcemap disabled
  - `src/tests/og-image.test.ts` — source-level structural tests for `og.png.ts` GET handler: Content-Type, Satori dimensions (1200x630), font loading, post title/date rendering, Resvg PNG output

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
image: ./cover.png           # optional — co-located image rendered as visual post header (not used for og:image)
imageAlt: "Description of the cover image"  # optional — recommended when image is set
draft: false                 # optional — hides from production builds
---
```

The schema is defined in `src/content.config.ts` using Zod validation.

### Image pipeline

When a blog post includes a cover image, the following data flow applies:

- **With `image` set**: The post renders the cover image as a visual header via Astro's `<Image>` component. The `og:image` meta tag is NOT set from the frontmatter `image`; it always points to the Satori-generated `/blog/{id}/og.png`.
- **Without `image`**: No visual header is rendered. The `og:image` meta tag still points to the per-post Satori OG image (`/blog/{id}/og.png`), not `public/og-default.png` (which is only the fallback for non-post pages).

**Co-located image constraint**: Images referenced in frontmatter must be placed **in the same directory as the `.md` file** (i.e., `src/content/blog/`) and referenced with a relative `./` path (e.g., `image: ./cover.png`). Images stored in `public/` cannot be used as co-located frontmatter images — Astro's asset pipeline requires co-located assets to be importable relative to the content file.

**`imageAlt` requirement**: `imageAlt` should be provided whenever `image` is set. Omitting it will render the cover `<img>` with an empty `alt=""` attribute (treated as decorative by screen readers).

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

CSP is configured in `astro.config.mjs` via Astro 6's `security.csp` option (not a `<meta>` tag). Current policy: `default-src 'self'`, `img-src 'self' data:`, `font-src 'self'`, and `worker-src 'self'` (in `directives`), plus `wasm-unsafe-eval` (in `scriptDirective`) — the latter two required for Pagefind's Web Worker and WebAssembly search runtime.

To extend the policy, edit the `security.csp` block in `astro.config.mjs`:

```js
security: {
  csp: {
    algorithm: 'SHA-256',
    directives: ["default-src 'self'", "img-src 'self' data:", "font-src 'self'", "worker-src 'self'"],
    scriptDirective: {
      resources: ["'self'", "'wasm-unsafe-eval'"],
      // add further resource origins here
    },
  },
},
```
