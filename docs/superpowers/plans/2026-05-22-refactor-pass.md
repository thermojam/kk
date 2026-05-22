# Refactor Pass + Audit Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conservative refactor across code quality / UI consistency / a11y+perf with a static HTML dashboard comparing before/after metrics and listing prioritized recommendations.

**Architecture:** Audit-driven. Snapshot metrics before, apply only safe changes in three tracks, snapshot after, render a self-contained HTML dashboard from both JSON snapshots. One final git commit.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, ESLint 9, TypeScript 5. Node shell scripts for audit. No new deps.

**Verification policy** (project preference, no automated tests in MVP): each phase ends with `npm run lint`, `npx tsc --noEmit`. Phase 5 also runs `npm run build` and a manual browser pass.

---

## File Map

**New files:**
- `scripts/refactor-audit.mjs` — single Node script that prints all metrics as JSON to stdout. No deps beyond `node:fs`, `node:child_process`. Reusable for before/after.
- `docs/refactor-baseline.json` — output of Phase 1.
- `docs/refactor-after.json` — output of Phase 5.
- `docs/refactor-dashboard.html` — static HTML, inline CSS, no JS deps; consumes both JSONs (embedded at generate-time).

**Existing files likely modified (will be confirmed by audit):**
- `components/ui/*.tsx` — possibly `aria-label` for icon-only buttons (`Dialog` close, etc.).
- `components/sections/*.tsx` — possibly unused imports, magic numbers, alt-attributes.
- `components/layout/*.tsx` — semantic landmarks check (`<header>`, `<footer>` already exist).
- `components/carousel/*.tsx` — `aria-label` on arrow buttons / dots.
- `app/(public)/layout.tsx` — confirm `<main>` wrapper.
- `app/globals.css` — only if hard-coded colors found that map to Tailwind tokens (unlikely).

**Explicitly NOT touched:**
- `SPEC.md`, `content/home.ts`, `public/**`, `package.json`.

---

## Task 1: Audit Script

**Files:**
- Create: `scripts/refactor-audit.mjs`

- [ ] **Step 1: Write the audit script**

```javascript
#!/usr/bin/env node
// Prints a JSON snapshot of repo health metrics to stdout.
// Usage: node scripts/refactor-audit.mjs > docs/refactor-baseline.json

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

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
  try { return readFileSync(p, 'utf8'); } catch { return ''; }
}

function safe(cmd, fallback = null) {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); }
  catch { return fallback; }
}

function count(re, text) {
  const m = text.match(re);
  return m ? m.length : 0;
}

// --- ESLint ---
let eslintErrors = null, eslintWarnings = null;
const eslintRaw = safe('npx --no-install eslint . --format json', null);
if (eslintRaw) {
  try {
    const data = JSON.parse(eslintRaw);
    eslintErrors = data.reduce((a, f) => a + f.errorCount, 0);
    eslintWarnings = data.reduce((a, f) => a + f.warningCount, 0);
  } catch {}
}

// --- TypeScript ---
const tscOut = safe('npx --no-install tsc --noEmit --pretty false 2>&1', '');
const tsErrors = tscOut ? (tscOut.match(/error TS\d+:/g) || []).length : null;

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
const imgTagsRaw = (allCode.match(/<img\b[^>]*>/g) || []);
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
  const out = safe('du -sb .next/static 2>/dev/null', null);
  if (out) bundleStaticBytes = parseInt(out.trim().split(/\s+/)[0], 10);
} catch {}

// --- Output ---
const snapshot = {
  timestamp: new Date().toISOString(),
  files: { total: files.length, over100: filesOver100, over200: filesOver200 },
  codeQuality: {
    eslintErrors, eslintWarnings, tsErrors,
    anyUsages, tsIgnores, consoleLogs, todoMarkers,
  },
  uiConsistency: { hardcodedHex, inlineRgb },
  a11y: {
    rawImgUsage, imgWithoutAlt, nextImageUsage,
    ariaLabelUsage, semanticMainCount: semanticMain,
  },
  perf: { bundleStaticBytes },
};

process.stdout.write(JSON.stringify(snapshot, null, 2) + '\n');
```

- [ ] **Step 2: Make executable and dry-run**

```bash
chmod +x scripts/refactor-audit.mjs
node scripts/refactor-audit.mjs | head -20
```

Expected: JSON output with non-null counters for `files`, `codeQuality.*`, `a11y.*`. `bundleStaticBytes` may be `null` if no build yet.

