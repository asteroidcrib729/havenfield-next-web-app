import "./database-env";
import { createPost, getAdminPost, updatePost } from "../src/server/blog";
import { closeDatabase, getDatabase } from "../src/server/database";
import { serverEnvironment } from "../src/server/environment";
import { editorialSeed } from "../src/server/seed-content";
import { journalDrafts } from "../src/content/journal-drafts";
import type { BlogPostInput } from "../src/lib/blog-types";
const expected = process.argv.find((value) => value.startsWith("--environment="))?.split("=")[1];
const apply = process.argv.includes("--apply");
const environment = serverEnvironment().environment;
if (expected !== environment)
  throw new Error(
    "Specify --environment matching the active private profile; default operation is a dry run",
  );
const result = {
  environment,
  apply,
  createdDrafts: [] as string[],
  existingDrafts: [] as string[],
  updatedCovers: [] as string[],
};
try {
  const db = await getDatabase();
  for (const draft of journalDrafts) {
    const existing = await db.query("SELECT id FROM posts WHERE slug=?", [draft.slug]);
    if (existing.length) {
      result.existingDrafts.push(draft.slug);
      continue;
    }
    if (apply) await createPost(draft, "plan03-content");
    result.createdDrafts.push(draft.slug);
  }
  for (const seed of editorialSeed) {
    const [row] = await db.query<{ id: string }>("SELECT id FROM posts WHERE slug=?", [seed.slug]);
    if (!row) continue;
    const post = await getAdminPost(row.id);
    if (!post || post.coverImage !== "/media/interior.jpg") continue;
    const input: BlogPostInput = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      author: post.author,
      category: post.category,
      tags: post.tags,
      coverImage: seed.coverImage,
      coverAlt: seed.coverAlt,
      status: post.status,
      publishedAt: post.publishedAt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      canonicalUrl: post.canonicalUrl,
      noindex: post.noindex,
    };
    if (apply)
      await updatePost(post.id, input, post.version, "plan03-content", "article.cover-refresh");
    result.updatedCovers.push(post.slug);
  }
  console.log(JSON.stringify(result));
} finally {
  await closeDatabase();
}
