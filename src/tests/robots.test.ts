import { describe, it, expect } from 'vitest';

// Replicates the robots.txt generation logic from robots.txt.ts.
// The real endpoint receives an Astro APIContext and uses context.site.
function generateRobotsTxt(siteUrl: string | undefined): string {
  const sitemap = siteUrl ? new URL('sitemap-index.xml', siteUrl).href : '';
  return `User-agent: *\nAllow: /\n${sitemap ? `\nSitemap: ${sitemap}\n` : ''}`;
}

describe('robots.txt output', () => {
  it('includes User-agent: * directive', () => {
    const output = generateRobotsTxt('https://example.com');
    expect(output).toContain('User-agent: *');
  });

  it('includes Allow: / directive', () => {
    const output = generateRobotsTxt('https://example.com');
    expect(output).toContain('Allow: /');
  });

  it('includes Sitemap line with correct URL when site is provided', () => {
    const output = generateRobotsTxt('https://example.com');
    expect(output).toContain('Sitemap: https://example.com/sitemap-index.xml');
  });

  it('uses SITE_URL value in the Sitemap line', () => {
    const siteUrl = 'https://my-blog.org';
    const output = generateRobotsTxt(siteUrl);
    expect(output).toContain(`Sitemap: ${siteUrl}/sitemap-index.xml`);
  });

  it('omits the Sitemap line when site is undefined', () => {
    const output = generateRobotsTxt(undefined);
    expect(output).not.toContain('Sitemap');
  });

  it('still includes User-agent and Allow directives when site is undefined', () => {
    const output = generateRobotsTxt(undefined);
    expect(output).toContain('User-agent: *');
    expect(output).toContain('Allow: /');
  });

  it('sitemap URL points to sitemap-index.xml (not sitemap.xml)', () => {
    const output = generateRobotsTxt('https://example.com');
    expect(output).toContain('sitemap-index.xml');
    expect(output).not.toContain('sitemap.xml\n');
  });
});