---

## Task 2: Baseline Snapshot

**Files:**
- Create: `docs/refactor-baseline.json`

- [ ] **Step 1: Build to get bundle size baseline**

```bash
npm run build
```

Expected: build succeeds. If it fails — STOP and report.

- [ ] **Step 2: Run audit script**

```bash
node scripts/refactor-audit.mjs > docs/refactor-baseline.json
cat docs/refactor-baseline.json
```

Expected: JSON file with all categories filled. Bundle bytes non-null after the build above.

- [ ] **Step 3: Manual augmentation**

Open `docs/refactor-baseline.json` and append (in a `manualNotes` field) any observations that the script can't detect:
- Existence of `<main>` landmark in `app/(public)/layout.tsx` (yes/no).
- Icon-only `<button>` instances and whether they have `aria-label`.
- Any `<img>` without `alt` — list file:line.

Edit format:

```json
"manualNotes": {
  "semanticMainInLayout": true,
  "iconButtonsMissingAriaLabel": ["path/to/file.tsx:42"],
  "imgsMissingAlt": []
}
```

If list is empty, use `[]`.

---

## Task 3: Track A — Code Quality

**Goal:** Apply only safe code-quality fixes the baseline surfaced.

- [ ] **Step 1: Auto-fix lint where safe**

```bash
npx eslint . --fix
```

Inspect the diff (`git diff`). Revert any change that:
- Reformats whole file (out of scope — Prettier handles formatting separately).
- Changes runtime behavior.

If unsure, revert that hunk and add it to recommendations later.

- [ ] **Step 2: Remove unused imports/variables identified by ESLint**

If `--fix` didn't catch them, do it manually based on remaining warnings.

```bash
npx eslint . --format compact
```

For each `'X' is defined but never used` — remove the unused symbol. For each `'Y' is assigned a value but never used` — remove the assignment.

- [ ] **Step 3: Remove `console.log` / dead code if present**

```bash
grep -rn "console\.\(log\|debug\)" app components lib content 2>/dev/null || echo "none found"
```

Remove only `console.log/debug/info`. Keep `console.warn/error` if present.

- [ ] **Step 4: Magic-number scan (manual)**

```bash
grep -rnE "setTimeout\([^,]+,\s*[0-9]{3,}" app components lib 2>/dev/null
grep -rnE "[^a-zA-Z_]([0-9]{3,})px" app components 2>/dev/null
```

For each result: if value appears 2+ times in same file with same meaning, lift to a `const` at top of file. If used once, leave it.

**Do not create new files for constants.** Inline `const NAME = value` at top of consuming file.

- [ ] **Step 5: Verify Track A**

```bash
npx eslint . --format compact
npx tsc --noEmit
```

Expected: errors = 0, warnings ≤ baseline.

---

## Task 4: Track B — UI Consistency

**Goal:** Align spacing/colors only where divergence is clearly accidental.

- [ ] **Step 1: Inventory section vertical padding**

```bash
grep -rnE "\bpy-(16|20|24|28|32)\b" components/sections components/layout
```

Document the result. If 90%+ of sections use one value (e.g., `py-24`) and 1-2 outliers use another without spec/plan justification — align outliers to majority. **Otherwise, leave as is.**

Check each outlier against `SPEC.md` and `docs/superpowers/specs/*` before changing. If spec specifies — do not touch.

- [ ] **Step 2: Hard-coded color scan**

```bash
grep -rnE "#[0-9a-fA-F]{3,8}" app components lib --include="*.tsx" --include="*.ts"
grep -rnE "rgba?\(" app components lib --include="*.tsx" --include="*.ts"
```

For each hit:
- If it appears in `app/globals.css` — leave (CSS source of truth).
- If it's in TSX inline-style and a Tailwind utility/token gives the same color — replace with the Tailwind class.
- If no matching token exists — leave and add to recommendations.

- [ ] **Step 3: Container width inventory**

```bash
grep -rnE "\b(max-w-|container\b)" components/sections components/layout
```

Same logic as Step 1: align only obvious outliers; respect spec.

- [ ] **Step 4: Verify Track B**

```bash
npx tsc --noEmit
npm run build
```

Expected: build succeeds, no TS errors.

---

## Task 5: Track C — Perf + A11y

**Goal:** Add missing `aria-label`, `alt`, lazy-loading, semantic landmarks. No visual changes.

- [ ] **Step 1: `<main>` landmark check**

