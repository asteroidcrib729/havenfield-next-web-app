import { randomUUID } from "node:crypto";
import { cache } from "react";
import { getDatabase, type Database } from "./database";
import { AppError } from "./errors";
import { recordAction } from "./audit";
import { lockMediaWrites } from "./media-registry";
import { properties as seedProperties } from "../content/properties";
import { propertyStories } from "../content/property-stories";
import { relatedStorySlugs } from "../content/content-links";
import { repositoryAssets } from "../content/asset-library";
import { propertyInputSchema } from "../lib/property-schema";
import type { Property, PropertyInput, ManagedProperty } from "../lib/property-types";
const staticUrls = new Set(repositoryAssets.map((asset) => asset.url));
function rowProperty(row: Record<string, unknown>): ManagedProperty {
  return {
    ...propertyInputSchema.parse(JSON.parse(String(row.content))),
    id: String(row.id),
    slug: String(row.slug),
    status: row.status as ManagedProperty["status"],
    version: Number(row.version),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
export function publicProperty(record: ManagedProperty): Property {
  const { status, id, version, createdAt, updatedAt, ...input } = record;
  void status;
  void version;
  void createdAt;
  void updatedAt;
  const first = input.galleryItems[0];
  return {
    ...input,
    id,
    image: first.url,
    imageAlt: first.alt,
    focalX: first.focalX,
    focalY: first.focalY,
    gallery: input.galleryItems.map((image) => image.url),
  };
}
export async function inventoryReady(db: Database) {
  const [row] = await db.query("SELECT initialized FROM catalog_state WHERE id=1");
  return Number(row?.initialized) === 1;
}
export function seedPropertyInput(home: Property): PropertyInput {
  return propertyInputSchema.parse({
    slug: home.slug,
    name: home.name,
    location: home.location,
    region: home.region,
    type: home.type,
    price: home.price,
    bedrooms: home.bedrooms,
    bathrooms: home.bathrooms,
    area: home.area,
    description: home.description,
    features: home.features,
    galleryItems: home.gallery.map((url) => {
      const asset = repositoryAssets.find((asset) => asset.url === url);
      if (!asset) throw Error("Seed image is missing");
      return { url, alt: asset.alt, focalX: asset.focalX, focalY: asset.focalY };
    }),
    stories: (propertyStories[home.id] || []).map(([title, text]) => ({ title, text })),
    relatedStories: relatedStorySlugs(home.id).slice(0, 6),
    status: "published",
  });
}
async function revision(tx: Database, property: ManagedProperty) {
  await tx.execute(
    "INSERT INTO property_revisions(id,property_id,version,snapshot,created_at) VALUES(?,?,?,?,?)",
    [randomUUID(), property.id, property.version, JSON.stringify(property), property.updatedAt],
  );
}
async function imageReferences(tx: Database, id: string, input: PropertyInput) {
  await tx.execute("DELETE FROM property_media_references WHERE property_id=? AND kind='gallery'", [
    id,
  ]);
  for (const image of input.galleryItems) {
    if (staticUrls.has(image.url)) continue;
    const [media] = await tx.query("SELECT id,state FROM media WHERE url=?", [image.url]);
    if (!media || media.state !== "active")
      throw new AppError(
        409,
        "media_unavailable",
        "Choose an active owned upload or a repository image",
      );
    for (const kind of ["gallery", "revision"])
      await tx.execute(
        "INSERT INTO property_media_references(media_id,property_id,kind) VALUES(?,?,?) ON CONFLICT(media_id,property_id,kind) DO NOTHING",
        [media.id, id, kind],
      );
  }
}
export async function seedPropertyInventory(database?: Database) {
  const db = database || (await getDatabase());
  return db.transaction(async (tx) => {
    await lockMediaWrites(tx);
    if (await inventoryReady(tx)) return 0;
    if (Number((await tx.query("SELECT COUNT(*) AS total FROM properties"))[0].total))
      throw Error("An uninitialized nonempty catalog needs operator review");
    const now = new Date().toISOString();
    for (const seed of seedProperties) {
      const input = seedPropertyInput(seed);
      const record = { ...input, id: seed.id, version: 1, createdAt: now, updatedAt: now };
      await tx.execute(
        "INSERT INTO properties(id,slug,status,version,content,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
        [seed.id, input.slug, input.status, 1, JSON.stringify(input), now, now],
      );
      await imageReferences(tx, seed.id, input);
      await revision(tx, record);
    }
    await tx.execute(
      "INSERT INTO catalog_state(id,initialized) VALUES(1,1) ON CONFLICT(id) DO UPDATE SET initialized=1",
    );
    await recordAction(
      tx,
      "property.inventory-initialize",
      "four-preserved-identities",
      "operator",
    );
    return seedProperties.length;
  });
}
export const getPublicProperties = cache(async (): Promise<Property[]> => {
  const db = await getDatabase();
  const rows = await db.query(
    "SELECT p.*,s.initialized AS inventory_initialized FROM catalog_state s LEFT JOIN properties p ON p.status='published' WHERE s.id=1 ORDER BY p.created_at,p.id LIMIT 100",
  );
  if (Number(rows[0]?.inventory_initialized) !== 1)
    return seedProperties.map((home) =>
      publicProperty({
        ...seedPropertyInput(home),
        id: home.id,
        version: 1,
        createdAt: "",
        updatedAt: "",
      }),
    );
  return rows.filter((row) => row.id !== null).map((row) => publicProperty(rowProperty(row)));
});
export const getPublicPropertyBySlug = cache(
  async (slug: string) => (await getPublicProperties()).find((home) => home.slug === slug) || null,
);
export async function inquiryPropertyExists(db: Database, id: string) {
  return (await inventoryReady(db))
    ? Boolean(
        (await db.query("SELECT id FROM properties WHERE id=? AND status='published'", [id]))[0],
      )
    : seedProperties.some((home) => home.id === id);
}
export async function getManagedProperties() {
  return (
    await (await getDatabase()).query("SELECT * FROM properties ORDER BY created_at,id LIMIT 100")
  ).map(rowProperty);
}
export async function getManagedProperty(id: string) {
  const [row] = await (await getDatabase()).query("SELECT * FROM properties WHERE id=?", [id]);
  return row ? rowProperty(row) : null;
}
function conflict(error: unknown): never {
  if (
    error &&
    typeof error === "object" &&
    (("code" in error && error.code === "23505") ||
      (error instanceof Error && error.message.includes("UNIQUE constraint failed")))
  )
    throw new AppError(409, "duplicate_slug", "This property address is already in use");
  throw error;
}
export async function saveProperty(
  input: PropertyInput,
  actor: string,
  id?: string,
  version?: number,
  action?: string,
): Promise<ManagedProperty> {
  const value = propertyInputSchema.parse(input),
    db = await getDatabase();
  try {
    return await db.transaction(async (tx) => {
      await lockMediaWrites(tx);
      if (!(await inventoryReady(tx)))
        throw new AppError(
          503,
          "catalog_not_ready",
          "Initialize the property inventory before editing",
        );
      const [previous] = id ? await tx.query("SELECT * FROM properties WHERE id=?", [id]) : [];
      if (id && !previous) throw new AppError(404, "not_found", "Property not found");
      if (previous && Number(previous.version) !== version)
        throw new AppError(
          409,
          "version_conflict",
          "This property changed. Reload before saving; your edits are preserved.",
        );
      if (previous && previous.slug !== value.slug)
        throw new AppError(
          409,
          "stable_slug",
          "Existing property addresses stay fixed to preserve links",
        );
      if (
        !id &&
        Number((await tx.query("SELECT COUNT(*) AS total FROM properties"))[0].total) >= 100
      )
        throw new AppError(409, "catalog_limit", "This portfolio supports up to 100 properties");
      const now = new Date().toISOString(),
        record: ManagedProperty = {
          ...value,
          id: id || "hf-" + randomUUID(),
          version: previous ? Number(previous.version) + 1 : 1,
          createdAt: previous ? String(previous.created_at) : now,
          updatedAt: now,
        };
      if (previous) {
        if (
          !(await tx.execute(
            "UPDATE properties SET status=?,version=?,content=?,updated_at=? WHERE id=? AND version=?",
            [value.status, record.version, JSON.stringify(value), now, id, version],
          ))
        )
          throw new AppError(
            409,
            "version_conflict",
            "This property changed. Reload before saving",
          );
      } else
        await tx.execute(
          "INSERT INTO properties(id,slug,status,version,content,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
          [record.id, value.slug, value.status, 1, JSON.stringify(value), now, now],
        );
      await imageReferences(tx, record.id, value);
      await revision(tx, record);
      await recordAction(tx, action || "property." + value.status, record.id, actor);
      return record;
    });
  } catch (error) {
    return conflict(error);
  }
}
export async function deleteProperty(id: string, version: number, actor: string) {
  await (
    await getDatabase()
  ).transaction(async (tx) => {
    await lockMediaWrites(tx);
    const [row] = await tx.query("SELECT version FROM properties WHERE id=?", [id]);
    if (!row) throw new AppError(404, "not_found", "Property not found");
    if (Number(row.version) !== version)
      throw new AppError(409, "version_conflict", "This property changed. Reload before deleting");
    if ((await tx.query("SELECT id FROM inquiries WHERE property_id=? LIMIT 1", [id])).length)
      throw new AppError(
        409,
        "property_in_use",
        "This home has inquiry history. Save it as a draft to remove it from the public collection.",
      );
    await tx.execute("DELETE FROM properties WHERE id=? AND version=?", [id, version]);
    await recordAction(tx, "property.delete", id, actor);
  });
}
export async function propertyRevisions(id: string) {
  return (
    await (
      await getDatabase()
    ).query(
      "SELECT id,version,created_at FROM property_revisions WHERE property_id=? ORDER BY version DESC LIMIT 20",
      [id],
    )
  ).map((row) => ({
    id: String(row.id),
    version: Number(row.version),
    createdAt: String(row.created_at),
  }));
}
export async function restorePropertyRevision(
  id: string,
  revisionId: string,
  version: number,
  actor: string,
) {
  const [row] = await (
    await getDatabase()
  ).query("SELECT snapshot FROM property_revisions WHERE property_id=? AND id=?", [id, revisionId]);
  if (!row) throw new AppError(404, "not_found", "Property revision not found");
  const {
    id: oldId,
    version: oldVersion,
    createdAt,
    updatedAt,
    ...input
  } = JSON.parse(String(row.snapshot)) as ManagedProperty;
  void oldId;
  void oldVersion;
  void createdAt;
  void updatedAt;
  return saveProperty(input, actor, id, version, "property.restore");
}
