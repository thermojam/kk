# Sprint 1 · Каркас — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить дефолтный Next.js-скаффолд в технический фундамент, из которого Sprint 2 будет собирать секции главной без отвлечений на инфраструктуру.

**Architecture:** Next.js 16 App Router + Tailwind v4 (`@theme` + CSS variables из `SPEC.md` §T4) + ручные UI-примитивы поверх Radix UI (Dialog/Accordion) + generic Embla-обёртка для всех 4 каруселей проекта. Layout — `app/(public)/layout.tsx` оборачивает Header (sticky) и Footer вокруг всех публичных страниц; `app/(public)/page.tsx` — пустой каркас с `<section>`-якорями и 3 демо-конфигурациями карусели на плашках.

**Tech Stack:** Next.js 16.2.6 · React 19.2.4 · TypeScript 5 · Tailwind CSS v4 · Embla Carousel React 8.5 · Framer Motion 12 · Radix UI (Dialog 1.1, Accordion 1.2) · lucide-react 0.460 · clsx 2.1.

**Источники:**
- Мастер-документ: `/SPEC.md` v2.2 (§T1 адаптив, §T2 меню, §T3 карусели, §T4 токены, §T5 стек, §T11 структура).
- Design doc: `docs/superpowers/specs/2026-05-18-sprint-1-foundation-design.md`.

**Без автотестов** (решение проекта, см. `feedback_no_tests_in_mvp` в памяти). Качество проверяется через `npx tsc --noEmit`, `npm run lint`, `npm run build`, ручная проверка в браузере, Lighthouse — финальный QA gate — задача 22.

---

## File Structure (после Sprint 1)

**Создаём:**
- `lib/cn.ts` — clsx-обёртка.
- `components/ui/{Logo,Button,Input,PhoneInput,Card,Accordion,Dialog}.tsx` — UI-примитивы.
- `components/layout/{Header,MobileMenu,Footer}.tsx` — layout.
- `components/carousel/{EmblaCarousel,CarouselDots,CarouselArrows}.tsx` — карусель.
- `app/(public)/layout.tsx` — обёртка Header+Footer.
- `app/(public)/page.tsx` — пустой каркас секций + 3 демо Embla.
- `content/materials/.gitkeep` — пустая папка под MDX в Sprint 4.

**Модифицируем:**
- `package.json` — добавить зависимости.
- `app/layout.tsx` — заменить Geist-шрифты на Nunito + Cormorant Garamond, заменить metadata на русскую.
- `app/globals.css` — заменить дефолтный Geist + dark mode на дизайн-токены из SPEC §T4 + типографику + контейнер.

**Удаляем:**
- `app/page.tsx` (заменён на `app/(public)/page.tsx`).
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`.

**Не трогаем:** `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `README.md`, `app/favicon.ico`.

---

### Task 1: Установить зависимости Sprint 1

**Files:**
- Modify: `package.json` (через `npm install`)
- Modify: `package-lock.json`

- [ ] **Step 1: Установить runtime-зависимости**

Run:
```bash
npm install @radix-ui/react-dialog@^1.1 @radix-ui/react-accordion@^1.2 clsx@^2.1 embla-carousel-react@^8.5 framer-motion@^12 lucide-react@^0.460
```

Ожидаемо: установка без ошибок, `package.json` обновлён, `node_modules` дополнено.

Если `npm` ругается на peer-dep конфликт с React 19 — добавить `--legacy-peer-deps`. Embla 8.5+ и Framer Motion 12+ поддерживают React 19, конфликта быть не должно.

- [ ] **Step 2: Проверить итоговый package.json**

Прочитать `package.json` и убедиться, что блок `dependencies` теперь содержит:

```json
"dependencies": {
  "@radix-ui/react-accordion": "^1.2",
  "@radix-ui/react-dialog": "^1.1",
  "clsx": "^2.1",
  "embla-carousel-react": "^8.5",
  "framer-motion": "^12",
  "lucide-react": "^0.460",
  "next": "16.2.6",
  "react": "19.2.4",
  "react-dom": "19.2.4"
}
```

`devDependencies` не меняется.

- [ ] **Step 3: Sanity-сборка**

Run:
```bash
npm run build
```

Ожидаемо: успешная сборка с дефолтным `app/page.tsx` (старый контент ещё на месте). Это базовый sanity-check, что зависимости совместимы. Warnings от Next про `dark:invert` в дефолтной странице игнорируем — страница удалится в задаче 2.

- [ ] **Step 4: Коммит**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add sprint 1 dependencies (radix, embla, framer, lucide, clsx)"
```

---

### Task 2: Очистить дефолтный скаффолд create-next-app

**Files:**
- Delete: `app/page.tsx`
- Delete: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

- [ ] **Step 1: Удалить демо-страницу и дефолтные SVG**

Run:
```bash
rm app/page.tsx public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

Ожидаемо: 6 файлов удалены. `app/page.tsx` пересоздастся в задаче 21 как `app/(public)/page.tsx`.

- [ ] **Step 2: Проверить, что в public/ остался только favicon-related контент**

Run:
```bash
ls public/
```

Ожидаемо: либо пустой каталог, либо только то, что было в проекте до скаффолда. `favicon.ico` в `app/`, не в `public/`.

- [ ] **Step 3: Коммит**

```bash
git add -A public/ app/page.tsx
git commit -m "chore: remove default create-next-app scaffold assets"
```

---

### Task 3: Подключить шрифты Nunito + Cormorant Garamond и заменить metadata на русскую

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Переписать `app/layout.tsx`**

Полностью заменить содержимое `app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700', '800'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  style: ['italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ксения Каменская · Психолог',
  description:
    'Психология женского тела и проявленности. Бесплатная консультация 20 минут.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${nunito.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
```

Ключевые отличия от дефолта:
- `lang="ru"` вместо `lang="en"`.
- Geist-шрифты → Nunito (sans) + Cormorant Garamond Italic (serif).
- `variable` — `--font-nunito` / `--font-cormorant`, чтобы не конфликтовать с Tailwind-токенами `--font-sans` / `--font-serif`, которые определим в `@theme inline` в задаче 4.
- Сабсеты `latin + cyrillic`, веса по SPEC §T1.
- Класс `font-sans` на `<body>` — будет работать после задачи 4.
- Метаданные на русском, без «Create Next App».

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто. Если ругается на `font-sans`-класс — это не TS, а runtime; пройдёт после задачи 4.

- [ ] **Step 3: Коммит**