Read `app/(public)/layout.tsx`. Verify the page content is wrapped in `<main>`. If not — wrap. If yes — note and skip.

- [ ] **Step 2: `<img>` audit**

```bash
grep -rn "<img " app components --include="*.tsx"
```

For each result:
- Replace with `<Image>` from `next/image` if the source is a static asset under `public/`. Provide `width`, `height`, `alt`.
- If decorative, set `alt=""` (explicitly).
- Hero image (LCP) — ensure `priority` prop.

- [ ] **Step 3: `next/image` audit**

```bash
grep -rn "<Image " app components --include="*.tsx"
```

For each — verify:
- Has `alt` (decorative: `alt=""`).
- LCP image has `priority`; others don't.
- `sizes` is present for responsive cases.

- [ ] **Step 4: Icon-only button audit**

```bash
grep -rnE "<button\b[^>]*>" app components --include="*.tsx" | head -50
```

For each `<button>` whose children are only an icon (lucide-react component, no text) — add `aria-label="..."` describing the action. Examples: carousel prev/next, mobile menu toggle, dialog close.

Also check `<a>` with only an icon — same rule.

- [ ] **Step 5: Decorative SVG audit**

```bash
grep -rnE "<svg\b" components --include="*.tsx" | head
```

For each inline SVG without text — add `aria-hidden="true"` and `focusable="false"`. (Icons in lucide-react are typically already `aria-hidden`; verify.)

- [ ] **Step 6: Verify Track C**

```bash
npx eslint . --format compact
npx tsc --noEmit
```

Expected: errors = 0.

---

## Task 6: Final Audit

**Files:**
- Create: `docs/refactor-after.json`

- [ ] **Step 1: Production build (for fresh bundle size)**

```bash
rm -rf .next
npm run build
```

Expected: build succeeds.

- [ ] **Step 2: Run audit script**

```bash
node scripts/refactor-audit.mjs > docs/refactor-after.json
cat docs/refactor-after.json
```

- [ ] **Step 3: Manual augmentation**

Re-do the manual notes from Task 2 Step 3, appending `manualNotes` block to `docs/refactor-after.json`. Should reflect changes made in Tracks A-C.

---

## Task 7: Dashboard Generation

**Files:**
- Create: `docs/refactor-dashboard.html`

- [ ] **Step 1: Generate the HTML**

The HTML must:
- Be self-contained (inline CSS, no external resources).
- Embed both JSON snapshots inline as `<script type="application/json">` or as hard-coded JS literals.
- Render: hero summary (3-4 KPI cards), full metrics table grouped by category, recommendations section.
- Be readable on desktop (1280px+) without JS, so style with CSS only — no fetch, no DOM ops beyond initial render.

