# Cleanup & Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** убрать мёртвый код и снизить вес LCP-картинки + JS-бандла без изменений UX.

**Architecture:** два последовательных трека (A — dead-code purge, B — performance) с апрув-чекпоинтом между ними. Внутри каждого — серия маленьких атомарных коммитов, каждый сам по себе ревёртабельный.

**Tech Stack:** Next.js 16 (App Router, `output: 'export'`) · TypeScript · Tailwind v4 · Radix Accordion · Embla · sharp (devDep, существующий) · framer-motion (удаляется).

**Спек:** `docs/superpowers/specs/2026-06-08-cleanup-perf-design.md`.

**Политика тестирования по проекту (memory):** автотестов нет, верификация = `next lint` + `tsc --noEmit` + `next build` + ручной browser smoke + Lighthouse. TDD не применяется.

---

## Track A · Dead-code purge

Пять атомарных коммитов. Production-бандл не меняется ни в одном из них.

---

### Task A1: Удалить папку `tests/`

**Files:**
- Delete: `tests/section-rounding.test.ts`
- Delete: `tests/centered-cta-sections.test.ts`
- Delete: `tests/telegram.test.ts`
- Delete: `tests/typescript-loader.mjs`

- [ ] **Step 1: Проверить, что никто не импортирует из `tests/`**

Run:
```bash
grep -rn "tests/" app components lib content scripts public 2>/dev/null
grep -rn '"test\|"tests"' package.json
```

Expected: пустой вывод (никаких ссылок на `tests/` из исходников; в `package.json` нет npm-скриптов `test`/`tests`).

- [ ] **Step 2: Удалить файлы**

Run:
```bash
git rm -r tests/
```

- [ ] **Step 3: Верификация lint/tsc/build**

Run:
```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: все три проходят без ошибок.

- [ ] **Step 4: Commit**

Run:
```bash
git commit -m "chore: drop tests/ folder (no automated tests in MVP)"
```

---

### Task A2: Удалить устаревшие документы и орфанный мокап

**Files:**
- Delete: `workareas-mockups.png` (root)
- Delete: `SPEC.md` (v2.2; источник истины — `SPEC_v3.md`)
- Delete: `sprint-4-spec.md` (промежуточный спек спринта 4, уже закрыт)

- [ ] **Step 1: Подтвердить, что нет ссылок**

Run:
```bash
grep -rn "workareas-mockups\|SPEC\.md\|sprint-4-spec" app components lib content scripts public 2>/dev/null
```

Expected: пустой вывод (внутренние ссылки на эти файлы из кода/контента отсутствуют). Ссылки в `docs/` или `README` — допустимо проигнорировать (можно поправить отдельным мелким редактированием по желанию).

- [ ] **Step 2: Удалить файлы**

Run:
```bash
git rm workareas-mockups.png SPEC.md sprint-4-spec.md
```

- [ ] **Step 3: Верификация**

Run:
```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: всё проходит.

- [ ] **Step 4: Commit**

Run:
```bash
git commit -m "chore: drop obsolete root-level docs and mockup asset"
```

---

### Task A3: Удалить неиспользуемый `Card.tsx` примитив

**Files:**
- Delete: `components/ui/Card.tsx`

- [ ] **Step 1: Подтвердить, что Card нигде не используется**

Run:
```bash
grep -rn "from '@/components/ui/Card'\|from \"@/components/ui/Card\"" app components lib content
```

Expected: пустой вывод.

- [ ] **Step 2: Удалить файл**

Run:
```bash
git rm components/ui/Card.tsx
```

- [ ] **Step 3: Верификация**

Run:
```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: всё проходит.

- [ ] **Step 4: Commit**

Run:
```bash
git commit -m "chore: drop unused Card UI primitive"
```

---

### Task A4: Очистить неиспользуемые tone'ы из `Badge`

**Files:**
- Modify: `components/ui/Badge.tsx`

- [ ] **Step 1: Подтвердить, что `primary` и `inverse` не вызываются**

Run:
```bash
grep -rn 'tone="primary"\|tone="inverse"\|tone={.*primary\|tone={.*inverse' app components lib
```

Expected: пустой вывод.

- [ ] **Step 2: Изменить `components/ui/Badge.tsx`**

Содержимое файла после правки:

```tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'accent';

