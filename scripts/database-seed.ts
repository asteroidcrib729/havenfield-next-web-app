import { seedPropertyInventory } from "../src/server/properties";
import "./database-env";
import { createPost } from "../src/server/blog";
import { closeDatabase, getDatabase } from "../src/server/database";
import { editorialSeed } from "../src/server/seed-content";
await seedPropertyInventory();
let inserted = 0;
for (const input of editorialSeed) {
  const existing = await (
    await getDatabase()
  ).query("SELECT id FROM posts WHERE slug=?", [input.slug]);
  if (existing.length) continue;
  await createPost(input);
  inserted++;
}
console.log(`Seeded ${inserted} original Havenfield articles. Existing articles were preserved.`);
await closeDatabase();
