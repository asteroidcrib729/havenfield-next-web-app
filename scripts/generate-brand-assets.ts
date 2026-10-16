import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
const mark = await readFile("public/brand/mark.svg");
for (const size of [32, 180, 192, 512])
  await sharp(mark).resize(size, size).png().toFile(`public/brand/icon-${size}.png`);
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f8f6f1"/><path d="M860 180L960 80l100 100v160H860z" fill="none" stroke="#875a40" stroke-width="10"/><path d="M900 340V215h120v125" fill="none" stroke="#875a40" stroke-width="8"/><text x="80" y="170" font-family="sans-serif" font-size="22" letter-spacing="6" fill="#875a40">HOMES &amp; PERSPECTIVES</text><text x="80" y="300" font-family="serif" font-size="108" fill="#242b27">Havenfield</text><text x="80" y="410" font-family="serif" font-size="56" fill="#242b27">Room for a different rhythm.</text><text x="80" y="550" font-family="sans-serif" font-size="22" fill="#626b63">An independent fictional portfolio concept</text></svg>';
await writeFile("public/brand/social.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("public/brand/social.png");
console.log("Generated original Havenfield social card and raster icons.");