type BadgeProps = {
    tone?: BadgeTone;
    className?: string;
    children: ReactNode;
};

const toneClasses: Record<BadgeTone, string> = {
    neutral: 'bg-neutral-50 text-neutral-700 border border-neutral-100',
    accent: 'bg-accent-500 text-neutral-900',
};

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-pill px-3 py-1',
                'text-[12px] font-bold leading-none',
                toneClasses[tone],
                className
            )}
        >
            {children}
        </span>
    );
}
```

- [ ] **Step 3: Верификация**

Run:
```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: всё проходит. `tsc` обязан был бы поругаться, если бы где-то остался `tone="primary"`.

- [ ] **Step 4: Commit**

Run:
```bash
git add components/ui/Badge.tsx
git commit -m "chore(badge): drop unused 'primary' and 'inverse' tones"
```

---

### Task A5: Очистить неиспользуемый `ghost` variant из `Button`

**Files:**
- Modify: `components/ui/Button.tsx`

- [ ] **Step 1: Подтвердить, что `ghost` не вызывается**

Run:
```bash
grep -rn 'variant="ghost"\|variant={.*ghost' app components lib
```

Expected: пустой вывод.

- [ ] **Step 2: Изменить `components/ui/Button.tsx`**

В типе `Variant` удалить `'ghost'`, в `variantClasses` удалить соответствующую запись. Результат — файл должен выглядеть как ниже (изменения только в двух местах, остальное идентично):

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'accent';
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
    primary: 'bg-primary-500 text-neutral-0 hover:bg-primary-600 focus-visible:ring-primary-300',
    secondary:
        'border border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-300',
    accent: 'bg-accent-500 text-neutral-900 hover:opacity-90 focus-visible:ring-accent-500',
};

const sizeClasses: Record<Size, string> = {
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-[52px] px-7 text-[16px]',
};

const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-sans font-bold ' +
    'transition-colors duration-150 outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...rest
}: ButtonProps) {
    const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

    if ('href' in rest && rest.href !== undefined) {
        return (
            <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
                {children}
            </a>
        );
    }

    return (
        <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
            {children}
        </button>
    );
}
```

- [ ] **Step 3: Верификация**

Run:
```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: всё проходит.

- [ ] **Step 4: Commit**

Run:
```bash
git add components/ui/Button.tsx
git commit -m "chore(button): drop unused 'ghost' variant"
```

---

## ⏸ Checkpoint после Track A

Перед стартом Track B пользователь подтверждает, что Track A апрувлен. Если есть правки — внести и продолжить.

---

## Track B · Performance

Девять задач. Начинается с фиксации Lighthouse-baseline, заканчивается замером после.

---

### Task B0: Зафиксировать Lighthouse baseline

**Files:** ничего не меняется. Результат — записать числа в комментарии следующего коммита.

- [ ] **Step 1: Собрать продакшен-билд**

Run:
```bash
npm run build
```

Expected: успешный билд, `out/` обновлён.

- [ ] **Step 2: Запустить статик-сервер**

Run в отдельном терминале:
```bash
npx serve out -l 3030
```

Expected: сервер слушает `http://localhost:3030`.

- [ ] **Step 3: Прогнать Lighthouse mobile в Chrome DevTools**

В Chrome:
1. Открыть `http://localhost:3030`.
2. DevTools → Lighthouse → Mode: Navigation → Device: Mobile → Categories: Performance.
3. Generate report.

- [ ] **Step 4: Записать числа**

Скопировать (только перенести в свою заметку — на этом шаге ничего в репозиторий не пишется):
- Performance score (0-100)
- LCP (s)
- TBT (ms)
- Total transfer (KB)

Эти числа понадобятся в Task B7 для сравнения.

- [ ] **Step 5: Остановить `npx serve` (Ctrl+C)**

---

### Task B1: Скрипт оптимизации изображений + регенерация ассетов

