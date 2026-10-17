import "./database-env";
import { journalDrafts } from "../src/content/journal-drafts";
import { getAdminPost, updatePost } from "../src/server/blog";
import { getDatabase, closeDatabase } from "../src/server/database";
import { serverEnvironment } from "../src/server/environment";
const selected = [
  "daylight-through-the-seasons",
  "read-a-floor-plan-in-everyday-routes",
  "small-spaces-with-room-to-live",
];
const expected = process.argv.find((v) => v.startsWith("--environment="))?.split("=")[1];
const environment = serverEnvironment().environment,
  apply = process.argv.includes("--apply");
if (expected !== environment)
  throw Error("An explicit matching --environment is required; default operation is a dry run");
const result = { environment, apply, published: [] as string[], alreadyPublic: [] as string[] };
try {
  const db = await getDatabase(),
    pending: NonNullable<Awaited<ReturnType<typeof getAdminPost>>>[] = [];
  for (const slug of selected) {
    const [row] = await db.query<{ id: string }>("SELECT id FROM posts WHERE slug=?", [slug]);
    const original = journalDrafts.find((p) => p.slug === slug);
    if (!row || !original) throw Error("Import the original Plan 03 drafts before publishing");
    const post = await getAdminPost(row.id);
    if (!post) throw Error("Selected story missing");
    if (post.status === "published") {
      result.alreadyPublic.push(slug);
      continue;
    }
    if (post.status !== "draft" || post.body !== original.body || post.title !== original.title)
      throw Error("Author-edited or scheduled copy needs deliberate editorial review");
    pending.push(post);
  }
  for (const post of pending) {
    const { id, version, createdAt, updatedAt, ...input } = post;
    void createdAt;
    void updatedAt;
    if (apply)
      await updatePost(
        id,
        {
          ...input,
          body: post.body.replaceAll("\\n", "\n"),
          status: "published",
          publishedAt: new Date().toISOString(),
          noindex: false,
        },
        version,
        "plan04-editorial",
        "article.publish",
      );
    result.published.push(post.slug);
  }
  console.log(JSON.stringify(result));
} finally {
  await closeDatabase();
}
