# Hero img Full-Bleed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить «карточку» 300×380 в правой колонке Hero-секции на full-bleed портрет, который тянется на всю высоту секции и упирается нижней кромкой в нижний край hero.

**Architecture:** Одна точечная правка `components/sections/Hero.tsx` (правая колонка, offset-рамка, padding-bottom) и одна правка `SPEC.md` §1 (адаптив и обработка портрета). Без новых файлов, без новых компонентов. По договорённости (`feedback_no_tests_in_mvp.md`) автотесты не пишем — верификация через `npm run lint`, `npm run build`, ручной просмотр в браузере.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Framer Motion, next/image.

**Spec:** `docs/superpowers/specs/2026-05-22-hero-img-fullbleed-design.md`

---

## File Structure

| Файл                            | Ответственность                                | Тип правки                                  |
| ------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| `components/sections/Hero.tsx`  | Hero-секция: layout, мотион, портрет           | модификация (правая колонка + grid padding) |
| `SPEC.md`                       | Мастер-документ продукта, §1 = Hero           | модификация (адаптив + обработка портрета)  |

---

## Task 1: Получить натуральные размеры hero.webp

**Files:**
- Read: `public/images/hero.webp`

- [ ] **Step 1: Узнать ширину и высоту**

Run:
```bash
sips -g pixelWidth -g pixelHeight /Users/nikitamensky/Desktop/kk/public/images/hero.webp
```

Expected output вида:
```
/Users/nikitamensky/Desktop/kk/public/images/hero.webp
  pixelWidth: <число>
  pixelHeight: <число>
```

Запомнить два числа — `W` (ширина) и `H` (высота). Они подставляются в `width={W}` и `height={H}` в Task 2 Step 3.

---

## Task 2: Hero.tsx — full-bleed portrait

**Files:**
- Modify: `components/sections/Hero.tsx` (lines 27 и 71-111)

- [ ] **Step 1: Сменить padding-bottom грид-контейнера**

В файле `components/sections/Hero.tsx` строка 27 — найти:

```tsx
<div className="container-page relative z-10 grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-24 lg:min-h-180">
```

Заменить на:

```tsx
<div className="container-page relative z-10 grid gap-10 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:pt-24 lg:pb-0 lg:min-h-180">
```

Изменения:
- `py-16` → `pt-16` (нижний паддинг 0 на мобайле — фото касается пола).
- `lg:py-24` → `lg:pt-24 lg:pb-0` (то же на десктопе).

- [ ] **Step 2: Заменить блок правой колонки**

В том же файле найти блок (Hero.tsx:71-111):

```tsx
                <div className="lg:order-2 flex items-center justify-center lg:justify-self-end">
                    <motion.div
                        {...fadeUp(0.3)}
                        whileHover={reduced ? undefined : { scale: 1.02 }}
                        className="relative w-[min(70vw,320px)] aspect-3/4 lg:w-75 lg:h-95 lg:aspect-auto"
                    >
                        {/* Offset-рамка (только на десктопе, под фото) */}
                        <span
                            aria-hidden
                            className="hidden lg:block absolute pointer-events-none"
                            style={{
                                top: '-14px',
                                right: '-14px',
                                left: '14px',
                                bottom: '0',
                                border: '1px solid var(--color-accent-500)',
                                borderRadius: 'var(--radius-sm)',
                                zIndex: 0,
                            }}
                        />

                        {/* Фото + duotone-стек */}
                        <div
                            className="relative overflow-hidden w-full h-full"
                            style={{
                                borderRadius: 'var(--radius-sm)',
                                zIndex: 1,
                            }}
                        >
                            <Image
                                src="/images/hero.webp"
                                alt="Ксения Каменская"
                                fill
                                sizes="(min-width: 1024px) 300px, 70vw"
                                priority
                                className="object-cover"
                            />

                        </div>
                    </motion.div>
                </div>
```

Заменить целиком на:

```tsx
                <motion.div
                    {...fadeUp(0.3)}
                    whileHover={reduced ? undefined : { scale: 1.01 }}
                    className="lg:order-2 relative w-full flex justify-center lg:h-180 lg:self-end lg:justify-end"
                >
                    <Image
                        src="/images/hero.webp"
                        alt="Ксения Каменская"
                        width={W}
                        height={H}
                        priority
                        sizes="(min-width: 1024px) 540px, 100vw"
                        className="block w-full h-auto object-bottom lg:w-auto lg:h-full"
                    />
                </motion.div>
```

**Подставить настоящие числа из Task 1:** заменить `{W}` на ширину и `{H}` на высоту из вывода `sips`.

Что произошло:
- Удалён обёртывающий `<div className="lg:order-2 flex …">` — `motion.div` сам стал грид-айтемом (классы `lg:order-2 lg:self-end` переехали на него).
- Удалён `<span aria-hidden>` (offset-рамка).
- Удалён внутренний `<div className="relative overflow-hidden …">` с `borderRadius` — он больше не нужен.
- `Image fill object-cover` → `Image` с явными `width`/`height` и адаптивным sizing через классы: на мобайле `w-full h-auto`, на десктопе `w-auto h-full object-bottom`.
- `aspect-3/4 w-[min(70vw,320px)] lg:w-75 lg:h-95 lg:aspect-auto` → `w-full lg:h-180`.
- `sizes` обновлён: 540px на десктопе, 100vw на мобайле.
- `whileHover: { scale: 1.02 }` → `{ scale: 1.01 }`.