**Files:**
- Create: `scripts/optimize-images.mjs`
- Modify: `package.json` (добавить npm-скрипт `images`)
- Create: `public/images/generated/hero-{960,1440,1920}.{avif,webp}` (6 файлов)
- Create: `public/images/generated/about-{320,480,760}.{avif,webp}` (6 файлов)

- [ ] **Step 1: Создать `scripts/optimize-images.mjs`**

```js
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'public', 'images');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'generated');

const SOURCES = [
    { name: 'hero', file: 'hero.webp', widths: [960, 1440, 1920] },
    { name: 'about', file: 'about.webp', widths: [320, 480, 760] },
];

const FORMATS = [
    { ext: 'avif', encode: (p) => p.avif({ quality: 70, effort: 4 }) },
    { ext: 'webp', encode: (p) => p.webp({ quality: 80 }) },
];

async function isFresh(srcPath, outPath) {
    try {
        const [srcStat, outStat] = await Promise.all([fs.stat(srcPath), fs.stat(outPath)]);
        return outStat.mtimeMs >= srcStat.mtimeMs;
    } catch {
        return false;
    }
}

async function processOne({ name, file, widths }) {
    const srcPath = path.join(SRC_DIR, file);
    for (const width of widths) {
        for (const { ext, encode } of FORMATS) {
            const outName = `${name}-${width}.${ext}`;
            const outPath = path.join(OUT_DIR, outName);
            if (await isFresh(srcPath, outPath)) {
                console.log(`skip   ${outName}`);
                continue;
            }
            const buffer = await encode(sharp(srcPath).resize({ width })).toBuffer();
            await fs.writeFile(outPath, buffer);
            console.log(`wrote  ${outName} (${(buffer.length / 1024).toFixed(1)} KB)`);
        }
    }
}

async function main() {
    await fs.mkdir(OUT_DIR, { recursive: true });
    for (const source of SOURCES) {
        await processOne(source);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
```

- [ ] **Step 2: Добавить npm-скрипт `images` в `package.json`**

В блоке `"scripts"` дописать строку (вставить перед `"lint"`, сохранив запятые):

```json
"images": "node scripts/optimize-images.mjs",
```

Финальный блок `scripts` должен выглядеть так:

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "images": "node scripts/optimize-images.mjs",
    "lint": "eslint",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
},
```

- [ ] **Step 3: Прогнать скрипт**

Run:
```bash
npm run images
```

Expected: вывод вроде `wrote hero-960.avif (XX.X KB)` × 12 строк. Никаких ошибок.

- [ ] **Step 4: Проверить размеры**

Run:
```bash
ls -lh public/images/generated/
```

Expected: 12 файлов. Опорные веса:
- `hero-1920.avif` — порядка 150-220 КБ
- `hero-1440.avif` — порядка 90-140 КБ
- `hero-960.avif` — порядка 40-80 КБ
- `about-760.avif` — порядка 30-60 КБ

Если какой-то AVIF получился больше WebP того же размера — допустимо, на маленьких ширинах AVIF иногда тяжелее. Это ок.

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/optimize-images.mjs package.json public/images/generated/
git commit -m "feat(perf): sharp pipeline + generated avif/webp variants for hero & about"
```

---

### Task B2: Компонент `ResponsiveImage`

**Files:**
- Create: `components/ui/ResponsiveImage.tsx`

- [ ] **Step 1: Создать `components/ui/ResponsiveImage.tsx`**

```tsx
import { cn } from '@/lib/cn';

type ResponsiveImageName = 'hero' | 'about';

type ResponsiveImageProps = {
    /** Базовое имя источника (без размера и расширения). */
    name: ResponsiveImageName;
    alt: string;
    /** Доступные ширины из public/images/generated/. Должны существовать avif+webp файлы для каждой. */
    widths: number[];
    /** Ширина для fallback `<img src>` (обычно средняя). */
    fallbackWidth: number;
    /** Intrinsic width/height — для CLS. */
    width: number;
    height: number;
    sizes: string;
    /** true => loading="eager" + fetchpriority="high". По умолчанию lazy. */
    priority?: boolean;
    className?: string;
};

function srcSetFor(name: ResponsiveImageName, widths: number[], ext: 'avif' | 'webp') {
    return widths.map((w) => `/images/generated/${name}-${w}.${ext} ${w}w`).join(', ');
}

export function ResponsiveImage({
    name,
    alt,
    widths,
    fallbackWidth,
    width,
    height,
    sizes,
    priority = false,
    className,
}: ResponsiveImageProps) {
    return (
        <picture>
            <source type="image/avif" srcSet={srcSetFor(name, widths, 'avif')} sizes={sizes} />
            <source type="image/webp" srcSet={srcSetFor(name, widths, 'webp')} sizes={sizes} />
            <img
                src={`/images/generated/${name}-${fallbackWidth}.webp`}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className={cn(className)}
            />
        </picture>
    );
}
```

