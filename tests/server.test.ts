import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { blogPostSchema, inquirySchema } from "../src/lib/blog-schema";
import {
  createSession,
  verifySession,
  verifyPassword,
  checkMutationOrigin,
  rateLimit,
} from "../src/server/auth";
import {
  createPost,
  updatePost,
  deletePost,
  getPublishedPosts,
  getPublishedPostBySlug,
  getPostRevisions,
  getSlugRedirect,
  restoreRevision,
  getAdminPost,
} from "../src/server/blog";
import { closeDatabase, getDatabase, migrateDatabase } from "../src/server/database";
import {
  listInquiries,
  changeInquiry,
  deleteInquiry,
  purgeExpiredInquiries,
} from "../src/server/inquiries";
import { saveAutosave, getAutosave, discardAutosave } from "../src/server/autosaves";
import { listMedia, deleteMedia, reserveMedia } from "../src/server/media-registry";
import { storeImage } from "../src/server/media";
import { systemSummary } from "../src/server/system";
import { exportDatabase, restoreDatabase } from "../src/server/backup";
import { createDatabase } from "../src/server/database";
import { apiError } from "../src/server/http";
import { GET as healthGET } from "../src/app/api/health/route";
import { createInquiry } from "../src/server/inquiries";
import { readJson } from "../src/server/http";
import type { BlogPostInput } from "../src/lib/blog-types";
import { GET as feedGET } from "../src/app/rss.xml/route";
import sitemap from "../src/app/sitemap";
import { GET as publicPostsGET } from "../src/app/api/posts/route";
import { GET as adminPostsGET, POST as adminPostsPOST } from "../src/app/api/admin/posts/route";
import { POST as loginPOST } from "../src/app/api/auth/login/route";
import { POST as logoutPOST } from "../src/app/api/auth/logout/route";
import { POST as mediaPOST } from "../src/app/api/admin/media/route";
import { normalizeImage, readUpload, getLocalImage } from "../src/server/media";
import sharp from "sharp";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const blobMock = vi.hoisted(() => ({ put: vi.fn(), del: vi.fn() }));
vi.mock("@vercel/blob", () => blobMock);
const cookieStore = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieStore.has(name) ? { value: cookieStore.get(name) } : undefined),
    set: (name: string, value: string) => cookieStore.set(name, value),
  }),
}));

