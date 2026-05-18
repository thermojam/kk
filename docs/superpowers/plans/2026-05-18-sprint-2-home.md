# Sprint 2 · Главная страница — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить каркас секций Sprint 1 в работающую главную: 7 секций с финальным контентом, hero-анимация по SPEC §1, наполненные карусели, корректный адаптив. После Sprint 2 главная содержательно готова — Sprint 3 подключит к Секции 7 (форма) реальную отправку и API.

**Architecture:** Server-секции импортируют типизированный контент из `content/home.ts` и рендерят его; интерактивные части (карусели, accordion, Hero) — изолированные client-«острова». Карточки в Секциях 3/4 рендерятся дважды (grid на lg+, Embla на base) — паттерн из Sprint 1; Услуги — единая Embla с `slidesPerView={ base:1, lg:3 }`. Hero — 4 эффекта (градиент, SVG-овалы, hover-scale, частицы) с гардом `useReducedMotion`.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind v4 · Framer Motion 12 · Embla Carousel React 8.6 · Radix UI (Accordion + Dialog + новый Checkbox) · lucide-react · sharp (dev-dep, one-off конвертация WebP).

**Источники:**
- Спек: `docs/superpowers/specs/2026-05-18-sprint-2-home-design.md`
- Мастер-документ: `/SPEC.md` v2.2 §1–§7 (контент), §T1 (адаптив), §T3 (карусели), §T4 (токены).

**Без автотестов** (по `feedback_no_tests_in_mvp`). Качество проверяется через `npx tsc --noEmit`, `npm run lint`, `npm run format:check`, `npm run build`, и ручную проверку в браузере. Lighthouse — Sprint 6.

---

## File Structure (после Sprint 2)

**Создаём:**
- `content/home.ts` — типы и данные секций.
- `components/ui/Badge.tsx` — UI-примитив для бейджей карточек.
- `components/ui/Checkbox.tsx` — UI-примитив поверх `@radix-ui/react-checkbox`.
- `components/icons/WorkAreaIcons.tsx` — обёртка lucide Waves/Compass/Mic.
- `components/sections/Hero.tsx` (client) + `HeroBackground.tsx` (client).
- `components/sections/About.tsx` (server).
- `components/sections/WorkAreas.tsx` (server) + `WorkAreasMobileCarousel.tsx` (client) + `WorkAreaCard.tsx` (server).
- `components/sections/Cases.tsx` (server) + `CasesMobileCarousel.tsx` (client) + `CaseCard.tsx` (server).
- `components/sections/Services.tsx` (server) + `ServicesCarousel.tsx` (client) + `ServiceCard.tsx` (server) + `ContactCtaBanner.tsx` (server).
- `components/sections/FAQ.tsx` (server) + `FAQAccordion.tsx` (client).
- `components/sections/ContactForm.tsx` (server, UI-каркас без логики).
- `public/images/hero.webp`, `public/images/about.webp`.
- `scripts/convert-hero-images.mjs` — one-off скрипт конвертации PNG→WebP (выполняется один раз, файл остаётся в репо для воспроизводимости).

**Модифицируем:**
- `app/(public)/page.tsx` — заменить demo-каркас на импорт секций из `content/home.ts`.
- `app/globals.css` — добавить keyframes для частиц Hero.
- `package.json` — новые зависимости (`@radix-ui/react-checkbox`, `sharp` в devDeps).

**Удаляем:**
- `public/image-2.png`, `public/image-4.png` — после успешной конвертации.

**Не трогаем:** Header, Footer, MobileMenu, Logo, Button, Input, PhoneInput, Card, Accordion (existing), Dialog, EmblaCarousel, CarouselDots, CarouselArrows, lib/cn, next.config.ts, tsconfig.json, eslint.config.mjs, .prettierrc.json.

---

### Task 1: Конвертация фото в WebP и переезд в `public/images/`

**Files:**
- Create: `scripts/convert-hero-images.mjs`
- Modify: `package.json` (добавить `sharp` в devDependencies, опционально npm script)
- Create: `public/images/hero.webp`, `public/images/about.webp`
- Delete: `public/image-2.png`, `public/image-4.png`

- [ ] **Step 1: Установить sharp как devDependency**

Run:
```bash
npm install -D sharp@^0.33
```
Expected: `sharp` появляется в `devDependencies` `package.json`, lock-файл обновлён, no errors.

- [ ] **Step 2: Написать one-off скрипт конвертации**

Create `scripts/convert-hero-images.mjs`:

```js
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'images');

await mkdir(outDir, { recursive: true });

const jobs = [
    { src: 'public/image-2.png', dest: 'public/images/hero.webp' },
    { src: 'public/image-4.png', dest: 'public/images/about.webp' },
];

for (const { src, dest } of jobs) {
    await sharp(path.join(root, src))
        .webp({ quality: 82, effort: 5 })
        .toFile(path.join(root, dest));
    console.log(`✓ ${src} → ${dest}`);
}
```

- [ ] **Step 3: Прогнать скрипт**

Run:
```bash
node scripts/convert-hero-images.mjs
```
Expected output:
```
✓ public/image-2.png → public/images/hero.webp
✓ public/image-4.png → public/images/about.webp
```

- [ ] **Step 4: Удалить исходные PNG**

Run:
```bash
rm public/image-2.png public/image-4.png
ls -lh public/images/
```
Expected: оба `.webp` файла существуют, каждый <500 KB (исходный PNG был 2-2.3 MB; quality=82 даёт сильное сжатие).

- [ ] **Step 5: Закоммитить**

```bash
git add scripts/convert-hero-images.mjs package.json package-lock.json public/
git commit -m "feat(images): convert hero/about portraits to WebP

- Add sharp as devDep, one-off script scripts/convert-hero-images.mjs
- Output: public/images/{hero,about}.webp (quality 82)
- Remove raw PNGs from public/ root"
```

---

### Task 2: Установить `@radix-ui/react-checkbox` + добавить UI-примитивы Badge и Checkbox

**Files:**
- Modify: `package.json` (новая зависимость)
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/Checkbox.tsx`

- [ ] **Step 1: Установить Radix Checkbox**

Run:
```bash
npm install @radix-ui/react-checkbox@^1.1
```
Expected: `@radix-ui/react-checkbox` в `dependencies`, no errors.

- [ ] **Step 2: Создать Badge примитив**

Create `components/ui/Badge.tsx`:

```tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'accent' | 'primary' | 'inverse';

type BadgeProps = {
    tone?: BadgeTone;
    className?: string;
    children: ReactNode;
};