- [ ] **Step 2: Верификация**

Run:
```bash
npx tsc --noEmit
```

Expected: без ошибок.

- [ ] **Step 3: Commit**

Run:
```bash
git add components/ui/ResponsiveImage.tsx
git commit -m "feat(ui): ResponsiveImage with avif/webp picture srcset"
```

---

### Task B3: CSS keyframes для Hero reveal

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Добавить блок в `app/globals.css`**

Вставить перед существующим блоком `@media (prefers-reduced-motion: reduce)` (line ~231) следующее (в самом конце уже существующих `@keyframes`-определений, после `@keyframes hero-particle`):

```css
/* Hero · reveal (CSS-замена framer-motion fadeUp) */
@keyframes hero-fade-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero-reveal {
    animation: hero-fade-up 0.6s ease-out both;
}
```

Существующий блок `@media (prefers-reduced-motion: reduce)` уже глушит `animation-duration` до 0.01ms — никаких изменений в нём не требуется.

- [ ] **Step 2: Верификация**

Run:
```bash
npm run lint && npm run build
```

Expected: без ошибок (Tailwind не должен пожаловаться на нестандартный класс, поскольку `.hero-reveal` определён прямо в CSS, а не как Tailwind-утилита).

- [ ] **Step 3: Commit**

Run:
```bash
git add app/globals.css
git commit -m "feat(css): hero-fade-up keyframe + .hero-reveal utility"
```

---

### Task B4: Перевод `Hero` на Server Component (drop framer-motion + use ResponsiveImage)

**Files:**
- Modify: `components/sections/Hero.tsx`

- [ ] **Step 1: Полностью заменить `components/sections/Hero.tsx`**