```bash
git add app/layout.tsx
git commit -m "feat(layout): swap geist for nunito + cormorant fonts and russian metadata"
```

---

### Task 4: Записать дизайн-токены и типографику в `app/globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Полностью переписать `app/globals.css`**

Заменить всё содержимое на:

```css
@import "tailwindcss";

/* ============================================================
   Дизайн-токены (SPEC.md §T4)
   ============================================================ */
@theme {
  /* Primary */
  --color-primary-50: #f7f1fc;
  --color-primary-300: #c9a3e8;
  --color-primary-400: #9b5fd1;
  --color-primary-500: #7b2cbf;
  --color-primary-600: #6a1faa;

  /* Accent (НИКОГДА не цвет текста на белом фоне) */
  --color-accent-50: #fff4e8;
  --color-accent-500: #ffa552;

  /* Neutral */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #faf8fc;
  --color-neutral-100: #e6e6ec;
  --color-neutral-500: #6b6b80;
  --color-neutral-700: #3a3a52;
  --color-neutral-900: #1e1e2e;

  /* Семантика */
  --color-success: #4caf7a;
  --color-error: #d13a5c;

  /* Радиусы */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-pill: 999px;
}

/* Шрифты пробрасываются inline, чтобы переменные из next/font
   (--font-nunito / --font-cormorant) попали в утилиты font-sans / font-serif */
@theme inline {
  --font-sans: var(--font-nunito), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-serif: var(--font-cormorant), Georgia, serif;
}

/* ============================================================
   База
   ============================================================ */
body {
  background: var(--color-neutral-0);
  color: var(--color-neutral-900);
}

/* Учитываем sticky-хедер при якорном скролле (точная высота
   синхронизируется с Header в задаче 15). */
html {
  scroll-behavior: smooth;
}

section[id] {
  scroll-margin-top: 80px;
}

/* ============================================================
   Контейнер (SPEC.md §T1)
   ============================================================ */
@layer components {
  .container-page {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 16px;
    padding-right: 16px;
  }

  @media (min-width: 640px) {
    .container-page {
      padding-left: 24px;
      padding-right: 24px;
    }
  }

  @media (min-width: 1024px) {
    .container-page {
      padding-left: 32px;
      padding-right: 32px;
    }
  }
}

/* ============================================================
   Типографика (SPEC.md §T1)
   ============================================================ */
@layer utilities {
  .font-display {
    font-family: var(--font-serif);
    font-style: italic;
    font-weight: 400;
    font-size: 48px;
    line-height: 1.05;
  }

  .text-h1 {
    font-family: var(--font-sans);
    font-weight: 800;
    font-size: 32px;
    line-height: 1.15;
  }

  .text-h2 {
    font-family: var(--font-sans);
    font-weight: 700;
    font-size: 24px;
    line-height: 1.2;
  }

  .text-h3 {
    font-family: var(--font-sans);
    font-weight: 700;
    font-size: 20px;
    line-height: 1.25;
  }

  .text-body {
    font-family: var(--font-sans);
    font-weight: 400;
    font-size: 15px;
    line-height: 1.55;
  }

  @media (min-width: 1024px) {
    .font-display { font-size: 72px; }
    .text-h1 { font-size: 48px; }
    .text-h2 { font-size: 36px; }
    .text-h3 { font-size: 24px; }
    .text-body { font-size: 16px; }
  }
}

/* ============================================================
   Embla — базовые правила слайдов.
   Ширина слайда задаётся CSS-переменными --slide-size-base /
   --slide-size-lg, которые EmblaCarousel прокидывает inline.
   ============================================================ */
.embla__viewport {
  overflow: hidden;
}

.embla__container {
  display: flex;
  touch-action: pan-y;
}

.embla__slide {
  flex: 0 0 var(--slide-size-base, 100%);
  min-width: 0;
  padding-left: 16px;
}

.embla__slide:first-child {
  padding-left: 0;
}

@media (min-width: 1024px) {
  .embla__slide {
    flex: 0 0 var(--slide-size-lg, var(--slide-size-base, 100%));
  }
}
```

Ключевые отличия от текущего файла:
- Никакого `--background` / `--foreground` и `@media (prefers-color-scheme: dark)` — без dark mode.
- Никакого `font-family: Arial` в body — шрифт назначается через утилиту `font-sans` (задача 3).
- Цвета — Primary/Accent/Neutral/семантика по SPEC §T4.
- Утилиты `.font-display`, `.text-h1..h3`, `.text-body` с мобильными размерами по умолчанию и `lg`-уровнем в одном media-блоке.
- `.container-page` для всех секций.
- Embla-стили: контейнер flex + слайды через CSS-переменные, gap через `padding-left` (а не margin) — чтобы первый слайд начинался от края.
- `scroll-margin-top: 80px` для якорей.

- [ ] **Step 2: Запустить dev-сервер и убедиться, что страница не падает**

Run:
```bash
npm run dev
```

Открыть http://localhost:3000 — будет 404 (мы удалили `app/page.tsx` в задаче 2 и ещё не создали `app/(public)/page.tsx`), но **в консоли** не должно быть CSS-ошибок типа «Cannot resolve `@theme`», «Unknown at-rule» и т.п. Tailwind v4 принимает `@theme`, `@theme inline`, `@layer` нативно.

Остановить сервер (`Ctrl+C`).

- [ ] **Step 3: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 4: Коммит**

```bash
git add app/globals.css
git commit -m "feat(styles): design tokens, typography utilities, container, embla base"
```

---

### Task 5: Создать `lib/cn.ts` — clsx-обёртка

**Files:**
- Create: `lib/cn.ts`

- [ ] **Step 1: Создать утилиту**

Создать `lib/cn.ts` со следующим содержимым:

```ts
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
```

Используется всеми UI-компонентами для склейки классов. Tailwind-merge не подключаем — в Sprint 1 не нужно, простая склейка достаточна. Если когда-нибудь возникнут реальные конфликты Tailwind-классов — добавим `tailwind-merge` тогда же.

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add lib/cn.ts
git commit -m "feat(lib): add cn() class-join helper"
```

---

### Task 6: UI-примитив `Logo`

**Files:**
- Create: `components/ui/Logo.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/ui/Logo.tsx`:

```tsx
import { cn } from '@/lib/cn';

type LogoProps = {
  size?: number;
  variant?: 'mark' | 'mark+text';
  className?: string;
};

