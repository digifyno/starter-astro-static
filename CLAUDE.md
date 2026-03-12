# Astro Static Site Starter

## Project Overview

Content-heavy static site built with Astro 5, Tailwind CSS 4, and TypeScript. Outputs pre-rendered HTML with zero JavaScript by default.

Includes `@astrojs/rss` (RSS feed at `/rss.xml`), `@astrojs/sitemap` (auto-generated sitemap), and `@tailwindcss/typography` (prose styling for blog posts).

## Project Structure

```
src/
  content.config.ts     # Content collection schemas (blog)
  content/blog/         # Markdown blog posts (frontmatter: title, description, date, tags)
  layouts/
    BaseLayout.astro    # Base HTML layout with nav (Home, Blog, Tags), footer, dark mode support
  pages/
    index.astro         # Landing page (hero, features grid, latest posts)
    404.astro           # Custom 404 error page
    rss.xml.ts          # RSS feed endpoint (/rss.xml)
    robots.txt.ts       # Dynamic robots.txt with sitemap URL
    blog/
      index.astro       # Blog listing page
      [id].astro        # Individual blog post (dynamic route)
      tags/
        index.astro     # Tags index page listing all tags with post counts
        [tag].astro     # Posts filtered by a single tag
  styles/
    global.css          # Tailwind CSS import
public/
  favicon.svg           # Site favicon
astro.config.mjs        # Astro config (static output, Tailwind vite plugin)
tsconfig.json           # TypeScript config (strict mode)
```

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to dist/
npm run preview   # Preview built site locally
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
- `/blog/tags` — index of all tags with post counts
- `/blog/tags/<tag>` — posts filtered by that tag
- Tag chips on the blog listing and individual post pages link to these routes.

## Styling

Tailwind CSS 4 is configured via the `@tailwindcss/vite` plugin in `astro.config.mjs`. Global styles are in `src/styles/global.css`. Dark mode uses the `dark:` variant with system preference detection.

## Build Output

`npm run build` produces static HTML in `dist/`. Deploy to any static hosting (Nginx, CDN, etc.).

## Health Probes

- **Post-build**: `dist/index.html` must exist
- **Type check**: `ASTRO_TELEMETRY_DISABLED=1 npx astro check` (warning only)
