import { readdir, lstat, readFile, rm } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
export function retainedBundles(items: { name: string; date: Date }[]) {
  const sorted = [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
  const daily = new Map<string, string>(),
    weekly = new Map<number, string>();
  for (const item of sorted) {
    const day = item.date.toISOString().slice(0, 10),
      week = Math.floor((item.date.getTime() + 3 * 86400_000) / (7 * 86400_000));
    if (!daily.has(day) && daily.size < 7) daily.set(day, item.name);
    if (!weekly.has(week) && weekly.size < 4) weekly.set(week, item.name);
  }
  return new Set([...daily.values(), ...weekly.values()]);
}
export async function pruneRecoveryBundles(destination: string, dryRun = true) {
  const root = resolve(destination);
  if ((await lstat(root)).isSymbolicLink())
    throw new Error("Backup roots must not be symbolic links");
  const items: { name: string; date: Date }[] = [];
  for (const name of await readdir(root)) {
    const match =
      /^havenfield-backup-(\d{4}-\d{2}-\d{2})T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-f0-9-]{36}$/.exec(name);
    if (!match) continue;
    const path = resolve(root, name),
      part = relative(root, path);
    if (isAbsolute(part) || part.startsWith("..") || (await lstat(path)).isSymbolicLink())
      throw new Error("Unsafe owned backup path");
    const manifestPath = resolve(path, "manifest.json");
    try {
      if ((await lstat(manifestPath)).isSymbolicLink()) continue;
      const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      if (
        manifest.format !== 1 ||
        !/^[a-f0-9]{64}$/.test(manifest.databaseChecksum) ||
        !Array.isArray(manifest.objects)
      )
        continue;
    } catch {
      continue;
    }
    items.push({ name, date: new Date(match[1] + "T00:00:00.000Z") });
  }
  const keep = retainedBundles(items);
  const removed = items.filter((item) => !keep.has(item.name)).map((item) => item.name);
  if (!dryRun)
    for (const name of removed) {
      const path = resolve(root, name);
      const entries = await readdir(path, { withFileTypes: true });
      if (
        entries.some(
          (entry) =>
            entry.isDirectory() ||
            entry.isSymbolicLink() ||
            (!["database.json", "manifest.json"].includes(entry.name) &&
              !/^[a-f0-9-]{36}\.webp$/.test(entry.name)),
        )
      )
        throw new Error("Unexpected backup contents; automatic pruning refused");
      await rm(path, { recursive: true, force: false });
    }
  return { retained: keep.size, candidates: removed, dryRun };
}
