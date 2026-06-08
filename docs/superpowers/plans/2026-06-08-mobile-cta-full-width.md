# Mobile CTA Full Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the `Hero` button width and height below the `sm` breakpoint while preserving the current desktop dimensions.

**Architecture:** Apply the same local Tailwind responsive width classes already used by the `Hero` buttons. Do not change the shared `Button` or `TelegramButton` components.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4

---

### Task 1: Apply responsive mobile width to both CTA buttons

**Files:**
- Modify: `components/sections/Offer.tsx:23`
- Modify: `components/sections/ContactCtaBanner.tsx:13`

- [ ] **Step 1: Verify the target buttons do not have the responsive width classes**

Run:

```bash
rg -n "w-full.*sm:w-auto" components/sections/Offer.tsx components/sections/ContactCtaBanner.tsx
```

Expected: no matches.

- [ ] **Step 2: Add the responsive width classes**

Use these exact class values:

```tsx
className="mt-8 h-[52px] w-full sm:h-11 sm:w-auto"
```

in `Offer`, and:

```tsx
className="h-[52px] w-full sm:h-11 sm:w-auto"
```

in `ContactCtaBanner`.

- [ ] **Step 3: Verify the source changes**

Run:

```bash
rg -n "h-\\[52px\\].*w-full.*sm:h-11.*sm:w-auto" components/sections/Offer.tsx components/sections/ContactCtaBanner.tsx
```

Expected: one match in each file.

- [ ] **Step 4: Run project verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit successfully.

- [ ] **Step 5: Verify responsive behavior in a browser**

At a viewport below `640px`, verify both buttons fill their parent width and are
`52px` high. At a viewport above `640px`, verify both buttons return to content
width and are `44px` high.