```tsx
import Link from 'next/link';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { Logo } from '@/components/ui/Logo';
import { TG_GOALS } from '@/lib/telegram';
import { HeroBackground } from '@/components/sections/HeroBackground';
import { Button } from '@/components/ui/Button';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

const HERO_TG_TEXT =
    'Здравствуйте, Ксения! Пишу с сайта — хочу записаться на бесплатную консультацию.';

export function Hero() {
    return (
        <section
            id="hero"
            className="relative isolate min-h-[760px] overflow-hidden rounded-b-[42px] bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)] lg:min-h-screen lg:rounded-b-[72px]"
        >
            <HeroBackground />

            <div className="container-page relative z-20 pt-4 lg:pt-6">
                <Link href="/" aria-label="На главную" className="inline-flex">
                    <Logo size={58} tone="mono" className="text-white" />
                </Link>
            </div>

            <div className="container-page relative z-10 grid gap-10 pb-24 pt-14 lg:min-h-[calc(100vh-82px)] lg:grid-cols-[minmax(0,1.12fr)_minmax(420px,0.88fr)] lg:items-center lg:pb-0 lg:pt-4">
                <div className="flex flex-col items-start gap-6 lg:max-w-[720px] lg:pb-8">
                    <span className="hero-reveal font-sans text-[11px] font-bold uppercase tracking-[0.38em] text-accent-500 lg:text-[12px]">
                        Ксения Каменская
                    </span>

                    <h1
                        className="hero-reveal max-w-[12ch] font-display text-white lg:max-w-none lg:text-[76px] xl:text-[88px]"
                        style={{ lineHeight: 1.03, animationDelay: '0.05s' }}
                    >
                        <span className="block">Психология</span>
                        <span className="block">женского</span>
                        <span className="block">
                            тела <span className="text-accent-500">и</span>
                        </span>
                        <span className="block text-accent-500">проявленности.</span>
                    </h1>

                    <p
                        className="hero-reveal text-body max-w-[560px] text-white/[0.78] lg:text-[17px] lg:leading-[1.55]"
                        style={{ animationDelay: '0.15s' }}
                    >
                        Помогаю женщинам перестать носить эмоции в&nbsp;теле, разобраться
                        с&nbsp;эмоциональным перееданием и&nbsp;вернуть себе ощущение «я&nbsp;живу
                        свою жизнь».
                    </p>

                    <div
                        className="hero-reveal flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                        style={{ animationDelay: '0.25s' }}
                    >
                        <TelegramButton
                            goal={TG_GOALS.hero}
                            text={HERO_TG_TEXT}
                            variant="accent"
                            size="lg"
                            className="w-full px-8 sm:w-auto"
                        >
                            Написать в Телеграм
                        </TelegramButton>
                        <Button
                            href="#services"
                            variant="secondary"
                            size="lg"
                            className="w-full border-white/50 text-white hover:bg-white/10 sm:w-auto"
                        >
                            Смотреть услуги
                        </Button>
                    </div>

                    <p
                        className="hero-reveal -mt-2 font-sans text-[13px] text-white/50"
                        style={{ animationDelay: '0.3s' }}
                    >
                        Первый шаг — бесплатная консультация 20 минут
                    </p>
                </div>

                <div
                    className="hero-reveal hidden h-full min-h-[650px] self-end transition-transform duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.035] lg:flex lg:items-end lg:justify-end"
                    style={{ animationDelay: '0.2s' }}
                >
                    <ResponsiveImage
                        name="hero"
                        alt="Ксения Каменская"
                        widths={[960, 1440, 1920]}
                        fallbackWidth={1440}
                        width={1086}
                        height={1448}
                        priority
                        sizes="(min-width: 1280px) 950px, 58vw"
                        className="block h-auto max-h-[calc(100vh+100px)] w-[125%] max-w-none shrink-0 object-contain object-bottom xl:w-[138%]"
                    />
                </div>
            </div>
        </section>
    );
}
```

Ключевые отличия от исходника:
- Нет `'use client'` (Hero снова Server Component).
- Нет импортов `motion`, `useReducedMotion`, `Image` from `next/image`.
- Нет функции `fadeUp`.
- Все ранее-`motion.*` элементы стали обычными `<span>/<h1>/<p>/<div>` с классом `hero-reveal` и опциональным `animationDelay`.
- Hover-скейл картинки реализован через Tailwind утилиты (`transition-transform`, `duration-[550ms]`, `hover:scale-[1.035]`, кастомный `cubic-bezier` через произвольное значение).
- `Image` → `ResponsiveImage` с `priority`.

- [ ] **Step 2: Верификация tsc + build**

Run:
```bash
npx tsc --noEmit && npm run build
```

Expected: всё проходит. `framer-motion` всё ещё в node_modules, но не используется — это нормально, выкинем в Task B6.

- [ ] **Step 3: Smoke в браузере**

Run:
```bash
npx serve out -l 3030
```

В Chrome открыть `http://localhost:3030`:
- [ ] Десктоп: при первой загрузке eyebrow → h1 → p → buttons → helper p появляются с задержкой fade-in (волна). Картинка тоже fade-in.
- [ ] Десктоп: hover на изображении → плавный scale до ~1.035.
- [ ] Mobile (через DevTools device emulation): картинка скрыта (`hidden lg:flex` сохранён). Текстовые элементы анимируются.
- [ ] Network tab → фильтр `hero-` показывает запрос к `hero-{XXX}.avif` (Chrome предпочитает AVIF). Transfer size hero на десктопе ≤ 200 КБ.

Если что-то сломалось → откатить файл (`git checkout components/sections/Hero.tsx`), починить, перебилдить.

Остановить `npx serve` (Ctrl+C).

- [ ] **Step 4: Commit**

