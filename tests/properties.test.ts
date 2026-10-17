import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { randomUUID, randomBytes, scryptSync, createHash } from "node:crypto";
import { Pool } from "pg";
import sharp from "sharp";
import { getDatabase, closeDatabase, createDatabase, type Database } from "../src/server/database";
import { migrateDatabase } from "../src/server/migrations";
import {
  seedPropertyInventory,
  seedPropertyInput,
  saveProperty,
  getPublicProperties,
  getManagedProperty,
  deleteProperty,
  propertyRevisions,
  restorePropertyRevision,
} from "../src/server/properties";
import { properties as seeds } from "../src/content/properties";
import { createInquiry } from "../src/server/inquiries";
import { normalizeImage, storeImage } from "../src/server/media";
import {
  listMedia,
  deleteMedia,
  updateMediaDetails,
  mediaReferences,
} from "../src/server/media-registry";
import { repositoryAssetReferences } from "../src/server/repository-assets";
import {
  exportDatabase,
  restoreDatabase,
  parseBackup,
  type DatabaseBackup,
} from "../src/server/backup";
import {
  createRecoveryBundle,
  readRecoveryBundle,
  readOwnedObject,
} from "../src/server/recovery-bundle";
import { remapRecoveryMedia } from "../src/server/recovery-media";
import { createSession, setSessionCookie } from "../src/server/auth";
import { GET as adminGET, POST as adminPOST } from "../src/app/api/admin/properties/route";
import {
  PATCH as adminPATCH,
  DELETE as adminDELETE,
} from "../src/app/api/admin/properties/[id]/route";
import { GET as assetsGET } from "../src/app/api/admin/assets/route";
import { GET as publicGET } from "../src/app/api/properties/route";
const cookieStore = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (key: string) => (cookieStore.has(key) ? { value: cookieStore.get(key) } : undefined),
    set: (key: string, value: string) => cookieStore.set(key, value),
  }),
}));
let directory: string, admin: Pool | undefined;
const schemas: string[] = [],
  handles: Database[] = [];
