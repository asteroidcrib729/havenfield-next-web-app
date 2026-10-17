import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { parseBackup, type DatabaseBackup } from "./backup";
type ObjectEntry = { id: string; file: string; checksum: string; bytes: number };
type Manifest = { format: 1; databaseChecksum: string; objects: ObjectEntry[] };
const digest = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const fileName = (id: string) => {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid recovery object identity");
  return `${id}.webp`;
};
export async function createRecoveryBundle(
  backup: DatabaseBackup,
  directory: string,
  readObject: (item: Record<string, string | number | null>) => Promise<Buffer>,
) {
  parseBackup(backup);
  const root = resolve(directory);
  await mkdir(root, { recursive: false });
  const objects: ObjectEntry[] = [];
  for (const item of backup.payload.tables.media) {
    if (item.state === "deleted") continue;
    if (item.state !== "active")
      throw new Error("Resolve interrupted media operations before creating a recovery bundle");
    const bytes = await readObject(item);
    if (bytes.length !== Number(item.bytes) || bytes.length > 4 * 1024 * 1024)
      throw new Error("Recovery object size does not match the media registry");
    const file = fileName(String(item.id));
    await writeFile(resolve(root, file), bytes, { flag: "wx", mode: 0o600 });
    objects.push({ id: String(item.id), file, checksum: digest(bytes), bytes: bytes.length });
  }
  await writeFile(resolve(root, "database.json"), JSON.stringify(backup), {
    flag: "wx",
    mode: 0o600,
  });
  const manifest: Manifest = { format: 1, databaseChecksum: backup.checksum, objects };
  await writeFile(resolve(root, "manifest.json"), JSON.stringify(manifest), {
    flag: "wx",
    mode: 0o600,
  });
  return manifest;
}
export async function readRecoveryBundle(directory: string) {
  const root = resolve(directory);
  if ((await lstat(root)).isSymbolicLink())
    throw new Error("Recovery directories must not be symbolic links");
  const bounded = async (file: string, max: number) => {
    const path = resolve(root, file),
      part = relative(root, path);
    if (isAbsolute(part) || part.startsWith("..")) throw new Error("Invalid recovery path");
    const info = await lstat(path);
    if (info.isSymbolicLink() || !info.isFile() || info.size > max)
      throw new Error("Invalid recovery file");
    return readFile(path);
  };
  const rawBackup = JSON.parse(
    (await bounded("database.json", 100 * 1024 * 1024)).toString("utf8"),
  );
  const backup = parseBackup(rawBackup);
  const manifest = JSON.parse(
    (await bounded("manifest.json", 4 * 1024 * 1024)).toString("utf8"),
  ) as Manifest;
  if (
    manifest.format !== 1 ||
    manifest.databaseChecksum !== rawBackup.checksum ||
    !Array.isArray(manifest.objects)
  )
    throw new Error("Recovery manifest does not match the database snapshot");
  const expected = backup.payload.tables.media.filter((item) => item.state === "active");
  if (
    expected.length !== manifest.objects.length ||
    new Set(manifest.objects.map((item) => item.id)).size !== expected.length
  )
    throw new Error("Recovery object inventory is incomplete");
  const objects = new Map<string, Buffer>();
  for (const item of manifest.objects) {
    if (
      item.file !== fileName(item.id) ||
      !expected.some((row) => row.id === item.id && Number(row.bytes) === item.bytes)
    )
      throw new Error("Invalid recovery object inventory");
    const bytes = await bounded(item.file, 4 * 1024 * 1024);
    if (bytes.length !== item.bytes || digest(bytes) !== item.checksum)
      throw new Error("Recovery object checksum mismatch");
    objects.set(item.id, bytes);
  }
  return { backup, objects };
}
export async function readOwnedObject(item: Record<string, string | number | null>) {
  if (item.storage === "local") {
    const directory = resolve(process.env.LOCAL_UPLOAD_DIR || ".data/uploads");
    if ((await lstat(directory)).isSymbolicLink())
      throw new Error("Upload root must not be a symbolic link");
    const key = fileName(String(item.id));
    if (item.object_key !== key) throw new Error("Invalid local media key");
    const path = resolve(directory, key),
      info = await lstat(path);
    if (info.isSymbolicLink() || !info.isFile() || info.size > 4 * 1024 * 1024)
      throw new Error("Invalid local object");
    return readFile(path);
  }
  const url = new URL(String(item.url));
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".public.blob.vercel-storage.com") ||
    decodeURIComponent(url.pathname.slice(1)) !== item.object_key ||
    url.username ||
    url.password ||
    url.search
  )
    throw new Error("Only registered public Blob objects can be exported");
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.body) throw new Error("Blob recovery download failed");
  const reader = response.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.length;
    if (size > 4 * 1024 * 1024) {
      await reader.cancel();
      throw new Error("Blob object exceeds recovery budget");
    }
    chunks.push(part.value);
  }
  return Buffer.concat(chunks);
}
