import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'public', 'images');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'generated');

const SOURCES = [
    { name: 'hero', file: 'hero.webp', widths: [960, 1440, 1920] },
    { name: 'about', file: 'about.webp', widths: [320, 480, 760] },
];

const FORMATS = [
    { ext: 'avif', encode: (p) => p.avif({ quality: 70, effort: 4 }) },
    { ext: 'webp', encode: (p) => p.webp({ quality: 80 }) },
];

async function isFresh(srcPath, outPath) {
    try {
        const [srcStat, outStat] = await Promise.all([fs.stat(srcPath), fs.stat(outPath)]);
        return outStat.mtimeMs >= srcStat.mtimeMs;
    } catch {
        return false;
    }
}

async function processOne({ name, file, widths }) {
    const srcPath = path.join(SRC_DIR, file);
    for (const width of widths) {
        for (const { ext, encode } of FORMATS) {
            const outName = `${name}-${width}.${ext}`;
            const outPath = path.join(OUT_DIR, outName);
            if (await isFresh(srcPath, outPath)) {
                console.log(`skip   ${outName}`);
                continue;
            }
            const buffer = await encode(sharp(srcPath).resize({ width })).toBuffer();
            await fs.writeFile(outPath, buffer);
            console.log(`wrote  ${outName} (${(buffer.length / 1024).toFixed(1)} KB)`);
        }
    }
}

async function main() {
    await fs.mkdir(OUT_DIR, { recursive: true });
    for (const source of SOURCES) {
        await processOne(source);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