export function Logo({ size = 40, variant = 'mark', className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 11 V29 M12 20 L20 11 M12 20 L20 29"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 11 V29 M22 20 L30 11 M22 20 L30 29"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {variant === 'mark+text' && (
        <span className="font-serif italic text-[16px] text-neutral-900">
          Ксения Каменская
        </span>
      )}
    </span>
  );
}
```

Замечания:
- SVG-знак — две литеры «К·К» в круге, `stroke="currentColor"`, чтобы цвет шёл от родителя (`text-primary-500` в Header, `text-neutral-0` в Footer-варианте на тёмном — на MVP не нужен).
- `aria-hidden` на SVG: смысл несут текст рядом или ссылка-обёртка.
- Шрифт текстовой части — `font-serif italic` (Cormorant Garamond), как описано в спеке.

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/ui/Logo.tsx
git commit -m "feat(ui): logo component with mark and mark+text variants"
```

---

### Task 7: UI-примитив `Button`

**Files:**
- Create: `components/ui/Button.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/ui/Button.tsx`:

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | 'href'> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-500 text-neutral-0 hover:bg-primary-600 focus-visible:ring-primary-300',
  secondary:
    'border border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-300',
  ghost:
    'text-primary-500 bg-transparent hover:underline focus-visible:ring-primary-300',
};

const sizeClasses: Record<Size, string> = {
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-[52px] px-7 text-[16px]',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-sans font-bold ' +
  'transition-colors duration-150 outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if ('href' in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
```

Замечания:
- `size="md"` высота 44px (`h-11`, SPEC §T1 touch-target минимум), `size="lg"` 52px для hero-CTA в Sprint 2.
- Дискриминация по `href`: если строка — рендер `<a>`, иначе `<button>` с `type` через `...rest` (по умолчанию HTML `type="submit"`, но потребители должны указывать `type="button"` где нужно; на Sprint 1 это не блокирует).
- Focus ring через `focus-visible:ring-*` для клавиатурного фокуса.
- Линтер может ругаться на `_v` / `_s` / `_c` / `_ch` — убрать через `eslint-disable-next-line @typescript-eslint/no-unused-vars` если потребуется; обычно подчёркивание-префикс конфиг Next-eslint допускает.

- [ ] **Step 2: Lint + typecheck**

Run:
```bash
npx tsc --noEmit && npm run lint
```

Ожидаемо: чисто. Если lint ругается на unused vars `_v/_s/_c/_ch` — поправить декларацию или добавить `// eslint-disable-next-line @typescript-eslint/no-unused-vars` перед destructure.

- [ ] **Step 3: Коммит**

```bash
git add components/ui/Button.tsx
git commit -m "feat(ui): button primitive with primary/secondary/ghost variants and md/lg sizes"
```

---

### Task 8: UI-примитив `Input`

**Files:**
- Create: `components/ui/Input.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/ui/Input.tsx`:

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  containerClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, containerClassName, id, required, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      <label
        htmlFor={inputId}
        className="text-[14px] font-bold text-neutral-700"
      >
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={cn(
          'h-12 rounded-md border bg-neutral-0 px-4 text-body text-neutral-900',
          'placeholder:text-neutral-500 outline-none transition-colors',
          'focus-visible:ring-2 focus-visible:ring-primary-300',
          error ? 'border-error' : 'border-neutral-100 focus:border-primary-400',
          className,
        )}
        {...rest}
      />
      {error && inputId && (
        <span id={`${inputId}-error`} className="text-[13px] text-error">
          {error}
        </span>
      )}
    </div>
  );
});
```

Замечания:
- `forwardRef` нужен для RHF в Sprint 3.
- Высота 48px (`h-12`) по спеке. Padding 16px.
- `aria-invalid` + `aria-describedby` для a11y, когда есть `error`.

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/ui/Input.tsx
git commit -m "feat(ui): input primitive with label, error slot, a11y attrs"
```

---

### Task 9: UI-примитив `PhoneInput`

**Files:**
- Create: `components/ui/PhoneInput.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/ui/PhoneInput.tsx`:

```tsx
'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type PhoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & {
  label: string;
  error?: string;
  containerClassName?: string;
  value?: string; // нормализованное +7XXXXXXXXXX или пустая строка
  onChange?: (normalized: string) => void;
};

function digitsToMask(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length === 0) return '';
  let out = '+7 (';
  out += d.slice(0, 3);
  if (d.length >= 3) {
    out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
  }
  return out;
}

function normalizedFromDigits(digits: string): string {
  return digits.length === 10 ? '+7' + digits : '';
}

function extractDigits(value: string): string {
  // Берём только цифры; если первая — 7 или 8, считаем её страновым кодом и отбрасываем
  let d = value.replace(/\D/g, '');
  if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
  return d.slice(0, 10);
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      label,
      error,
      className,
      containerClassName,
      id,
      required,
      value,
      onChange,
      ...rest
    },
    ref,
  ) {
    const inputId = id ?? rest.name ?? 'phone';

    const initialDigits =
      value && value.startsWith('+7') ? value.slice(2) : '';
    const [digits, setDigits] = useState(initialDigits);
    const display = digitsToMask(digits);

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        <label
          htmlFor={inputId}
          className="text-[14px] font-bold text-neutral-700"
        >
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          value={display}
          onChange={(e) => {
            const d = extractDigits(e.target.value);
            setDigits(d);
            onChange?.(normalizedFromDigits(d));
          }}
          className={cn(
            'h-12 rounded-md border bg-neutral-0 px-4 text-body text-neutral-900',
            'placeholder:text-neutral-500 outline-none transition-colors',
            'focus-visible:ring-2 focus-visible:ring-primary-300',
            error
              ? 'border-error'
              : 'border-neutral-100 focus:border-primary-400',
            className,
          )}
          {...rest}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-[13px] text-error">
            {error}
          </span>
        )}
      </div>
    );
  },
);
```

