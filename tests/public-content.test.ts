import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlogPost } from "../src/lib/blog-types";
import { ArticleBody } from "../src/components/article-body";

const publishedPosts = vi.hoisted(() => vi.fn());
vi.mock("../src/server/blog", () => ({ getPublishedPosts: publishedPosts }));
import { GET } from "../src/app/rss.xml/route";
import sitemap from "../src/app/sitemap";

function post(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: "story-1",
    slug: "a-quiet-home",
    title: "A quiet home",
    excerpt: "Original ideas for a considered home.",
    body: "A demonstration article with enough words to be a useful example.",
    author: "Havenfield Journal",
    category: "Design",
    tags: ["Light"],
    coverImage: "/media/interior.jpg",
    coverAlt: "Warm interior",
    status: "published",
    publishedAt: "2026-10-01T10:00:00.000Z",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    noindex: false,
    version: 1,
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
    ...overrides,
  };
}

describe("safe public article rendering", () => {
  it("renders author markup as text and refuses executable link protocols", () => {
    const markup = renderToStaticMarkup(
      createElement(ArticleBody, {
        body: '<script>alert("unsafe")</script>\n\n[Unsafe](javascript:alert)\n\n[Story](/journal/story)',
      }),
    );
    expect(markup).not.toContain("<script>");
    expect(markup).not.toContain('alert("unsafe")');
    expect(markup).not.toContain('href="javascript:');
    expect(markup).toContain('href="/journal/story"');
  });
  it("preserves editorial hierarchy, lists, and emphasis", () => {
    const markup = renderToStaticMarkup(
      createElement(ArticleBody, {
        body: "## A lighter room\n\nKeep **daylight** close.\n\n- A reading nook\n- A clear view\n\n> Make room to pause.",
      }),
    );
    expect(markup).toContain("<h2");
    expect(markup).toContain("<strong");
    expect(markup).toContain("<ul");
    expect(markup).toContain("<blockquote");
  });
});

describe("public discovery feeds", () => {
  beforeEach(() => publishedPosts.mockReset());
  it("escapes RSS content and excludes noindex and externally canonical stories", async () => {
    publishedPosts.mockResolvedValue({
      posts: [
        post({ title: "Light & <space>" }),
        post({ id: "private", slug: "not-indexed", noindex: true }),
        post({ id: "external", slug: "elsewhere", canonicalUrl: "https://example.com/original" }),
      ],
      total: 3,
      page: 1,
      limit: 50,
    });
    const response = await GET();
    const body = await response.text();
    expect(response.headers.get("content-type")).toContain("application/rss+xml");
    expect(body).toContain("Light &amp; &lt;space&gt;");
    expect(body).not.toContain("not-indexed");
    expect(body).not.toContain("elsewhere");
  });
  it("includes home and indexable journal routes without exposing administrator routes", async () => {
    publishedPosts.mockResolvedValue({
      posts: [post(), post({ id: "private", slug: "not-indexed", noindex: true })],
      total: 2,
      page: 1,
      limit: 100,
    });
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/journal/a-quiet-home"))).toBe(true);
    expect(urls.some((url) => url.includes("/properties/"))).toBe(true);
    expect(urls.some((url) => url.includes("not-indexed") || url.includes("/admin"))).toBe(false);
  });
});