let directory: string;
const secret = randomBytes(48).toString("hex");
const salt = randomBytes(32).toString("hex");
const password = "a long test password only";
const encoded = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const draft: BlogPostInput = {
  slug: "test-draft",
  title: "An original editorial draft",
  excerpt: "A useful excerpt with context for readers.",
  body: "## A useful article\n\nA considered guide to evaluating a fictional home.",
  author: "Havenfield Editorial",
  category: "Design notes",
  tags: ["Design"],
  coverImage: "/media/interior.jpg",
  coverAlt: "A bright living room",
  status: "draft",
  publishedAt: null,
  seoTitle: "An original editorial draft",
  seoDescription: "Useful practical advice for finding a comfortable home.",
  canonicalUrl: "",
  noindex: false,
};
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "havenfield-test-"));
  process.env.SQLITE_PATH = join(directory, "test.sqlite");
  process.env.LOCAL_UPLOAD_DIR = join(directory, "uploads");
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL;
  process.env.SESSION_SECRET = secret;
  process.env.ADMIN_EMAIL = "editor@example.test";
  process.env.ADMIN_PASSWORD_HASH = encoded;
  delete process.env.SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.HAVENFIELD_TEST_DATABASE_URL) {
    const url = new URL(process.env.HAVENFIELD_TEST_DATABASE_URL);
    if (
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      !/^\/havenfield_test_[a-z0-9_]+$/.test(url.pathname)
    )
      throw new Error("Unsafe integration database");
    process.env.DATABASE_URL = url.toString();
    await migrateDatabase(await getDatabase());
  }
});
afterAll(async () => {
  await closeDatabase();
  await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("authentication boundaries", () => {
  it("verifies only the expected scrypt password", () => {
    expect(verifyPassword(password, encoded)).toBe(true);
    expect(verifyPassword("wrong", encoded)).toBe(false);
    expect(verifyPassword(password, "not-a-hash")).toBe(false);
  });
  it("rejects tampered and expired signed sessions and password rotations", () => {
    const now = Date.now();
    const token = createSession("editor@example.test", now);
    expect(verifySession(token, now)).toEqual({ email: "editor@example.test" });
    expect(verifySession(token + "x", now)).toBeNull();
    expect(verifySession(token, now + 9 * 60 * 60_000)).toBeNull();
    process.env.ADMIN_PASSWORD_HASH = encoded + "x";
    expect(verifySession(token, now)).toBeNull();
    process.env.ADMIN_PASSWORD_HASH = encoded;
  });
  it("requires both a trusted Origin and request header for mutations", () => {
    const make = (origin: string, header = true) =>
      new Request("http://localhost:3000/api/inquiries", {
        method: "POST",
        headers: { origin, ...(header ? { "x-requested-with": "Havenfield" } : {}) },
      });
    expect(() => checkMutationOrigin(make("http://localhost:3000"))).not.toThrow();
    expect(() => checkMutationOrigin(make("https://attacker.test"))).toThrow();
    expect(() => checkMutationOrigin(make("http://localhost:3000", false))).toThrow();
  });
  it("enforces durable limits under concurrent requests", async () => {
    const outcomes = await Promise.allSettled(
      Array.from({ length: 8 }, () => rateLimit("concurrent-test", 3, 60_000)),
    );
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(3);
    expect(outcomes.filter((result) => result.status === "rejected")).toHaveLength(5);
  });
});
describe("editorial persistence", () => {
  it("keeps drafts and future scheduled posts out of public queries", async () => {
    const post = await createPost(draft);
    const scheduled = await createPost({
      ...draft,
      slug: "test-scheduled",
      status: "scheduled",
      publishedAt: new Date(Date.now() + 86400_000).toISOString(),
    });
    expect(await getPublishedPostBySlug(post.slug)).toBeNull();
    expect(await getPublishedPostBySlug(scheduled.slug)).toBeNull();
    expect((await getPublishedPosts()).total).toBe(0);
  });
  it("publishes, preserves slug redirects, and rejects lost updates", async () => {
    const post = await createPost({ ...draft, slug: "a-public-guide", status: "published" });
    expect((await getPublishedPostBySlug(post.slug))?.id).toBe(post.id);
    const updated = await updatePost(
      post.id,
      { ...draft, slug: "a-renamed-guide", status: "published" },
      post.version,
    );
    expect(await getSlugRedirect(post.slug)).toBe(updated.slug);
    expect(await getPublishedPostBySlug(post.slug)).toBeNull();
    await expect(
      updatePost(post.id, { ...draft, slug: "a-stale-guide" }, post.version),
    ).rejects.toMatchObject({ code: "version_conflict" });
    const revision = (await getPostRevisions(post.id)).find((item) => item.version === 1)!;
    const restored = await restoreRevision(post.id, revision.id, updated.version);
    expect(restored.status).toBe("draft");
    expect(restored.version).toBe(3);
    expect(await getPublishedPostBySlug(restored.slug)).toBeNull();
    await expect(deletePost(post.id, updated.version)).rejects.toMatchObject({
      code: "version_conflict",
    });
    await deletePost(post.id, restored.version);
    expect(await getAdminPost(post.id)).toBeNull();
    expect(await getPostRevisions(post.id)).toHaveLength(0);
    expect(await getSlugRedirect("a-renamed-guide")).toBeNull();
  });
  it("reserves old slugs and filters published posts safely", async () => {
    const post = await createPost({
      ...draft,
      slug: "reserved-old",
      status: "published",
      tags: ["Architecture"],
    });
    await updatePost(
      post.id,
      { ...draft, slug: "reserved-new", status: "published", tags: ["Architecture"] },
      post.version,
    );
    await expect(createPost({ ...draft, slug: "reserved-old" })).rejects.toMatchObject({
      code: "duplicate_slug",
    });
    const result = await getPublishedPosts({ tag: "Architecture", query: "original" });
    expect(result.total).toBe(1);
    expect((await getPublishedPosts({ query: "%' OR 1=1 --" })).total).toBe(0);
    expect((await getPublishedPosts({ tag: "Architecture", limit: 1 })).posts).toHaveLength(1);
  });
  it("rolls back failed transactions", async () => {
    const db = await getDatabase();
    await expect(
      db.transaction(async (tx) => {
        await tx.execute("INSERT INTO rate_limits(key,count,expires_at) VALUES(?,?,?)", [
          "rollback",
          1,
          Date.now() + 60_000,
        ]);
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");
    expect(await db.query("SELECT key FROM rate_limits WHERE key=?", ["rollback"])).toHaveLength(0);
  });
  it("rejects one of two concurrent edits without losing a revision", async () => {
    const post = await createPost({ ...draft, slug: "concurrent-original" });
    const outcomes = await Promise.allSettled([
      updatePost(post.id, { ...draft, slug: "concurrent-first" }, 1),
      updatePost(post.id, { ...draft, slug: "concurrent-second" }, 1),
    ]);
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = outcomes.find((result) => result.status === "rejected");
    expect(rejected?.status === "rejected" && rejected.reason.code).toBe("version_conflict");
    expect((await getAdminPost(post.id))?.version).toBe(2);
    expect(await getPostRevisions(post.id)).toHaveLength(2);
  });
  it("reserves a slug exactly once under concurrent creation", async () => {
    const outcomes = await Promise.allSettled([
      createPost({ ...draft, slug: "concurrent-unique" }),
      createPost({ ...draft, slug: "concurrent-unique" }),
    ]);
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = outcomes.find((result) => result.status === "rejected");
    expect(rejected?.status === "rejected" && rejected.reason.code).toBe("duplicate_slug");
  });
  it("treats search wildcard characters as literal input", async () => {
    await createPost({
      ...draft,
      slug: "literal-search",
      title: "A 50% plan_with details",
      status: "published",
    });
    await createPost({
      ...draft,
      slug: "other-search",
      title: "A 50X planZwith details",
      status: "published",
    });
    expect((await getPublishedPosts({ query: "50%" })).total).toBe(1);
    expect((await getPublishedPosts({ query: "plan_with" })).total).toBe(1);
  });
  it("publishes scheduled articles at the exact UTC boundary", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      const before = new Date("2030-01-01T00:00:00.000Z");
      vi.setSystemTime(before);
      const post = await createPost({
        ...draft,
        slug: "boundary-story",
        status: "scheduled",
        publishedAt: "2030-01-01T00:00:01.000Z",
      });
      expect(await getPublishedPostBySlug(post.slug)).toBeNull();
      expect(await (await feedGET()).text()).not.toContain(post.slug);
      expect((await sitemap()).some((entry) => entry.url.endsWith(post.slug))).toBe(false);
      vi.setSystemTime(new Date("2030-01-01T00:00:01.000Z"));
      expect((await getPublishedPostBySlug(post.slug))?.id).toBe(post.id);
      const feed = await feedGET();
      expect(feed.headers.get("cache-control")).toBe("no-store");
      expect(await feed.text()).toContain(post.slug);
      expect((await sitemap()).some((entry) => entry.url.endsWith(post.slug))).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
describe("input and inquiry safeguards", () => {
  it("rejects executable content, missing alt text, bad URLs, and invalid schedules", () => {
    expect(
      blogPostSchema.safeParse({
        ...draft,
        body: "<script>alert('x')</script> very long unsafe content",
      }).success,
    ).toBe(false);
    expect(blogPostSchema.safeParse({ ...draft, coverAlt: "" }).success).toBe(false);
    expect(blogPostSchema.safeParse({ ...draft, coverImage: "javascript:alert(1)" }).success).toBe(
      false,
    );
    expect(
      blogPostSchema.safeParse({
        ...draft,
        status: "scheduled",
        publishedAt: "2020-01-01T00:00:00Z",
      }).success,
    ).toBe(false);
    expect(
      inquirySchema.safeParse({
        name: "Visitor",
        email: "visitor@example.test",
        message: "A valid inquiry message",
        consent: false,
      }).success,
    ).toBe(false);
  });
  it("limits actual streamed JSON payload size", async () => {
    const request = new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "x".repeat(1000) }),
    });
    await expect(readJson(request, 100)).rejects.toMatchObject({ status: 413 });
  });
  it("stores a genuine consented receipt without claiming email delivery", async () => {
    const request = new Request("http://localhost:3000/api/inquiries");
    const receipt = await createInquiry(request, {
      name: "Portfolio Visitor",
      email: "visitor@example.test",
      message: "Please tell me more about the fictional property.",
      consent: true,
    });
    expect(receipt.message).toContain("does not send email");
    const rows = await (
      await getDatabase()
    ).query("SELECT email,consent_at FROM inquiries WHERE id=?", [receipt.id]);
    expect(rows[0].email).toBe("visitor@example.test");
    expect(rows[0].consent_at).toBeTruthy();
  });
});
describe("API authorization lifecycle", () => {
  const mutation = (path: string, body: unknown) =>
    new Request(`http://localhost:3000${path}`, {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "x-requested-with": "Havenfield",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  it("requires a session before every admin read and write, and removes it on logout", async () => {
    expect((await adminPostsGET(new Request("http://localhost:3000/api/admin/posts"))).status).toBe(
      401,
    );
    expect((await adminPostsPOST(mutation("/api/admin/posts", draft))).status).toBe(401);
    const signedIn = await loginPOST(
      mutation("/api/auth/login", { email: "editor@example.test", password }),
    );
    expect(signedIn.status).toBe(200);
    expect(cookieStore.get("havenfield_admin")).toBeTruthy();
    const created = await adminPostsPOST(
      mutation("/api/admin/posts", { ...draft, slug: "api-editor-draft" }),
    );
    expect(created.status).toBe(201);
    const adminList = await adminPostsGET(new Request("http://localhost:3000/api/admin/posts"));
    expect(adminList.status).toBe(200);
    expect(
      (await adminList.json()).posts.some(
        (post: { slug: string }) => post.slug === "api-editor-draft",
      ),
    ).toBe(true);
    const publicList = await publicPostsGET(
      new Request("http://localhost:3000/api/posts?status=draft"),
    );
    expect(publicList.status).toBe(200);
    expect(
      (await publicList.json()).posts.some(
        (post: { slug: string }) => post.slug === "api-editor-draft",
      ),
    ).toBe(false);
    expect((await logoutPOST(mutation("/api/auth/logout", {}))).status).toBe(200);
    expect((await adminPostsGET(new Request("http://localhost:3000/api/admin/posts"))).status).toBe(
      401,
    );
  });
});
describe("cover image uploads", () => {
  it("denies anonymous uploads before parsing any multipart body", async () => {
    cookieStore.clear();
    expect(
      (await mediaPOST(new Request("http://localhost:3000/api/admin/media", { method: "POST" })))
        .status,
    ).toBe(401);
  });
  it("checks actual image format and strips metadata during WebP encoding", async () => {
    const input = await sharp({
      create: { width: 32, height: 32, channels: 3, background: "#bdcdb4" },
    })
      .jpeg()
      .withMetadata()
      .toBuffer();
    const output = await normalizeImage(input);
    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.exif).toBeUndefined();
    await expect(
      normalizeImage(
        Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'),
      ),
    ).rejects.toMatchObject({ code: "image_type" });
  });
  it("bounds multipart payloads and serves a validated local uploaded cover", async () => {
    await expect(
      readUpload(
        new Request("http://localhost:3000/api/admin/media", {
          method: "POST",
          headers: {
            "content-type": "multipart/form-data; boundary=x",
            "content-length": String(6 * 1024 * 1024),
          },
          body: "x",
        }),
      ),
    ).rejects.toMatchObject({ status: 413 });
    cookieStore.set("havenfield_admin", createSession("editor@example.test"));
    const input = await sharp({
      create: { width: 32, height: 32, channels: 3, background: "#bdcdb4" },
    })
      .png()
      .toBuffer();
    const form = new FormData();
    form.set(
      "file",
      new File([new Uint8Array(input)], "original-private-name.png", { type: "image/png" }),
    );
    form.set("alt", "An original test image");
    const response = await mediaPOST(
      new Request("http://localhost:3000/api/admin/media", {
        method: "POST",
        headers: { origin: "http://localhost:3000", "x-requested-with": "Havenfield" },
        body: form,
      }),
    );
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result.url).toMatch(/^\/api\/media\/[a-f0-9-]+\.webp$/);
    expect(result.url).not.toContain("private-name");
    expect(await getLocalImage(result.url.split("/").at(-1))).toBeTruthy();
    expect(await getLocalImage("../../secrets.webp")).toBeNull();
    expect(blogPostSchema.safeParse({ ...draft, coverImage: result.url }).success).toBe(true);
    cookieStore.clear();
  });
});
describe("original content seeding", () => {
  it("preserves edited content when the seed CLI is run again", async () => {
    const run = promisify(execFile);
    const env = {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || "",
      DIRECT_DATABASE_URL: "",
      VERCEL: "",
      BLOB_READ_WRITE_TOKEN: "",
    };
    await run(process.execPath, ["--import", "tsx", "scripts/database-seed.ts"], {
      env,
      windowsHide: true,
      timeout: 10_000,
    });
    const seeded = (await getPublishedPosts({ query: "A home that fits your everyday" })).posts[0];
    expect(seeded).toBeTruthy();
    const edited = await updatePost(
      seeded.id,
      {
        ...draft,
        slug: seeded.slug,
        title: seeded.title,
        excerpt: "An introduction deliberately updated by the publisher.",
        status: "published",
      },
      seeded.version,
    );
    const result = await run(process.execPath, ["--import", "tsx", "scripts/database-seed.ts"], {
      env,
      windowsHide: true,
      timeout: 10_000,
    });
    expect(result.stdout).toContain("Seeded 0");
    expect((await getAdminPost(seeded.id))?.excerpt).toBe(edited.excerpt);
  }, 30_000);
});

describe("complete media and recovery workflows", () => {
  it("preserves shared images and historical references until every article is deleted", async () => {
    const bytes = await sharp({
      create: { width: 40, height: 30, channels: 3, background: "#63735a" },
    })
      .webp()
      .toBuffer();
    const url = await storeImage(bytes, "Synthetic test image", "editor@example.test");
    const media = (await listMedia()).items.find((item) => item.url === url)!;
    expect(media).toMatchObject({
      state: "active",
      width: 40,
      height: 30,
      owner: "editor@example.test",
    });
    const one = await createPost({ ...draft, slug: "shared-media-one", coverImage: url }),
      two = await createPost({
        ...draft,
        slug: "shared-media-two",
        body: draft.body + "\n\n![A test image](" + url + ")",
      });
    await expect(deleteMedia(media.id, "editor@example.test")).rejects.toMatchObject({
      code: "media_in_use",
    });
    const edited = await updatePost(
      one.id,
      { ...draft, slug: one.slug, coverImage: "" },
      one.version,
    );
    await deletePost(two.id, two.version);
    await expect(deleteMedia(media.id, "editor@example.test")).rejects.toMatchObject({
      code: "media_in_use",
    });
    await deletePost(edited.id, edited.version);
    await deleteMedia(media.id, "editor@example.test");
    expect(await getLocalImage(media.objectKey)).toBeNull();
    await expect(
      createPost({ ...draft, slug: "deleted-image-reference", coverImage: url }),
    ).rejects.toMatchObject({ code: "media_unavailable" });
  });
  it("tracks interrupted uploads, respects cleanup grace and retries missing objects safely", async () => {
    const id = randomUUID();
    await reserveMedia({
      id,
      objectKey: id + ".webp",
      url: "",
      storage: "local",
      width: 1,
      height: 1,
      bytes: 20,
      alt: "",
      owner: "editor@example.test",
    });
    await expect(deleteMedia(id, "editor@example.test", true)).rejects.toMatchObject({
      code: "media_grace",
    });
    await (
      await getDatabase()
    ).execute("UPDATE media SET created_at=? WHERE id=?", ["2020-01-01T00:00:00.000Z", id]);
    await deleteMedia(id, "editor@example.test", true);
    expect(
      (await (await getDatabase()).query("SELECT state FROM media WHERE id=?", [id]))[0].state,
    ).toBe("deleted");
  });
  it("recovers drafts without publishing or replacing newer edits", async () => {
    const post = await createPost({ ...draft, slug: "recovery-draft" });
    const key = randomUUID();
    const recovery = {
      key,
      postId: post.id,
      baseVersion: 1,
      generation: 1,
      post: { ...draft, slug: post.slug, title: "Recovered writing" },
    };
    await saveAutosave(recovery, "editor@example.test");
    expect((await getAutosave(key, "editor@example.test"))?.post.title).toBe("Recovered writing");
    expect(await getAutosave(key, "other@example.test")).toBeNull();
    await expect(saveAutosave(recovery, "editor@example.test")).rejects.toMatchObject({
      code: "autosave_conflict",
    });
    expect((await getAdminPost(post.id))?.title).toBe(draft.title);
    await updatePost(post.id, { ...draft, slug: post.slug, status: "published" }, 1);
    await expect(
      saveAutosave({ ...recovery, generation: 2 }, "editor@example.test"),
    ).rejects.toMatchObject({ code: "version_conflict" });
    await expect(
      saveAutosave({ ...recovery, baseVersion: 2, generation: 2 }, "editor@example.test"),
    ).rejects.toMatchObject({ code: "autosave_published" });
    await discardAutosave(key, "editor@example.test");
    expect(await getAutosave(key, "editor@example.test")).toBeNull();
  });
  it("protects images referenced only by interrupted writing", async () => {
    const bytes = await sharp({
      create: { width: 10, height: 10, channels: 3, background: "white" },
    })
      .webp()
      .toBuffer();
    const url = await storeImage(bytes, "Recovery image");
    const media = (await listMedia()).items.find((item) => item.url === url)!;
    const key = randomUUID();
    await saveAutosave(
      { key, postId: null, baseVersion: 0, generation: 1, post: { ...draft, coverImage: url } },
      "editor@example.test",
    );
    await expect(deleteMedia(media.id, "editor@example.test")).rejects.toMatchObject({
      code: "media_in_use",
    });
    await discardAutosave(key, "editor@example.test");
    await deleteMedia(media.id, "editor@example.test");
  });
  it("exports new operations records and restores them atomically", async () => {
    const backup = await exportDatabase(await getDatabase());
    expect(backup.payload.format).toBe(3);
    expect(backup.payload.tables.publisher_actions.length).toBeGreaterThan(0);
    const target = await createDatabase({
      url: "",
      sqlitePath: join(directory, "operations-restore.sqlite"),
      autoMigrate: false,
    });
    try {
      await restoreDatabase(target, backup);
      expect((await exportDatabase(target)).payload.tables).toEqual(backup.payload.tables);
    } finally {
      await target.close();
    }
  });
});
describe("inquiry lifecycle and operational diagnostics", () => {
  it("stores one receipt for concurrent retries, rejects changed details and invalid properties", async () => {
    await (await getDatabase()).execute("DELETE FROM rate_limits");
    const key = randomUUID();
    const body = {
      name: "Lifecycle Visitor",
      email: "lifecycle@example.test",
      message: "A synthetic message for the courtyard concept.",
      propertyId: "hf-01",
      consent: true,
      idempotencyKey: key,
    };
    const request = new Request("http://localhost:3000/api/inquiries");
    const results = await Promise.all([createInquiry(request, body), createInquiry(request, body)]);
    expect(results[0].id).toBe(results[1].id);
    expect((await listInquiries({ query: "lifecycle@example.test" })).total).toBe(1);
    await expect(
      createInquiry(request, { ...body, message: "Different original request details" }),
    ).rejects.toMatchObject({ code: "idempotency_conflict" });
    await expect(
      createInquiry(request, { ...body, idempotencyKey: randomUUID(), propertyId: "not-a-home" }),
    ).rejects.toMatchObject({ code: "property_reference" });
    await changeInquiry(results[0].id, "reviewed", "editor@example.test");
    expect(
      (await listInquiries({ status: "reviewed" })).items.some((item) => item.id === results[0].id),
    ).toBe(true);
    await deleteInquiry(results[0].id, "editor@example.test");
    expect((await listInquiries({ query: "lifecycle@example.test" })).total).toBe(0);
  });
  it("purges expired records while preserving current records and excluding bodies from audit", async () => {
    const db = await getDatabase();
    await db.execute("UPDATE inquiries SET expires_at=?", ["2020-01-01T00:00:00.000Z"]);
    const maintenanceStarted = Date.now();
    expect(await purgeExpiredInquiries("maintenance")).toBeGreaterThan(0);
    const operations = await systemSummary();
    expect(operations.databaseReady).toBe(true);
    expect(Date.parse(operations.lastMaintenanceAt!)).toBeGreaterThanOrEqual(maintenanceStarted);
    expect((await listInquiries()).total).toBe(0);
    const actions = await db.query("SELECT * FROM publisher_actions");
    expect(actions.some((row) => row.action === "article.restore")).toBe(true);
    expect(JSON.stringify(actions)).not.toContain("lifecycle@example.test");
    expect(JSON.stringify(actions)).not.toContain("Synthetic message");
  });
  it("returns generic readiness and correlated sanitized failures", async () => {
    expect((await healthGET()).status).toBe(200);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = apiError(new Error("postgres://private:credential@host/database"));
    expect(result.status).toBe(503);
    const data = await result.json();
    expect(JSON.stringify(data)).not.toContain("credential");
    expect(spy.mock.calls[0][0]).not.toContain("credential");
    expect(result.headers.get("x-request-id")).toBeTruthy();
    spy.mockRestore();
  });
});

describe("storage failures", () => {
  it("retains a durable pending upload after storage failure and allows reviewed retry cleanup", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "synthetic-test-token";
    blobMock.put.mockRejectedValueOnce(new Error("Synthetic storage outage"));
    try {
      const bytes = await sharp({
        create: { width: 5, height: 5, channels: 3, background: "white" },
      })
        .webp()
        .toBuffer();
      await expect(storeImage(bytes, "Failure fixture", "editor@example.test")).rejects.toThrow(
        "Synthetic storage outage",
      );
      const pending = (await listMedia()).items.find(
        (item) => item.state === "uploading" && item.storage === "blob",
      )!;
      expect(pending.objectKey).toMatch(/^journal\/development\//);
      await (
        await getDatabase()
      ).execute("UPDATE media SET created_at=? WHERE id=?", [
        "2020-01-01T00:00:00.000Z",
        pending.id,
      ]);
      blobMock.del.mockRejectedValueOnce(new Error("Synthetic delete outage"));
      await expect(deleteMedia(pending.id, "editor@example.test", true)).rejects.toThrow(
        "delete outage",
      );
      expect(
        (await (await getDatabase()).query("SELECT state FROM media WHERE id=?", [pending.id]))[0]
          .state,
      ).toBe("deleting");
      blobMock.del.mockResolvedValueOnce(undefined);
      await deleteMedia(pending.id, "editor@example.test", true);
      expect(blobMock.del).toHaveBeenLastCalledWith(pending.objectKey, {
        token: "synthetic-test-token",
      });
    } finally {
      delete process.env.BLOB_READ_WRITE_TOKEN;
    }
  });
});

it("reuses existing taxonomy spelling without changing established links", async () => {
  await createPost({
    ...draft,
    slug: "taxonomy-first",
    category: "Quiet Places",
    tags: ["Natural Light"],
  });
  const post = await createPost({
    ...draft,
    slug: "taxonomy-second",
    category: "quiet places",
    tags: ["natural light", "NATURAL LIGHT"],
  });
  expect(post.category).toBe("Quiet Places");
  expect(post.tags).toEqual(["Natural Light"]);
});

it("rejects invalid credentials and invalidated cookies on the actual protected handlers", async () => {
  await (await getDatabase()).execute("DELETE FROM rate_limits");
  const request = new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "x-requested-with": "Havenfield",
      "content-type": "application/json",
    },
    body: JSON.stringify({ email: "editor@example.test", password: "wrong password" }),
  });
  expect((await loginPOST(request)).status).toBe(401);
  const token = createSession("editor@example.test");
  cookieStore.set("havenfield_admin", token + "tampered");
  expect((await adminPostsGET(new Request("http://localhost:3000/api/admin/posts"))).status).toBe(
    401,
  );
  cookieStore.set(
    "havenfield_admin",
    createSession("editor@example.test", Date.now() - 9 * 60 * 60_000),
  );
  expect((await adminPostsGET(new Request("http://localhost:3000/api/admin/posts"))).status).toBe(
    401,
  );
  cookieStore.set("havenfield_admin", token);
  const previous = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "rotated private test secret".repeat(3);
  expect((await adminPostsGET(new Request("http://localhost:3000/api/admin/posts"))).status).toBe(
    401,
  );
  process.env.SESSION_SECRET = previous;
  process.env.ADMIN_PASSWORD_HASH = encoded + "invalidated";
  expect((await adminPostsGET(new Request("http://localhost:3000/api/admin/posts"))).status).toBe(
    401,
  );
  process.env.ADMIN_PASSWORD_HASH = encoded;
  cookieStore.clear();
});

it("reports a database outage through public handlers and recovers on retry", async () => {
  const db = await getDatabase();
  const outage = vi
    .spyOn(db, "query")
    .mockRejectedValueOnce(new Error("Synthetic private database outage"));
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const response = await publicPostsGET(new Request("http://localhost:3000/api/posts"));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("private");
    expect(response.headers.get("x-request-id")).toBeTruthy();
    expect((await publicPostsGET(new Request("http://localhost:3000/api/posts"))).status).toBe(200);
  } finally {
    outage.mockRestore();
    log.mockRestore();
  }
});

it("silently discards honeypot submissions without storing personal details", async () => {
  await (await getDatabase()).execute("DELETE FROM rate_limits");
  const before = (await listInquiries()).total;
  await createInquiry(new Request("http://localhost:3000/api/inquiries"), {
    name: "Bot fixture",
    email: "bot@example.test",
    message: "A synthetic honeypot submission for validation",
    consent: true,
    website: "filled trap",
  });
  expect((await listInquiries()).total).toBe(before);
});
