import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'images');

await mkdir(outDir, { recursive: true });

const jobs = [
    { src: 'public/image-2.png', dest: 'public/images/hero.webp' },
    { src: 'public/image-4.png', dest: 'public/images/about.webp' },
];

for (const { src, dest } of jobs) {
    await sharp(path.join(root, src))
        .webp({ quality: 82, effort: 5 })
        .toFile(path.join(root, dest));
    console.log(`✓ ${src} → ${dest}`);
}