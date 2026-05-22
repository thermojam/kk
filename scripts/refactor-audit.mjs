#!/usr/bin/env node
// Prints a JSON snapshot of repo health metrics to stdout.
// Usage: node scripts/refactor-audit.mjs > docs/refactor-baseline.json

import {execSync} from 'node:child_process';
import {readdirSync, readFileSync, statSync, existsSync} from 'node:fs';
import {join, relative} from 'node:path';

const ROOT = process.cwd();
const SRC_DIRS = ['app', 'components', 'lib', 'content'];

function walk(dir, exts = ['.ts', '.tsx']) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const s = statSync(p);
        if (s.isDirectory()) out.push(...walk(p, exts));
        else if (exts.some((e) => name.endsWith(e))) out.push(p);
    }
    return out;
}

const files = SRC_DIRS.flatMap((d) => walk(join(ROOT, d)));

function read(p) {
    try {
        return readFileSync(p, 'utf8');
    } catch {
        return '';
    }
}

function safe(cmd, fallback = null) {
    try {
        return execSync(cmd, {stdio: ['ignore', 'pipe', 'ignore']}).toString();
    } catch (e) {
        if (e.stdout) return e.stdout.toString();
        return fallback;
    }
}

function count(re, text) {
    const m = text.match(re);
    return m ? m.length : 0;
}

// --- ESLint ---
let eslintErrors = null,
    eslintWarnings = null;
const eslintRaw = safe('npx --no-install eslint . --format json', null);
if (eslintRaw) {
    try {
        const data = JSON.parse(eslintRaw);
        eslintErrors = data.reduce((a, f) => a + f.errorCount, 0);
        eslintWarnings = data.reduce((a, f) => a + f.warningCount, 0);
    } catch {
    }
}

// --- TypeScript ---
const tscOut = safe('npx --no-install tsc --noEmit --pretty false 2>&1', null);
const tsErrors = tscOut === null ? null : (tscOut.match(/error TS\d+:/g) || []).length;

// --- File sizes ---
const fileSizes = files.map((p) => ({
    path: relative(ROOT, p),
    lines: read(p).split('\n').length,
}));
const filesOver100 = fileSizes.filter((f) => f.lines > 100).length;
const filesOver200 = fileSizes.filter((f) => f.lines > 200).length;

// --- Code quality probes ---
const allCode = files.map(read).join('\n');
const anyUsages = count(/:\s*any\b|<any>/g, allCode);
const tsIgnores = count(/@ts-ignore|@ts-expect-error/g, allCode);
const consoleLogs = count(/\bconsole\.(log|debug|info)\b/g, allCode);
const todoMarkers = count(/\b(TODO|FIXME|XXX|HACK)\b/g, allCode);

// --- A11y probes ---
const imgTagsRaw = allCode.match(/<img\b[^>]*>/g) || [];
const imgWithoutAlt = imgTagsRaw.filter((t) => !/\balt\s*=/.test(t)).length;
const nextImageUsage = count(/<Image\b/g, allCode);
const rawImgUsage = imgTagsRaw.length;
const ariaLabelUsage = count(/\baria-label\s*=/g, allCode);
const semanticMain = count(/<main\b/g, allCode);

// --- UI consistency probes ---
const hardcodedHex = count(/#[0-9a-fA-F]{3,8}\b/g, allCode);
const inlineRgb = count(/rgba?\(/g, allCode);

// --- Bundle size (build dir if present) ---
let bundleStaticBytes = null;
try {
    const out = safe('du -sk .next/static 2>/dev/null', null);
    if (out) bundleStaticBytes = parseInt(out.trim().split(/\s+/)[0], 10) * 1024;
} catch {
}

// --- Output ---
const snapshot = {
    timestamp: new Date().toISOString(),
    files: {total: files.length, over100: filesOver100, over200: filesOver200},
    codeQuality: {
        eslintErrors,
        eslintWarnings,
        tsErrors,
        anyUsages,
        tsIgnores,
        consoleLogs,
        todoMarkers,
    },
    uiConsistency: {hardcodedHex, inlineRgb},
    a11y: {
        rawImgUsage,
        imgWithoutAlt,
        nextImageUsage,
        ariaLabelUsage,
        semanticMainCount: semanticMain,
    },
    perf: {bundleStaticBytes},
};

process.stdout.write(JSON.stringify(snapshot, null, 2) + '\n');