Замечания:
- Реализация без библиотек, ~80 строк.
- Внутреннее состояние держит сырые цифры (без +7). Это упрощает редактирование и бэкспейс.
- `value` снаружи — нормализованная форма (`+7XXXXXXXXXX` или `''`). При первой инициализации парсится в digits.
- `onChange` отдаёт нормализованную строку, либо пустую если ещё не 10 цифр.
- Бэкспейс работает корректно: пользователь стирает символы маски — `extractDigits` всё равно даёт правильное число цифр.
- На вставке `89991234567` стартовая 8 отбрасывается, получаем 10 цифр.

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/ui/PhoneInput.tsx
git commit -m "feat(ui): phone input with +7 mask, raw-digit state, normalized onChange"
```

---

### Task 10: UI-примитив `Card`

**Files:**
- Create: `components/ui/Card.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/ui/Card.tsx`:

```tsx
import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Card({ as: Tag = 'div', className, children }: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-lg bg-neutral-0 border border-neutral-100 shadow-sm p-6',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
```

Замечания:
- Без compound-слотов (header/body/footer). Секции и материалы складывают свою верстку сами.
- `as` позволяет рендерить `<article>` для материалов и кейсов.

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/ui/Card.tsx
git commit -m "feat(ui): card primitive (rounded-lg, neutral-100 border, shadow-sm)"
```

---

### Task 11: UI-примитив `Accordion`

**Files:**
- Create: `components/ui/Accordion.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/ui/Accordion.tsx`:

```tsx
'use client';

import * as RA from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AccordionItemData = {
  id: string;
  q: string;
  a: ReactNode;
};

type AccordionProps = {
  items: AccordionItemData[];
  defaultOpenId?: string;
  className?: string;
};

export function Accordion({ items, defaultOpenId, className }: AccordionProps) {
  return (
    <RA.Root
      type="single"
      collapsible
      defaultValue={defaultOpenId}
      className={cn('flex flex-col divide-y divide-neutral-100', className)}
    >
      {items.map((item) => (
        <RA.Item key={item.id} value={item.id} className="py-2">
          <RA.Header>
            <RA.Trigger
              className={cn(
                'group flex w-full items-center justify-between gap-4 py-4',
                'text-left text-h3 text-neutral-900',
                'outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-sm',
              )}
            >
              <span>{item.q}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-primary-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </RA.Trigger>
          </RA.Header>
          <RA.Content
            className={cn(
              'overflow-hidden',
              'data-[state=open]:animate-[accordion-down_200ms_ease]',
              'data-[state=closed]:animate-[accordion-up_200ms_ease]',
            )}
          >
            <div className="pb-4 text-body text-neutral-700">{item.a}</div>
          </RA.Content>
        </RA.Item>
      ))}
    </RA.Root>
  );
}
```

- [ ] **Step 2: Добавить keyframes в `app/globals.css`**

В конец `app/globals.css` (после блока `@layer utilities`) добавить:

```css
/* Radix Accordion — анимация collapse через CSS-переменную --radix-accordion-content-height */
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

- [ ] **Step 3: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 4: Коммит**

```bash
git add components/ui/Accordion.tsx app/globals.css
git commit -m "feat(ui): accordion wrapper over radix with chevron rotate + collapse anim"
```

---

### Task 12: UI-примитив `Dialog`

**Files:**
- Create: `components/ui/Dialog.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/ui/Dialog.tsx`:

```tsx
'use client';

import * as RD from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  hideTitle?: boolean;
  position?: 'right' | 'center';
  children: ReactNode;
  contentClassName?: string;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  hideTitle,
  position = 'center',
  children,
  contentClassName,
}: DialogProps) {
  const reduced = useReducedMotion();

  const contentMotion =
    position === 'right'
      ? {
          initial: reduced ? { opacity: 0 } : { x: '100%' },
          animate: reduced ? { opacity: 1 } : { x: 0 },
          exit: reduced ? { opacity: 0 } : { x: '100%' },
          transition: { duration: 0.2, ease: 'easeOut' as const },
        }
      : {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.98 },
          transition: { duration: 0.15, ease: 'easeOut' as const },
        };

  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RD.Portal forceMount>
            <RD.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-neutral-900/40"
              />
            </RD.Overlay>
            <RD.Content asChild forceMount>
              <motion.div
                {...contentMotion}
                className={cn(
                  'fixed z-50 bg-neutral-0 outline-none',
                  position === 'right' &&
                    'top-0 right-0 h-full w-[88%] max-w-sm shadow-xl',
                  position === 'center' &&
                    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ' +
                      'w-[92%] max-w-md rounded-lg shadow-xl',
                  contentClassName,
                )}
              >
                <RD.Title
                  className={cn(
                    hideTitle && 'sr-only',
                    !hideTitle && 'text-h3 text-neutral-900 px-6 pt-6',
                  )}
                >
                  {title}
                </RD.Title>
                <RD.Close
                  aria-label="Закрыть"
                  className={cn(
                    'absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center',
                    'rounded-md text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none',
                    'focus-visible:ring-2 focus-visible:ring-primary-300',
                  )}
                >
                  <X className="size-5" aria-hidden="true" />
                </RD.Close>
                {children}
              </motion.div>
            </RD.Content>
          </RD.Portal>
        )}
      </AnimatePresence>
    </RD.Root>
  );
}
```

Замечания:
- `position="right"` — slide-in справа на 88% ширины (макс 24rem), для MobileMenu.
- `position="center"` — модал по центру с лёгким scale-in, заложен на Sprint 3 для «подробнее ▾» возле чекбоксов согласий.
- Body lock из коробки в Radix Dialog.
- `useReducedMotion()` отключает translate, оставляя fade.
- `hideTitle` — для MobileMenu, где заголовок дублирует логотип и должен быть `sr-only` ради a11y.

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/ui/Dialog.tsx
git commit -m "feat(ui): dialog wrapper over radix with right slide-in and center modal positions"
```

---

### Task 13: Layout `Footer`

**Files:**
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/layout/Footer.tsx`:

```tsx
import { Logo } from '@/components/ui/Logo';

const NAV = [
  { href: '/#about', label: 'Обо мне' },
  { href: '/#services', label: 'Услуги' },
  { href: '/#materials', label: 'Материалы' },
  { href: '/#contact', label: 'Контакт' },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-100 bg-neutral-50">
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Левая колонка */}
          <div className="flex flex-col gap-3 text-neutral-700">
            <Logo variant="mark+text" />
            <p className="text-body">Психолог · Женские практики</p>
            <p className="text-[13px] text-neutral-500">
              Услуги психолога не являются психотерапией и медицинской помощью.
            </p>
          </div>

          {/* Центральная колонка */}
          <div className="flex flex-col gap-2 text-body text-neutral-700">
            <a
              href="https://t.me/xenia_kamensky"
              className="hover:text-primary-500"
            >
              Telegram: @xenia_kamensky
            </a>
            <a
              href="https://t.me/kmensky_case"
              className="hover:text-primary-500"
            >
              Канал отзывов: t.me/kmensky_case
            </a>
            <a
              href="mailto:hello@kamenskaya.ru"
              className="hover:text-primary-500"
            >
              Email: hello@kamenskaya.ru
            </a>
          </div>

          {/* Правая колонка */}
          <nav aria-label="Футер: навигация">
            <ul className="flex flex-col gap-2 text-body text-neutral-700">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-primary-500">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Нижняя строка */}
        <div className="mt-10 border-t border-neutral-100 pt-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between text-[13px] text-neutral-500">
          <p>
            ИП Каменская К. С. · ОГРНИП 323784700394015 · ИНН 781435744110
          </p>
          <ul className="flex gap-4">
            <li>
              <a href="#" className="hover:text-primary-500">
                Политика ПДн
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary-500">
                Оферта
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary-500">
                Cookie
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
```

Замечания:
- Юр-ссылки в нижней строке временно `href="#"` — настоящие страницы появятся в Sprint 5.
- Server component (`'use client'` не нужен).

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/layout/Footer.tsx
git commit -m "feat(layout): footer with 3 columns, signature row, dead legal links"
```