Run:
```bash
git add components/sections/Hero.tsx
git commit -m "feat(hero): drop framer-motion, server component + responsive image"
```

---

### Task B5: Перевод `About` на `ResponsiveImage`

**Files:**
- Modify: `components/sections/About.tsx`

- [ ] **Step 1: Изменить `components/sections/About.tsx`**

Заменить импорт `Image` на `ResponsiveImage` и сам `<Image>`-блок. Файл целиком:

```tsx
import { Check } from 'lucide-react';
import type { Qualification } from '@/content/home';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

type AboutProps = { qualifications: Qualification[] };

export function About({ qualifications }: AboutProps) {
    return (
        <section id="about" className="container-page py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16 lg:items-center">
                <div className="order-1 lg:order-1">
                    <ResponsiveImage
                        name="about"
                        alt="Ксения Каменская"
                        widths={[320, 480, 760]}
                        fallbackWidth={480}
                        width={1086}
                        height={1448}
                        sizes="(min-width: 1024px) 380px, 320px"
                        className="w-full rounded-lg object-cover aspect-[3/4] max-w-[320px] mx-auto lg:max-w-none lg:mx-0"
                    />
                </div>
                <div className="order-2 lg:order-2 flex flex-col gap-8">
                    <h2 className="text-h2 text-neutral-900">Обо мне</h2>
                    <div className="flex flex-col gap-4 text-body text-neutral-700">
                        <p>
                            Лишний вес. ПМС, который выбивал из жизни. Эмоциональное переедание и
                            срывы. Я знаю этот путь изнутри — не из учебника.
                        </p>
                        <p>
                            Через психосоматику, нутрициологию и славянские практики я вернула себе
                            энергию, гармонию и тело, в котором мне хорошо.
                        </p>
                        <p>
                            Прошла путь от страха камеры и публичных выступлений — к норме «быть
                            видимой и яркой». Занялась тем, что действительно мне по душе. Теперь
                            помогаю другим женщинам пройти этот путь. В работе соединяю
                            восстановление контакта с телом и свободу быть проявленной.
                        </p>
                    </div>
                    <div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-primary-500">
                            Квалификации
                        </p>
                        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-10">
                            {qualifications.map((q) => (
                                <li key={q.title} className="flex gap-3">
                                    <Check
                                        aria-hidden="true"
                                        className="mt-0.5 size-5 shrink-0 text-accent-500"
                                        strokeWidth={2.5}
                                    />
                                    <div>
                                        <p className="text-neutral-900">{q.title}</p>
                                        {q.institution && (
                                            <p className="mt-0.5 text-[13px] text-neutral-500">
                                                {q.institution}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
```

