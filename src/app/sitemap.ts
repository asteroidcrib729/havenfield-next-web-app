import type { MetadataRoute } from "next";
import { properties } from "@/content/properties";
import { absoluteUrl } from "@/lib/site";
import { getPublishedPosts } from "@/server/blog";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/properties", "/about", "/amenities", "/contact", "/journal", "/privacy", "/terms", "/cookies"].map((path) => ({ url: absoluteUrl(path), changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.7 }));
  const homes = properties.map((property) => ({ url: absoluteUrl(`/properties/${property.slug}`), changeFrequency: "monthly" as const, priority: 0.8 }));
  const stories: MetadataRoute.Sitemap = [];
  let page = 1; let count = 0; let total = 1;
  while (count < total) {
    const result = await getPublishedPosts({ page, limit: 100 }); total = result.total; count += result.posts.length;
    for (const post of result.posts) if (!post.noindex && (!post.canonicalUrl || post.canonicalUrl === absoluteUrl(`/journal/${post.slug}`))) stories.push({ url: absoluteUrl(`/journal/${post.slug}`), lastModified: new Date(post.updatedAt), changeFrequency: "monthly", priority: 0.6 });
    if (!result.posts.length) break; page += 1;
  }
  return [...routes, ...homes, ...stories];
}