---

### Task 14: Layout `MobileMenu`

**Files:**
- Create: `components/layout/MobileMenu.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/layout/MobileMenu.tsx`:

```tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Logo } from '@/components/ui/Logo';

const NAV = [
  { href: '/#about', label: 'Обо мне' },
  { href: '/#services', label: 'Услуги' },
  { href: '/#materials', label: 'Материалы' },
  { href: '/#contact', label: 'Контакт' },
];

type MobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const close = () => onOpenChange(false);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Меню"
      hideTitle
      position="right"
    >
      <div className="flex h-full flex-col px-6 pt-6 pb-8">
        <div className="mb-8 flex items-center">
          <Logo variant="mark+text" />
        </div>

        <nav aria-label="Главная навигация" className="flex flex-col gap-4">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className="text-h3 text-neutral-900 hover:text-primary-500"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="my-8 border-t border-neutral-100" />

        <Button
          href="/#contact"
          variant="primary"
          size="md"
          onClick={close}
          className="w-full"
        >
          Записаться на консультацию
        </Button>

        <div className="mt-auto flex flex-col gap-2 pt-8 text-body text-neutral-700">
          <a href="https://t.me/xenia_kamensky">@xenia_kamensky</a>
          <a href="mailto:hello@kamenskaya.ru">hello@kamenskaya.ru</a>
        </div>
      </div>
    </Dialog>
  );
}
```

Замечания:
- Body lock и focus-trap — из Radix Dialog (через нашу обёртку).
- Slide-in справа + reduced-motion — реализованы в `Dialog` через Framer Motion.
- Закрытие по клику на пункт — `onClick={close}`. Якорный скролл случится после закрытия (браузер обработает `href="/#about"` нормально, т.к. мы на `/`).
- Telegram-ник `@xenia_kamensky` хардкодим (открытый вопрос SPEC §П3 №3, решаем в Sprint 3).

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/layout/MobileMenu.tsx
git commit -m "feat(layout): mobile menu (right slide-in via dialog wrapper)"
```

---

### Task 15: Layout `Header`

**Files:**
- Create: `components/layout/Header.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/layout/Header.tsx`:

```tsx
'use client';

import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/#about', label: 'Обо мне' },
  { href: '/#services', label: 'Услуги' },
  { href: '/#materials', label: 'Материалы' },
  { href: '/#contact', label: 'Контакт' },
];

const COMPACT_THRESHOLD_PX = 20;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  // Hysteresis: переход вниз → компакт срабатывает после 20px накопления.
  const lastYRef = useRef(0);
  const accDownRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastYRef.current;
        lastYRef.current = y;

        if (y <= 0) {
          accDownRef.current = 0;
          setCompact(false);
        } else if (delta > 0) {
          accDownRef.current += delta;
          if (accDownRef.current >= COMPACT_THRESHOLD_PX) {
            setCompact(true);
          }
        } else if (delta < 0) {
          accDownRef.current = 0;
          setCompact(false);
        }
        tickingRef.current = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 w-full bg-neutral-0/95 backdrop-blur transition-[height,border-color] duration-150',
          compact
            ? 'h-14 border-b border-neutral-100'
            : 'h-20 border-b border-transparent',
        )}
      >
        <div className="container-page flex h-full items-center justify-between">
          <a href="/" aria-label="На главную" className="text-primary-500">
            <Logo variant="mark+text" />
          </a>

          {/* Десктоп-нав */}
          <nav
            aria-label="Главная навигация"
            className="hidden lg:flex items-center gap-8"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-body text-neutral-700 hover:text-primary-500"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Десктоп-CTA */}
          <div className="hidden lg:block">
            <Button href="/#contact" variant="primary" size="md">
              Записаться
            </Button>
          </div>

          {/* Мобайл-меню кнопка */}
          <button
            type="button"
            aria-label="Открыть меню"
            onClick={() => setMenuOpen(true)}
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-md',
              'text-neutral-900 hover:bg-neutral-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
              'lg:hidden',
            )}
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
```

Замечания:
- Sticky-поведение: компакт = 56px, обычный = 80px. Hysteresis 20px перед переходом в компакт.
- Throttle scroll-listener через `requestAnimationFrame` и `tickingRef` — без lodash.
- Якорный скролл работает нативно через `scroll-behavior: smooth` в `html` и `scroll-margin-top: 80px` на `section[id]` (задача 4).
- Logo обёрнут в `<a href="/">` с `aria-label`; цвет SVG-знака — `text-primary-500`.

- [ ] **Step 2: Typecheck + lint**

Run:
```bash
npx tsc --noEmit && npm run lint
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/layout/Header.tsx
git commit -m "feat(layout): sticky header with rAF-throttled compact mode + 20px hysteresis"
```

---

### Task 16: Обвязка `app/(public)/layout.tsx`

**Files:**
- Create: `app/(public)/layout.tsx`

- [ ] **Step 1: Создать layout-группу**

Создать `app/(public)/layout.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
```

Замечания:
- Группа `(public)` — обычная App Router route group, URL не меняется. Все публичные маршруты (`/`, `/materials`, `/contact`, `/thanks`, `/privacy` и т.д.) переедут под эту группу в своих спринтах.
- `<main className="flex-1">` обеспечивает прижатие футера к низу (`<body className="min-h-full flex flex-col">` уже в root `layout.tsx`).

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add "app/(public)/layout.tsx"
git commit -m "feat(layout): public route group with header + footer wrapper"
```

---

### Task 17: Carousel `CarouselDots`

**Files:**
- Create: `components/carousel/CarouselDots.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/carousel/CarouselDots.tsx`:

