# Cleanup & Performance — дизайн

**Дата:** 2026-06-08
**Тип:** рефакторинг + перф-оптимизация + чистка мёртвого кода
**Источники:** запрос пользователя, CLAUDE.md §§1-3, memory «без автотестов в MVP»

## Цель

За один проход:

1. Убрать мёртвый код, орфанные ассеты и устаревшую документацию из репозитория.
2. Снизить вес LCP-изображения (`/images/hero.webp`, 795 КБ) и убрать `framer-motion` из главного бандла, не теряя визуального поведения Hero.

Метрики — фиксируем «до/после»:

- Lighthouse Perf (mobile, throttled) — цель ≥ 90 (как в SPEC).
- Transfer size hero-картинки на десктопе — < 200 КБ (с 795 КБ).
- `framer-motion` исчезает из `package.json` и из main route chunk.

## Структура

Один план, **два трека**, последовательно, апрув-чекпоинт между ними.

```
Трек A · Dead-code purge  → коммит → npm run lint / tsc / build → апрув
Трек B · Performance      → коммит(ы) → build + smoke + Lighthouse → апрув
```

Каждый трек безопасен сам по себе; trek B не блокируется trek A.

---

## Трек A · Dead-code purge

Один коммит. Производственный бандл не меняется.

### Удаляется

| Артефакт | Что | Обоснование |
|---|---|---|
| `tests/` (4 файла) | `section-rounding.test.ts`, `centered-cta-sections.test.ts`, `telegram.test.ts`, `typescript-loader.mjs` | Нет npm-скрипта запуска; два — хрупкие снапшоты Tailwind-классов; политика «без автотестов в MVP» из memory |
| `workareas-mockups.png` | 438 КБ в корне | Орфанный девлоп-ассет; ноль импортов |
| `SPEC.md` (50 КБ) | Версия v2.2 мастер-спека | Источник истины — `SPEC_v3.md`; `lib/telegram.ts` ссылается на v3 |
| `sprint-4-spec.md` | Промежуточный спек в корне | Спринт завершён по git-логу; история остаётся в git |
| `components/ui/Card.tsx` | UI-примитив | Ноль импортов; WorkArea/Case/Service используют ручные `<article>` |
| `components/ui/Badge.tsx` — `tone="primary"`, `tone="inverse"` | Записи в `toneClasses` + тип-литералы | Ноль использований в `grep` |
| `components/ui/Button.tsx` — `variant="ghost"` | Запись в `variantClasses` + тип-литерал | Ноль использований в `grep` |

### НЕ удаляется

- `out/`, `tsconfig.tsbuildinfo`, `.next/` — gitignored, локальные артефакты.
- `docs/superpowers/specs/*` и `docs/superpowers/plans/*` для предыдущих спринтов — история работы, не код.
- `lib/cn.ts` (тонкая обёртка над `clsx`) — используется широко, минорная экономия не стоит изменения public API.

### Definition of Done — трек A

- [ ] `git ls-files` не возвращает удалённые пути.
- [ ] `npm run lint` — без ошибок.
- [ ] `npx tsc --noEmit` — без ошибок.
- [ ] `npm run build` — успех.
- [ ] `grep -rn '\"tone\":\s*\"primary\"\|tone=\"primary\"\|tone=\"inverse\"\|variant=\"ghost\"' app components` — пусто.

---

## Трек B · Performance

Делится на две подзадачи. Можно объединить в один коммит или разнести.

### B1. Image pipeline (главный LCP-выигрыш)

**Архитектура:**

```
public/images/hero.webp     ──┐                ┌─→ public/images/generated/hero-{960,1440,1920}.{avif,webp}
public/images/about.webp    ──┤  sharp script  └─→ public/images/generated/about-{320,480,760}.{avif,webp}
                              └─→ scripts/optimize-images.mjs
```

**Артефакты:**

1. **`scripts/optimize-images.mjs`** — Node-скрипт на `sharp` (уже в devDeps).
   - Идемпотентность: пропускает регенерацию, если `mtime` output-файла свежее source.
   - Выходные параметры: AVIF effort=4 quality=70, WebP quality=80 (тюнить по факту).
   - Запускается вручную: `npm run images`.
   - НЕ вешается на `prebuild` — чтобы не тормозить ежедневный `next build`.

2. **`public/images/generated/`** — коммитится в git как production-ассет.

3. **`components/ui/ResponsiveImage.tsx`** — Server Component, рендерит:

   ```html
   <picture>
     <source type="image/avif" srcset="…-960.avif 960w, …-1440.avif 1440w, …-1920.avif 1920w" sizes="…" />
     <source type="image/webp" srcset="…-960.webp 960w, …-1440.webp 1440w, …-1920.webp 1920w" sizes="…" />
     <img src="…-1440.webp" alt="…" width=… height=… loading=eager fetchpriority=high />
   </picture>
   ```

   Props:
   ```ts
   type ResponsiveImageProps = {
     /** Базовое имя без размера и расширения: 'hero' | 'about'. */
     name: 'hero' | 'about';
     alt: string;
     widths: number[];
     /** Ширина для fallback `src` (обычно средняя). */
     fallbackWidth: number;
     /** Intrinsic width/height для CLS. */
     width: number;
     height: number;
     sizes: string;
     priority?: boolean;
     className?: string;
   };
   ```

**Размерности (под реальные place­ments):**

