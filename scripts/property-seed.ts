import "./database-env";
import { seedPropertyInventory } from "../src/server/properties";
import { closeDatabase } from "../src/server/database";
import { serverEnvironment } from "../src/server/environment";
const expected = process.argv.find((value) => value.startsWith("--environment="))?.split("=")[1];
if (expected !== serverEnvironment().environment)
  throw Error("Specify --environment matching the active private profile");
try {
  console.log(JSON.stringify({ environment: expected, inserted: await seedPropertyInventory() }));
} finally {
  await closeDatabase();
}
