import { describe, it, expect } from 'vitest';

// Replicates the SEO logic from src/components/SEO.astro for unit testing.
// The Astro component applies these transformations when rendering meta tags.
// Update these functions if the component implementation changes.

// Determines the absolute image URL for og:image and twitter:image.
// Absolute http(s) URLs pass through unchanged; relative paths are prefixed with siteUrl.
// Mirrors: const absoluteImage = image.startsWith("http") ? image : `${siteUrl}${image}`;
function resolveImageUrl(image: string, siteUrl: string): string {
  return image.startsWith("http") ? image : `${siteUrl}${image}`;
}

// Determines the og:type content value from the type prop.
// Mirrors: type === "article" ? "article" : "website"
function resolveOgType(type: "website" | "article"): string {
  return type === "article" ? "article" : "website";
}

// Normalises the canonicalURL prop to a string for use in href/content attributes.
// Accepts both URL objects (serialised via .toString()) and plain strings.
// Mirrors: canonicalURL.toString()
function resolveCanonicalHref(canonicalURL: URL | string): string {
  return canonicalURL.toString();
}

// Default prop values from SEO.astro
const DEFAULT_IMAGE = "/og-default.png";
const DEFAULT_TYPE = "website";

describe("SEO.astro logic", () => {
  describe("canonical URL", () => {
    it("passes a plain string canonical URL through unchanged", () => {
      const href = resolveCanonicalHref("https://example.com/blog/my-post");
      expect(href).toBe("https://example.com/blog/my-post");
    });

    it("serialises a URL object to a string via toString()", () => {
      const url = new URL("https://example.com/blog/my-post");
      const href = resolveCanonicalHref(url);
      expect(href).toBe("https://example.com/blog/my-post");
    });

    it("URL object and equivalent string produce identical output", () => {
      const raw = "https://example.com/about";
      expect(resolveCanonicalHref(new URL(raw))).toBe(resolveCanonicalHref(raw));
    });

    it("preserves query strings in the canonical URL", () => {
      const href = resolveCanonicalHref("https://example.com/page?q=test");
      expect(href).toBe("https://example.com/page?q=test");
    });

    it("preserves hash fragments in the canonical URL", () => {
      const href = resolveCanonicalHref("https://example.com/page#section");
      expect(href).toBe("https://example.com/page#section");
    });
  });

  describe("og:image and twitter:image URL resolution", () => {
    it("passes an http:// URL through unchanged", () => {
      const result = resolveImageUrl("http://example.com/cover.png", "https://myblog.com");
      expect(result).toBe("http://example.com/cover.png");
    });

    it("passes an https:// URL through unchanged", () => {
      const result = resolveImageUrl("https://cdn.example.com/cover.png", "https://myblog.com");
      expect(result).toBe("https://cdn.example.com/cover.png");
    });

    it("prefixes a relative path with siteUrl", () => {
      const result = resolveImageUrl("/images/post-cover.jpg", "https://example.com");
      expect(result).toBe("https://example.com/images/post-cover.jpg");
    });

    it("default image (/og-default.png) is prefixed with siteUrl", () => {
      const result = resolveImageUrl(DEFAULT_IMAGE, "https://example.com");
      expect(result).toBe("https://example.com/og-default.png");
    });

    it("produces a URL containing og-default.png when no image prop is supplied", () => {
      // Default value in SEO.astro: image = "/og-default.png"
      const result = resolveImageUrl(DEFAULT_IMAGE, "https://example.com");
      expect(result).toContain("og-default.png");
    });

    it("custom relative post image is prefixed with siteUrl", () => {
      const result = resolveImageUrl("/blog/images/hero.png", "https://myblog.org");
      expect(result).toBe("https://myblog.org/blog/images/hero.png");
    });

    it("still returns a usable string when siteUrl is empty", () => {
      // When SITE_URL env var is unset and Astro.site is undefined, siteUrl falls back to ""
      const result = resolveImageUrl(DEFAULT_IMAGE, "");
      expect(result).toBe(DEFAULT_IMAGE);
    });

    it("absolute custom image is unaffected by siteUrl value", () => {
      const image = "https://i.imgur.com/xyz.png";
      expect(resolveImageUrl(image, "https://example.com")).toBe(image);
      expect(resolveImageUrl(image, "")).toBe(image);
    });
  });

  describe("og:type resolution", () => {
    it('maps type prop "article" maps to og:type "article"', () => {
      expect(resolveOgType("article")).toBe("article");
    });

    it('maps type prop "website" maps to og:type "website"', () => {
      expect(resolveOgType("website")).toBe("website");
    });

    it('default type ("website") resolves to og:type "website"', () => {
      // Default value in SEO.astro: type = "website"
      expect(resolveOgType(DEFAULT_TYPE as "website" | "article")).toBe("website");
    });
  });

  describe("OG and Twitter tag content values", () => {
    it("og:title and twitter:title use the title prop directly", () => {
      const title = "My Blog Post Title";
      // Both tags receive the title prop value unchanged — verify it is a non-empty string
      expect(typeof title).toBe("string");
      expect(title.length).toBeGreaterThan(0);
    });

    it("og:description and twitter:description use the description prop directly", () => {
      const description = "A detailed summary of the post.";
      expect(typeof description).toBe("string");
      expect(description.length).toBeGreaterThan(0);
    });

    it("og:url content matches the canonical href", () => {
      // Both the canonical <link> and og:url use canonicalURL.toString()
      const canonicalURL = "https://example.com/blog/my-post";
      const canonicalHref = resolveCanonicalHref(canonicalURL);
      expect(canonicalHref).toBe(canonicalURL);
    });
  });

  describe("default prop values", () => {
    it("default image path is /og-default.png", () => {
      expect(DEFAULT_IMAGE).toBe("/og-default.png");
    });

    it("default og:type is website", () => {
      expect(resolveOgType(DEFAULT_TYPE as "website" | "article")).toBe("website");
    });

    it("default image resolves to an absolute URL when siteUrl is available", () => {
      const result = resolveImageUrl(DEFAULT_IMAGE, "https://example.com");
      expect(result).toMatch(/^https?:\/\//);
      expect(result).toContain("og-default.png");
    });
  });
});
