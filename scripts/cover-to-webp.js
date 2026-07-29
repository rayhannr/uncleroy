// Converts a cover screenshot PNG to webp under 100KB, stepping quality down until it fits.
// Usage: node scripts/cover-to-webp.js <input.png> <slug>
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 100 * 1024;
const QUALITY_STEPS = [80, 70, 60, 50, 40, 30];

const [, , inputPath, slug] = process.argv;

if (!inputPath || !slug) {
  console.error("Usage: node scripts/cover-to-webp.js <input.png> <slug>");
  process.exit(1);
}

const outputPath = path.join("src/contents/blog/images", `${slug}.webp`);

let buffer;
let quality;
for (quality of QUALITY_STEPS) {
  buffer = await sharp(inputPath).webp({ quality }).toBuffer();
  if (buffer.length <= MAX_BYTES) break;
}

if (buffer.length > MAX_BYTES) {
  console.error(
    `Warning: could not get under 100KB (lowest tried quality=${quality}, size=${(buffer.length / 1024).toFixed(1)}KB)`
  );
}

await writeFile(outputPath, buffer);
console.log(`Wrote ${outputPath} (${(buffer.length / 1024).toFixed(1)}KB, quality=${quality})`);
