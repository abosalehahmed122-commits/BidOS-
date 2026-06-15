// Renders the brand SVGs to high-res transparent PNGs.
// Usage: node scripts/export-logo.mjs
import sharp from 'sharp';

const pub = 'apps/web/public';
const jobs = [
  { in: `${pub}/logo.svg`, out: `${pub}/logo.png`, density: 288 }, // ~992x256 (4x)
  { in: `${pub}/logo-mark.svg`, out: `${pub}/logo-mark.png`, density: 576 }, // ~512x512
  { in: `${pub}/logo-mark.svg`, out: `${pub}/favicon-256.png`, density: 576, resize: 256 },
];

for (const j of jobs) {
  let img = sharp(j.in, { density: j.density });
  if (j.resize) img = img.resize(j.resize, j.resize);
  const info = await img.png().toFile(j.out);
  console.log(`${j.out}  ${info.width}x${info.height}`);
}
