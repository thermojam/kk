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
    // Вырезанная фигура на прозрачном фоне: у исходника по 90px пустых полей
    // слева и справа. Без trim фигура заняла бы половину своей рамки, а
    // выравнивание по правому краю колонки цеплялось бы за пустоту.
    { name: 'course', file: 'course-img.png', widths: [360, 500], trim: true },
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

async function processOne({ name, file, widths, trim = false }) {
    const srcPath = path.join(SRC_DIR, file);
    for (const width of widths) {
        for (const { ext, encode } of FORMATS) {
            const outName = `${name}-${width}.${ext}`;
            const outPath = path.join(OUT_DIR, outName);
            if (await isFresh(srcPath, outPath)) {
                console.log(`skip   ${outName}`);
                continue;
            }
            const source = trim ? sharp(srcPath).trim() : sharp(srcPath);
            const buffer = await encode(source.resize({ width })).toBuffer();
            await fs.writeFile(outPath, buffer);
            console.log(`wrote  ${outName} (${(buffer.length / 1024).toFixed(1)} KB)`);
        }
    }
}

async function processOg() {
    const srcPath = path.join(SRC_DIR, 'about.webp');
    const targets = [
        {
            file: 'og-cover.webp',
            encode: (pipeline) => pipeline.webp({ quality: 80 }),
        },
        {
            file: 'og-cover.jpg',
            encode: (pipeline) => pipeline.jpeg({ quality: 82, mozjpeg: true }),
        },
    ];
    for (const { file, encode } of targets) {
        const outPath = path.join(SRC_DIR, file);
        if (await isFresh(srcPath, outPath)) {
            console.log(`skip   ${file}`);
            continue;
        }
        const buffer = await encode(
            sharp(srcPath).resize(1200, 630, {
                fit: 'cover',
                position: sharp.strategy.attention,
            }),
        ).toBuffer();
        await fs.writeFile(outPath, buffer);
        console.log(`wrote  ${file} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }
}

async function main() {
    await fs.mkdir(OUT_DIR, { recursive: true });
    for (const source of SOURCES) {
        await processOne(source);
    }
    await processOg();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
