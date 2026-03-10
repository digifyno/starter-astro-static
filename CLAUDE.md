# Astro Static Site Starter

## Project Overview

Content-heavy static site built with Astro 5, Tailwind CSS 4, and TypeScript. Outputs pre-rendered HTML with zero JavaScript by default.

## Project Structure

```
src/
  content.config.ts     # Content collection schemas (blog)
  content/blog/         # Markdown blog posts (frontmatter: title, description, date, tags)
  layouts/
    BaseLayout.astro    # Base HTML layout with nav, footer, dark mode support
  pages/
    index.astro         # Landing page (hero, features grid, latest posts)
    blog/
      index.astro       # Blog listing page
      [id].astro        # Individual blog post (dynamic route)
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

## Styling

Tailwind CSS 4 is configured via the `@tailwindcss/vite` plugin in `astro.config.mjs`. Global styles are in `src/styles/global.css`. Dark mode uses the `dark:` variant with system preference detection.

## Build Output

`npm run build` produces static HTML in `dist/`. Deploy to any static hosting (Nginx, CDN, etc.).

## Health Probes

- **Post-build**: `dist/index.html` must exist
- **Type check**: `npx astro check` (warning only)
