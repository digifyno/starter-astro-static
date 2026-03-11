import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  const sitemap = context.site ? new URL('sitemap-index.xml', context.site).href : '';
  return new Response(
    `User-agent: *\nAllow: /\n${sitemap ? `\nSitemap: ${sitemap}\n` : ''}`
  );
}
