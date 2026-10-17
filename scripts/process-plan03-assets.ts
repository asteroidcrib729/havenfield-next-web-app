import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, relative } from "node:path";
import sharp from "sharp";
const file = "development-plans/plan-03-assets.json";
const manifest = JSON.parse(await readFile(file, "utf8"));
const sources: Record<string, string> = JSON.parse(
  await readFile(".data/plan03/source-map.json", "utf8"),
);
const exactPrompts: Record<string, string> = JSON.parse(
  await readFile(".data/plan03/generation-prompts.json", "utf8"),
);
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
for (const asset of manifest.assets) {
  if (!sources[asset.id]) continue;
  if (
    !asset.sourcePath.startsWith(".data/plan03/sources/") ||
    !asset.outputPath.startsWith("public/media/plan03/") ||
    relative(resolve("public/media/plan03"), resolve(asset.outputPath)).startsWith("..")
  )
    throw new Error("Unsafe asset destination");
  const bytes = await readFile(sources[asset.id]);
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Image dimensions missing");
  await mkdir(dirname(asset.sourcePath), { recursive: true });
  try {
    await copyFile(sources[asset.id], asset.sourcePath, constants.COPYFILE_EXCL);
  } catch (error) {
    if (
      !(error instanceof Error && "code" in error && error.code === "EEXIST") ||
      hash(await readFile(asset.sourcePath)) !== hash(bytes)
    )
      throw error;
  }
  await mkdir(dirname(asset.outputPath), { recursive: true });
  let output = await sharp(bytes)
    .rotate()
    .resize({ width: 1536, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  if (output.length > 350 * 1024)
    output = await sharp(bytes)
      .rotate()
      .resize({ width: 1536, withoutEnlargement: true })
      .webp({ quality: 74 })
      .toBuffer();
  if (output.length > 350 * 1024)
    output = await sharp(bytes)
      .rotate()
      .resize({ width: 1440, withoutEnlargement: true })
      .webp({ quality: 64 })
      .toBuffer();
  if (output.length > 350 * 1024) throw new Error("Image exceeds wide-image budget: " + asset.id);
  await writeFile(asset.outputPath, output);
  if (exactPrompts[asset.id]) asset.generationPrompt = exactPrompts[asset.id];
  asset.derivatives = [];
  for (const width of asset.id === "HF03-19" ? [480] : []) {
    const path = asset.outputPath.replace(".webp", "-" + width + ".webp");
    const data = await sharp(bytes)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    await writeFile(path, data);
    asset.derivatives.push({ path, width, bytes: data.length, sha256: hash(data) });
  }
  asset.actualDimensions = { width: metadata.width, height: metadata.height };
  asset.sourceSha256 = hash(bytes);
  asset.sha256 = hash(output);
  asset.bytes = output.length;
  asset.approval = "technical-review-passed";
  asset.generatedOn = "2026-10-17";
}
manifest.approvedSources = manifest.assets.filter(
  (a: { approval: string }) => a.approval === "technical-review-passed",
).length;
await writeFile(file, JSON.stringify(manifest, null, 2) + "\n");
await writeFile(
  "src/content/visuals.ts",
  "// Small runtime index; prompts and source hashes stay in development-plans.\nexport const visualAlt: Record<string,string> = " +
    JSON.stringify(
      Object.fromEntries(
        manifest.assets
          .filter((a: { approval: string }) => a.approval === "technical-review-passed")
          .map((a: { outputPath: string; alt: string }) => [
            "/" + a.outputPath.replace(/^public\//, ""),
            a.alt,
          ]),
      ),
      null,
      2,
    ) +
    ";\n",
);
await writeFile(
  "src/content/asset-library.ts",
  "// Public read-only image index. Original prompts remain in development-plans.\nexport const repositoryAssets = " +
    JSON.stringify(
      manifest.assets
        .filter((a: { approval: string }) => a.approval === "technical-review-passed")
        .map(
          (a: {
            id: string;
            outputPath: string;
            alt: string;
            group: string;
            actualDimensions: { width: number; height: number };
            focalPoint: { x: number; y: number };
          }) => ({
            id: a.id,
            url: "/" + a.outputPath.replace(/^public\//, ""),
            alt: a.alt,
            collection: a.group,
            width: a.actualDimensions.width,
            height: a.actualDimensions.height,
            focalX: a.focalPoint?.x ?? 50,
            focalY: a.focalPoint?.y ?? 50,
          }),
        ),
      null,
      2,
    ) +
    ";\n",
);
const available = manifest.assets.filter(
  (a: { approval: string }) => a.approval === "technical-review-passed",
);
const width = 320,
  height = 236,
  cols = 4,
  rows = Math.ceil(available.length / cols);
const overlays = [];
for (let i = 0; i < available.length; i++) {
  const thumb = await sharp(available[i].outputPath).resize(320, 213, { fit: "cover" }).toBuffer();
  const x = (i % cols) * width,
    y = Math.floor(i / cols) * height;
  overlays.push({ input: thumb, left: x, top: y });
  overlays.push({
    input: Buffer.from(
      '<svg width="320" height="23"><rect width="320" height="23" fill="#f8f6f1"/><text x="8" y="16" font-family="sans-serif" font-size="12" fill="#242b27">' +
        available[i].id +
        " " +
        available[i].subject +
        "</text></svg>",
    ),
    left: x,
    top: y + 213,
  });
}
await mkdir("development-plans/assets", { recursive: true });
if (available.length)
  await sharp({
    create: { width: cols * width, height: rows * height, channels: 3, background: "#f8f6f1" },
  })
    .composite(overlays)
    .webp({ quality: 84 })
    .toFile("development-plans/assets/plan03-contact-sheet.webp");
console.log(
  JSON.stringify({
    approvedSources: manifest.approvedSources,
    target: 28,
    optimizedBytes: available.reduce((n: number, a: { bytes: number }) => n + a.bytes, 0),
  }),
);
