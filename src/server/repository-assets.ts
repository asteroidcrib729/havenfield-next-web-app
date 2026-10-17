import { getDatabase } from "./database";
import { repositoryAssets } from "../content/asset-library";
import { AppError } from "./errors";
export async function repositoryAssetReferences(url: string) {
  if (!repositoryAssets.some((asset) => asset.url === url))
    throw new AppError(404, "not_found", "Repository image not found");
  const db = await getDatabase(),
    pattern = "%" + url.replace(/[\\%_]/g, "\\$&") + "%";
  const [posts, revisions, properties, propertyHistory, recoveries] = await Promise.all([
    db.query("SELECT id,title FROM posts WHERE cover_image=? OR body LIKE ? ESCAPE '\\'", [
      url,
      pattern,
    ]),
    db.query(
      "SELECT DISTINCT p.id,p.title FROM post_revisions r JOIN posts p ON p.id=r.post_id WHERE r.snapshot LIKE ? ESCAPE '\\'",
      [pattern],
    ),
    db.query("SELECT id,content FROM properties WHERE content LIKE ? ESCAPE '\\'", [pattern]),
    db.query(
      "SELECT DISTINCT p.id,p.content FROM property_revisions r JOIN properties p ON p.id=r.property_id WHERE r.snapshot LIKE ? ESCAPE '\\'",
      [pattern],
    ),
    db.query("SELECT key,post_id FROM article_autosaves WHERE snapshot LIKE ? ESCAPE '\\'", [
      pattern,
    ]),
  ]);
  const fixedPages: Record<string, string[]> = {
    "home-breakfast": ["/"],
    "home-arrival": ["/"],
    "about-materials": ["/about", "/privacy", "/terms", "/cookies", "/admin/login"],
    "about-workshop": ["/about"],
    "amenities-garden": ["/amenities"],
    "amenities-terrace": ["/amenities"],
    "amenities-path": ["/amenities"],
    "journal-masthead": ["/journal"],
    "contact-studio": ["/contact"],
  };
  const filename = url.split("/").pop()?.replace(".webp", "") || "";
  return [
    ...(fixedPages[filename] || []).map((route) => ({
      id: route,
      title: "Page: " + route,
      kind: "repository placement",
      href: route,
    })),
    ...posts.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      kind: "article",
      href: "/admin/posts/" + row.id,
    })),
    ...revisions.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      kind: "article revision",
      href: "/admin/posts/" + row.id,
    })),
    ...properties.map((row) => ({
      id: String(row.id),
      title: JSON.parse(String(row.content)).name as string,
      kind: "property",
      href: "/admin/properties/" + row.id,
    })),
    ...propertyHistory.map((row) => ({
      id: String(row.id),
      title: JSON.parse(String(row.content)).name as string,
      kind: "property revision",
      href: "/admin/properties/" + row.id,
    })),
    ...recoveries.map((row) => ({
      id: String(row.key),
      title: "Interrupted article recovery",
      kind: "recovery",
      href: row.post_id ? "/admin/posts/" + row.post_id : "/admin/posts/new",
    })),
  ];
}