- [ ] **Step 3: Запустить lint**

Run:
```bash
npm run lint
```

Expected: 0 errors. (5 предсуществующих warnings в `Button.tsx` про destructure unused-vars — не трогаем, их не было в правках.)

Если появилась новая ошибка — диагностировать и исправить в `Hero.tsx`.

- [ ] **Step 4: Запустить build**

Run:
```bash
npm run build
```

Expected: успешная сборка с финальной строкой типа `✓ Generating static pages` и `Finalizing page optimization`.

Если build падает — читать ошибку, фиксить, повторять.

- [ ] **Step 5: Визуальная проверка**

Run:
```bash
npm run dev
```

Открыть http://localhost:3000 в браузере.

**Десктоп (≥ 1024px, например 1280px ширина):**
- Портрет в правой части секции.
- Нижняя кромка фото — ровно в нижнем краю hero-секции (без зазора, без перекрытия следующей секции About).
- Высота фигуры — на всю высоту секции (≥ 720px).
- Текст слева: eyebrow «Ksenia Kamenskaya», h1 «Психология женского тела и проявленности.», подзаголовок, два CTA.
- Glow за фигурой виден.
- Hover на фото — лёгкое увеличение (`scale: 1.01`).

**Мобайл (< 1024px, например DevTools 375px):**
- Текст сверху (eyebrow + h1 + p + CTA).
- Под ним — портрет на всю ширину секции.
- Нижняя кромка фото — в нижнем краю hero-секции.
- Никаких зазоров между низом фото и нижней границей секции.

Если что-то не так — диагностировать и фиксить (без отдельной задачи в плане; это часть Task 2).

- [ ] **Step 6: Коммит**

Run:
```bash
git add components/sections/Hero.tsx
git commit -m "feat(hero): full-bleed portrait, image flush with section bottom"
```

---

## Task 3: SPEC.md §1 — обновить адаптив и обработку портрета

**Files:**
- Modify: `SPEC.md` (раздел §1 — Hero)

- [ ] **Step 1: Найти раздел §1**

Run:
```bash
grep -n "Hero\|§1\|hero" /Users/nikitamensky/Desktop/kk/SPEC.md | head -20
```

Expected: список строк, где встречается «Hero» / «§1». Идентифицировать начало раздела про Hero и нужные подпункты: «Адаптив» / «Адаптация» / «Цвет и обработка».

- [ ] **Step 2: Прочитать раздел §1**

Прочитать SPEC.md от номера строки, найденного в Step 1, до конца раздела (или до начала §2). Найти три подпункта, которые нужно поменять:

a) Подпункт про портрет на десктопе (упоминание размеров `300×380` / `lg:w-75 lg:h-95`, offset-рамки, border-radius).
b) Подпункт про портрет на мобайле (упоминание `min(70vw, 320px)`, `aspect 3/4`, «портрет под текстом»).
c) Подпункт про обработку фото (duotone purple/orange, fallback десатурация).

- [ ] **Step 3: Обновить подпункт «Десктоп / Адаптив»**

Заменить текст вида «портрет 300×380, offset-рамка accent-500, border-radius 6px» на:

```
Портрет: full-bleed в правой колонке, высота 720px (= min-height секции), ширина — авто по aspect фото, выровнено по нижнему краю секции. Без offset-рамки и без border-radius.
```

Точная формулировка существующего абзаца может отличаться — взять смысл (full-bleed правая колонка, до пола, без декора) и переписать в стиле текущего SPEC.md.

- [ ] **Step 4: Обновить подпункт «Мобайл / Адаптив»**

Заменить текст вида «портрет сверху 50vw, текст снизу» или «портрет под текстом, max-width min(70vw, 320px), aspect 3/4» на:

```
Портрет: под текстом, ширина 100% секции, высота авто, нижняя кромка вплотную к низу секции.
```

- [ ] **Step 5: Обновить подпункт «Цвет и обработка»**

Заменить текст вида «портрет — duotone purple/orange (fallback: лёгкая десатурация)» на:

```
Портрет — без цветовых фильтров. Фон удалён, силуэт в натуральных цветах на neutral-900.
```

- [ ] **Step 6: Коммит**

Run:
```bash
git add SPEC.md
git commit -m "docs(spec): hero §1 — full-bleed portrait, no filters"
```

---

## Done

После Task 3 ветка готова к финальной проверке (`finishing-a-development-branch` skill — опционально, обсуждается отдельно).

Сводка финального состояния:
- `components/sections/Hero.tsx` — full-bleed портрет, нижняя кромка фото у нижнего края секции на всех вьюпортах.
- `SPEC.md` §1 — текстовые формулировки приведены в соответствие.
- `npm run lint` — 0 ошибок.
- `npm run build` — успешно.
- Hero визуально соответствует выбранному варианту B (Full-Bleed Right).