const toneClasses: Record<BadgeTone, string> = {
    neutral: 'bg-neutral-50 text-neutral-700 border border-neutral-100',
    accent: 'bg-accent-500 text-neutral-900',
    primary: 'bg-primary-50 text-primary-500 border border-primary-300',
    inverse: 'bg-neutral-0 text-primary-500',
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

- [ ] **Step 3: Создать Checkbox примитив**

Create `components/ui/Checkbox.tsx`:

```tsx
'use client';

import * as RC from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CheckboxProps = {
    id: string;
    label: ReactNode;
    required?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    name?: string;
    className?: string;
};

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
    { id, label, required, checked, defaultChecked, onCheckedChange, name, className },
    ref
) {
    return (
        <div className={cn('flex items-start gap-3', className)}>
            <RC.Root
                ref={ref}
                id={id}
                name={name}
                required={required}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={(v) => onCheckedChange?.(v === true)}
                className={cn(
                    'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center',
                    'rounded-sm border bg-neutral-0 transition-colors',
                    'border-neutral-100 hover:border-primary-400',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                    'data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500'
                )}
            >
                <RC.Indicator>
                    <Check className="size-4 text-neutral-0" aria-hidden="true" />
                </RC.Indicator>
            </RC.Root>
            <label htmlFor={id} className="text-[14px] text-neutral-700 leading-snug">
                {label}
                {required && <span className="text-error ml-0.5">*</span>}
            </label>
        </div>
    );
});
```

- [ ] **Step 4: Verify типы и форматинг**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check
```
Expected: tsc — no output (success), lint — только pre-existing warning в Button.tsx, format:check — All matched files use Prettier code style.

- [ ] **Step 5: Закоммитить**

```bash
git add package.json package-lock.json components/ui/Badge.tsx components/ui/Checkbox.tsx
git commit -m "feat(ui): add Badge and Checkbox primitives

Badge supports neutral/accent/primary/inverse tones for service cards.
Checkbox wraps @radix-ui/react-checkbox with project-themed styling
and label slot — used by ContactForm in Task 10."
```

---

### Task 3: `content/home.ts` — типы и данные секций

**Files:**
- Create: `content/home.ts`

- [ ] **Step 1: Создать `content/home.ts` с типами и пятью массивами**

Create `content/home.ts`:

```ts
export type WorkAreaIconName = 'waves' | 'compass' | 'mic';

export type WorkArea = {
    id: string;
    icon: WorkAreaIconName;
    title: string;
    bullets: string[];
};

export type Case = {
    id: string;
    title: string;
    body: string;
};

export type Service = {
    id: string;
    badge: string;
    title: string;
    subtitle?: string;
    description: string;
    pricing: string[];
    cta: { label: string; href: string };
    featured?: boolean;
    disclaimer?: string;
};

export type FAQItem = {
    id: string;
    question: string;
    answer: string;
};

export type Qualification = {
    title: string;
    institution: string;
};

export const workAreas: WorkArea[] = [
    {
        id: 'body-emotions',
        icon: 'waves',
        title: 'Тело и эмоции',
        bullets: [
            'Вес, который стоит или растёт, несмотря на усилия',
            'Эмоциональное переедание, срывы, чувство вины после еды',
            'Усталость и опустошённость, которые не уходят после отпуска',
            'Состояния, при которых тело «не слушается», хотя всё делаешь правильно',
            'ПМС, циклы и состояния, которые сбивают с жизненного ритма',
        ],
    },
    {
        id: 'life-scenarios',
        icon: 'compass',
        title: 'Жизненные сценарии',
        bullets: [
            '«Я всё тащу сама» — усталость от роли сильной',
            'Саботаж на пути к целям: не получается ни начать, ни довести до конца',
            'В жизни всё вроде бы хорошо, но нет удовлетворения, удовольствия — ощущение, что живёшь не свою жизнь',
            'Непонимание, куда двигаться в профессии или в отношениях',
            'Повторяющиеся сценарии: «меня не выбирают», «я недостаточно хороша»',
        ],
    },
    {
        id: 'visibility',
        icon: 'mic',
        title: 'Проявленность и голос',
        bullets: [
            'Страх публичности, камеры, синдром самозванца',
            'Сложности в том, чтобы говорить о себе и своём деле',
            'Внутренние блоки, которые мешают быть видимой в своей работе',
        ],
    },
];

export const cases: Case[] = [
    {
        id: 'weight',
        title: 'Вес уходит в последнюю очередь',
        body: 'Клиентка, 35 лет. Пришла с весом и эмоциональными срывами. Работали полгода. Тело менялось постепенно — но главное случилось раньше: она перестала воевать с собой. За эти месяцы её жизнь развернулась — записала песни, отправилась в путешествие, узнала, что ждёт ребёнка.',
    },
    {
        id: 'stage-fear',
        title: 'От страха сцены — к своему голосу',
        body: 'Клиентка, 34 года. Пришла с запросом на омоложение. В процессе нашли настоящее — желание масштаба и проявленности, которое блокировал страх публичных выступлений. Через несколько сессий она впервые в жизни вышла на форум как спикер перед залом в 200 человек.',
    },
    {
        id: 'voice',
        title: 'Голос, который было страшно показать',
        body: 'Клиентка, 29 лет. Пришла с запросом на проявленность в Instagram: ступор, страх, редкие ролики. Работали точечно с тем, что внутри мешало проявиться. Через пару месяцев она начала снимать регулярно, в своём стиле — и её аудитория за это время выросла в десять раз. Главное случилось внутри: она перестала ждать «правильного момента».',
    },
];

export const services: Service[] = [
    {
        id: 'consult-food-body',
        badge: 'Разовая',
        title: 'Консультация',
        subtitle: '«Отношения с едой и телом»',
        description:
            'Разовая встреча для тех, у кого основной запрос — про вес, переедание, контакт со своим телом. Разбираем, что происходит, ищем психологические причины и намечаем первые шаги.',
        pricing: ['1,5 часа · 5 000 ₽'],
        cta: { label: 'Записаться', href: '#contact' },
    },
    {
        id: 'session',
        badge: 'Разовая',
        title: 'Психологическая сессия',
        description:
            'Исследование корня проблемы, работа с эмоциями и жизненными сценариями. Подходит для широкого спектра запросов — отношения, страхи, потеря себя, проявленность.',
        pricing: ['1,5 часа · 5 000 ₽', 'Пакет из 3 сессий — 12 000 ₽'],
        cta: { label: 'Записаться', href: '#contact' },
    },
    {
        id: 'path-to-self',
        badge: '★ Основная программа',
        title: 'Длительное сопровождение',
        subtitle: '«Путь к себе»',
        description:
            'Моя основная программа. Для женщин, готовых к системной работе. Темы: эмоциональное состояние, отношения с едой и телом, самооценка, границы, родовые сценарии, проявленность.',
        pricing: ['3 или 6 месяцев', 'Стоимость — после диагностической встречи'],
        cta: { label: 'Записаться на диагностику', href: '#contact' },
        featured: true,
    },
    {
        id: 'bereginya',
        badge: 'Телесная практика',
        title: 'Женская славянская гимнастика',
        subtitle: '«Сила Берегини»',
        description:
            'Авторская оздоровительная практика. Мягкие упражнения, которые возвращают контакт с телом, снимают физическое напряжение и помогают чувствовать себя в своём теле спокойно.',
        pricing: ['Видео-комплекс — 3 000 ₽', 'Комплекс с индивидуальным разбором — 8 000 ₽'],
        cta: { label: 'Записаться', href: '#contact' },
        disclaimer:
            '⚠ Это оздоровительная практика, не лечебная физкультура. При хронических состояниях, беременности, обострениях, онкологических и психиатрических диагнозах — нужна консультация врача. Перед первым занятием попрошу заполнить короткую анкету о здоровье.',
    },
    {
        id: 'free-consult',
        badge: 'Бесплатно',
        title: 'Бесплатная консультация',
        subtitle: '20 минут',
        description:
            'Знакомство, обсуждение запроса, помогу определить подходящий формат.',
        pricing: [],
        cta: { label: 'Записаться', href: '#contact' },
    },
];

export const faq: FAQItem[] = [
    {
        id: 'medical',
        question: 'Это медицинская услуга?',
        answer:
            'Нет. Я психолог, не врач. Не ставлю диагнозы и не назначаю лечение. Если в процессе работы увидим признаки состояния, которое требует врача — открыто скажу и помогу найти специалиста.',
    },
    {
        id: 'session-vs-program',
        question: 'В чём разница между разовой сессией и программой?',
        answer:
            'Разовая — для конкретной ситуации, когда нужен взгляд со стороны и план. Программа — для глубокого запроса, когда одной сессии будет мало. На бесплатной встрече вместе определим, что подходит.',
    },
    {
        id: 'format',
        question: 'Как проходят встречи?',
        answer: 'Онлайн, в Zoom. Нужен только тихий час и наушники или гарнитура.',
    },
    {
        id: 'fit',
        question: 'Что если я не пойму, подходит ли мне твой подход?',
        answer:
            'Для этого есть бесплатная встреча на 20 минут. Расскажешь, что происходит — отвечу честно, могу ли я быть полезной и как мы будем работать. Если не подойдём друг другу — порекомендую коллегу.',
    },
    {
        id: 'confidentiality',
        question: 'Конфиденциально ли это?',
        answer:
            'Да. Всё, что обсуждается на сессии, остаётся между нами. Единственные исключения — угроза жизни или требование суда.',
    },
    {
        id: 'limits',
        question: 'С какими запросами не работаешь?',
        answer:
            'С острыми психиатрическими состояниями (тяжёлая депрессия, ПТСР, расстройства пищевого поведения в острой фазе), с несовершеннолетними без согласия родителей. Если случай требует врача — направлю к нему. Я не заменяю психиатра и психотерапевта с медицинским образованием.',
    },
    {
        id: 'refund',
        question: 'Можно ли вернуть деньги?',
        answer:
            'Да, если предупредишь минимум за 24 часа до встречи. Позже — сессия считается состоявшейся. Для программ — пропорциональный возврат за непроведённые сессии. Полные условия — в оферте.',
    },
    {
        id: 'duration',
        question: 'Сколько длится программа на самом деле?',
        answer:
            'Минимум 3 месяца, чаще 4–6. Не потому что я хочу больше денег — а потому что глубокие изменения не случаются за 5 встреч. Если кто-то обещает обратное — это маркетинг, не работа.',
    },
];

export const qualifications: Qualification[] = [
    { title: 'Сертифицированный психолог', institution: 'Академия репарационной психологии и терапии iARPT' },
    { title: 'Психолог-консультант, «Психосоматика и телесная терапия»', institution: 'Институт «Хронос»' },
    { title: 'Магистр нутрициологии', institution: 'СПбПУ Петра Великого' },
    { title: 'Специалист по фитооздоровлению', institution: 'НАМН' },
    { title: 'Инструктор женской славянской гимнастики «Сила Берегини»', institution: '' },
];
```

- [ ] **Step 2: Verify типы**

Run:
```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 3: Закоммитить**

```bash
git add content/home.ts
git commit -m "feat(content): add typed section data for home (SPEC §1-§6)

content/home.ts exports workAreas[], cases[], services[], faq[],
qualifications[]. All texts are verbatim from SPEC.md §1-§6.
services[2] ('Путь к себе') has featured: true."
```

---

### Task 4: `components/icons/WorkAreaIcons.tsx`

**Files:**
- Create: `components/icons/WorkAreaIcons.tsx`

- [ ] **Step 1: Создать обёртку над lucide**

Create `components/icons/WorkAreaIcons.tsx`:

```tsx
import { Compass, Mic, Waves } from 'lucide-react';
import type { WorkAreaIconName } from '@/content/home';

type WorkAreaIconProps = {
    name: WorkAreaIconName;
    className?: string;
};

const icons = {
    waves: Waves,
    compass: Compass,
    mic: Mic,
} as const;

export function WorkAreaIcon({ name, className }: WorkAreaIconProps) {
    const Icon = icons[name];
    return (
        <Icon
            aria-hidden="true"
            strokeWidth={1.5}
            className={className ?? 'size-10 text-primary-500'}
        />
    );
}
```

- [ ] **Step 2: Verify типы**

Run:
```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 3: Закоммитить**

```bash
git add components/icons/WorkAreaIcons.tsx
git commit -m "feat(icons): WorkAreaIcon wrapper over lucide Waves/Compass/Mic

Maps content/home.ts icon names to lucide components with project
defaults (stroke 1.5, size-10, primary-500). Used in Section 3."
```

---

### Task 5: Секция About (server)

**Files:**
- Create: `components/sections/About.tsx`
- Modify: `app/(public)/page.tsx` (заменить placeholder секции `#about`)

- [ ] **Step 1: Создать About-секцию**

Create `components/sections/About.tsx`:

```tsx
import Image from 'next/image';
import type { Qualification } from '@/content/home';

type AboutProps = { qualifications: Qualification[] };

export function About({ qualifications }: AboutProps) {
    return (
        <section id="about" className="container-page py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
                <div className="order-1 lg:order-1">
                    <Image
                        src="/images/about.webp"
                        alt="Ксения Каменская"
                        width={1086}
                        height={1448}
                        sizes="(min-width: 1024px) 480px, 100vw"
                        className="w-full rounded-lg object-cover aspect-[3/4] max-w-[480px] mx-auto lg:mx-0"
                        priority={false}
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
                    <ul className="flex flex-col gap-3 text-body text-neutral-700">
                        {qualifications.map((q) => (
                            <li key={q.title} className="flex gap-3">
                                <span
                                    aria-hidden="true"
                                    className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-500"
                                />
                                <span>
                                    {q.title}
                                    {q.institution && (
                                        <>
                                            <br />
                                            <span className="text-neutral-500">
                                                {q.institution}
                                            </span>
                                        </>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
```

Замечание по SPEC §2 «Адаптив: фото слева, текст справа на десктопе»: используем `lg:grid-cols-2` без `lg:order-*` инверсии — фото в первом столбце левее. На мобайле фото сверху текста (order естественный).

- [ ] **Step 2: Подключить About в page.tsx**

Modify `app/(public)/page.tsx` — заменить placeholder-секцию `#about`. Найти блок:

```tsx
<section id="about" className="container-page py-16 lg:py-24">
    <SectionHeading>Обо мне</SectionHeading>
    <p className="text-body text-neutral-700">
        Здесь будет секция «Обо мне» — Sprint 2.
    </p>
</section>
```

Заменить на:

```tsx
<About qualifications={qualifications} />
```

В начале файла:
- Удалить `'use client';` (page.tsx становится server-компонентом по мере замены секций; пока он остаётся client из-за демо-каруселей — окончательно перейдёт на server в Task 12).
- Не удалять пока — это финальная задача.
- Добавить импорт `About` и `qualifications`:

```tsx
import { About } from '@/components/sections/About';
import { qualifications } from '@/content/home';
```

В Sprint 1 page.tsx начинается с `'use client';` — пока **оставляем** его, чтобы существующие демо-карусели продолжали работать. В Task 12 удалим `'use client'` целиком, когда все секции будут заменены.

- [ ] **Step 3: Verify gate**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check && npm run build
```
Expected: всё зелёное, билд success, route `/` rendered.

- [ ] **Step 4: Ручная проверка**

Run:
```bash
npm run dev
```

Открыть `http://localhost:3000`:
- Скролл к `#about`. Должна показаться секция «Обо мне» с реальным фото `/images/about.webp`, текстом, и списком 5 квалификаций с Accent-точками.
- На десктопе фото слева, текст справа.
- На мобайле (DevTools 375px) фото сверху центрировано, текст снизу.
- Все остальные секции — пока демо-плейсхолдеры (заменяются дальше по плану).

Остановить dev (`Ctrl+C`).

- [ ] **Step 5: Закоммитить**

```bash
git add components/sections/About.tsx app/(public)/page.tsx
git commit -m "feat(home): About section (server, next/image + qualifications)

Replaces #about placeholder with real content from SPEC §2:
about.webp portrait, 3-paragraph body, 5 qualifications with
accent-bullet markers. Desktop: photo left, text right.
Mobile: photo on top, text below."
```

---

### Task 6: Секция FAQ (server + client island)

**Files:**
- Create: `components/sections/FAQAccordion.tsx`
- Create: `components/sections/FAQ.tsx`
- Modify: `app/(public)/page.tsx` (заменить placeholder `#faq`)

- [ ] **Step 1: Создать FAQAccordion (client-обёртка над существующим Accordion)**

Create `components/sections/FAQAccordion.tsx`:

```tsx
'use client';

import { Accordion } from '@/components/ui/Accordion';
import type { FAQItem } from '@/content/home';

type FAQAccordionProps = { items: FAQItem[] };

export function FAQAccordion({ items }: FAQAccordionProps) {
    const accordionItems = items.map((item) => ({
        id: item.id,
        q: item.question,
        a: item.answer,
    }));

    return <Accordion items={accordionItems} defaultOpenId={items[0]?.id} />;
}
```

`Accordion` из Sprint 1 принимает `{ id, q, a }` — этот компонент адаптирует наш `FAQItem` тип.

- [ ] **Step 2: Создать FAQ-секцию**

Create `components/sections/FAQ.tsx`:

```tsx
import type { FAQItem } from '@/content/home';
import { FAQAccordion } from '@/components/sections/FAQAccordion';

type FAQProps = { items: FAQItem[] };

export function FAQ({ items }: FAQProps) {
    return (
        <section id="faq" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">Частые вопросы</h2>
            <div className="max-w-3xl">
                <FAQAccordion items={items} />
            </div>
        </section>
    );
}
```

- [ ] **Step 3: Подключить FAQ в page.tsx**

Modify `app/(public)/page.tsx`:
- Найти блок `<section id="faq" ...>` с плейсхолдером и заменить на `<FAQ items={faq} />`.
- В импорты добавить `import { FAQ } from '@/components/sections/FAQ';` и расширить импорт из `@/content/home` до `import { faq, qualifications } from '@/content/home';`.

- [ ] **Step 4: Verify gate**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check && npm run build
```
Expected: всё зелёное.

- [ ] **Step 5: Ручная проверка**

Run: `npm run dev`. Открыть `http://localhost:3000#faq`.
- Первый вопрос («Это медицинская услуга?») открыт по умолчанию.
- Клик на следующий — открывает его, закрывает первый (single mode).
- Анимация раскрытия плавная (keyframes accordion-down/up из globals.css).
- Кликабельные области ≥ 44px высотой (вся строка кликабельна).

Остановить dev.

- [ ] **Step 6: Закоммитить**

```bash
git add components/sections/FAQAccordion.tsx components/sections/FAQ.tsx app/(public)/page.tsx
git commit -m "feat(home): FAQ section with Radix Accordion

Server wrapper + client FAQAccordion island. 8 questions from
SPEC §6, first open by default. Reuses Accordion primitive from
Sprint 1."
```

---

### Task 7: Секция WorkAreas (server + mobile carousel)

**Files:**
- Create: `components/sections/WorkAreaCard.tsx`
- Create: `components/sections/WorkAreasMobileCarousel.tsx`
- Create: `components/sections/WorkAreas.tsx`
- Modify: `app/(public)/page.tsx` (заменить placeholder `#work-areas`)

- [ ] **Step 1: Создать WorkAreaCard**

Create `components/sections/WorkAreaCard.tsx`:

```tsx
import type { WorkArea } from '@/content/home';
import { WorkAreaIcon } from '@/components/icons/WorkAreaIcons';

type WorkAreaCardProps = { item: WorkArea };

export function WorkAreaCard({ item }: WorkAreaCardProps) {
    return (
        <article className="flex h-full flex-col gap-4 rounded-lg bg-neutral-0 border border-neutral-100 shadow-sm p-6">
            <WorkAreaIcon name={item.icon} />
            <h3 className="text-h3 text-neutral-900">{item.title}</h3>
            <ul className="flex flex-col gap-2 text-body text-neutral-700">
                {item.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-2 size-1 shrink-0 rounded-full bg-primary-400"
                        />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}
```

- [ ] **Step 2: Создать WorkAreasMobileCarousel**

Create `components/sections/WorkAreasMobileCarousel.tsx`:

```tsx
'use client';

import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { WorkAreaCard } from '@/components/sections/WorkAreaCard';
import type { WorkArea } from '@/content/home';

type WorkAreasMobileCarouselProps = { items: WorkArea[] };

export function WorkAreasMobileCarousel({ items }: WorkAreasMobileCarouselProps) {
    return (
        <EmblaCarousel
            items={items}
            renderItem={(item) => <WorkAreaCard item={item} />}
            options={{ loop: false }}
            slidesPerView={{ base: 1 }}
            showArrows={false}
            showDots
            ariaLabel="Сферы работы"
        />
    );
}
```

- [ ] **Step 3: Создать WorkAreas-секцию**

Create `components/sections/WorkAreas.tsx`:

```tsx
import type { WorkArea } from '@/content/home';
import { WorkAreaCard } from '@/components/sections/WorkAreaCard';
import { WorkAreasMobileCarousel } from '@/components/sections/WorkAreasMobileCarousel';

type WorkAreasProps = { items: WorkArea[] };

export function WorkAreas({ items }: WorkAreasProps) {
    return (
        <section id="work-areas" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">С чем я работаю</h2>

            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
                {items.map((item) => (
                    <WorkAreaCard key={item.id} item={item} />
                ))}
            </div>

            <div className="lg:hidden">
                <WorkAreasMobileCarousel items={items} />
            </div>
        </section>
    );
}
```

- [ ] **Step 4: Подключить WorkAreas в page.tsx**

Modify `app/(public)/page.tsx`:
- Найти блок `<section id="work-areas" ...>` (демо-карусель) и заменить на `<WorkAreas items={workAreas} />`.
- В импорты добавить `import { WorkAreas } from '@/components/sections/WorkAreas';` и расширить импорт из `@/content/home` до `import { faq, qualifications, workAreas } from '@/content/home';`.
- Из существующего page.tsx убрать переменную `workAreasDemo` (Sprint 1 демо) и её использование.

- [ ] **Step 5: Verify gate**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check && npm run build
```
Expected: всё зелёное.

- [ ] **Step 6: Ручная проверка**

Run: `npm run dev`. Открыть `http://localhost:3000#work-areas`.
- Десктоп: 3 карточки в ряд, иконки Waves/Compass/Mic в Primary, буллеты с Primary-точками.
- Мобайл (375px): одна карточка в кадре + край следующей, dots под каруселью, свайп работает.
- Стрелок нет (правильно по T3: WorkAreas — без стрелок).
- Кнопка Tab → фокус на карусель → ← → переключает слайды.

Остановить dev.

- [ ] **Step 7: Закоммитить**

```bash
git add components/sections/WorkAreaCard.tsx components/sections/WorkAreasMobileCarousel.tsx components/sections/WorkAreas.tsx app/(public)/page.tsx
git commit -m "feat(home): WorkAreas section (grid on lg+, Embla on mobile)

3 cards from SPEC §3 with lucide icons (Waves/Compass/Mic) in
Primary. Desktop: 3-col grid. Mobile: Embla carousel without
arrows, dots only, loop disabled (T3 spec)."
```

---

### Task 8: Секция Cases (server + mobile carousel)

**Files:**
- Create: `components/sections/CaseCard.tsx`
- Create: `components/sections/CasesMobileCarousel.tsx`
- Create: `components/sections/Cases.tsx`
- Modify: `app/(public)/page.tsx` (заменить placeholder `#cases`)

- [ ] **Step 1: Создать CaseCard**

Create `components/sections/CaseCard.tsx`:

```tsx
import type { Case } from '@/content/home';

type CaseCardProps = { item: Case };

export function CaseCard({ item }: CaseCardProps) {
    return (
        <article className="flex h-full flex-col gap-4 rounded-lg bg-primary-50 p-6">
            <h3 className="font-serif italic text-[24px] leading-[1.15] text-neutral-900">
                «{item.title}»
            </h3>
            <p className="text-body text-neutral-700 leading-relaxed">{item.body}</p>
        </article>
    );
}
```

- [ ] **Step 2: Создать CasesMobileCarousel**

Create `components/sections/CasesMobileCarousel.tsx`:

```tsx
'use client';

import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { CaseCard } from '@/components/sections/CaseCard';
import type { Case } from '@/content/home';

type CasesMobileCarouselProps = { items: Case[] };

export function CasesMobileCarousel({ items }: CasesMobileCarouselProps) {
    return (
        <EmblaCarousel
            items={items}
            renderItem={(item) => <CaseCard item={item} />}
            options={{ loop: false }}
            slidesPerView={{ base: 1 }}
            showArrows={false}
            showDots
            ariaLabel="Истории клиенток"
        />
    );
}
```

- [ ] **Step 3: Создать Cases-секцию**

Create `components/sections/Cases.tsx`:

```tsx
import type { Case } from '@/content/home';
import { CaseCard } from '@/components/sections/CaseCard';
import { CasesMobileCarousel } from '@/components/sections/CasesMobileCarousel';

type CasesProps = { items: Case[] };

export function Cases({ items }: CasesProps) {
    return (
        <section id="cases" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">Истории клиенток</h2>

            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
                {items.map((item) => (
                    <CaseCard key={item.id} item={item} />
                ))}
            </div>

            <div className="lg:hidden">
                <CasesMobileCarousel items={items} />
            </div>
        </section>
    );
}
```

- [ ] **Step 4: Подключить Cases в page.tsx**

Modify `app/(public)/page.tsx`:
- Найти блок `<section id="cases" ...>` и заменить на `<Cases items={cases} />`.
- Добавить импорт `import { Cases } from '@/components/sections/Cases';` и расширить импорт `cases` из `@/content/home`.
- Убрать переменную `casesDemo`.

- [ ] **Step 5: Verify gate**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check && npm run build
```
Expected: всё зелёное.

- [ ] **Step 6: Ручная проверка**

Run: `npm run dev`. Открыть `http://localhost:3000#cases`.
- Десктоп: 3 кейса в ряд на фоне Primary-50, заголовки Cormorant Italic в кавычках, тело Nunito.
- Мобайл: Embla, 1 кейс + край следующего, dots.

Остановить dev.

- [ ] **Step 7: Закоммитить**

```bash
git add components/sections/CaseCard.tsx components/sections/CasesMobileCarousel.tsx components/sections/Cases.tsx app/(public)/page.tsx
git commit -m "feat(home): Cases section (grid on lg+, Embla on mobile)

3 client stories from SPEC §4 in Primary-50 cards.
Italic Cormorant titles in quotes, Nunito body. Same
responsive pattern as WorkAreas."
```

---

### Task 9: Секция Services (ServiceCard + Embla везде + CTA-баннер)

**Files:**
- Create: `components/sections/ServiceCard.tsx`
- Create: `components/sections/ServicesCarousel.tsx`
- Create: `components/sections/ContactCtaBanner.tsx`
- Create: `components/sections/Services.tsx`
- Modify: `app/(public)/page.tsx` (заменить placeholder `#services`)

- [ ] **Step 1: Создать ServiceCard с переключением featured-стиля**

Create `components/sections/ServiceCard.tsx`:

```tsx
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Service } from '@/content/home';
import { cn } from '@/lib/cn';

type ServiceCardProps = { item: Service };

export function ServiceCard({ item }: ServiceCardProps) {
    const featured = item.featured === true;

    return (
        <article
            className={cn(
                'flex h-full flex-col gap-4 rounded-lg p-6',
                featured
                    ? 'bg-primary-500 text-neutral-0'
                    : 'bg-neutral-0 text-neutral-900 border border-neutral-100 shadow-sm'
            )}
        >
            <Badge tone={featured ? 'accent' : 'neutral'} className="self-start">
                {item.badge}
            </Badge>

            <div className="flex flex-col gap-1">
                <h3
                    className={cn(
                        'text-h3',
                        featured ? 'text-neutral-0' : 'text-neutral-900'
                    )}
                >
                    {item.title}
                </h3>
                {item.subtitle && (
                    <p
                        className={cn(
                            'font-serif italic text-[16px]',
                            featured ? 'text-neutral-0/90' : 'text-primary-500'
                        )}
                    >
                        {item.subtitle}
                    </p>
                )}
            </div>

            <p
                className={cn(
                    'text-body flex-1',
                    featured ? 'text-neutral-0/90' : 'text-neutral-700'
                )}
            >
                {item.description}
            </p>

            {item.pricing.length > 0 && (
                <ul
                    className={cn(
                        'flex flex-col gap-1 text-[14px]',
                        featured ? 'text-neutral-0/85' : 'text-neutral-500'
                    )}
                >
                    {item.pricing.map((line) => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
            )}

            <Button
                href={item.cta.href}
                variant="primary"
                className={
                    featured
                        ? '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50'
                        : ''
                }
            >
                {item.cta.label}
            </Button>

            {item.disclaimer && (
                <p className="border-t border-neutral-100 pt-4 text-[13px] text-neutral-500 leading-snug">
                    {item.disclaimer}
                </p>
            )}
        </article>
    );
}
```

Примечания:
- На featured-карточке (Primary-фон) CTA-кнопка инвертирована: фон белый, текст Primary.
- `disclaimer` используется только для «Сила Берегини» (не featured, поэтому видимый текст контрастирует на белом).

- [ ] **Step 2: Создать ServicesCarousel**

Create `components/sections/ServicesCarousel.tsx`:

```tsx
'use client';

import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { ServiceCard } from '@/components/sections/ServiceCard';
import type { Service } from '@/content/home';

type ServicesCarouselProps = { items: Service[] };

export function ServicesCarousel({ items }: ServicesCarouselProps) {
    return (
        <EmblaCarousel
            items={items}
            renderItem={(item) => <ServiceCard item={item} />}
            options={{ loop: true }}
            slidesPerView={{ base: 1, lg: 3 }}
            showArrows
            showDots
            ariaLabel="Услуги"
        />
    );
}
```

- [ ] **Step 3: Создать ContactCtaBanner**

Create `components/sections/ContactCtaBanner.tsx`:

```tsx
import { Button } from '@/components/ui/Button';

export function ContactCtaBanner() {
    return (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-lg bg-primary-50 px-6 py-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <p className="text-body text-neutral-700 max-w-md">
                Не знаешь, с чего начать? Начни с бесплатного звонка.
            </p>
            <Button href="#contact" variant="primary" size="md">
                Бесплатная консультация · 20 минут
            </Button>
        </div>
    );
}
```

- [ ] **Step 4: Создать Services-секцию**

Create `components/sections/Services.tsx`:

```tsx
import type { Service } from '@/content/home';
import { ServicesCarousel } from '@/components/sections/ServicesCarousel';
import { ContactCtaBanner } from '@/components/sections/ContactCtaBanner';

type ServicesProps = { items: Service[] };

export function Services({ items }: ServicesProps) {
    return (
        <section id="services" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">Услуги</h2>
            <ServicesCarousel items={items} />
            <ContactCtaBanner />
        </section>
    );
}
```

- [ ] **Step 5: Подключить Services в page.tsx**

Modify `app/(public)/page.tsx`:
- Найти блок `<section id="services" ...>` (демо-карусель) и заменить на `<Services items={services} />`.
- Добавить импорт `import { Services } from '@/components/sections/Services';` и `services` в импорте из `@/content/home`.
- Убрать переменную `servicesDemo`.

- [ ] **Step 6: Verify gate**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check && npm run build
```
Expected: всё зелёное.

- [ ] **Step 7: Ручная проверка**

Run: `npm run dev`. Открыть `http://localhost:3000#services`.
- Десктоп: 3 карточки в кадре, можно листать (loop включён). Карточка «Путь к себе» в центре или с краю — выделена Primary-500 с белым текстом, Accent-бейджем «★ Основная программа», белой кнопкой.
- Стрелки видны слева/справа dots, переключают слайды.
- Карточка «Сила Берегини» — внизу карточки серый дисклеймер про оздоровительную практику.
- Карточка «Бесплатная консультация» — без блока цен (`pricing.length === 0` пропущен).
- CTA-баннер под каруселью: Primary-50 фон, текст + кнопка.
- Мобайл: 1 карточка в кадре, стрелки скрыты (`hidden md:flex` в CarouselArrows из Sprint 1).

Остановить dev.

- [ ] **Step 8: Закоммитить**

```bash
git add components/sections/ServiceCard.tsx components/sections/ServicesCarousel.tsx components/sections/ContactCtaBanner.tsx components/sections/Services.tsx app/(public)/page.tsx
git commit -m "feat(home): Services section with featured card B emphasis

5 services from SPEC §5 in single Embla carousel (loop, 1 base /
3 lg). 'Путь к себе' uses featured: true → Primary-500 fill,
inverted button, accent badge. Сила Берегини renders SPEC §5
disclaimer. ContactCtaBanner below the carousel."
```

---

### Task 10: Секция ContactForm (UI-каркас без логики)

**Files:**
- Create: `components/sections/ContactForm.tsx`
- Modify: `app/(public)/page.tsx` (заменить placeholder `#contact`)

- [ ] **Step 1: Создать ContactForm**

Create `components/sections/ContactForm.tsx`:

```tsx
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';

const CONSENT_GENERAL_TEXT =
    'Я согласна на обработку моих персональных данных (имя, email, телефон) для связи со мной.';

const CONSENT_HEALTH_TEXT =
    'Я согласна на обработку специальных категорий персональных данных о состоянии здоровья, которые я могу указать в ходе дальнейшего общения.';

export function ContactForm() {
    return (
        <section id="contact" className="container-page py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:items-start">
                <div className="flex flex-col gap-4">
                    <h2 className="text-h2 text-neutral-900">
                        Запишись на бесплатную консультацию
                    </h2>
                    <p className="text-body text-neutral-700 max-w-md">
                        20 минут. Расскажешь, что происходит — отвечу честно, могу ли быть полезной
                        и как мы будем работать.
                    </p>
                </div>

                <form
                    aria-label="Форма заявки на консультацию"
                    className="flex flex-col gap-5 rounded-lg bg-neutral-50 p-6 lg:p-8"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <Input label="Имя" name="name" required autoComplete="name" />
                    <Input label="Email" name="email" type="email" required autoComplete="email" />
                    <PhoneInput label="Телефон (опционально)" name="phone" />

                    <Checkbox
                        id="consent-general"
                        name="consent_pdn_general"
                        required
                        label={
                            <>
                                {CONSENT_GENERAL_TEXT}{' '}
                                <span className="text-primary-500 underline">подробнее ▾</span>
                            </>
                        }
                    />
                    <Checkbox
                        id="consent-health"
                        name="consent_pdn_health"
                        required
                        label={
                            <>
                                {CONSENT_HEALTH_TEXT}{' '}
                                <span className="text-primary-500 underline">подробнее ▾</span>
                            </>
                        }
                    />

                    <Button type="submit" disabled className="self-start">
                        Записаться
                    </Button>
                    <p className="text-[13px] text-neutral-500">
                        Записываясь, ты принимаешь условия оферты.
                    </p>
                </form>
            </div>
        </section>
    );
}
```

Замечания:
- `<form onSubmit={(e) => e.preventDefault()}>` — заглушка, чтобы случайный Enter не делал GET по action. Sprint 3 заменит на RHF + Zod.
- Кнопка `disabled` — статичная, всегда disabled в Sprint 2. Sprint 3 заменит на динамическое `isValid`.
- «подробнее ▾» — плоский span без раскрытия (Sprint 5 юр.слой). Стилизован как ссылка для визуальной достоверности.

ContactForm — server-компонент (нет `'use client'`), но он импортирует `PhoneInput` и `Checkbox`, которые помечены `'use client'`. Это легитимный паттерн: server-компонент может рендерить client-компоненты — Next.js сам разместит границу.

- [ ] **Step 2: Подключить ContactForm в page.tsx**

Modify `app/(public)/page.tsx`:
- Найти блок `<section id="contact" ...>` (плейсхолдер «Здесь будет форма — Sprint 3») и заменить на `<ContactForm />`.
- Добавить импорт `import { ContactForm } from '@/components/sections/ContactForm';`.

- [ ] **Step 3: Verify gate**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check && npm run build
```
Expected: всё зелёное.

- [ ] **Step 4: Ручная проверка**

Run: `npm run dev`. Открыть `http://localhost:3000#contact`.
- Десктоп: заголовок слева, форма справа на фоне Neutral-50.
- Мобайл: заголовок сверху, форма снизу, оба full-width.
- Поля Имя (req) / Email (req) / Телефон (опц.) — рендерятся, маска телефона при печати работает.
- 2 чекбокса с длинным текстом + «подробнее ▾» (визуально как ссылка, но не кликается куда-либо).
- Кнопка «Записаться» — disabled (серая), не нажимается.
- Микротекст под кнопкой про оферту.

Остановить dev.

- [ ] **Step 5: Закоммитить**

```bash
git add components/sections/ContactForm.tsx app/(public)/page.tsx
git commit -m "feat(home): ContactForm UI shell (Sprint 2 scope)

Static markup of SPEC §7: name/email/phone + 2 required consent
checkboxes + disabled submit button + offer microcopy. No
RHF/Zod/onSubmit yet — that lands in Sprint 3 along with the
/api/lead endpoint and /thanks redirect."
```

---

### Task 11: Hero + HeroBackground (4 эффекта + reduced-motion)

**Files:**
- Create: `components/sections/HeroBackground.tsx`
- Create: `components/sections/Hero.tsx`
- Modify: `app/globals.css` (keyframes для частиц Accent)
- Modify: `app/(public)/page.tsx` (заменить placeholder `#hero`)

- [ ] **Step 1: Добавить keyframes частиц в globals.css**

Modify `app/globals.css` — добавить в конец файла:

```css
/* Hero · частицы Accent (SPEC §1) */
@keyframes hero-particle {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
}

.hero-particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: var(--color-accent-500);
    opacity: 0.7;
    animation-name: hero-particle;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
    .hero-particle {
        animation: none;
    }
}
```

- [ ] **Step 2: Создать HeroBackground (декоративный слой)**

Create `components/sections/HeroBackground.tsx`:

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
            <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1200 720"
                preserveAspectRatio="xMidYMid slice"
            >
                <motion.ellipse
                    cx="120"
                    cy="160"
                    rx="240"
                    ry="160"
                    fill="var(--color-primary-300)"
                    opacity="0.4"
                    animate={{ x: [-15, 15, -15], y: [-10, 10, -10] }}
                    transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
                />
                <motion.ellipse
                    cx="720"
                    cy="540"
                    rx="180"
                    ry="130"
                    fill="var(--color-primary-400)"
                    opacity="0.3"
                    animate={{ x: [20, -20, 20], y: [12, -12, 12] }}
                    transition={{ duration: 22, ease: 'easeInOut', repeat: Infinity }}
                />
                <motion.ellipse
                    cx="980"
                    cy="80"
                    rx="100"
                    ry="80"
                    fill="var(--color-primary-300)"
                    opacity="0.5"
                    animate={{ x: [-8, 8, -8], y: [-6, 6, -6] }}
                    transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
                />
            </svg>

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

- [ ] **Step 3: Создать Hero**

Create `components/sections/Hero.tsx`:

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
        transition: reduced ? undefined : { duration: 0.6, delay, ease: 'easeOut' as const },
    });

    return (
        <section
            id="hero"
            className="relative isolate overflow-hidden"
            style={{
                background:
                    'linear-gradient(135deg, var(--color-primary-50), var(--color-accent-50))',
            }}
        >
            <HeroBackground />

            <div className="container-page relative z-10 grid gap-10 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:py-24 lg:min-h-[720px]">
                <div className="flex flex-col gap-6 lg:order-1 lg:max-w-[560px]">
                    <motion.h1
                        {...fadeUp(0)}
                        className="font-display text-neutral-900"
                    >
                        Психология женского тела и проявленности.
                    </motion.h1>
                    <motion.p
                        {...fadeUp(0.1)}
                        className="text-body text-neutral-700 max-w-[480px]"
                    >
                        Помогаю женщинам перестать носить эмоции в теле, разобраться с
                        эмоциональным перееданием и вернуть себе ощущение «я живу свою жизнь».
                    </motion.p>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="flex flex-col items-start gap-3"
                    >
                        <Button href="#contact" variant="primary" size="lg">
                            Записаться на бесплатную консультацию · 20 минут
                        </Button>
                        <Button href="#services" variant="ghost" size="md">
                            Узнать о программе →
                        </Button>
                    </motion.div>
                </div>

                <div className="lg:order-2 flex items-center justify-center">
                    <motion.div
                        whileHover={reduced ? undefined : { scale: 1.02 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="relative size-[280px] sm:size-[320px] lg:size-[320px] overflow-hidden rounded-full bg-neutral-100"
                    >
                        <Image
                            src="/images/hero.webp"
                            alt="Ксения Каменская"
                            fill
                            sizes="(min-width: 1024px) 320px, 280px"
                            priority
                            className="object-cover"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
```

Замечания:
- `priority` на `<Image>` — LCP-картинка Hero, грузится первой.
- Кнопка-secondary `Узнать о программе` рендерится как `variant="ghost"` (текстовая ссылка с подчёркиванием на hover) — выглядит как textual secondary CTA из мокапа.
- `lg:min-h-[720px]` — SPEC §1 «высота 720px на десктопе».

- [ ] **Step 4: Подключить Hero в page.tsx**

Modify `app/(public)/page.tsx`:
- Найти блок `<section id="hero" ...>` (плейсхолдер) и заменить на `<Hero />`.
- Добавить импорт `import { Hero } from '@/components/sections/Hero';`.

- [ ] **Step 5: Verify gate**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check && npm run build
```
Expected: всё зелёное.

- [ ] **Step 6: Ручная проверка**

Run: `npm run dev`. Открыть `http://localhost:3000`.

**Десктоп (1280px):**
- Hero на высоту ~720px, градиент primary-50 → accent-50.
- Текст слева (display-заголовок Cormorant Italic, подзаголовок, два CTA), портрет справа в круге 320px.
- При первом рендере: текст с fade-up (stagger), портрет появляется без анимации.
- Hover на портрете → scale 1.02.
- За портретом видно медленное движение трёх Primary-овалов и 5 анимированных Accent-точек.
- Клик «Записаться на бесплатную консультацию · 20 минут» → плавный скролл к `#contact`.
- Клик «Узнать о программе →» → плавный скролл к `#services`.

**Мобайл (375px):**
- Hero высота auto, портрет сверху 280px круг, текст и кнопки снизу.
- Овалов и частиц нет (компонент `HeroBackground` возвращает `null` через `hidden lg:block` обёртку — даже SVG не монтируется в DOM на мобайле благодаря тому что HeroBackground всё равно рендерит контент только в `lg:block`-обёртке).
- Только fade-up при первом появлении.

**Reduced-motion (DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce):**
- Перезагрузить страницу.
- Овалов и точек нет (HeroBackground возвращает `null` через `useReducedMotion`).
- Fade-up отсутствует, элементы появляются сразу.
- Hover-scale не работает.

Остановить dev.

- [ ] **Step 7: Закоммитить**

```bash
git add app/globals.css components/sections/HeroBackground.tsx components/sections/Hero.tsx app/(public)/page.tsx
git commit -m "feat(home): Hero section with full animation set (SPEC §1)

- Gradient background primary-50 → accent-50
- HeroBackground: 3 animated Primary ellipses + 5 Accent particles
  (CSS keyframes, lg+ only, gated by useReducedMotion)
- Portrait in 320px circle with whileHover scale 1.02
- Stagger fade-up for headline / subhead / CTA on mount
- Mobile: only fade-up; reduced-motion: nothing animates"
```

---

### Task 12: Финальный смок — очистка `page.tsx` и интеграционный обзор

**Files:**
- Modify: `app/(public)/page.tsx`

- [ ] **Step 1: Заменить page.tsx на чистую финальную версию**

Replace contents of `app/(public)/page.tsx` целиком:

```tsx
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { WorkAreas } from '@/components/sections/WorkAreas';
import { Cases } from '@/components/sections/Cases';
import { Services } from '@/components/sections/Services';
import { FAQ } from '@/components/sections/FAQ';
import { ContactForm } from '@/components/sections/ContactForm';
import { cases, faq, qualifications, services, workAreas } from '@/content/home';

export default function HomePage() {
    return (
        <>
            <Hero />
            <About qualifications={qualifications} />
            <WorkAreas items={workAreas} />
            <Cases items={cases} />
            <Services items={services} />
            <FAQ items={faq} />
            <ContactForm />
        </>
    );
}
```

Что изменилось относительно состояния после Task 11:
- Удалена директива `'use client'` (она была нужна для Sprint 1 демо-каруселей, теперь все интерактивные части — внутри секций как client-острова).
- Удалены утилитарные `Placeholder`, `SectionHeading`, `placeholderSlides`, переменные `workAreasDemo`/`casesDemo`/`servicesDemo`/`materialsDemo`.
- Удалена демо-секция `#materials` — она вернётся в Sprint 4 со страницей `/materials`.
- Порядок секций: hero → about → work-areas → cases → services → faq → contact (SPEC §1-§7).

- [ ] **Step 2: Финальный verify gate**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run format:check && npm run build
```
Expected: всё зелёное. В выводе `next build` маршрут `/` всё ещё `○ (Static)` — главная остаётся статической, потому что HomePage — server-компонент без данных runtime.

- [ ] **Step 3: Финальная ручная проверка**

Run: `npm run dev`. Полный прогон сверху вниз:

**Desktop 1280px:**
1. `/` рендерится. Sticky-header сверху, Hero ниже.
2. Скролл вниз: hero → about → work-areas → cases → services → faq → contact. Никаких других секций (демо `/materials` удалена).
3. В шапке клики «Обо мне» / «Услуги» / «Контакт» скроллят к соответствующим якорям с offset под sticky-header (80px scroll-margin-top).
4. Карусель Услуг листается стрелками и dots, loop работает (5 карточек крутятся).
5. Карточка «Путь к себе» визуально выделена Primary-500 фоном.
6. FAQ открывается/закрывается, первый вопрос open by default.
7. В Hero видны движущиеся овалы и точки. Hover на портрете — scale.

**Mobile 375px (DevTools):**
1. Бургер-меню работает (Sprint 1), пункты скроллят на якоря.
2. Hero: портрет сверху 280px, без овалов и точек, только fade-up.
3. WorkAreas/Cases — Embla, 1 карточка в кадре + край следующей, dots, без стрелок.
4. Services — Embla, 1 карточка, со стрелками (стрелки скрыты на base, появляются ≥ md? Нет: `hidden md:flex` означает hidden < md и flex ≥ md → 375px < 768px значит стрелок нет, что соответствует SPEC §T3 «стрелки только на десктопе»).
5. ContactForm: поля по ширине, заголовок сверху.

**Reduced-motion (Emulate CSS):**
1. Перезагрузить. Hero — без анимаций.
2. FAQ — раскрывается мгновенно (Radix Accordion использует CSS keyframes; они уже учитывают reduced-motion через `@media` если нужно, но в текущем globals.css этого правила нет — это приемлемо, потому что accordion-анимация короткая и не критична).

Остановить dev.

- [ ] **Step 4: Финальный коммит**

```bash
git add app/(public)/page.tsx
git commit -m "feat(home): finalize page.tsx with all Sprint 2 sections

Replaces Sprint 1 demo scaffold:
- Imports 7 sections (Hero, About, WorkAreas, Cases, Services, FAQ, ContactForm)
  in SPEC §1-§7 order
- Drops 'use client' (page is now a server component)
- Removes demo Placeholder/SectionHeading helpers and demo arrays
- Removes /materials demo section (will return in Sprint 4)

Sprint 2 scope complete: home page is content-ready.
Sprint 3 will wire up the ContactForm to /api/lead + email."
```

---

## Sprint 2 Completion Checklist

После выполнения всех 12 задач:

- [ ] Все секции SPEC §1-§7 присутствуют на `/` в правильном порядке.
- [ ] `public/images/{hero,about}.webp` существуют; `public/image-*.png` удалены.
- [ ] `content/home.ts` экспортирует 5 типизированных массивов с дословным контентом из SPEC.
- [ ] `npx tsc --noEmit` — без ошибок.
- [ ] `npm run lint` — только pre-existing warning в `Button.tsx`.
- [ ] `npm run format:check` — All matched files use Prettier code style.
- [ ] `npm run build` — success, `/` рендерится как Static.
- [ ] Hero на десктопе показывает движущиеся овалы, частицы, hover-scale портрета.
- [ ] Hero на мобайле — без овалов/точек, только fade-up.
- [ ] `prefers-reduced-motion: reduce` отключает все Hero-анимации.
- [ ] Карточка В Услуг визуально выделена (Primary-500 + белый текст + Accent-бейдж).
- [ ] FAQ: первый вопрос открыт, single-mode (открытие одного закрывает другие).
- [ ] ContactForm: поля видны, кнопка disabled, чекбоксы кликаются, форма не отправляет данные.
- [ ] Якоря из меню (`#about`, `#services`, `#materials`, `#contact`) — но `#materials` пока ведёт никуда (страница появится в Sprint 4). В Sprint 2 это не блокер, главная — content-complete.