```tsx
'use client';

import type { EmblaCarouselType } from 'embla-carousel';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type CarouselDotsProps = {
  embla: EmblaCarouselType | undefined;
  className?: string;
};

export function CarouselDots({ embla, className }: CarouselDotsProps) {
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelected(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    onSelect(embla);
    embla.on('select', onSelect);
    embla.on('reInit', (api) => {
      setSnaps(api.scrollSnapList());
      onSelect(api);
    });
    return () => {
      embla.off('select', onSelect);
    };
  }, [embla, onSelect]);

  if (snaps.length <= 1) return null;

  return (
    <div
      className={cn('flex items-center justify-center gap-2', className)}
      role="tablist"
      aria-label="Слайды карусели"
    >
      {snaps.map((_, i) => {
        const isActive = i === selected;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Перейти к слайду ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className={cn(
              // Кликабельная область 44px (touch-target), визуал — точка 8px
              'inline-flex h-11 w-11 items-center justify-center',
            )}
          >
            <span
              className={cn(
                'block size-2 rounded-pill transition-colors',
                isActive ? 'bg-accent-500' : 'bg-primary-300',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
```

Замечания:
- Активная точка `bg-accent-500`, неактивная `bg-primary-300`.
- Кликабельная зона 44×44 (touch-target), визуальная точка 8×8.
- Возврат `null` для одиночного слайда.

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/carousel/CarouselDots.tsx
git commit -m "feat(carousel): dots with active accent-500 and 44px touch targets"
```

---

### Task 18: Carousel `CarouselArrows`

**Files:**
- Create: `components/carousel/CarouselArrows.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/carousel/CarouselArrows.tsx`:

```tsx
'use client';

import type { EmblaCarouselType } from 'embla-carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type CarouselArrowsProps = {
  embla: EmblaCarouselType | undefined;
  className?: string;
};

export function CarouselArrows({ embla, className }: CarouselArrowsProps) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback((api: EmblaCarouselType) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!embla) return;
    update(embla);
    embla.on('select', update);
    embla.on('reInit', update);
    return () => {
      embla.off('select', update);
      embla.off('reInit', update);
    };
  }, [embla, update]);

  const btn =
    'inline-flex h-11 w-11 items-center justify-center rounded-full ' +
    'border border-neutral-100 bg-neutral-0 text-primary-500 ' +
    'hover:bg-primary-50 transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className={cn('hidden md:flex items-center justify-center gap-3', className)}>
      <button
        type="button"
        aria-label="Предыдущий слайд"
        disabled={!canPrev}
        onClick={() => embla?.scrollPrev()}
        className={btn}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Следующий слайд"
        disabled={!canNext}
        onClick={() => embla?.scrollNext()}
        className={btn}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
```

Замечания:
- Видимы только на `md+` (`hidden md:flex`) — по SPEC §T3.
- Disabled state по `canScrollPrev/Next` (актуально для секций 3 и 4 с `loop: false`).

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/carousel/CarouselArrows.tsx
git commit -m "feat(carousel): arrows visible on md+, disabled when no scroll possible"
```

---

### Task 19: Carousel `EmblaCarousel` (generic-обёртка)

**Files:**
- Create: `components/carousel/EmblaCarousel.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/carousel/EmblaCarousel.tsx`:

```tsx
'use client';

import type { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { CarouselArrows } from '@/components/carousel/CarouselArrows';
import { CarouselDots } from '@/components/carousel/CarouselDots';
import { cn } from '@/lib/cn';

type SlidesPerView = { base: number; lg?: number };

export type EmblaCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  options?: EmblaOptionsType;
  showArrows?: boolean;
  showDots?: boolean;
  slidesPerView?: SlidesPerView;
  className?: string;
  ariaLabel: string;
};

export function EmblaCarousel<T>({
  items,
  renderItem,
  options,
  showArrows = false,
  showDots = true,
  slidesPerView = { base: 1 },
  className,
  ariaLabel,
}: EmblaCarouselProps<T>) {
  const [viewportRef, embla] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    ...options,
  });

  // Реинициализация при resize
  useEffect(() => {
    if (!embla) return;
    const onResize = () => embla.reInit();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [embla]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!embla) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      embla.scrollPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      embla.scrollNext();
    }
  };

  const base = slidesPerView.base;
  const lg = slidesPerView.lg ?? base;
  const style: CSSProperties = {
    ['--slide-size-base' as string]: `${100 / base}%`,
    ['--slide-size-lg' as string]: `${100 / lg}%`,
  };

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div ref={viewportRef} className="embla__viewport" style={style}>
        <div className="embla__container">
          {items.map((item, i) => (
            <div key={i} className="embla__slide">
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>

      {(showArrows || showDots) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {showDots && <CarouselDots embla={embla} />}
          </div>
          {showArrows && <CarouselArrows embla={embla} />}
        </div>
      )}
    </div>
  );
}
```

Замечания:
- `slidesPerView` → CSS-переменные `--slide-size-base/--slide-size-lg`, подхваченные правилами `.embla__slide` из `globals.css` (задача 4).
- Дефолт: `align: 'start'`, `containScroll: 'trimSnaps'`. Любой `options` (например `loop: true`) переопределяет.
- Клавиатура ←/→: фокус на корневом `<div role="region" tabIndex={0}>`.
- Reinit на resize.
- Dots и Arrows получают `embla` напрямую — они сами слушают `select`/`reInit`.

- [ ] **Step 2: Typecheck + lint**

Run:
```bash
npx tsc --noEmit && npm run lint
```

Ожидаемо: чисто.

- [ ] **Step 3: Коммит**

```bash
git add components/carousel/EmblaCarousel.tsx
git commit -m "feat(carousel): generic embla wrapper with slidesPerView via css vars, keyboard nav, dots+arrows slots"
```

---

### Task 20: Пустая папка `content/materials/`

**Files:**
- Create: `content/materials/.gitkeep`

- [ ] **Step 1: Создать пустой .gitkeep**

Run:
```bash
mkdir -p content/materials && touch content/materials/.gitkeep
```

Замечания:
- Заранее закрепляем папку под MDX-материалы Sprint 4.
- `.gitkeep` — конвенция, чтобы git трекал пустую директорию.
- В Sprint 1 пакет `next-mdx-remote` не ставим.

- [ ] **Step 2: Коммит**

```bash
git add content/materials/.gitkeep
git commit -m "chore(content): placeholder folder for sprint 4 materials"
```

---

### Task 21: Главная-каркас `app/(public)/page.tsx`

