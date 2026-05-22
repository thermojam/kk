# Hero Dark Poster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить светлый Hero (lilac gradient, портрет-круг) на тёмный «постер» во всех вьюпортах. Контент SPEC §1 сохраняется 1:1.

**Architecture:** Локальная переработка секции 1 без введения новых токенов и без глобальной dark-темы. Меняются `Hero.tsx` (layout), `HeroBackground.tsx` (декор), `Button.tsx` (новый вариант `accent` для primary CTA на тёмном). `SPEC.md §1` приводится в соответствие с реализацией.

**Tech Stack:** Next.js 16 · TypeScript · Tailwind v4 (через `@theme` в `globals.css`) · Framer Motion 12 · ESLint · Prettier.

**Verification policy:** Без автотестов на этапе MVP (проектное решение). Каждая задача проверяется через `npm run lint` + `npm run build` (next build делает type-check) + ручная визуальная проверка в `npm run dev`.

**Reference spec:** `docs/superpowers/specs/2026-05-20-hero-dark-poster-design.md`.

---

### Task 1: SPEC.md §1 — переписать под Dark Poster

**Files:**
- Modify: `SPEC.md:38-50`

- [ ] **Step 1: Прочитать актуальный SPEC.md §1 (строки 1–52)**

Команда: открыть файл и убедиться, что строки 38–50 совпадают с тем, что меняем (Анимация + Адаптив). Контент-блок (строки 18–36) НЕ трогаем.

- [ ] **Step 2: Заменить блок «Анимация» (строки 38–45)**

Старое (для контекста, оно сейчас в файле):
```
#### Анимация (концепт «параллакс на портрете»)

- Фон: мягкий градиент `--primary-50` → `--accent-50`
- Декоративный SVG-слой: медленно движущиеся овалы Primary 300/400, opacity 0.3–0.5
- Портрет: лёгкий `scale(1.02)` при hover/mouse-move (Framer Motion)
- Частицы: 3–5 точек Accent, анимация по Y, амплитуда 5–10px, период 5–7 сек, чистый CSS `@keyframes`
- На мобайле: всё статично, только входной fade-up
- `prefers-reduced-motion: reduce` → всё статично
```

Новое:
```
#### Дизайн (концепт «Dark Poster»)

- Фон: solid `--color-neutral-900` на всех вьюпортах
- Декор (lg+): два radial-glow через CSS-градиенты — primary-500 нижний-левый (460×460px, opacity 0.55) и primary-400 верхний-правый (320×320px, opacity 0.35); движение через Framer Motion translate ±15px по X и ±10px по Y, длительности 18s и 22s в противофазе, easeInOut, repeat Infinity
- Частицы: 5 точек `--color-accent-500` через `.hero-particle` keyframes (амплитуда 8px, периоды 5–7 сек)
- Портрет: duotone — фильтр `grayscale(1) contrast(1.1)` + два overlay-слоя `mix-blend-mode: multiply` (primary-500, тени) и `mix-blend-mode: lighten` (accent-500, света); fallback при провале визуальной проверки — `filter: contrast(1.05) saturate(0.6) brightness(0.95)`
- Портрет: `scale(1.02)` при hover (Framer Motion)
- Входной fade-up: eyebrow 0s, заголовок 0.05s, подзаголовок 0.15s, CTA 0.25s, портрет 0.3s
- На мобайле (< 1024px): без glow и без частиц, статичный тёмный фон, только входной fade-up
- `prefers-reduced-motion: reduce` → всё статично, glow и частицы отключены
```

- [ ] **Step 3: Заменить блок «Адаптив» (строки 47–50)**

Старое:
```
#### Адаптив

- **Десктоп (lg+):** портрет справа, текст слева, высота 720px
- **Мобайл:** портрет сверху 50vw, текст снизу, высота auto
```

Новое:
```
#### Адаптив

- **Десктоп (lg+):** двухколоночный grid `1.15fr / 0.85fr`, gap 48px, min-height 720px; слева — eyebrow + заголовок + подзаголовок + CTA-стек; справа — портрет 300×380px с offset-рамкой 1px accent-500 (смещение -14px по top/right, +14px по left/bottom)
- **Мобайл:** single column, тёмный фон сохраняется; порядок eyebrow → заголовок → подзаголовок → портрет (`min(70vw, 320px)`, aspect 3/4, без offset-рамки) → CTA-стек; высота auto

#### Цвета и контраст

- Заголовок: white; завершающий фрагмент «и проявленности.» — accent-500
- Eyebrow «Ksenia Kamenskaya»: accent-500, Nunito 700, 11px, uppercase, letter-spacing 0.4em
- Подзаголовок: `rgba(255,255,255,0.78)`
- Primary CTA: bg accent-500, текст neutral-900 (используется `Button variant="accent"`)
- Secondary CTA (ghost): белый текст, hover underline
```

