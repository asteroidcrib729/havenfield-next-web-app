import { randomUUID } from "node:crypto";
import type {
  BlogPost,
  BlogPostInput,
  BlogRevision,
  PostList,
  PostStatus,
} from "../lib/blog-types";
import { blogPostSchema } from "../lib/blog-schema";
import { getDatabase, type Database } from "./database";
import { AppError } from "./errors";
import { recordAction } from "./audit";
import { refreshMediaReferences } from "./media-registry";

type Row = Record<string, unknown>;
const columns =
  "id,slug,title,excerpt,body,author,category,tags,cover_image,cover_alt,status,published_at,seo_title,seo_description,canonical_url,noindex,version,created_at,updated_at";
function fromRow(row: Row): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt),
    body: String(row.body),
    author: String(row.author),
    category: String(row.category),
    tags: JSON.parse(String(row.tags)),
    coverImage: String(row.cover_image),
    coverAlt: String(row.cover_alt),
    status: row.status as PostStatus,
    publishedAt: row.published_at == null ? null : String(row.published_at),
    seoTitle: String(row.seo_title),
    seoDescription: String(row.seo_description),
    canonicalUrl: String(row.canonical_url),
    noindex: Boolean(row.noindex),
    version: Number(row.version),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
function values(post: BlogPost): unknown[] {
  return [
    post.id,
    post.slug,
    post.title,
    post.excerpt,
    post.body,
    post.author,
    post.category,
    JSON.stringify(post.tags),
    post.coverImage,
    post.coverAlt,
    post.status,
    post.publishedAt,
    post.seoTitle,
    post.seoDescription,
    post.canonicalUrl,
    post.noindex ? 1 : 0,
    post.version,
    post.createdAt,
    post.updatedAt,
  ];
}
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
export interface ListOptions {
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
  tag?: string;
  status?: PostStatus;
}
async function listPosts(options: ListOptions, isPublic: boolean): Promise<PostList> {
  const db = await getDatabase();
  const page = Math.max(1, Math.min(10000, Math.floor(options.page || 1)));
  const limit = Math.max(1, Math.min(100, Math.floor(options.limit || 12)));
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (isPublic) {
    clauses.push("status IN ('published','scheduled') AND published_at<=?");
    params.push(new Date().toISOString());
  } else if (options.status) {
    clauses.push("status=?");
    params.push(options.status);
  }
  if (options.query) {
    clauses.push("(LOWER(title) LIKE ? ESCAPE '\\' OR LOWER(excerpt) LIKE ? ESCAPE '\\')");
    const query = `%${escapeLike(options.query.toLowerCase().slice(0, 200))}%`;
    params.push(query, query);
  }
  if (options.category) {
    clauses.push("category=?");
    params.push(options.category);
  }
  if (options.tag) {
    clauses.push("tags LIKE ? ESCAPE '\\'");
    params.push(`%${escapeLike(JSON.stringify(options.tag))}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const counts = await db.query(`SELECT COUNT(*) AS total FROM posts ${where}`, params);
  const rows = await db.query(
    `SELECT ${columns} FROM posts ${where} ORDER BY COALESCE(published_at,created_at) DESC,id ASC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit],
  );
  return { posts: rows.map(fromRow), total: Number(counts[0].total), page, limit };
}
export function getPublishedPosts(options: ListOptions = {}) {
  return listPosts(options, true);
}
export async function getPublicationTaxonomy(): Promise<{ categories: string[]; tags: string[] }> {
  const rows = await (
    await getDatabase()
  ).query(
    "SELECT DISTINCT category,tags FROM posts WHERE status IN ('published','scheduled') AND published_at<=?",
    [new Date().toISOString()],
  );
  return {
    categories: [...new Set(rows.map((row) => String(row.category)))].sort(),
    tags: [...new Set(rows.flatMap((row) => JSON.parse(String(row.tags)) as string[]))].sort(),
  };
}
export function getAdminPosts(options: ListOptions = {}) {
  return listPosts(options, false);
}
export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const rows = await (
    await getDatabase()
  ).query(
    `SELECT ${columns} FROM posts WHERE slug=? AND status IN ('published','scheduled') AND published_at<=?`,
    [slug, new Date().toISOString()],
  );
  return rows[0] ? fromRow(rows[0]) : null;
}
export async function getSlugRedirect(slug: string): Promise<string | null> {
  const rows = await (
    await getDatabase()
  ).query(
    "SELECT posts.slug FROM slug_redirects JOIN posts ON posts.id=slug_redirects.post_id WHERE slug_redirects.slug=? AND posts.status IN ('published','scheduled') AND posts.published_at<=?",
    [slug, new Date().toISOString()],
  );
  return rows[0] ? String(rows[0].slug) : null;
}
export async function getAdminPost(id: string): Promise<BlogPost | null> {
  const rows = await (await getDatabase()).query(`SELECT ${columns} FROM posts WHERE id=?`, [id]);
  return rows[0] ? fromRow(rows[0]) : null;
}
async function assertSlugAvailable(db: Database, slug: string, id: string) {
  const rows = await db.query(
    "SELECT id FROM posts WHERE slug=? AND id<>? UNION ALL SELECT post_id AS id FROM slug_redirects WHERE slug=? AND post_id<>?",
    [slug, id, slug, id],
  );
  if (rows.length)
    throw new AppError(
      409,
      "duplicate_slug",
      "This slug is already used by another article or redirect",
    );
}
async function saveRevision(db: Database, post: BlogPost) {
  await db.execute(
    "INSERT INTO post_revisions(id,post_id,version,snapshot,created_at) VALUES(?,?,?,?,?)",
    [randomUUID(), post.id, post.version, JSON.stringify(post), post.updatedAt],
  );
}
function normalizePost(
  input: BlogPostInput,
  id: string,
  version: number,
  createdAt: string,
): BlogPost {
  const parsed = blogPostSchema.parse(input);
  const now = new Date().toISOString();
  const publication = parsed.publishedAt ? new Date(parsed.publishedAt).toISOString() : null;
  return {
    ...parsed,
    publishedAt:
      parsed.status === "draft"
        ? null
        : parsed.status === "published"
          ? publication || now
          : publication,
    id,
    version,
    createdAt,
    updatedAt: now,
  };
}
async function canonicalTaxonomy(tx: Database, post: BlogPost) {
  const rows = await tx.query("SELECT DISTINCT category,tags FROM posts ORDER BY category,tags");
  const categories = new Map(
    rows.map((row) => [String(row.category).toLowerCase(), String(row.category)]),
  );
  const tags = new Map<string, string>();
  for (const row of rows)
    for (const tag of JSON.parse(String(row.tags)) as string[])
      if (!tags.has(tag.toLowerCase())) tags.set(tag.toLowerCase(), tag);
  post.category = categories.get(post.category.toLowerCase()) || post.category;
  post.tags = post.tags.map((tag) => tags.get(tag.toLowerCase()) || tag);
}
function databaseConflict(error: unknown): never {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "23505" ||
      (error.code === "ERR_SQLITE_ERROR" &&
        "message" in error &&
        String(error.message).includes("UNIQUE constraint")))
  )
    throw new AppError(409, "duplicate_slug", "This slug is already in use");
  throw error;
}
export async function createPost(input: BlogPostInput, actor = "system"): Promise<BlogPost> {
  const post = normalizePost(input, randomUUID(), 1, new Date().toISOString());
  try {
    return await (
      await getDatabase()
    ).transaction(async (tx) => {
      await canonicalTaxonomy(tx, post);
      await assertSlugAvailable(tx, post.slug, post.id);
      await tx.execute(
        `INSERT INTO posts(${columns}) VALUES(${Array(19).fill("?").join(",")})`,
        values(post),
      );
      await saveRevision(tx, post);
      await refreshMediaReferences(tx, post.id, post);
      await recordAction(tx, `article.${post.status}`, post.id, actor);
      return post;
    });
  } catch (error) {
    return databaseConflict(error);
  }
}
export async function updatePost(
  id: string,
  input: BlogPostInput,
  version: number,
  actor = "system",
  action?: string,
): Promise<BlogPost> {
  try {
    return await (
      await getDatabase()
    ).transaction(async (tx) => {
      const rows = await tx.query(`SELECT ${columns} FROM posts WHERE id=?`, [id]);
      if (!rows[0]) throw new AppError(404, "not_found", "Article not found");
      const previous = fromRow(rows[0]);
      if (previous.version !== version)
        throw new AppError(409, "version_conflict", "This article changed. Reload before saving.");
      const post = normalizePost(input, id, version + 1, previous.createdAt);
      await canonicalTaxonomy(tx, post);
      await assertSlugAvailable(tx, post.slug, id);
      const changed = await tx.execute(
        "UPDATE posts SET slug=?,title=?,excerpt=?,body=?,author=?,category=?,tags=?,cover_image=?,cover_alt=?,status=?,published_at=?,seo_title=?,seo_description=?,canonical_url=?,noindex=?,version=?,created_at=?,updated_at=? WHERE id=? AND version=?",
        [...values(post).slice(1), id, version],
      );
      if (!changed)
        throw new AppError(409, "version_conflict", "This article changed. Reload before saving.");
      if (previous.slug !== post.slug) {
        await tx.execute("DELETE FROM slug_redirects WHERE slug=? AND post_id=?", [post.slug, id]);
        await tx.execute(
          "INSERT INTO slug_redirects(slug,post_id) VALUES(?,?) ON CONFLICT(slug) DO UPDATE SET post_id=excluded.post_id",
          [previous.slug, id],
        );
      }
      await saveRevision(tx, post);
      await refreshMediaReferences(tx, post.id, post);
      await recordAction(
        tx,
        action ||
          (post.status === "draft" && previous.status !== "draft"
            ? "article.unpublish"
            : `article.${post.status}`),
        post.id,
        actor,
      );
      return post;
    });
  } catch (error) {
    return databaseConflict(error);
  }
}
export async function deletePost(id: string, version: number, actor = "system"): Promise<void> {
  const db = await getDatabase();
  await db.transaction(async (tx) => {
    const rows = await tx.query("SELECT version FROM posts WHERE id=?", [id]);
    if (!rows[0]) throw new AppError(404, "not_found", "Article not found");
    if (
      Number(rows[0].version) !== version ||
      !(await tx.execute("DELETE FROM posts WHERE id=? AND version=?", [id, version]))
    )
      throw new AppError(409, "version_conflict", "This article changed. Reload before deleting.");
    await recordAction(tx, "article.delete", id, actor);
  });
}
export async function getPostRevisions(id: string): Promise<BlogRevision[]> {
  const rows = await (
    await getDatabase()
  ).query(
    "SELECT id,post_id,version,snapshot,created_at FROM post_revisions WHERE post_id=? ORDER BY version DESC",
    [id],
  );
  return rows.map((row) => ({
    id: String(row.id),
    postId: String(row.post_id),
    version: Number(row.version),
    snapshot: JSON.parse(String(row.snapshot)),
    createdAt: String(row.created_at),
  }));
}
export async function restoreRevision(
  id: string,
  revisionId: string,
  version: number,
  actor = "system",
): Promise<BlogPost> {
  const rows = await (
    await getDatabase()
  ).query("SELECT snapshot FROM post_revisions WHERE id=? AND post_id=?", [revisionId, id]);
  if (!rows[0]) throw new AppError(404, "not_found", "Revision not found");
  const {
    id: _id,
    version: _version,
    createdAt: _created,
    updatedAt: _updated,
    ...input
  } = JSON.parse(String(rows[0].snapshot)) as BlogPost;
  void _id;
  void _version;
  void _created;
  void _updated;
  // Every restore requires editorial review before it can be published again.
  input.status = "draft";
  return updatePost(id, input, version, actor, "article.restore");
}