async function isolated() {
  const value = process.env.HAVENFIELD_TEST_DATABASE_URL;
  if (!value) return { url: "", sqlitePath: resolve(directory, randomUUID() + ".sqlite") };
  const url = new URL(value);
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    !/^\/havenfield_test_[a-z0-9_]+$/.test(url.pathname)
  )
    throw Error("Unsafe test database");
  admin ??= new Pool({ connectionString: url.toString() });
  const schema = "property_" + randomUUID().replaceAll("-", "");
  schemas.push(schema);
  await admin.query("CREATE SCHEMA " + schema);
  url.searchParams.set("options", "-c search_path=" + schema);
  return { url: url.toString() };
}
beforeEach(async () => {
  await mkdir(".data", { recursive: true });
  directory = await mkdtemp(resolve(".data/property-test-"));
  await closeDatabase();
  const options = await isolated();
  Object.assign(process.env, {
    APP_ENV: "development",
    LOCAL_PREVIEW: "0",
    VERCEL: "",
    VERCEL_ENV: "",
    VERCEL_URL: "",
    DATABASE_URL: options.url,
    DIRECT_DATABASE_URL: "",
    SQLITE_PATH: options.sqlitePath || "",
    LOCAL_UPLOAD_DIR: resolve(directory, "uploads"),
    BLOB_READ_WRITE_TOKEN: "",
    SESSION_SECRET: randomBytes(48).toString("hex"),
    ADMIN_EMAIL: "editor@havenfield.test",
    SITE_URL: "http://localhost:3000",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  });
  const salt = randomBytes(32).toString("hex");
  process.env.ADMIN_PASSWORD_HASH =
    "scrypt:" + salt + ":" + scryptSync("disposable-property-test", salt, 64).toString("hex");
  cookieStore.clear();
  const db = await getDatabase();
  await migrateDatabase(db);
  await seedPropertyInventory(db);
});
afterEach(async () => {
  cookieStore.clear();
  await closeDatabase();
  for (const handle of handles.splice(0)) await handle.close();
  for (const schema of schemas.splice(0)) await admin?.query("DROP SCHEMA " + schema + " CASCADE");
  await admin?.end();
  admin = undefined;
  const bounded = relative(resolve(".data"), directory);
  if (isAbsolute(bounded) || !bounded.startsWith("property-test-"))
    throw Error("Unsafe fixture cleanup");
  await rm(directory, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
});
function input() {
  return {
    ...seedPropertyInput(seeds[0]),
    slug: "draft-" + randomUUID(),
    name: "Quiet Test Home",
    status: "draft" as const,
  };
}
const actor = "editor@havenfield.test";
const request = (data: unknown, origin = "http://localhost:3000", header = true, method = "POST") =>
  new Request("http://localhost:3000/api/admin/properties", {
    method,
    headers: {
      "content-type": "application/json",
      origin,
      ...(header ? { "x-requested-with": "Havenfield" } : {}),
    },
    body: JSON.stringify(data),
  });
describe("managed property contracts on the active isolated adapter", () => {
  it("seeds original identities once without changing inquiry associations and never restores deleted homes from static data", async () => {
    const db = await getDatabase();
    expect((await getPublicProperties()).map((home) => home.id)).toEqual(
      seeds.map((home) => home.id),
    );
    expect(await seedPropertyInventory()).toBe(0);
    await db.execute(
      "INSERT INTO inquiries(id,name,email,phone,message,property_id,consent_at,created_at) VALUES(?,?,?,?,?,?,?,?)",
      [
        "old",
        "Example",
        "example@example.test",
        "",
        "A preserved inquiry",
        "hf-01",
        "2026-10-01",
        "2026-10-01",
      ],
    );
    await expect(deleteProperty("hf-01", 1, actor)).rejects.toMatchObject({
      code: "property_in_use",
    });
    expect(
      (await db.query("SELECT property_id FROM inquiries WHERE id=?", ["old"]))[0].property_id,
    ).toBe("hf-01");
    for (const seed of seeds) {
      const current = await getManagedProperty(seed.id);
      await saveProperty(
        { ...seedPropertyInput(seed), status: "draft" },
        actor,
        seed.id,
        current!.version,
      );
    }
    expect(await getPublicProperties()).toEqual([]);
    expect(await seedPropertyInventory()).toBe(0);
  });
  it("keeps drafts private, publishes edited galleries, rejects stale saves and restores retained versions", async () => {
    const initial = input(),
      draft = await saveProperty(initial, actor);
    expect(draft.id).toMatch(/^hf-[a-f0-9-]{36}$/);
    expect((await getPublicProperties()).some((home) => home.id === draft.id)).toBe(false);
    const published = await saveProperty(
      { ...initial, status: "published", galleryItems: [...initial.galleryItems].reverse() },
      actor,
      draft.id,
      1,
    );
    const visible = (await getPublicProperties()).find((home) => home.id === draft.id);
    expect(visible?.image).toBe(initial.galleryItems.at(-1)?.url);
    await expect(saveProperty(initial, actor, draft.id, 1)).rejects.toMatchObject({
      code: "version_conflict",
    });
    await expect(
      saveProperty({ ...initial, slug: "changed-address" }, actor, draft.id, 2),
    ).rejects.toMatchObject({ code: "stable_slug" });
    const revisions = await propertyRevisions(draft.id);
    expect(revisions.map((item) => item.version)).toEqual([2, 1]);
    const restored = await restorePropertyRevision(
      draft.id,
      revisions[1].id,
      published.version,
      actor,
    );
    expect(restored.version).toBe(3);
    expect(restored.status).toBe("draft");
    expect((await getPublicProperties()).some((home) => home.id === draft.id)).toBe(false);
    await deleteProperty(draft.id, 3, actor);
    expect(await getManagedProperty(draft.id)).toBeNull();
    expect(await propertyRevisions(draft.id)).toEqual([]);
  });
  it("preserves idempotent inquiry receipts after unpublishing while rejecting new inquiries and protecting history", async () => {
    const initial = input(),
      draft = await saveProperty(initial, actor),
      key = randomUUID(),
      body = {
        name: "Example Visitor",
        email: "visitor@example.test",
        message: "A fictional inquiry about this test concept.",
        propertyId: draft.id,
        consent: true,
        idempotencyKey: key,
      };
    await expect(createInquiry(request(body), body)).rejects.toMatchObject({
      code: "property_reference",
    });
    const live = await saveProperty({ ...initial, status: "published" }, actor, draft.id, 1),
      receipt = await createInquiry(request(body), body);
    const hidden = await saveProperty(initial, actor, draft.id, live.version);
    expect((await createInquiry(request(body), body)).id).toBe(receipt.id);
    await expect(
      createInquiry(request({ ...body, idempotencyKey: randomUUID() }), {
        ...body,
        idempotencyKey: randomUUID(),
      }),
    ).rejects.toMatchObject({ code: "property_reference" });
    await expect(deleteProperty(draft.id, hidden.version, actor)).rejects.toMatchObject({
      code: "property_in_use",
    });
  });
  it("guards private APIs and requires both the mutation origin and request header", async () => {
    expect((await adminGET()).status).toBe(401);
    expect((await assetsGET(new Request("http://localhost:3000/api/admin/assets"))).status).toBe(
      401,
    );
    expect((await adminPOST(request(input()))).status).toBe(401);
    await setSessionCookie(createSession(actor));
    expect((await adminPOST(request(input(), "https://untrusted.example"))).status).toBe(403);
    expect((await adminPOST(request(input(), "http://localhost:3000", false))).status).toBe(403);
    const response = await adminPOST(request(input()));
    expect(response.status).toBe(201);
    const { property } = await response.json();
    const publicResponse = await publicGET(
      new Request("http://localhost:3000/api/properties?status=draft"),
    );
    expect(
      (await publicResponse.json()).properties.some(
        (home: { id: string }) => home.id === property.id,
      ),
    ).toBe(false);
    const context = { params: Promise.resolve({ id: property.id }) };
    expect(
      (
        await adminPATCH(
          request({ version: 0, property: input() }, undefined, true, "PATCH"),
          context,
        )
      ).status,
    ).toBe(400);
    expect(
      (await adminDELETE(request({ version: 2 }, undefined, true, "DELETE"), context)).status,
    ).toBe(409);
    expect(
      (await adminDELETE(request({ version: 1 }, undefined, true, "DELETE"), context)).status,
    ).toBe(200);
  });
  it("protects property/revision uploads and preserves placement metadata when library defaults change", async () => {
    const source = await sharp({
        create: { width: 100, height: 100, channels: 3, background: "#777766" },
      })
        .png()
        .toBuffer(),
      url = await storeImage(await normalizeImage(source), "A synthetic garden image", actor);
    const media = (await listMedia()).items[0],
      initial = input();
    initial.galleryItems = [
      { url, alt: "A garden chosen for this placement", focalX: 30, focalY: 40 },
    ];
    const draft = await saveProperty(initial, actor);
    expect((await listMedia({ unused: true })).items).toEqual([]);
    expect((await mediaReferences(media.id)).some((row) => row.kind === "property gallery")).toBe(
      true,
    );
    await updateMediaDetails(
      media.id,
      {
        alt: "Updated library description",
        collection: "Garden stories",
        focalX: 20,
        focalY: 80,
        version: 1,
      },
      actor,
    );
    const updated = (await listMedia({ collection: "Garden stories" })).items[0];
    expect(updated.version).toBe(2);
    expect(updated.focalX).toBe(20);
    await expect(
      updateMediaDetails(media.id, { alt: "Stale", version: 1 }, actor),
    ).rejects.toMatchObject({ code: "version_conflict" });
    expect((await getManagedProperty(draft.id))?.galleryItems[0].focalX).toBe(30);
    await expect(deleteMedia(media.id, actor)).rejects.toMatchObject({ code: "media_in_use" });
    const next = await saveProperty(
      { ...initial, galleryItems: seedPropertyInput(seeds[0]).galleryItems },
      actor,
      draft.id,
      1,
    );
    await expect(deleteMedia(media.id, actor)).rejects.toMatchObject({ code: "media_in_use" });
    await deleteProperty(draft.id, next.version, actor);
    await deleteMedia(media.id, actor);
    expect((await listMedia()).items).toEqual([]);
  });
  it("rejects unowned or removed gallery URLs and reports source-controlled property usage", async () => {
    await expect(
      saveProperty(
        {
          ...input(),
          galleryItems: [
            {
              url: "https://unowned.example/image.webp",
              alt: "Unowned photo",
              focalX: 50,
              focalY: 50,
            },
          ],
        },
        actor,
      ),
    ).rejects.toMatchObject({ code: "media_unavailable" });
    const refs = await repositoryAssetReferences(seeds[0].image);
    expect(refs.some((ref) => ref.id === "hf-01" && ref.kind === "property")).toBe(true);
    expect(refs.some((ref) => ref.kind === "property revision")).toBe(true);
    await expect(repositoryAssetReferences("/media/not-owned.webp")).rejects.toMatchObject({
      code: "not_found",
    });
  });
  it("round-trips properties, gallery references, revisions and media metadata and remaps recovery URLs", async () => {
    const source = await sharp({
        create: { width: 80, height: 60, channels: 3, background: "#aaa088" },
      })
        .png()
        .toBuffer(),
      url = await storeImage(await normalizeImage(source), "A recovery image", actor),
      media = (await listMedia()).items[0];
    await updateMediaDetails(
      media.id,
      { alt: media.alt, collection: "Recovery", focalX: 15, focalY: 75, version: 1 },
      actor,
    );
    const draft = await saveProperty(
        { ...input(), galleryItems: [{ url, alt: "Recovery placement", focalX: 10, focalY: 70 }] },
        actor,
      ),
      backup = await exportDatabase(await getDatabase());
    expect(backup.payload.format).toBe(3);
    const bundle = resolve(directory, "bundle");
    await createRecoveryBundle(backup, bundle, readOwnedObject);
    const verified = await readRecoveryBundle(bundle);
    expect(verified.backup.payload.tables.properties).toHaveLength(5);
    const restoredUrl = "https://example.public.blob.vercel-storage.com/restored.webp",
      mapped = remapRecoveryMedia(
        verified.backup,
        new Map([[media.id, { url: restoredUrl, objectKey: "journal/development/restored.webp" }]]),
      );
    expect(
      String(mapped.payload.tables.properties.find((row) => row.id === draft.id)?.content),
    ).toContain(restoredUrl);
    expect(
      mapped.payload.tables.property_revisions.some((row) =>
        String(row.snapshot).includes(restoredUrl),
      ),
    ).toBe(true);
    const target = await createDatabase({ ...(await isolated()), autoMigrate: false });
    handles.push(target);
    await restoreDatabase(target, mapped);
    expect((await exportDatabase(target)).payload.tables).toEqual(mapped.payload.tables);
    await expect(restoreDatabase(target, mapped)).rejects.toThrow("nonempty");
  });
  it("still reads original format-2 recovery bundles and supplies safe defaults for new metadata", async () => {
    const source = await sharp({
      create: { width: 80, height: 60, channels: 3, background: "#bbb099" },
    })
      .png()
      .toBuffer();
    await storeImage(await normalizeImage(source), "Legacy format image", actor);
    const current = await exportDatabase(await getDatabase()),
      payload = structuredClone(current.payload);
    const legacy = payload.tables as unknown as Record<string, Record<string, unknown>[]>;
    for (const name of [
      "properties",
      "property_revisions",
      "property_media_references",
      "catalog_state",
    ])
      delete legacy[name];
    legacy.media = legacy.media.map(({ collection, focal_x, focal_y, version, ...row }) => {
      void collection;
      void focal_x;
      void focal_y;
      void version;
      return row;
    });
    payload.format = 2;
    payload.migrations = payload.migrations.slice(0, 2);
    const backup = {
      payload,
      checksum: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
    } as DatabaseBackup;
    const bundle = resolve(directory, "legacy-bundle");
    await createRecoveryBundle(backup, bundle, readOwnedObject);
    const verified = await readRecoveryBundle(bundle);
    expect(verified.objects.size).toBe(1);
    expect(parseBackup(backup).payload.format).toBe(3);
    expect(verified.backup.payload.tables.media[0]).toMatchObject({
      collection: "",
      focal_x: 50,
      focal_y: 50,
      version: 1,
    });
  });
});