- [ ] **Step 4: Verify — открыть SPEC.md и визуально прочитать §1 целиком**

Команда: `head -65 SPEC.md`. Убедиться, что:
- контент-блок (строки 18–36) не изменён;
- блоки Анимация/Дизайн и Адаптив заменены целиком;
- появился новый подраздел «Цвета и контраст»;
- разделитель `---` перед §2 на месте.

- [ ] **Step 5: Commit**

```bash
git add SPEC.md
git commit -m "docs(spec): rewrite §1 Hero for Dark Poster redesign"
```

---

### Task 2: Button — добавить вариант `accent`

**Files:**
- Modify: `components/ui/Button.tsx`

**Почему отдельным шагом:** primary CTA на тёмном фоне должен быть accent-500 (оранжевый), но текущий `variant="primary"` зашит в `bg-primary-500`. Передача `className` для подмены фона — ненадёжна (Tailwind v4 не гарантирует cascade order по DOM). Корректное решение — расширить тип `Variant`. Изменение минимальное и обратно-совместимое.

- [ ] **Step 1: Прочитать текущий `Button.tsx`**

Команда: открыть файл. Убедиться в текущей структуре `Variant` и `variantClasses`.

- [ ] **Step 2: Добавить тип `accent` в `Variant`**

Заменить:
```ts
type Variant = 'primary' | 'secondary' | 'ghost';
```

на:
```ts
type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
```

- [ ] **Step 3: Добавить класс `accent` в `variantClasses`**

В объекте `variantClasses` после строки `ghost` добавить:
```ts
accent: 'bg-accent-500 text-neutral-900 hover:opacity-90 focus-visible:ring-accent-500',
```

Итоговый объект:
```ts
const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary-500 text-neutral-0 hover:bg-primary-600 focus-visible:ring-primary-300',
    secondary:
        'border border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-300',
    ghost: 'text-primary-500 bg-transparent hover:underline focus-visible:ring-primary-300',
    accent: 'bg-accent-500 text-neutral-900 hover:opacity-90 focus-visible:ring-accent-500',
};
```

- [ ] **Step 4: Verify — lint + build**

```bash
npm run lint && npm run build
```

Expected: оба прохода без ошибок. Build также покажет type-check.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat(ui): add Button variant accent for dark backgrounds"
```

---

### Task 3: HeroBackground — radial glow на neutral-900

**Files:**
- Modify: `components/sections/HeroBackground.tsx` (полная замена содержимого)

**Заметка:** после этого шага визуально сайт будет неконсистентным (Hero пока светлый, фон-декор уже под тёмный) — это OK для feature-ветки, исправится в Task 4.

- [ ] **Step 1: Заменить содержимое `HeroBackground.tsx` целиком**

Финальное содержимое:
```tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PARTICLES = [
    { top: '10%', left: '55%', delay: 0, duration: 5.5 },
    { top: '22%', left: '78%', delay: 1.2, duration: 6.2 },
    { top: '70%', left: '62%', delay: 2.4, duration: 5.0 },
    { top: '82%', left: '85%', delay: 3.6, duration: 6.8 },
    { top: '45%', left: '92%', delay: 4.8, duration: 5.8 },
];

