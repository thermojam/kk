## Project

Next.js 16 App Router site for ksenia-kamenskaya.ru. TypeScript uses strict mode; `@/*` resolves from the repository root.

## Commands

- `npm run dev` — start the local server at `http://localhost:3000`.
- `npm run build` — create the static export in `out/`.
- `npm run lint` — run ESLint.
- `npx tsc --noEmit` — run TypeScript checks.
- `npm run format:check` — check Prettier formatting.
- `npm run images` — regenerate responsive image assets after changing source images.

There is no automated test suite.

## Project guidance

- Edit page copy, prices, FAQs, and legal text in `content/`; keep components presentational.
- `output: 'export'` means there is no server runtime. Do not add API routes, `headers()`, or ISR-dependent behavior.
- Keep `trailingSlash: true`; internal page links use trailing slashes because these URLs are indexed.
- Use `ResponsiveImage` with generated assets in `public/images/generated/`. Register new source images in `SOURCES` in `scripts/optimize-images.mjs`.
- Telegram CTA events are defined in `TG_GOALS` in `lib/telegram.ts`; add a goal there when adding a tracked CTA.
- Analytics loads only after cookie consent. `NEXT_PUBLIC_YM_ID` is set in `.env.production`; verification IDs are optional and documented in `.env.example`.

See `README.md` for setup and feature overview. See `docs/` for design and implementation notes.
