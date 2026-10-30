# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Проект

Лендинг психолога (ksenia-kamenskaya.ru): Next.js 16 App Router, React 19, TS strict, Tailwind 4. Алиас `@/*` → корень.

### Команды
```bash
npm run dev            # localhost:3000
npm run build          # статический экспорт в out/
npm run lint
npx tsc --noEmit       # отдельного скрипта нет
npm run format:check   # сейчас падает на 16 файлах, унаследовано от 645800c; не форматировать чужое при правках
npm run images         # пересобрать public/images/generated/ после замены исходников
```
Автотестов нет намеренно: проверка — lint + tsc + ручной просмотр в браузере.

### Структура
- `app/(public)/` — страницы: главная, `course/`, `offer/`, `privacy/`, `cookies/`
- `content/` — все тексты, цены, FAQ, юр. тексты (`content/legal/`). Правки контента — здесь, не в компонентах.
- `components/sections/` (главная), `components/course/`, `components/ui/`, `components/seo/` (JSON-LD)
- `lib/telegram.ts` — deep links и цели Метрики `TG_GOALS`; `lib/analytics/` — Метрика грузится только после согласия на cookies

### Подвохи
- `output: 'export'`: нет серверного рантайма — API-роуты, `headers()`, ISR не работают. Оплата живёт в ветке `feat/payments`.
- `trailingSlash: true` не менять — URL со слэшем уже в индексе. Внутренние ссылки писать со слэшем (`/course/`).
- Картинки не через `next/image` (unoptimized), а через `ResponsiveImage` + файлы из `npm run images`; новое изображение добавлять в `SOURCES` в `scripts/optimize-images.mjs`.
- Новая CTA-кнопка в Telegram → новая цель в `TG_GOALS`, её же завести в Метрике.
- `NEXT_PUBLIC_YM_ID` задан только в `.env.production`; локально Метрика не грузится — это норма.
- Секреты: `.env` (gitignored), шаблон — `.env.example`. `.env.production` содержит только `NEXT_PUBLIC_YM_ID`, без секретов.
- Отступ 4 пробела, одинарные кавычки, printWidth 100 (Prettier).
- Ветки: работа в `dev`, релиз — merge в `main`.