Замечание: ранее About использовал `loading="eager"`. После рефактора используется default `lazy` (поскольку About не выше fold'а ни на мобилке, ни на десктопе — за Hero, который min-h ≥ 760px на mobile и min-h-screen на desktop). Это намеренное улучшение, не регрессия.

- [ ] **Step 2: Верификация tsc + build**

Run:
```bash
npx tsc --noEmit && npm run build
```

Expected: всё проходит.

- [ ] **Step 3: Smoke в браузере**

Run:
```bash
npx serve out -l 3030
```

В Chrome открыть `http://localhost:3030`, проскроллить до секции «Обо мне»:
- [ ] Картинка отображается, ширина соответствует прежней (на десктопе 380px колонка, на мобиле центрирована до 320px).
- [ ] Network: запрос к `about-{480|760}.avif`, transfer ≤ 60 КБ.

Остановить `npx serve`.

- [ ] **Step 4: Commit**

Run:
```bash
git add components/sections/About.tsx
git commit -m "feat(about): switch to ResponsiveImage (avif/webp)"
```

---

### Task B6: Удалить `framer-motion`

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Проверить, что `framer-motion` нигде не импортируется**

Run:
```bash
grep -rn "framer-motion" app components lib content scripts 2>/dev/null
```

Expected: **пустой вывод**. Если что-то найдено — открыть файл, понять, что забыли почистить, исправить, и только потом продолжать.

- [ ] **Step 2: Удалить зависимость**

Run:
```bash
npm uninstall framer-motion
```

Expected: `framer-motion` исчезает из `package.json` `"dependencies"` и из `package-lock.json`.

- [ ] **Step 3: Верификация**

Run:
```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: всё проходит.

- [ ] **Step 4: Подтвердить, что бандл легче**

Run:
```bash
ls -lh out/_next/static/chunks/ | sort -k5 -h
```

Expected: общий объём chunk'ов уменьшился по сравнению с baseline'ом из Task B0 (точное число зависит от tree-shaking, но один из больших chunk'ов должен исчезнуть либо уменьшиться).

- [ ] **Step 5: Commit**

Run:
```bash
git add package.json package-lock.json
git commit -m "chore(deps): drop framer-motion (replaced by CSS in Hero)"
```

---

### Task B7: Lighthouse после + сравнение

**Files:** ничего не меняется.

- [ ] **Step 1: Билд + сервер**

Run:
```bash
npm run build
npx serve out -l 3030
```

- [ ] **Step 2: Прогнать Lighthouse mobile в Chrome DevTools** (как в B0)

- [ ] **Step 3: Сравнить с baseline из B0**

Зафиксировать:
- Δ Performance score
- Δ LCP
- Δ TBT
- Δ Total transfer

Целевая планка из SPEC: Perf ≥ 90 (mobile, throttled).

- [ ] **Step 4: Если Perf < 90**

Возможные причины:
- AVIF файлы получились крупнее ожидаемого → понизить quality в `optimize-images.mjs` (например, 60), перегенерить, повторить.
- Шрифты Google Fonts — `display: 'swap'` уже стоит; больше там сжать сложно.
- HeroBackground с тремя blur-радиальными слоями — может бить по paint. На MVP можно оставить.

В spec'е не оговорен план Б для перф-регрессии — поднять с пользователем и обсудить точечно.

- [ ] **Step 5: Если Perf ≥ 90**

Done. Зафиксировать числа в произвольной заметке (или в комментарии к финальному коммиту Track B, если хочется).

Остановить `npx serve`.

---

## ⏸ Final Checkpoint

После Task B7 — финальный смотр от пользователя. На этом план закрыт.

---

## File Structure Summary

**Удалённые файлы:**
```
tests/section-rounding.test.ts
tests/centered-cta-sections.test.ts
tests/telegram.test.ts
tests/typescript-loader.mjs
workareas-mockups.png
SPEC.md
sprint-4-spec.md
components/ui/Card.tsx
```

**Созданные файлы:**
```
scripts/optimize-images.mjs
components/ui/ResponsiveImage.tsx
public/images/generated/hero-{960,1440,1920}.{avif,webp}     # 6 файлов
public/images/generated/about-{320,480,760}.{avif,webp}      # 6 файлов
```

**Модифицированные файлы:**
```
package.json                            # + "images" script, − framer-motion
package-lock.json                       # − framer-motion и транзитивы
components/ui/Badge.tsx                 # − tone 'primary', 'inverse'
components/ui/Button.tsx                # − variant 'ghost'
app/globals.css                         # + @keyframes hero-fade-up + .hero-reveal
components/sections/Hero.tsx            # server component, CSS reveal, ResponsiveImage
components/sections/About.tsx           # ResponsiveImage
```

## Definition of Done (общий)

- [ ] `npm run lint` — clean
- [ ] `npx tsc --noEmit` — clean
- [ ] `npm run build` — успех
- [ ] `grep -rn 'framer-motion' app components lib package.json` — пусто
- [ ] `git ls-files | grep -E 'tests/|workareas-mockups\.png|^SPEC\.md$|^sprint-4-spec\.md$|components/ui/Card\.tsx'` — пусто
- [ ] `public/images/generated/` содержит 12 файлов
- [ ] Hero визуально не отличается от прежнего поведения (fade-in волной + hover-scale картинки)
- [ ] About картинка отображается корректно
- [ ] Lighthouse mobile Performance ≥ 90 (либо ≥ baseline, если baseline уже был ниже 90 — это поднимаем отдельно)
- [ ] Hero LCP image transfer ≤ 200 КБ на десктопе