# Astro 5 Static Site Starter

A content-first static site template with blog, tags, RSS, and dark mode.

## Features

- **Astro 5** — zero client-side JS by default, lightning-fast static output
- **Tailwind CSS 4** — utility-first styling with dark mode support
- **TypeScript** strict mode throughout
- **Blog** with Astro content collections and Zod schema validation
- **Tag system** — auto-generated tag index and per-tag pages
- **RSS feed** at `/rss.xml`
- **Sitemap** auto-generated at `/sitemap-index.xml`
- **Dark mode** via system preference detection
- **CSP meta tag** for content security
- **Accessible focus-visible styles** for keyboard navigation

## Getting Started

```bash
git clone <repo>
cd <repo>
npm install
npm run dev
```

The dev server starts at `http://localhost:4321`.

## Environment Variables

| Variable   | Default               | Purpose |
|------------|-----------------------|---------|
| `SITE_URL` | `https://example.com` | Canonical base URL used in sitemap, OG tags, and canonical `<link>`. Set to your production domain before deploying. |

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

## Adding Blog Posts

Create a `.md` file in `src/content/blog/` with the required frontmatter:

```yaml
---
title: "Post Title"
description: "Brief description"
date: 2025-01-15
tags: ["tag1", "tag2"]
---

Post content here.
```

The post will automatically appear in the blog listing at `/blog/<filename>` and any matching tag pages.

## Build & Deploy

```bash
SITE_URL=https://yourdomain.com npm run build
# Serve dist/ with any static host (Nginx, CDN, etc.)
```

Other commands:

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to dist/
npm run preview   # Preview built site locally
```

## Tech Stack

| Package | Purpose |
|---------|---------|
| [Astro 5](https://astro.build) | Static site framework |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first CSS |
| [@astrojs/rss](https://docs.astro.build/en/guides/rss/) | RSS feed generation |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | Sitemap generation |
| [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | Prose styling for blog posts |