export function HeroBackground() {
    const reduced = useReducedMotion();
    if (reduced) return null;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden lg:block overflow-hidden"
        >
            <motion.div
                className="absolute"
                style={{
                    left: '-160px',
                    bottom: '-180px',
                    width: '460px',
                    height: '460px',
                    background:
                        'radial-gradient(circle, var(--color-primary-500) 0%, transparent 70%)',
                    opacity: 0.55,
                }}
                animate={{ x: [-15, 15, -15], y: [-10, 10, -10] }}
                transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
                className="absolute"
                style={{
                    right: '35%',
                    top: '-120px',
                    width: '320px',
                    height: '320px',
                    background:
                        'radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)',
                    opacity: 0.35,
                }}
                animate={{ x: [15, -15, 15], y: [10, -10, 10] }}
                transition={{ duration: 22, ease: 'easeInOut', repeat: Infinity }}
            />

            {PARTICLES.map((p, i) => (
                <span
                    key={i}
                    className="hero-particle"
                    style={{
                        top: p.top,
                        left: p.left,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Verify — lint + build**

```bash
npm run lint && npm run build
```

Expected: проходит без ошибок.

- [ ] **Step 3: Commit**

```bash
git add components/sections/HeroBackground.tsx
git commit -m "refactor(hero): redesign HeroBackground — radial glow on neutral-900"
```

---

### Task 4: Hero.tsx — Dark Poster layout

**Files:**
- Modify: `components/sections/Hero.tsx` (полная замена содержимого)

- [ ] **Step 1: Заменить содержимое `Hero.tsx` целиком**

Финальное содержимое:
```tsx
'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { HeroBackground } from '@/components/sections/HeroBackground';

export function Hero() {
    const reduced = useReducedMotion();

    const fadeUp = (delay: number) => ({
        initial: reduced ? false : { opacity: 0, y: 20 },
        animate: reduced ? undefined : { opacity: 1, y: 0 },
        transition: reduced
            ? undefined
            : { duration: 0.6, delay, ease: 'easeOut' as const },
    });

    return (
        <section
            id="hero"
            className="relative isolate overflow-hidden"
            style={{ background: 'var(--color-neutral-900)' }}
        >
            <HeroBackground />

            <div className="container-page relative z-10 grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-24 lg:min-h-[720px]">
                <div className="flex flex-col gap-6 lg:order-1 lg:max-w-[560px]">
                    <motion.span
                        {...fadeUp(0)}
                        className="font-sans font-bold uppercase tracking-[0.4em] text-[11px]"
                        style={{ color: 'var(--color-accent-500)' }}
                    >
                        Ksenia Kamenskaya
                    </motion.span>

                    <motion.h1
                        {...fadeUp(0.05)}
                        className="font-display"
                        style={{ color: '#ffffff', lineHeight: 0.98 }}
                    >
                        Психология женского тела{' '}
                        <span style={{ color: 'var(--color-accent-500)' }}>
                            и&nbsp;проявленности.
                        </span>
                    </motion.h1>

                    <motion.p
                        {...fadeUp(0.15)}
                        className="text-body max-w-[460px]"
                        style={{ color: 'rgba(255,255,255,0.78)' }}
                    >
                        Помогаю женщинам перестать носить эмоции в&nbsp;теле, разобраться
                        с&nbsp;эмоциональным перееданием и&nbsp;вернуть себе ощущение
                        «я&nbsp;живу свою жизнь».
                    </motion.p>

                    <motion.div
                        {...fadeUp(0.25)}
                        className="flex flex-col items-start gap-3"
                    >
                        <Button href="#contact" variant="accent" size="lg">
                            Записаться на бесплатную консультацию · 20 минут
                        </Button>
                        <Button href="#services" variant="ghost" size="md" className="!text-white">
                            Узнать о программе →
                        </Button>
                    </motion.div>
                </div>

                <div className="lg:order-2 flex items-center justify-center lg:justify-self-end">
                    <motion.div
                        {...fadeUp(0.3)}
                        whileHover={reduced ? undefined : { scale: 1.02 }}
                        className="relative w-[min(70vw,320px)] aspect-[3/4] lg:w-[300px] lg:h-[380px] lg:aspect-auto"
                    >
                        {/* Offset-рамка (только на десктопе, под фото) */}
                        <span
                            aria-hidden
                            className="hidden lg:block absolute pointer-events-none"
                            style={{
                                top: '-14px',
                                right: '-14px',
                                left: '14px',
                                bottom: '14px',
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
                                background: 'var(--color-neutral-100)',
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
                                style={{ filter: 'grayscale(1) contrast(1.1)' }}
                            />
                            <span
                                aria-hidden
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'var(--color-primary-500)',
                                    mixBlendMode: 'multiply',
                                }}
                            />
                            <span
                                aria-hidden
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'var(--color-accent-500)',
                                    mixBlendMode: 'lighten',
                                    opacity: 0.85,
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
```

Заметки по реализации:
- Ghost-кнопка получает `className="!text-white"` для перекрытия `text-primary-500` из `Button.tsx`. Импорт-важность `!` нужен потому что классы из `Button.tsx` идут позже в декларации.
- Offset-рамка размещена ПЕРВОЙ в DOM, с `zIndex: 0`; фото-контейнер вторым с `zIndex: 1` — это гарантирует, что фото поверх рамки в области пересечения, а выступающие части рамки видны вокруг фото.
- `transition` для `whileHover` теперь дефолтный (Framer Motion 12 берёт значение из transition-prop). Если нужна явная длительность hover — добавить `transition={{ duration: 0.4, ease: 'easeOut' }}` рядом с `whileHover` (но дефолт нормальный).

- [ ] **Step 2: Verify — lint + build**

```bash
npm run lint && npm run build
```

Expected: оба прохода без ошибок.

- [ ] **Step 3: Commit**

```bash
git add components/sections/Hero.tsx
git commit -m "feat(hero): Dark Poster layout — asymmetric grid, duotone portrait, accent CTA"
```

---

### Task 5: Финальная проверка — визуальный QA

**Files:** none (только запуск dev и проверки)

- [ ] **Step 1: Запустить dev-сервер**

```bash
npm run dev
```

Ожидаемо: сервер на http://localhost:3000.

- [ ] **Step 2: Десктоп ≥ 1280px — golden path**

Открыть http://localhost:3000 на ширине ≥ 1280px. Проверить:
- фон полностью тёмный (neutral-900);
- виден eyebrow «Ksenia Kamenskaya» (accent-500, uppercase, разреженный);
- заголовок Cormorant Italic 72px, белый, последний фрагмент «и проявленности.» — оранжевый;
- подзаголовок белый с прозрачностью;
- primary CTA — оранжевая plain (accent-500), текст тёмный;
- ghost CTA — белая;
- портрет справа 300×380px, в дуотоне (тёплый purple/orange tint), вокруг — оранжевая offset-рамка 1px со смещением вверх-вправо;
- radial-glow видно по углам (нижний-левый — фиолетовый, верхний-правый — светлее);
- частицы accent двигаются.

- [ ] **Step 3: Mobile < 1024px**

Открыть DevTools, переключить на ширину 375px (iPhone). Проверить:
- фон тёмный сохраняется;
- одна колонка, всё по центру/left-aligned по гриду;
- заголовок 40px;
- портрет под текстом, width ~70vw, aspect 3/4, тот же duotone;
- offset-рамка ОТСУТСТВУЕТ;
- glow и частицы НЕ видны;
- CTA-кнопки полной ширины контейнера / по контенту в столбик.

- [ ] **Step 4: prefers-reduced-motion**

В DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Перезагрузить страницу. Проверить:
- никакого движения glow / частиц / fade-up;
- статичный финальный кадр (всё видимо сразу).

- [ ] **Step 5: Hover на портрете (десктоп)**

Навести курсор на портрет. Проверить:
- лёгкий `scale(1.02)`;
- никаких рывков.

- [ ] **Step 6: Дуотон на лице — визуальная оценка**

Внимательно посмотреть на портрет. Критерий: лицо узнаваемо, нет «грязи», цветовое решение читается как осознанная стилизация, а не сбой рендера.

Если duotone не работает (лицо «теряется», цвет бьёт с пресетом 8.2) — сделать fallback:
- В `Hero.tsx` удалить два `<span>` с `mixBlendMode: 'multiply'` / `'lighten'`;
- На `<Image>` поменять `style={{ filter: 'grayscale(1) contrast(1.1)' }}` на `style={{ filter: 'contrast(1.05) saturate(0.6) brightness(0.95)' }}`;
- Закоммитить отдельным шагом: `git commit -m "fix(hero): switch portrait to desaturated fallback"`.

- [ ] **Step 7: Стык Hero → About — визуальная оценка**

Проскроллить вниз. Критерий: переход тёмный→светлый не «бьёт по глазам», воспринимается как осознанный кинематографический заход.

Если переход слишком резкий — добавить градиент-фейд в нижней части Hero:
- В `Hero.tsx` после `<HeroBackground />` добавить:
```tsx
<div
    aria-hidden
    className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
    style={{
        background:
            'linear-gradient(to bottom, transparent, var(--color-neutral-0))',
    }}
/>
```
- Закоммитить отдельным шагом: `git commit -m "fix(hero): add fade-to-light gradient at bottom for smooth section transition"`.

- [ ] **Step 8: Cormorant 72px weight — визуальная оценка**

Внимательно посмотреть на заголовок на десктопе. Критерий: серифный italic читается уверенно, не выглядит «тонким», глаз цепляется в первую секунду.

Если по факту слишком тонко — поднять weight до 500:
- Найти конфигурацию `next/font` в `app/layout.tsx` (или там, где грузится Cormorant). Обычно: `Cormorant_Garamond({ weight: ['400'], style: ['italic'], ... })`.
- Добавить `'500'` в массив `weight`.
- В `app/globals.css` в утилите `.font-display` (строка ~93) поменять `font-weight: 400` на `font-weight: 500`.
- Закоммитить отдельным шагом: `git commit -m "fix(hero): bump display font-weight to 500 for dark background"`.

- [ ] **Step 9: Финальная очистка временных файлов**

```bash
rm -rf .superpowers/brainstorm
```

Если хотите оставить моки для истории — пропустите этот шаг. В `.gitignore` `.superpowers/` уже зашит, поэтому файлы не попадут в коммит в любом случае.

- [ ] **Step 10: Сводный verify**

```bash
npm run lint && npm run build
```

Expected: оба зелёные. Если build выдаёт warnings про unused imports — это плановый шаг привести код в чистый вид (правка в Hero.tsx или Button.tsx).

---

## Что НЕ входит в этот план

- Глобальная dark-тема сайта.
- Изменение Header/Footer.
- Изменение остальных секций (About, WorkAreas, Cases, Services, FAQ, Contact).
- Перенос accent-500 в primary-CTA в других секциях.
- A/B-тест двух версий hero.
- Автотесты (по проектному решению — без unit/e2e на MVP).