**Files:**
- Create: `app/(public)/page.tsx`

- [ ] **Step 1: Создать страницу с якорями и тремя демо-каруселями**

Создать `app/(public)/page.tsx`:

```tsx
import { Card } from '@/components/ui/Card';
import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';

const placeholderSlides = (n: number, prefix: string) =>
  Array.from({ length: n }, (_, i) => ({ id: `${prefix}-${i + 1}`, label: `Слайд ${i + 1}` }));

const workAreasDemo = placeholderSlides(3, 'wa');
const casesDemo = placeholderSlides(3, 'case');
const servicesDemo = placeholderSlides(5, 'svc');
const materialsDemo = placeholderSlides(4, 'mat');

function Placeholder({ label }: { label: string }) {
  return (
    <Card className="flex h-40 items-center justify-center text-h3 text-primary-500">
      {label}
    </Card>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="text-h2 text-neutral-900 mb-6">
      {children} <span className="text-neutral-500">(плейсхолдер)</span>
    </h2>
  );
}

export default function HomePage() {
  return (
    <>
      <section id="hero" className="container-page py-16 lg:py-24">
        <SectionHeading>Hero</SectionHeading>
        <p className="text-body text-neutral-700">
          Здесь будет первый экран — Sprint 2.
        </p>
      </section>

      <section id="about" className="container-page py-16 lg:py-24">
        <SectionHeading>Обо мне</SectionHeading>
        <p className="text-body text-neutral-700">
          Здесь будет секция «Обо мне» — Sprint 2.
        </p>
      </section>

      {/* Демо-карусель #1: секции 3/4 — mobile-only Embla + desktop grid 3 (loop: false) */}
      <section id="work-areas" className="container-page py-16 lg:py-24">
        <SectionHeading>С чем я работаю</SectionHeading>

        <div className="lg:hidden">
          <EmblaCarousel
            items={workAreasDemo}
            renderItem={(item) => <Placeholder label={item.label} />}
            options={{ loop: false }}
            slidesPerView={{ base: 1 }}
            showArrows={false}
            showDots
            ariaLabel="Демо-карусель: сферы работы"
          />
        </div>
        <div className="hidden lg:grid grid-cols-3 gap-4">
          {workAreasDemo.map((item) => (
            <Placeholder key={item.id} label={item.label} />
          ))}
        </div>
      </section>

      {/* Демо повторяет #1, но с кейсами — структурно то же */}
      <section id="cases" className="container-page py-16 lg:py-24">
        <SectionHeading>Истории клиенток</SectionHeading>

        <div className="lg:hidden">
          <EmblaCarousel
            items={casesDemo}
            renderItem={(item) => <Placeholder label={item.label} />}
            options={{ loop: false }}
            slidesPerView={{ base: 1 }}
            showArrows={false}
            showDots
            ariaLabel="Демо-карусель: кейсы"
          />
        </div>
        <div className="hidden lg:grid grid-cols-3 gap-4">
          {casesDemo.map((item) => (
            <Placeholder key={item.id} label={item.label} />
          ))}
        </div>
      </section>

      {/* Демо-карусель #2: секция 5 — Embla везде, lg=3 / base=1, loop: true */}
      <section id="services" className="container-page py-16 lg:py-24">
        <SectionHeading>Услуги</SectionHeading>
        <EmblaCarousel
          items={servicesDemo}
          renderItem={(item) => <Placeholder label={item.label} />}
          options={{ loop: true }}
          slidesPerView={{ base: 1, lg: 3 }}
          showArrows
          showDots
          ariaLabel="Демо-карусель: услуги"
        />
      </section>

      <section id="faq" className="container-page py-16 lg:py-24">
        <SectionHeading>FAQ</SectionHeading>
        <p className="text-body text-neutral-700">
          Здесь будет FAQ — Sprint 2.
        </p>
      </section>

      <section id="contact" className="container-page py-16 lg:py-24">
        <SectionHeading>Записаться</SectionHeading>
        <p className="text-body text-neutral-700">
          Здесь будет форма — Sprint 3.
        </p>
      </section>

      {/* Демо-карусель #3 (materials поведение) — рендерим в отдельной секции */}
      <section id="materials" className="container-page py-16 lg:py-24">
        <SectionHeading>Материалы</SectionHeading>

        <div className="lg:hidden">
          <EmblaCarousel
            items={materialsDemo}
            renderItem={(item) => <Placeholder label={item.label} />}
            options={{ loop: false }}
            slidesPerView={{ base: 1 }}
            showArrows={false}
            showDots
            ariaLabel="Демо-карусель: материалы"
          />
        </div>
        <div className="hidden lg:grid grid-cols-3 gap-4">
          {materialsDemo.map((item) => (
            <Placeholder key={item.id} label={item.label} />
          ))}
        </div>
      </section>
    </>
  );
}
```

Замечания:
- Якоря строго из SPEC §1: `#hero`, `#about`, `#work-areas`, `#cases`, `#services`, `#faq`, `#contact`. `#materials` добавлен как 8-й — это раздел Sprint 4, но в Sprint 1 удобно держать его тут как полигон для materials-карусели.
- Три демо-конфигурации (как и просит spec §G):
  1. mobile-Embla + desktop-grid с `loop: false` — рендерим в `#work-areas`, `#cases`, `#materials`.
  2. Embla везде, `lg=3 / base=1`, `loop: true` — рендерим в `#services`.
- Плашки — `<Card>` с подписью «Слайд N», достаточно чтобы визуально проверить snap, gap, dots/arrows, disabled state.
- Server component — `EmblaCarousel` сам `'use client'`, React это переваривает.

- [ ] **Step 2: Запустить dev-сервер**

Run:
```bash
npm run dev
```

Открыть http://localhost:3000 в DevTools на ширинах 320 / 640 / 1024 / 1280px и проверить вручную:
- Header показывает Logo + 4 пункта + CTA «Записаться» на 1024+, Logo + ≡ на меньших.
- Клик по ≡ открывает MobileMenu (slide-in справа), Esc / клик-вне / ✕ / клик на пункт — закрывают; body не скроллится при открытом меню.
- Клик на «Обо мне» → плавный скролл к `#about`, верхний край секции виден ниже sticky-хедера.
- Скролл вниз > 20px → хедер становится 56px с тонким `border-b`. Скролл вверх → обратно 80px.
- Карусели:
  - В `#work-areas` на <1024px — Embla (1 слайд в кадре, край следующего за счёт grid 3 нет, но gap 16px есть), dots, без стрелок. На ≥1024px — grid 3 колонки.
  - В `#services` — везде Embla; на 1024+ видны 3 плашки одновременно, на мобайле 1; стрелки видны от 768px; loop работает (после последнего слайда вернётся к первому).
  - В `#materials` — как `#work-areas`.