Skeleton structure:

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Refactor Audit Dashboard</title>
  <style>
    :root {
      --bg: #0f1115;
      --surface: #1a1d24;
      --text: #e8e8e8;
      --muted: #9aa3b2;
      --accent: #4ade80;
      --warn: #f59e0b;
      --bad: #ef4444;
      --border: #2a2f3a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 32px;
      background: var(--bg); color: var(--text);
      font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    .subtitle { color: var(--muted); margin: 0 0 32px; }
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 16px; margin-bottom: 40px;
    }
    .kpi {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 20px;
    }
    .kpi-label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-value { font-size: 32px; font-weight: 600; margin-top: 8px; }
    .kpi-delta { font-size: 13px; margin-top: 4px; }
    .delta-good { color: var(--accent); }
    .delta-bad { color: var(--bad); }
    .delta-neutral { color: var(--muted); }
    table { width: 100%; border-collapse: collapse; margin: 16px 0 32px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); }
    th { color: var(--muted); font-weight: 500; font-size: 12px; text-transform: uppercase; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    h2 { font-size: 18px; margin: 32px 0 12px; }
    .rec { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin: 12px 0; }
    .rec-header { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
    .pri { font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600; letter-spacing: 0.5px; }
    .pri-P0 { background: var(--bad); color: white; }
    .pri-P1 { background: var(--warn); color: #1a1d24; }
    .pri-P2 { background: var(--border); color: var(--text); }
    .rec-title { font-weight: 600; }
    .rec-body { color: var(--muted); font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Refactor Audit Dashboard</h1>
    <p class="subtitle">Branch: sprint-3-foundation · Generated: <!-- DATE --></p>

    <!-- HERO KPIs: 4 cards -->
    <div class="kpi-grid"><!-- generated below from JSONs --></div>

    <!-- METRICS TABLES grouped by category -->
    <h2>Code Quality</h2>
    <table><!-- ... --></table>

    <h2>UI Consistency</h2>
    <table><!-- ... --></table>

    <h2>A11y</h2>
    <table><!-- ... --></table>

    <h2>Perf</h2>
    <table><!-- ... --></table>

    <h2>Recommendations</h2>
    <!-- numbered list of .rec blocks, each with P0/P1/P2 -->
  </div>
</body>
</html>
```

KPI selection logic (top-4 biggest improvements):
- ESLint warnings reduction
- A11y attributes added (`ariaLabelUsage` delta)
- TS errors → 0
- Bundle bytes change (if measurable)

Each metric row format:
```html
<tr>
  <td>ESLint warnings</td>
  <td class="num">{baseline}</td>
  <td class="num">{after}</td>
  <td class="num delta-good">−N</td>
</tr>
```

Delta color rules:
- "Lower is better" metrics (errors, warnings, `any` usage, hex literals, raw `<img>`, missing alts): green if down, red if up.
- "Higher is better" metrics (`aria-label`, semantic landmarks): green if up.
- Bundle bytes: green if down ≥ 1KB, red if up ≥ 1KB, otherwise neutral.

Recommendations section — populate from issues found during audit that were **deferred** (out of scope: visual changes, abstractions, deps, refactors). Each item: `P0/P1/P2`, title, body (2-3 sentences with motivation + risk/effort).

- [ ] **Step 2: Open in browser to sanity-check**

```bash
open docs/refactor-dashboard.html
```

Verify:
- Loads without errors.
- KPI cards visible.
- Tables populated.
- Recommendations have priorities.
- No `<!-- DATE -->` placeholders left.

---

## Task 8: Final Verification + Commit

- [ ] **Step 1: Full verification suite**

```bash
npx eslint . --format compact
npx tsc --noEmit
npm run build
```

Expected: zero errors. Warnings ≤ baseline (record in commit body).

- [ ] **Step 2: Manual browser pass**

```bash
npm run dev
```

Open `http://localhost:3000/` and verify:
- Hero renders, portrait visible.
- Services section / cards render.
- Work areas section.
- Cases section (desktop + scroll mobile carousel mentally).
- FAQ accordion opens/closes.
- Contact form renders.
- Mobile menu opens/closes (resize to <768px).
- Tab through focusable elements — focus rings visible on CTAs.
- No layout shifts vs visual memory of previous build.

If anything looks different vs before — investigate and revert.

- [ ] **Step 3: Stage and commit**

Stage:
```bash
git add scripts/refactor-audit.mjs docs/refactor-baseline.json docs/refactor-after.json docs/refactor-dashboard.html
# plus any source files touched in tracks A/B/C
git add app components lib
git status
```

Review `git status` — confirm nothing unrelated is staged (no `node_modules`, `.next`, etc.).

Commit:
```bash
git commit -m "$(cat <<'EOF'
refactor: code quality + UI consistency + a11y/perf pass with audit dashboard

Track A — Code quality: removed unused imports/vars, ESLint --fix safe pass.
Track B — UI consistency: aligned accidental spacing/color outliers; spec-justified
  divergence preserved.
Track C — A11y/perf: added aria-label to icon-only buttons, alt on images,
  semantic landmarks verified, LCP image priority.

Dashboard: docs/refactor-dashboard.html (before/after metrics + deferred recommendations).
Audit script: scripts/refactor-audit.mjs.

Verification: lint clean, tsc clean, build green, manual browser pass OK.
No visual UI changes.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Confirm**

```bash
git status
git log -1 --stat
```

Expected: clean working tree, last commit shows all expected files.

---

## Self-Review Notes

- Spec coverage check: every fase in spec maps to a task — Phase 1→Task 2, Phase 2→Task 3, Phase 3→Task 4, Phase 4→Task 5, Phase 5→Tasks 6-7.
- No tests in plan — per project `feedback_no_tests_in_mvp` memory and CLAUDE.md.
- Method/file names consistent across tasks (`refactor-audit.mjs`, `refactor-baseline.json`, `refactor-after.json`, `refactor-dashboard.html`).
- Risks from spec (visual regression, subjective metrics, big commit) — addressed via explicit revert rules in Track A Step 1, "respect spec" rules in Track B, and grouped commit message in Task 8.
