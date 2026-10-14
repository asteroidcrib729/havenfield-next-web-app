import { getPublishedPosts } from "@/server/blog";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-dynamic";
const xml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
export async function GET() {
  const { posts } = await getPublishedPosts({ limit: 50 });
  const items = posts.filter((post) => !post.noindex && (!post.canonicalUrl || post.canonicalUrl === absoluteUrl(`/journal/${post.slug}`))).map((post) => `<item><title>${xml(post.title)}</title><link>${xml(absoluteUrl(`/journal/${post.slug}`))}</link><guid isPermaLink="true">${xml(absoluteUrl(`/journal/${post.slug}`))}</guid><description>${xml(post.excerpt)}</description>${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}<category>${xml(post.category)}</category></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(site.name)} Journal</title><link>${xml(absoluteUrl("/journal"))}</link><description>Original perspectives on considered homes and everyday living.</description><language>en</language><atom:link href="${xml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "no-store" } });
}