- **Hero** — `lg`-only (`hidden lg:flex`), фактический CSS-width ≈ 760 × 1.25-1.38 (≈ 950-1050 CSS-px), retina × 2.
  Ширины: `960 / 1440 / 1920`. Fallback: `1440`. Атрибут `sizes` точный после замера в браузере.
- **About** — `max-w-[320px]` mobile, `lg:max-w-none` в колонке 380 CSS-px.
  Ширины: `320 / 480 / 760`. Fallback: `480`. Атрибут `sizes`: `(min-width: 1024px) 380px, 320px`.

**Целевые веса (ожидаемые):**

- `hero-1440.avif` ≈ 90-130 КБ.
- `hero-1920.avif` ≈ 150-200 КБ.
- `about-760.avif` ≈ 30-50 КБ.

**Замена в кодовой базе:**

- `components/sections/Hero.tsx` — `<Image>` → `<ResponsiveImage name="hero" …>`.
- `components/sections/About.tsx` — `<Image>` → `<ResponsiveImage name="about" …>`.
- Никаких других `next/image` использований в проекте нет (верифицировать `grep` при имплементации).

**Что НЕ делаем:**

- Не отключаем `output: 'export'` и `unoptimized: true` — инфраструктурный перебор для MVP на Beget-статике.
- Не вводим plugin `next-optimized-images` или подобные — лишняя сложность.
- Не трогаем `Logo.tsx` (SVG inline) и иконки `lucide-react` (SVG-only, не растровые).

### B2. Hero · framer-motion → CSS

**Изменения в `app/globals.css`:**

```css
@keyframes hero-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}

.hero-reveal {
    animation: hero-fade-up 0.6s ease-out both;
}
```

Существующий блок `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; } }` в `globals.css` (lines ~231-248) уже глушит анимации — не трогаем.

**Изменения в `components/sections/Hero.tsx`:**

- Убрать `'use client'`.
- Удалить импорты `motion`, `useReducedMotion` из `framer-motion`.
- Удалить функцию `fadeUp`.
- Каждый раскрывающийся элемент (eyebrow, h1, p, button row, helper p, image wrapper) обернуть в:

  ```tsx
  <div className="hero-reveal" style={{ animationDelay: '0.15s' }}>…</div>
  ```

  Делеи: `0`, `0.05s`, `0.15s`, `0.25s`, `0.3s`, `0.2s` для image (как в текущем коде).

- Hover-скейл картинки → Tailwind utility:

  ```
  transition-transform duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.035]
  ```

  Эффект для пользователя идентичен текущему `whileHover` framer-motion.

**Удаление зависимости:**

- После рефактора `grep -rn 'framer-motion' app components lib` → 0 hits.
- `npm uninstall framer-motion`.
- `package-lock.json` обновляется.
- Бандл route `/` теряет ≈ 30-40 КБ gzip.

### Definition of Done — трек B

- [ ] `npm run images` создаёт 12 файлов в `public/images/generated/`.
- [ ] `grep -rn 'framer-motion'` по `app/`, `components/`, `lib/`, `package.json` — 0 hits.
- [ ] `npm run build` — успех.
- [ ] В `out/index.html` присутствуют ссылки на `/images/generated/hero-1920.avif`, `/images/generated/about-760.avif` и др.
- [ ] Browser smoke: Hero визуально не сломан, hover-скейл работает, fade-in на reveal-элементах виден, изображения загружаются.
- [ ] Network tab desktop: hero transfer ≤ 200 КБ.
- [ ] Lighthouse mobile after ≥ Lighthouse mobile before; целевое Perf ≥ 90.

---

## Риски и митигации

| Риск | Митигация |
|---|---|
| Регрессия визуала Hero после миграции на CSS | Smoke в браузере до коммита; git rollback быстрый |
| AVIF не поддерживается старыми браузерами | `<picture>` с тремя `<source>`: AVIF → WebP → `<img>` (WebP-fallback) — graceful degradation |
| `npm run images` забыли запустить после смены исходника | Оригинал в `public/images/*.webp` живёт; комментарий в скрипте подсказывает; на MVP некритично |
| Удаление `tests/telegram.test.ts` теряет страховку `tgLink` | Функция тривиальна (`encodeURIComponent` + конкат); ручной клик по TG-кнопке покрывает |
| Несоответствие `sizes` атрибута реальной верстке | При имплементации замеряем CSS-ширину в браузере, прописываем `sizes` точно |
| Lighthouse «до» оказывается уже ≥ 90 | Это валидный результат; фиксируем что perf-track не ухудшил картину; image-savings всё равно остаются полезны для пользователей |

## Явно вне scope

- Любая абстракция вроде `SectionWithMobileCarousel<T>` или общий `SectionGrid`.
- Замена Embla на CSS scroll-snap (Embla нужна в Services с loop + arrows + 3-up).
- Миграция с `output: 'export'` на SSR.
- Автотесты любые.
- Изменения дизайн-токенов, верстки текстов, контента.
- Изменения в legal-страницах, footer, cookie banner, analytics/consent.
- Добавление ESLint-плагинов против регрессии мёртвого кода.

## Верификация (общая)

Запускать после каждого трека в указанном порядке:

```bash
npm run lint
npx tsc --noEmit
npm run build
# Только после трека B:
npm run images   # если меняли исходники
npx serve out    # smoke в браузере + Lighthouse mobile
```

Lighthouse-метрики записываем в коммит-сообщение трека B (before/after).