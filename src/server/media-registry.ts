import { mediaDetailsSchema } from "../lib/property-schema";
import { lstat, unlink } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import type { Database } from "./database";
import { getDatabase } from "./database";
import { AppError } from "./errors";
import { recordAction } from "./audit";
import { serverEnvironment } from "./environment";
import type { MediaItem } from "../lib/media-types";
import type { BlogPostInput } from "../lib/blog-types";

export async function lockMediaWrites(tx: Database) {
  if (tx.dialect === "postgres") await tx.query("SELECT pg_advisory_xact_lock(?)", [1212503623]);
}
function decoded(value: string) {
  return value.replace(/%[a-f0-9]{2}/gi, (token) =>
    String.fromCharCode(parseInt(token.slice(1), 16)),
  );
}
export async function refreshMediaReferences(tx: Database, postId: string, post: BlogPostInput) {
  await lockMediaWrites(tx);
  const media = await tx.query("SELECT id,url,state FROM media WHERE state<>'deleted'");
  await tx.execute("DELETE FROM media_references WHERE post_id=? AND kind<>'revision'", [postId]);
  for (const item of media) {
    const url = decoded(String(item.url));
    const kinds = new Set<string>();
    if (decoded(post.coverImage).split(/[?#]/)[0] === url) kinds.add("cover");
    if (decoded(post.body).includes(url)) kinds.add("inline");
    if (kinds.size) kinds.add("revision");
    if (kinds.size && item.state !== "active")
      throw new AppError(
        409,
        "media_unavailable",
        "An image is being deleted; choose another image before saving",
      );
    for (const kind of kinds)
      await tx.execute(
        "INSERT INTO media_references(media_id,post_id,kind) VALUES(?,?,?) ON CONFLICT(media_id,post_id,kind) DO NOTHING",
        [item.id, postId, kind],
      );
  }
  const unavailable = await tx.query("SELECT url FROM media WHERE state='deleted'");
  if (
    unavailable.some(
      (item) =>
        decoded(post.coverImage).split(/[?#]/)[0] === decoded(String(item.url)) ||
        decoded(post.body).includes(decoded(String(item.url))),
    )
  )
    throw new AppError(
      409,
      "media_unavailable",
      "An image was removed; choose another image before saving",
    );
}
export async function registerMedia(input: {
  id: string;
  objectKey: string;
  url: string;
  storage: "local" | "blob";
  width: number;
  height: number;
  bytes: number;
  alt: string;
  owner: string;
}) {
  await (
    await getDatabase()
  ).transaction(async (tx) => {
    await tx.execute(
      "INSERT INTO media(id,object_key,url,storage,width,height,bytes,content_type,alt,owner,created_at,state) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        input.id,
        input.objectKey,
        input.url,
        input.storage,
        input.width,
        input.height,
        input.bytes,
        "image/webp",
        input.alt,
        input.owner,
        new Date().toISOString(),
        "active",
      ],
    );
    await recordAction(tx, "media.upload", input.id, input.owner);
  });
}
export async function reserveMedia(input: Parameters<typeof registerMedia>[0]) {
  await (
    await getDatabase()
  ).execute(
    "INSERT INTO media(id,object_key,url,storage,width,height,bytes,content_type,alt,owner,created_at,state) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      input.id,
      input.objectKey,
      `pending:${input.id}`,
      input.storage,
      input.width,
      input.height,
      input.bytes,
      "image/webp",
      input.alt,
      input.owner,
      new Date().toISOString(),
      "uploading",
    ],
  );
}
export async function finishMedia(id: string, url: string, actor: string) {
  await (
    await getDatabase()
  ).transaction(async (tx) => {
    if (
      !(await tx.execute("UPDATE media SET url=?,state='active' WHERE id=? AND state='uploading'", [
        url,
        id,
      ]))
    )
      throw new AppError(409, "media_state", "The upload needs operator review");
    await recordAction(tx, "media.upload", id, actor);
  });
}
function fromRow(row: Record<string, unknown>): MediaItem {
  const references = Number(row.reference_count || 0);
  const createdAt = String(row.created_at);
  return {
    id: String(row.id),
    url: String(row.url),
    objectKey: String(row.object_key),
    storage: row.storage as MediaItem["storage"],
    width: Number(row.width),
    height: Number(row.height),
    bytes: Number(row.bytes),
    alt: String(row.alt),
    owner: String(row.owner),
    createdAt,
    state: row.state as MediaItem["state"],
    collection: String(row.collection || ""),
    focalX: Number(row.focal_x ?? 50),
    focalY: Number(row.focal_y ?? 50),
    version: Number(row.version || 1),
    references,
    cleanupEligible: references === 0 && Date.parse(createdAt) <= Date.now() - 7 * 86400_000,
  };
}
export async function listMedia(
  options: { query?: string; page?: number; unused?: boolean; collection?: string } = {},
) {
  const db = await getDatabase();
  const page = Math.max(1, Math.floor(options.page || 1));
  const limit = 12;
  const query = `%${(options.query || "")
    .trim()
    .slice(0, 200)
    .toLowerCase()
    .replace(/[\\%_]/g, "\\$&")}%`;
  let where =
    "m.state<>'deleted' AND (LOWER(m.alt) LIKE ? ESCAPE '\\' OR LOWER(m.id) LIKE ? ESCAPE '\\')" +
    (options.unused
      ? " AND NOT EXISTS(SELECT 1 FROM media_references r WHERE r.media_id=m.id) AND NOT EXISTS(SELECT 1 FROM property_media_references pr WHERE pr.media_id=m.id) AND NOT EXISTS(SELECT 1 FROM article_autosaves a WHERE a.snapshot LIKE '%' || m.url || '%')"
      : "");
  const bindings: unknown[] = [query, query];
  if (options.collection) {
    where += " AND m.collection=?";
    bindings.push(options.collection === "__uncollected" ? "" : options.collection);
  }
  const total = Number(
    (await db.query(`SELECT COUNT(*) AS total FROM media m WHERE ${where}`, bindings))[0].total,
  );
  const rows = await db.query(
    `SELECT m.*,(SELECT COUNT(DISTINCT post_id) FROM media_references r WHERE r.media_id=m.id)+(SELECT COUNT(DISTINCT property_id) FROM property_media_references pr WHERE pr.media_id=m.id)+(SELECT COUNT(*) FROM article_autosaves a WHERE a.snapshot LIKE '%' || m.url || '%') AS reference_count FROM media m WHERE ${where} ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`,
    [...bindings, limit, (page - 1) * limit],
  );
  const collections = (
    await db.query(
      "SELECT DISTINCT collection FROM media WHERE state<>? AND collection<>? ORDER BY collection LIMIT 100",
      ["deleted", ""],
    )
  ).map((row) => String(row.collection));
  return { items: rows.map(fromRow), total, page, limit, collections };
}
export async function mediaReferences(id: string) {
  const db = await getDatabase();
  const references = await db.query(
    "SELECT DISTINCT p.id,p.title,p.slug,r.kind FROM media_references r JOIN posts p ON p.id=r.post_id WHERE media_id=? ORDER BY p.title",
    [id],
  );
  const [media] = await db.query("SELECT url FROM media WHERE id=?", [id]);
  if (media) {
    const recoveries = await db.query("SELECT post_id,snapshot FROM article_autosaves");
    for (const saved of recoveries)
      if (decoded(String(saved.snapshot)).includes(decoded(String(media.url))))
        references.push({
          id: saved.post_id || "new",
          title: "Interrupted draft recovery",
          slug: "",
          kind: "recovery",
        });
  }
  const propertyRows = await db.query(
    "SELECT p.id,p.slug,p.content,r.kind FROM property_media_references r JOIN properties p ON p.id=r.property_id WHERE r.media_id=? ORDER BY p.id",
    [id],
  );
  return [
    ...references.map((ref) => ({
      id: String(ref.id),
      title: String(ref.title),
      slug: String(ref.slug),
      kind: String(ref.kind),
      href: ref.id === "new" ? "/admin/posts/new" : "/admin/posts/" + ref.id,
    })),
    ...propertyRows.map((row) => ({
      id: String(row.id),
      title: JSON.parse(String(row.content)).name as string,
      slug: String(row.slug),
      kind: "property " + row.kind,
      href: "/admin/properties/" + row.id,
    })),
  ];
}
export async function updateMediaDetails(id: string, input: unknown, actor: string) {
  const value = mediaDetailsSchema.parse(input);
  return (await getDatabase()).transaction(async (tx) => {
    await lockMediaWrites(tx);
    const [row] = await tx.query("SELECT * FROM media WHERE id=? AND state='active'", [id]);
    if (!row) throw new AppError(404, "not_found", "Image not found");
    if (value.version !== undefined && value.version !== Number(row.version))
      throw new AppError(
        409,
        "version_conflict",
        "Image details changed. Reload the media library before reopening this editor.",
      );
    const changed = await tx.execute(
      "UPDATE media SET alt=?,collection=?,focal_x=?,focal_y=?,version=version+1 WHERE id=? AND version=?",
      [
        value.alt,
        value.collection ?? row.collection,
        value.focalX ?? row.focal_x,
        value.focalY ?? row.focal_y,
        id,
        row.version,
      ],
    );
    if (!changed)
      throw new AppError(
        409,
        "version_conflict",
        "Image details changed. Reload the media library before reopening this editor.",
      );
    await recordAction(tx, "media.details", id, actor);
  });
}
export async function updateMediaAlt(id: string, alt: string, actor: string) {
  return updateMediaDetails(id, { alt }, actor);
}
export async function deleteMedia(id: string, actor: string, cleanup = false) {
  const db = await getDatabase();
  const item = await db.transaction(async (tx) => {
    await lockMediaWrites(tx);
    const [row] = await tx.query("SELECT * FROM media WHERE id=? AND state<>'deleted'", [id]);
    if (!row) throw new AppError(404, "not_found", "Image not found");
    const refs = await tx.query("SELECT post_id FROM media_references WHERE media_id=? LIMIT 1", [
      id,
    ]);
    const propertyRefs = await tx.query(
      "SELECT property_id FROM property_media_references WHERE media_id=? LIMIT 1",
      [id],
    );
    const recovery = await tx.query("SELECT snapshot FROM article_autosaves");
    if (
      refs.length ||
      propertyRefs.length ||
      recovery.some((saved) => decoded(String(saved.snapshot)).includes(decoded(String(row.url))))
    )
      throw new AppError(
        409,
        "media_in_use",
        "This image is used by an article, property or retained revision; remove those references before deleting",
      );
    if (
      (cleanup || row.state === "uploading") &&
      Date.parse(String(row.created_at)) > Date.now() - 7 * 86400_000
    )
      throw new AppError(409, "media_grace", "Unused images have a seven-day cleanup grace period");
    await tx.execute("UPDATE media SET state='deleting' WHERE id=?", [id]);
    return fromRow(row);
  });
  if (item.storage === "blob") {
    const env = serverEnvironment();
    if (!item.objectKey.startsWith(`journal/${env.environment}/`) || !env.blobToken)
      throw new AppError(
        503,
        "media_configuration",
        "This image belongs to a different storage environment or storage is not configured",
      );
    const { del } = await import("@vercel/blob");
    await del(item.objectKey, { token: env.blobToken });
  } else {
    if (!/^[a-f0-9-]{36}\.webp$/.test(item.objectKey))
      throw new AppError(409, "media_key", "Image key is invalid");
    const directory = resolve(
      /* turbopackIgnore: true */ process.env.LOCAL_UPLOAD_DIR || ".data/uploads",
    );
    const path = resolve(directory, item.objectKey);
    const bounded = relative(directory, path);
    if (isAbsolute(bounded) || bounded.startsWith(".."))
      throw new AppError(409, "media_key", "Image key is invalid");
    try {
      if ((await lstat(directory)).isSymbolicLink())
        throw new AppError(
          409,
          "media_key",
          "Symbolic-link storage roots cannot be deleted through the library",
        );
      if ((await lstat(path)).isSymbolicLink())
        throw new AppError(409, "media_key", "Symbolic-link media cannot be deleted");
      await unlink(path);
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT"))
        throw error;
    }
  }
  await db.transaction(async (tx) => {
    await tx.execute("UPDATE media SET state='deleted' WHERE id=? AND state='deleting'", [id]);
    await recordAction(tx, cleanup ? "media.cleanup" : "media.delete", id, actor);
  });
}