- Footer показывает 3 колонки на 1024+, стек на мобайле, нижняя строка с реквизитами.
- В Chrome DevTools → Emulate CSS media → `prefers-reduced-motion: reduce`: MobileMenu открывается без translate (только fade).

Остановить сервер (`Ctrl+C`).

- [ ] **Step 3: Typecheck + lint**

Run:
```bash
npx tsc --noEmit && npm run lint
```

Ожидаемо: чисто.

- [ ] **Step 4: Коммит**

```bash
git add "app/(public)/page.tsx"
git commit -m "feat(home): empty section anchors + 3 embla demo configs on placeholders"
```

---

### Task 22: Финальный QA gate

**Files:** нет (только проверки)

- [ ] **Step 1: Чистый production-билд**

Run:
```bash
rm -rf .next && npm run build
```

Ожидаемо:
- Билд завершается успешно.
- В выводе нет warnings (Next 16 печатает warnings прямо в выводе билда).
- Все маршруты под `/` (RSC + клиентские islands для Header/MobileMenu/Embla) корректно собираются.

Если warnings есть — устранить и закоммитить как `fix:`.

- [ ] **Step 2: Strict typecheck**

Run:
```bash
npx tsc --noEmit
```

Ожидаемо: чисто, exit 0.

- [ ] **Step 3: Lint**

Run:
```bash
npm run lint
```

Ожидаемо: чисто, exit 0.

- [ ] **Step 4: Lighthouse на production-сборке**

Run:
```bash
npm run build && npm run start
```

В другом терминале (или в Chrome) — открыть http://localhost:3000, в DevTools → Lighthouse → Mobile + Desktop, прогнать.

Целевые метрики (SPEC §П1):
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95

Если Performance просел из-за Framer Motion в Header — это ожидаемо для пустого каркаса; реальная цифра уточнится после Sprint 2 (Hero даст LCP). Если Accessibility просел — проверить контрасты, `aria-label` у иконок-кнопок (≡, ✕, стрелки каруселей).

Остановить prod-сервер (`Ctrl+C`).

- [ ] **Step 5: Ручной адаптив-чек**

В DevTools прогнать страницу на 320 / 640 / 768 / 1024 / 1280 / 1440px:
- Контейнер не упирается в края на >1200px (max-width 1200, центр).
- Touch-таргеты ≥ 44px (Header ≡-кнопка, dots каруселей, стрелки каруселей, Button md).
- Текст не вылезает за края, длинные подписи в Header сжимаются без скролла.
- Карусели свайпаются пальцем (использовать device emulation с touch).
- MobileMenu занимает 88% ширины (~282px на iPhone SE 320px).

- [ ] **Step 6: Проверить чистоту git**

Run:
```bash
git status
```

Ожидаемо: либо `nothing to commit, working tree clean`, либо только новые временные артефакты (`.next/`, `node_modules/`), которые игнорируются.

- [ ] **Step 7: Зафиксировать готовность Sprint 1**

Если все шаги выше прошли — создать пустой завершающий коммит как маркер окончания спринта:

```bash
git commit --allow-empty -m "chore: sprint 1 (foundation) complete — qa gate passed"
```

Это удобный якорь для `git log --grep="sprint 1"` в будущем.

---

## Definition of Done (зеркалит чек-лист из spec §H)

После задачи 22 в проекте:

**Конфиг:**
- `package.json` содержит ровно те зависимости, что в spec §B.
- `app/globals.css` — токены §T4 + типографика §T1 + контейнер + Embla-база.
- `app/layout.tsx` — Nunito + Cormorant Garamond, lang=ru, русская metadata.
- Удалены: `app/page.tsx` (старый), 5 дефолтных SVG в `public/`, дефолтный dark-mode CSS.

**UI:**
- `components/ui/{Logo,Button,Input,PhoneInput,Card,Accordion,Dialog}.tsx` — типизированы, без ошибок.
- Touch-таргеты ≥ 44px.

**Layout:**
- Sticky Header с hysteresis 20px и компактной версией.
- MobileMenu — Radix Dialog + Framer Motion slide-in справа, reduced-motion корректно отключает translate.
- Footer — 3 колонки + нижняя строка с реквизитами ИП.

**Carousel:**
- `EmblaCarousel` принимает `slidesPerView`, `showArrows`, `showDots`, `options`, `ariaLabel`.
- Dots: активная `bg-accent-500`, остальные `bg-primary-300`, кликабельны.
- Arrows: видны от `md`, disabled при `canScrollPrev/Next === false`.
- Swipe touch + drag mouse + клавиатура ← → работают.

**Главная (плейсхолдер):**
- `app/(public)/page.tsx` имеет `<section id>` для `#hero`, `#about`, `#work-areas`, `#cases`, `#services`, `#faq`, `#contact`, `#materials`.
- 3 демо-конфигурации Embla отрендерены.
- Якорная навигация плавная, с учётом sticky-хедера.

**Качество:**
- `npm run build` без warnings.
- `npx tsc --noEmit` чисто.
- `npm run lint` чисто.
- Lighthouse (prod): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95.

---

## Что НЕ входит и куда едет

| Артефакт | Куда |
|---|---|
| Hero-параллакс, About, WorkAreas, Cases, Services, FAQ контент | Sprint 2 |
| `LeadForm`, `ContactForm`, `ScreeningForm`, `ConsentCheckbox` | Sprint 3 |
| `@radix-ui/react-checkbox`, RHF, Zod | Sprint 3 (с формами) |
| Drizzle, `pg`, `lib/db/`, миграции, env | Sprint 3 (когда нужны API) |
| `lib/email/`, Unisender SDK, шаблоны | Sprint 3 |
| `app/api/lead/route.ts`, `app/api/screening/route.ts` | Sprint 3 |
| `/materials` + `[slug]` + VK embed + `next-mdx-remote` | Sprint 4 |
| `/privacy`, `/consent`, `/offer`, `/cookies`, `CookieBanner`, дисклеймеры | Sprint 5 |
| Яндекс.Метрика, opt-in загрузка | Sprint 5/6 |
| `lib/payments/` (интерфейс + Robokassa) | пост-MVP v1.5 |
| Любые автотесты | Не делаем в MVP (см. `feedback_no_tests_in_mvp` в памяти) |
