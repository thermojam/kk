# Telegram CTA Deeplinks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore meaningful prefilled Telegram messages for all eight CTA buttons while leaving footer Telegram links unchanged.

**Architecture:** Keep the existing `TelegramButton` API and CTA-specific text ownership. Restore `tgLink(text)` URL generation, then update the two generic CTA messages and simplify the «Сила Берегини» message.

**Tech Stack:** Next.js 16, TypeScript, React, Node.js built-in test runner

---

### Task 1: Restore Telegram deeplink generation

**Files:**
- Modify: `lib/telegram.ts`
- Create: `tests/telegram.test.ts`

- [x] Write a failing unit test asserting that `tgLink(text)` appends an encoded `text` query parameter.
- [x] Run `node --experimental-strip-types --experimental-loader ./tests/typescript-loader.mjs --test tests/telegram.test.ts` and verify it fails because `tgLink()` drops the text.
- [x] Implement the minimal `tgLink(text)` change.
- [x] Run the unit test and verify it passes.

### Task 2: Update CTA-specific message copy

**Files:**
- Modify: `components/sections/ContactCtaBanner.tsx`
- Modify: `components/sections/Offer.tsx`
- Modify: `content/home.ts`

- [x] Replace the banner message with the approved format-selection message.
- [x] Add the approved final Offer message.
- [x] Remove the implied health-questionnaire commitment from the «Сила Берегини» message.
- [x] Verify all eight CTA call sites pass non-empty meaningful text using targeted source inspection.

### Task 3: Verify the complete change

**Files:**
- Verify: `lib/telegram.ts`
- Verify: `components/sections/ContactCtaBanner.tsx`
- Verify: `components/sections/Offer.tsx`
- Verify: `content/home.ts`
- Verify: `components/layout/Footer.tsx`

- [x] Run the Telegram unit test.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Confirm footer Telegram and reviews links still use ordinary URLs without `?text=`.
- [x] Review the final diff for spec-only changes.
