# Site Domain Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the obsolete public site URL with `https://ksenia-kamenskaya.ru` without changing the email address or historical documentation.

**Architecture:** Keep the existing shared `BUSINESS.siteUrl` source for legal copy and JSON-LD. Update the two independent root metadata URL values so SEO output matches the shared business URL.

**Tech Stack:** Next.js 16, TypeScript, ESLint

---

### Task 1: Update the active public site URL

**Files:**
- Modify: `content/legal/business.ts:7`
- Modify: `app/layout.tsx:21`
- Modify: `app/layout.tsx:36`

- [x] **Step 1: Verify the old URL exists in active code**

Run:

```bash
rg -n "https://kamenskaya\.ru" content app components lib
```

Expected: three matches in `content/legal/business.ts` and `app/layout.tsx`.

- [x] **Step 2: Replace the active URL values**

Set `BUSINESS.siteUrl`, `metadataBase`, and `openGraph.url` to:

```ts
'https://ksenia-kamenskaya.ru'
```

- [x] **Step 3: Verify the URL replacement**

Run:

```bash
rg -n "https://kamenskaya\.ru" content app components lib
rg -n "https://ksenia-kamenskaya\.ru" content app components lib
```

Expected: no old URL matches and three new URL matches. Email values remain unchanged.

- [x] **Step 4: Run project verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit successfully.
