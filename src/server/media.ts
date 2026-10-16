import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, lstat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { AppError } from "./errors";
import { reserveMedia, finishMedia } from "./media-registry";
import { serverEnvironment } from "./environment";

// Stay below Vercel's 4.5 MB function request cap, including multipart overhead.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_UPLOAD_BYTES + 16 * 1024;
export async function readUpload(request: Request): Promise<{ bytes: Buffer; alt: string }> {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    throw new AppError(415, "content_type", "Upload a multipart image file");
  if (Number(request.headers.get("content-length") || 0) > MAX_MULTIPART_BYTES)
    throw new AppError(413, "payload_too_large", "Images must be smaller than 4 MiB");
  if (!request.body) throw new AppError(400, "missing_file", "Choose an image file");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > MAX_MULTIPART_BYTES) {
      await reader.cancel();
      throw new AppError(413, "payload_too_large", "Images must be smaller than 4 MiB");
    }
    chunks.push(value);
  }
  let form: FormData;
  try {
    form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": request.headers.get("content-type")! },
    }).formData();
  } catch {
    throw new AppError(400, "invalid_upload", "The upload form is invalid");
  }
  const file = form.get("file");
  const alt = form.get("alt");
  if (!(file instanceof File) || file.size < 1)
    throw new AppError(400, "missing_file", "Choose an image file");
  if (file.size > MAX_UPLOAD_BYTES)
    throw new AppError(413, "payload_too_large", "Images must be smaller than 4 MiB");
  if ((alt !== null && typeof alt !== "string") || (typeof alt === "string" && alt.length > 240))
    throw new AppError(400, "validation", "Image description must be shorter than 240 characters");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new AppError(415, "image_type", "Choose a JPEG, PNG, or WebP image");
  return {
    bytes: Buffer.from(await file.arrayBuffer()),
    alt: typeof alt === "string" ? alt.trim() : "",
  };
}
export async function normalizeImage(bytes: Buffer): Promise<Buffer> {
  try {
    const image = sharp(bytes, {
      limitInputPixels: 24_000_000,
      animated: false,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    if (
      !["jpeg", "png", "webp"].includes(metadata.format || "") ||
      (metadata.pages || 1) > 1 ||
      !metadata.width ||
      !metadata.height
    )
      throw new Error("Invalid image format");
    const output = await image
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    if (output.length > MAX_UPLOAD_BYTES)
      throw new AppError(
        413,
        "payload_too_large",
        "The processed image exceeds 4 MiB; reduce its dimensions and retry",
      );
    return output;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      415,
      "image_type",
      "The file must be a valid, static JPEG, PNG, or WebP image",
    );
  }
}
export async function storeImage(bytes: Buffer, alt = "", owner = "system"): Promise<string> {
  const id = randomUUID();
  const key = `${id}.webp`;
  const metadata = await sharp(bytes).metadata();
  const dimensions = {
    id,
    width: metadata.width!,
    height: metadata.height!,
    bytes: bytes.length,
    alt,
    owner,
  };
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const objectKey = `journal/${serverEnvironment().environment}/${key}`;
    await reserveMedia({ ...dimensions, objectKey, url: "", storage: "blob" });
    const blob = await put(objectKey, bytes, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      abortSignal: AbortSignal.timeout(20000),
      contentType: "image/webp",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    await finishMedia(id, blob.url, owner);
    return blob.url;
  }
  if (serverEnvironment().hosted)
    throw new AppError(503, "media_configuration", "Media storage is not configured");
  const directory = resolve(
    /* turbopackIgnore: true */ process.env.LOCAL_UPLOAD_DIR || ".data/uploads",
  );
  await mkdir(directory, { recursive: true });
  if ((await lstat(directory)).isSymbolicLink())
    throw new AppError(409, "media_key", "Symbolic-link storage roots are not supported");
  await reserveMedia({ ...dimensions, objectKey: key, url: "", storage: "local" });
  await writeFile(resolve(directory, key), bytes, { flag: "wx" });
  const url = `/api/media/${key}`;
  await finishMedia(id, url, owner);
  return url;
}
export async function getLocalImage(key: string): Promise<Buffer | null> {
  if (
    process.env.VERCEL ||
    !/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\.webp$/.test(key) ||
    !/^[a-f0-9-]+\.webp$/.test(key)
  )
    return null;
  try {
    return await readFile(
      /* turbopackIgnore: true */ resolve(process.env.LOCAL_UPLOAD_DIR || ".data/uploads", key),
    );
  } catch {
    return null;
  }
}
