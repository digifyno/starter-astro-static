---
title: "Tailwind CSS Tips for Astro Projects"
description: "Practical tips for using Tailwind CSS effectively in your Astro components."
date: 2025-01-05
tags: ["tailwind", "css", "tips"]
---

Tailwind CSS pairs perfectly with Astro's component model. Here are some tips to get the most out of it.

## Use Component Scoping

Astro components have scoped styles by default, but Tailwind utilities work globally. Use Tailwind for layout and spacing, and scoped styles for component-specific animations.

## Dark Mode

This starter supports dark mode via Tailwind's `dark:` variant. The dark mode class is applied based on the user's system preference.

```html
<div class="bg-white dark:bg-gray-950">
  <p class="text-gray-900 dark:text-gray-100">Adapts automatically</p>
</div>
```

## Responsive Design

Use Tailwind's responsive prefixes to build layouts that work on every screen size:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- Cards adapt to screen width -->
</div>
```

## Custom Styles

Extend Tailwind in your CSS file at `src/styles/global.css` to add custom utilities or override defaults.
