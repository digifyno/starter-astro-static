---
title: "Getting Started with Astro"
description: "Learn how to set up and customize your new Astro static site with Tailwind CSS."
date: 2025-01-15
tags: ["astro", "tutorial"]
---

Welcome to your new Astro static site! This starter comes pre-configured with everything you need to build a fast, content-heavy website.

## Quick Start

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open [localhost:4321](http://localhost:4321) in your browser

## Adding New Pages

Create `.astro` files in `src/pages/` to add new routes. Astro uses file-based routing, so `src/pages/about.astro` becomes `/about`.

## Writing Blog Posts

Add Markdown files to `src/content/blog/`. Each post needs frontmatter with `title`, `description`, and `date` fields.

## Styling

This starter uses Tailwind CSS for styling. Add utility classes directly in your Astro components for rapid development.

## Building for Production

Run `npm run build` to generate static HTML in the `dist/` directory. The output can be deployed to any static hosting provider.
