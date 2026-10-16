import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readRecoveryBundle } from "./recovery-bundle";

const magic = Buffer.from("HAVENFIELD-BACKUP-1\n");
const limit = 256 * 1024 * 1024;
const validName = (name: string) =>
  ["database.json", "manifest.json"].includes(name) || /^[a-f0-9-]{36}\.webp$/.test(name);

export function encryptBackupBytes(plain: Buffer, key: Buffer): Buffer {
  if (key.length !== 32 || plain.length > limit) throw new Error("Invalid backup key or size");
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(magic);
  const encrypted = Buffer.concat([cipher.update(gzipSync(plain)), cipher.final()]);
  return Buffer.concat([magic, nonce, cipher.getAuthTag(), encrypted]);
}

export function decryptBackupBytes(encrypted: Buffer, key: Buffer): Buffer {
  if (
    key.length !== 32 ||
    encrypted.length > limit ||
    encrypted.length < magic.length + 29 ||
    !encrypted.subarray(0, magic.length).equals(magic)
  )
    throw new Error("Invalid encrypted backup");
  try {
    const offset = magic.length;
    const decipher = createDecipheriv("aes-256-gcm", key, encrypted.subarray(offset, offset + 12));
    decipher.setAAD(magic);
    decipher.setAuthTag(encrypted.subarray(offset + 12, offset + 28));
    const compressed = Buffer.concat([
      decipher.update(encrypted.subarray(offset + 28)),
      decipher.final(),
    ]);
    return gunzipSync(compressed, { maxOutputLength: limit });
  } catch {
    throw new Error("Backup authentication failed: wrong key, damaged file or unsupported size");
  }
}

async function boundedFile(path: string, maximum: number) {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size > maximum)
    throw new Error("Unsafe backup input or size");
  return readFile(path);
}

export async function readBackupKey(path: string) {
  const key = await boundedFile(path, 32);
  if (key.length !== 32) throw new Error("Backup key must contain exactly 32 binary bytes");
  return key;
}

export async function encryptRecoveryBundle(source: string, output: string, key: Buffer) {
  const bundle = await readRecoveryBundle(source);
  const files: Record<string, string> = {};
  let total = 0;
  const names = [
    "database.json",
    "manifest.json",
    ...[...bundle.objects.keys()].map((id) => `${id}.webp`),
  ];
  for (const name of names) {
    const bytes = await boundedFile(resolve(source, name), limit);
    total += Math.ceil(bytes.length / 3) * 4;
    if (total > limit - 4096) throw new Error("Backup exceeds the encrypted archive size budget");
    files[name] = bytes.toString("base64");
  }
  const encrypted = encryptBackupBytes(Buffer.from(JSON.stringify({ format: 1, files })), key);
  await writeFile(output, encrypted, { flag: "wx", mode: 0o600 });
  // Verify the actual written bytes before asking the owner to copy the archive.
  decryptBackupBytes(await boundedFile(output, limit), key);
  return { bytes: encrypted.length, mediaObjects: bundle.objects.size };
}

export async function decryptRecoveryBundle(source: string, output: string, key: Buffer) {
  const decoded: unknown = JSON.parse(
    decryptBackupBytes(await boundedFile(source, limit), key).toString("utf8"),
  );
  if (
    !decoded ||
    typeof decoded !== "object" ||
    !("format" in decoded) ||
    decoded.format !== 1 ||
    !("files" in decoded)
  )
    throw new Error("Invalid archive inventory");
  const files = decoded.files;
  if (!files || typeof files !== "object" || Array.isArray(files))
    throw new Error("Invalid archive files");
  const entries = Object.entries(files);
  if (
    !entries.some(([name]) => name === "database.json") ||
    !entries.some(([name]) => name === "manifest.json") ||
    entries.some(
      ([name, value]) =>
        !validName(name) ||
        typeof value !== "string" ||
        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value),
    )
  )
    throw new Error("Unsafe archive filename or encoding");
  // A new directory is mandatory; never merge into an existing restore target.
  await mkdir(output, { recursive: false, mode: 0o700 });
  for (const [name, value] of entries)
    await writeFile(resolve(output, name), Buffer.from(value as string, "base64"), {
      flag: "wx",
      mode: 0o600,
    });
  const verified = await readRecoveryBundle(output);
  return { mediaObjects: verified.objects.size };
}
