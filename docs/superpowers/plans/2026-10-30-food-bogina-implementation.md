# Food Bogina: реализация страницы `/food-bogina/` — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать страницу предзаписи `/food-bogina/` (Вариант A из спеки) и точечно починить три существующих файла, которые сейчас знают только про `/course/`.

**Architecture:** Копия паттерна `course/*`: отдельный типизированный контент (`content/food-bogina.ts`), шесть компонентов-секций в `components/food-bogina/*`, страница в `app/(public)/food-bogina/`. Общий `CourseHeroBackground.tsx` переезжает в `components/ui/DarkHeroBackground.tsx` (нейтральное имя, используется двумя тёмными hero). Никакой общей «движковой» абстракции программных страниц не строится — решение подтверждено в спеке.

**Tech Stack:** Next.js 16 App Router, React 19, TS strict, Tailwind 4, `@radix-ui/react-accordion`, `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-10-30-food-bogina-design.md`. В проекте нет автотестов (осознанно, см. `CLAUDE.md`) — проверка каждого шага: `npx tsc --noEmit` и `npm run lint`, финальная проверка — `npm run build` и ручной просмотр в браузере.

---

## Task 1: Три новые цели Метрики

**Files:**
- Modify: `lib/telegram.ts`

- [ ] **Шаг 1: добавить три ключа в `TG_GOALS`**

В `lib/telegram.ts` после строки `courseHeader: 'course_header_click',` и перед `notFound: 'tg_click_not_found',` вставить:

```ts
    foodBoginaCard: 'tg_click_food_bogina_card',
    foodBoginaHero: 'tg_click_food_bogina_hero',
    foodBoginaFormat: 'tg_click_food_bogina_format',
```

Итоговый объект должен выглядеть так:

```ts
export const TG_GOALS = {
    hero: 'tg_click_hero',
    offer: 'tg_click_offer',
    serviceFood: 'tg_click_service_food',
    serviceSession: 'tg_click_service_session',
    serviceProgram: 'tg_click_service_program',
    serviceGym: 'tg_click_service_gym',
    serviceCombo: 'tg_click_service_combo',
    serviceFree: 'tg_click_service_free',
    servicesBanner: 'tg_click_services_banner',
    serviceCourse: 'tg_click_service_course',
    courseHero: 'tg_click_course_hero',
    coursePricing: 'tg_click_course_pricing',
    courseHeader: 'course_header_click',
    foodBoginaCard: 'tg_click_food_bogina_card',
    foodBoginaHero: 'tg_click_food_bogina_hero',
    foodBoginaFormat: 'tg_click_food_bogina_format',
    notFound: 'tg_click_not_found',
} as const;
```

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add lib/telegram.ts
git commit -m "feat(food-bogina): добавить цели Метрики для карточки, hero и блока формата"
```

---

## Task 2: Контент главной — поле `href` у `Service` и новая карточка

**Files:**
- Modify: `content/home.ts`

- [ ] **Шаг 1: добавить `href?: string` в тип `Service`**

```ts
export type Service = {
    id: string;
    badge: string;
    title: string;
    subtitle?: string;
    description: string;
    /** Список тарифов (0..N). Пустой массив — блок цен не рендерится (free consult). */
    prices: ServicePrice[];
    /** Дополнительная строка курсивом под тарифами. Например, «стоимость — после диагностической встречи». */
    pricingNote?: string;
    cta: { label: string; tgGoal: TgGoal; tgText: string };
    /** Услуга со своей страницей — вся карточка ведёт туда (см. ServiceCard). */
    href?: string;
    featured?: boolean;
    disclaimer?: string;
};
```

- [ ] **Шаг 2: прописать `href: '/course'` у существующей карточки курса**

Сейчас переход на `/course` для карточки курса собирался хардкодом в `ServiceCard.tsx` (`item.id === 'course' ? '/course' : undefined`). Этот хардкод убирается в Task 3, поэтому ссылку нужно перенести в контент — иначе карточка курса потеряет переход. В объекте `id: 'course'` (вторая запись в `services`) добавить поле `href`:

```ts
    {
        // Курс стоит вторым намеренно: на десктопе слайдер показывает три
        // карточки, и вторая оказывается по центру — там же, куда падает взгляд.
        id: 'course',
        badge: '✨ Новая программа',
        title: 'Три ступени к телу',
        subtitle: 'Групповая программа',
        description:
            'Три ступени: психокоррекция, питание и образ жизни, славянская гимнастика. Четыре недели, одна глубокая сессия в неделю. Запись — в Телеграм.',
        prices: [{ value: '7 000 ₽' }],
        href: '/course',
        cta: {
            label: 'Записаться',
            tgGoal: TG_GOALS.serviceCourse,
            tgText: 'Здравствуйте! Хочу записаться на программу «Три ступени к телу». Как оплатить?',
        },
        featured: true,
    },
```

- [ ] **Шаг 3: добавить карточку `food-bogina` сразу после карточки курса**

```ts
    {
        id: 'food-bogina',
        badge: '✨ Новая программа',
        title: 'Food-Богиня',
        subtitle: 'Курс по питанию · предзапись',
        description:
            'Три месяца, один день на готовку в неделю. Новая программа готовится — оставь заявку, напишем первой.',
        prices: [],
        href: '/food-bogina',
        cta: {
            label: 'Узнать первой',
            tgGoal: TG_GOALS.foodBoginaCard,
            tgText: 'Здравствуйте! Хочу записаться в лист предзаписи на курс «Food-Богиня».',
        },
    },
```

- [ ] **Шаг 4: проверить**

Run: `npx tsc --noEmit`
Expected: без ошибок. (Если упадёт на `ServiceCard.tsx` с `item.id === 'course'` — это ожидаемо исправится в Task 3, но порядок задач именно такой: сначала контент, `ServiceCard.tsx` ещё не трогали, так что сейчас ошибок быть не должно, старый хардкод продолжает работать на прежнем месте.)

- [ ] **Шаг 5: commit**

```bash
git add content/home.ts
git commit -m "feat(food-bogina): добавить поле href к Service и карточку Food-Богиня на главной"
```

---

## Task 3: `ServiceCard` — переход по `href` из контента, а не по хардкоду `id`

**Files:**
- Modify: `components/sections/ServiceCard.tsx:12-15`

- [ ] **Шаг 1: заменить хардкод на поле из контента**

Было:
```ts
    const showDisclaimerBeforePrices = item.id === 'bereginya' && Boolean(item.disclaimer);
    // Курс — единственная услуга с отдельной страницей: вся карточка ведёт
    // туда, а кнопка «Записаться» остаётся поверх ссылки как быстрый диплинк в Телеграм.
    const href = item.id === 'course' ? '/course' : undefined;
```

Стало:
```ts
    const showDisclaimerBeforePrices = item.id === 'bereginya' && Boolean(item.disclaimer);
    // Услуги со своей страницей задают href в контенте (см. content/home.ts) —
    // вся карточка ведёт туда, а кнопка «Записаться» остаётся поверх ссылки как
    // быстрый диплинк в Телеграм.
    const href = item.href;
```

Остальной файл не трогать.

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add components/sections/ServiceCard.tsx
git commit -m "fix(food-bogina): ServiceCard берёт ссылку на страницу услуги из content, не из хардкода id"
```

---

## Task 4: `Header` — тёмный первый экран и скрытая кнопка «Записаться» для всех программных страниц

**Files:**
- Modify: `components/layout/Header.tsx:20-26,43`

- [ ] **Шаг 1: обобщить проверку с одной страницы на список программных страниц**

Было:
```ts
export function Header() {
    const pathname = usePathname();
    const onCourse = pathname === '/course/';
    // Над тёмным градиентом логотип белый. Везде ещё фон белый, и на нём
    // белый логотип не виден.
    const darkFirstScreen = pathname === '/' || onCourse;
```

Стало:
```ts
export function Header() {
    const pathname = usePathname();
    const PROGRAM_PATHS = ['/course/', '/food-bogina/'];
    const onProgramPage = PROGRAM_PATHS.includes(pathname);
    // Над тёмным градиентом логотип белый. Везде ещё фон белый, и на нём
    // белый логотип не виден.
    const darkFirstScreen = pathname === '/' || onProgramPage;
```

И ниже, в JSX (было `{!onCourse && (`, строка 43):
```tsx
                {/* На самом курсе/программной странице кнопка не нужна: страница
                    целиком про неё, а CTA всё равно есть ниже по этой же странице. */}
                {!onProgramPage && (
                    <Button
                        href="/course/"
                        variant="accent"
                        size="md"
                        onClick={() => reachGoal(TG_GOALS.courseHeader)}
                    >
                        Записаться
                    </Button>
                )}
```

Комментарий над JSDoc-блоком файла (строки 11-19) не трогать — он уже обобщённо говорит «страницы с тёмным первым экраном».

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add components/layout/Header.tsx
git commit -m "fix(food-bogina): Header распознаёт /food-bogina/ как программную страницу"
```

---

## Task 5: Переезд `CourseHeroBackground` → `components/ui/DarkHeroBackground`

**Files:**
- Create: `components/ui/DarkHeroBackground.tsx`
- Delete: `components/course/CourseHeroBackground.tsx`
- Modify: `components/course/CourseHero.tsx:2,16`

- [ ] **Шаг 1: создать новый файл с тем же содержимым, переименовав компонент**

`components/ui/DarkHeroBackground.tsx`:
```tsx
export function DarkHeroBackground() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-[12%] -bottom-[30%] h-[70%] w-[55%] rounded-full bg-primary-500/20 blur-[120px]" />
            <div className="absolute -left-[8%] top-0 h-[45%] w-[38%] rounded-full bg-accent-300/15 blur-[130px]" />
        </div>
    );
}
```

- [ ] **Шаг 2: удалить старый файл**

```bash
git rm components/course/CourseHeroBackground.tsx
```

- [ ] **Шаг 3: обновить импорт и использование в `CourseHero.tsx`**

Было (строка 2):
```ts
import { CourseHeroBackground } from '@/components/course/CourseHeroBackground';
```
Стало:
```ts
import { DarkHeroBackground } from '@/components/ui/DarkHeroBackground';
```

Было (строка 16):
```tsx
            <CourseHeroBackground />
```
Стало:
```tsx
            <DarkHeroBackground />
```

- [ ] **Шаг 4: проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок. Дополнительно открыть `npm run dev` → `/course/` и убедиться, что декоративные блобы на фоне hero всё ещё на месте (переезд файла не должен ничего визуально менять).

- [ ] **Шаг 5: commit**

```bash
git add -A components/ui/DarkHeroBackground.tsx components/course/CourseHeroBackground.tsx components/course/CourseHero.tsx
git commit -m "refactor(food-bogina): переместить CourseHeroBackground в components/ui/DarkHeroBackground"
```

---

## Task 6: Контент курса — `content/food-bogina.ts`

**Files:**
- Create: `content/food-bogina.ts`

- [ ] **Шаг 1: создать файл целиком**

```ts
import type { Qualification } from '@/content/home';
import { TG_GOALS } from '@/lib/telegram';

export type FoodBoginaReason = {
    id: string;
    title: string;
    icon: 'clock' | 'leaf' | 'sparkles' | 'wheat-off' | 'heart';
};

export type FoodBoginaStep = { n: number; body: string };

export const foodBogina = {
    title: 'Food-Богиня',

    hero: {
        subtitle: 'курс нутрициолога и шеф-повара с 15-летним опытом — Ксении Каменской',
        lead: 'Новый уровень здоровья, энергии и красоты через разнообразный рацион. На готовку уходит один день в неделю.',
        leadAccent: 'Подача как в ресторане. Вкус как дома.',
        facts: ['3 месяца', '1 день на готовку в неделю', 'эфир раз в неделю'],
        note: 'Оставь заявку в Телеграм — напишем первой, когда откроется запись.',
    },

    reasons: [
        {
            id: 'fast',
            title:
                'Готовить быстро: минимум времени на готовку и уборку кухни, но вкусно, полезно и разнообразно',
            icon: 'clock',
        },
        {
            id: 'veggies',
            title: 'Есть больше овощей и зелени — без усилий и уговоров себя',
            icon: 'leaf',
        },
        {
            id: 'body',
            title: 'Стройное тело и энергию через полноценное питание, а не ограничения',
            icon: 'sparkles',
        },
        {
            id: 'sugar',
            title: 'Меньше сахара и белой муки — без запретов и чувства вины',
            icon: 'wheat-off',
        },
        {
            id: 'family',
            title: 'Позаботиться о близких — даже когда домашние просят пельмени и бутерброды с колбасой',
            icon: 'heart',
        },
    ] satisfies FoodBoginaReason[],

    theory: {
        title: 'Что изменится в понимании себя',
        steps: [
            { n: 1, body: 'Улучшишь самочувствие и внешность, исправив ошибки в рационе' },
            { n: 2, body: 'Уберёшь тягу к сладкому, не отказывая себе в гастрономических удовольствиях' },
            { n: 3, body: 'Поддержишь иммунитет в межсезонье' },
            { n: 4, body: 'Разберёшься, нужен ли тебе детокс и как его проводить' },
            { n: 5, body: 'Разберёшься в БАД — что нужно именно тебе, а не что советует реклама' },
        ] satisfies FoodBoginaStep[],
    },

    practice: {
        title: 'Что сможешь уже через месяц',
        steps: [
            { n: 1, body: 'Соберёшь сбалансированное меню из быстрых заготовок с учётом всей семьи' },
            { n: 2, body: 'Будешь собирать блюда за несколько минут — с подачей как в ресторане' },
            { n: 3, body: 'Сделаешь заготовки на неделю за один день и минимум хлопот на кухне' },
            { n: 4, body: 'Автоматизируешь закупку продуктов — 1 час в неделю' },
            { n: 5, body: 'Будешь готовить «как шеф» — от повседневных блюд до хитов мировой кухни' },
        ] satisfies FoodBoginaStep[],
    },

    duration: {
        paragraphs: [
            'Этого времени достаточно, чтобы шаг за шагом встроить знания и навыки в практику, не забирая время и силы из других сфер жизни.',
        ],
        accent: 'Выстроить систему с удовольствием и комфортом — и сделать её своим образом жизни.',
    },

    format: [
        'Практикум в прямом эфире с Ксенией — раз в неделю',
        'Видео-уроки 7–25 минут в день: теория питания и практика Food-Богини',
        'Телеграм-канал с занятиями и чат поддержки — вопрос ведущей или куратору в любой момент',
        'Домашние задания с обратной связью, подарки за прогресс',
        'Конспект со всеми материалами месяца — можно скачать',
    ],

    author: {
        qualifications: [
            {
                title: 'Технолог продукции общественного питания, бывший шеф-повар',
                institution: '15 лет на пищевых производствах',
            },
            {
                title: 'Нутрициолог в индустрии питания',
                institution: 'Высшая школа биотехнологий и биомедицинских систем СПбПУ',
            },
            {
                title: 'Натуропат с научным подходом, специалист по фитооздоровлению',
                institution: 'более 5 лет практики',
            },
            {
                title: 'Создала систему, которая не требует тратить на кухне часы',
                institution: '',
            },
            {
                title: 'Обучила более 250 человек принципам функционального питания',
                institution: '',
            },
        ] satisfies Qualification[],
    },

    closingAccent: 'Полезное питание — вкусное и быстрое.',
    closing:
        'Делюсь системой заготовок для быстрой готовки: один день — и рацион на всю неделю готов, блюда собираются за считанные минуты. Изучать нутрициологию и кулинарию годами не придётся — это уже сделано за тебя.',

    cta: {
        label: 'Хочу на курс',
        tgGoalHero: TG_GOALS.foodBoginaHero,
        tgGoalFormat: TG_GOALS.foodBoginaFormat,
        tgText: 'Здравствуйте! Хочу записаться в лист предзаписи на курс «Food-Богиня».',
    },
};
```

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit`
Expected: без ошибок (файл пока ничем не импортируется, значит единственная проверка — что сам файл типизирован корректно).

- [ ] **Шаг 3: commit**

```bash
git add content/food-bogina.ts
git commit -m "feat(food-bogina): добавить контент курса content/food-bogina.ts"
```

---

## Task 7: `FoodBoginaHero` — тёмный hero, портрет слева прижат к низу

**Files:**
- Create: `components/food-bogina/FoodBoginaHero.tsx`

- [ ] **Шаг 1: создать компонент**

```tsx
import { TelegramButton } from '@/components/ui/TelegramButton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DarkHeroBackground } from '@/components/ui/DarkHeroBackground';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { foodBogina } from '@/content/food-bogina';

/**
 * Тёмный первый экран, но с раскладкой наоборот относительно CourseHero:
 * портрет слева и прижат к нижнему краю секции (приём Hero.tsx с главной —
 * self-end/items-end на колонке, object-bottom на картинке), текст справа.
 */
export function FoodBoginaHero() {
    return (
        <section className="relative isolate -mt-[72px] overflow-hidden rounded-b-[clamp(42px,7vw,72px)] bg-dark-gradient pt-[72px]">
            <DarkHeroBackground />
            <div className="container-page relative z-10 grid items-center gap-10 pt-14 lg:grid-cols-[minmax(320px,0.62fr)_minmax(0,1fr)] lg:gap-8 lg:pt-16">
                {/* Портрет только с десктопа — на мобильном он украл бы весь экран у оффера. */}
                <div className="hidden h-full min-h-[520px] self-end lg:flex lg:items-end lg:justify-start">
                    <ResponsiveImage
                        name="food-bogina"
                        alt="Ксения Каменская"
                        widths={[360, 500]}
                        fallbackWidth={500}
                        width={2131}
                        height={3682}
                        sizes="420px"
                        className="h-auto max-h-[calc(100vh-72px)] w-full max-w-[420px] object-contain object-bottom"
                    />
                </div>

                <div className="flex flex-col items-start gap-8 pb-20 lg:gap-9 lg:pb-28">
                    <Badge tone="accent">✨ Новая программа</Badge>

                    <div className="flex flex-col items-start gap-5">
                        <h1 className="font-display text-white">{foodBogina.title}</h1>
                        <p className="max-w-[460px] font-sans text-[15px] text-white/80">
                            {foodBogina.hero.subtitle}
                        </p>
                        <p className="my-6 max-w-[560px] font-serif text-[24px] italic leading-[1.15] text-white/90 lg:my-8 lg:text-[30px]">
                            <span className="block">{foodBogina.hero.lead}</span>
                            <span className="mt-1 block text-accent-500">{foodBogina.hero.leadAccent}</span>
                        </p>
                    </div>

                    <ul className="flex max-w-[560px] flex-wrap items-center gap-x-3 gap-y-1 font-serif text-[20px] font-medium italic leading-none text-accent-500 lg:text-[24px]">
                        {foodBogina.hero.facts.map((fact, i) => (
                            <li key={fact} className="flex items-center gap-3">
                                {i > 0 && (
                                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/40" />
                                )}
                                {fact}
                            </li>
                        ))}
                    </ul>

                    <div className="flex w-full flex-col items-start gap-4 sm:w-auto">
                        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
                            <TelegramButton
                                goal={foodBogina.cta.tgGoalHero}
                                text={foodBogina.cta.tgText}
                                variant="accent"
                                size="lg"
                                className="w-full px-8 sm:w-auto"
                            >
                                {foodBogina.cta.label}
                            </TelegramButton>
                            <Button
                                href="#format"
                                variant="secondary"
                                size="lg"
                                className="w-full border-white/50 text-white hover:bg-white/10 sm:w-auto"
                            >
                                Узнать формат
                            </Button>
                        </div>
                        <p className="font-sans text-[13px] text-white/70">{foodBogina.hero.note}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add components/food-bogina/FoodBoginaHero.tsx
git commit -m "feat(food-bogina): добавить FoodBoginaHero"
```

---

## Task 8: `FoodBoginaAudience` — 5 карточек причин

**Files:**
- Create: `components/food-bogina/FoodBoginaAudience.tsx`

- [ ] **Шаг 1: создать компонент**

Карточка не выносится в отдельный файл (слишком маленькая, в отличие от `WorkAreaCard`), иконки — напрямую из `lucide-react`, без отдельного файла-реестра (их всего 5 и они одноразовые для этой страницы).

```tsx
import { Clock, Leaf, Sparkles, WheatOff, Heart } from 'lucide-react';
import type { ComponentType } from 'react';
import { foodBogina, type FoodBoginaReason } from '@/content/food-bogina';

const ICONS: Record<FoodBoginaReason['icon'], ComponentType<{ className?: string }>> = {
    clock: Clock,
    leaf: Leaf,
    sparkles: Sparkles,
    'wheat-off': WheatOff,
    heart: Heart,
};

export function FoodBoginaAudience() {
    return (
        <section id="audience" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 mb-8 text-neutral-900">Этот курс для тебя, если хочешь</h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {foodBogina.reasons.map((reason) => {
                    const Icon = ICONS[reason.icon];
                    return (
                        <article
                            key={reason.id}
                            className="flex h-full flex-col gap-5 rounded-3xl border border-neutral-100 bg-neutral-0 p-6 shadow-[0_18px_50px_-28px_rgba(30,30,46,0.18)]"
                        >
                            <div
                                aria-hidden="true"
                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50/70"
                            >
                                <Icon className="size-8 text-primary-300" />
                            </div>
                            <p className="text-body text-neutral-700">{reason.title}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
```

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add components/food-bogina/FoodBoginaAudience.tsx
git commit -m "feat(food-bogina): добавить FoodBoginaAudience"
```

---

## Task 9: `FoodBoginaProgram` — аккордеон теория/практика

**Files:**
- Create: `components/food-bogina/FoodBoginaProgram.tsx`

- [ ] **Шаг 1: создать компонент**

Клон `CourseProgram`, но с двумя пунктами вместо трёх и без заголовка у каждого шага (в `FoodBoginaStep` нет поля `title`, только `n`/`body` — в отличие от `CourseSession`).

```tsx
'use client';

import * as RA from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { foodBogina, type FoodBoginaStep } from '@/content/food-bogina';

const CONTENT_ANIMATION_CLASS =
    'grid overflow-hidden contain-content data-[state=open]:animate-[accordion-down_200ms_ease] data-[state=closed]:animate-[accordion-up_200ms_ease]';

function StepList({ steps }: { steps: FoodBoginaStep[] }) {
    return (
        <ol className="min-h-0 pb-24">
            {steps.map((step) => (
                <li
                    key={step.n}
                    className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-3 sm:py-7"
                >
                    <span className="font-serif text-[36px] italic leading-none text-accent-500 lg:text-[44px]">
                        {String(step.n).padStart(2, '0')}
                    </span>
                    <p className="text-[16px] leading-[1.55] text-white/65">{step.body}</p>
                </li>
            ))}
        </ol>
    );
}

export function FoodBoginaProgram() {
    return (
        <section
            id="program"
            className="overflow-hidden rounded-[clamp(42px,7vw,72px)] bg-dark-gradient text-neutral-0"
        >
            <div className="container-page py-16 lg:py-24">
                <RA.Root type="single" collapsible defaultValue="theory">
                    <RA.Item value="theory">
                        <StepTrigger eyebrow="Теоретическая часть" title={foodBogina.theory.title} />
                        <RA.Content className={CONTENT_ANIMATION_CLASS}>
                            <StepList steps={foodBogina.theory.steps} />
                        </RA.Content>
                    </RA.Item>

                    <RA.Item value="practice">
                        <StepTrigger eyebrow="Практическая часть" title={foodBogina.practice.title} />
                        <RA.Content className={CONTENT_ANIMATION_CLASS}>
                            <StepList steps={foodBogina.practice.steps} />
                        </RA.Content>
                    </RA.Item>
                </RA.Root>
            </div>
        </section>
    );
}

function StepTrigger({ eyebrow, title }: { eyebrow: string; title: ReactNode }) {
    return (
        <RA.Header asChild>
            <div>
                <RA.Trigger className="group flex w-full items-center justify-between gap-6 rounded-sm border-b border-accent-500 pb-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-500 mb-8 lg:mb-10">
                    <div>
                        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-500">
                            {eyebrow}
                        </p>
                        <h2 className="text-h2 text-neutral-0">{title}</h2>
                    </div>
                    <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent-500 transition-colors duration-200 group-data-[state=open]:bg-accent-500/15"
                    >
                        <ChevronDown className="size-4 text-accent-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </span>
                </RA.Trigger>
            </div>
        </RA.Header>
    );
}
```

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add components/food-bogina/FoodBoginaProgram.tsx
git commit -m "feat(food-bogina): добавить FoodBoginaProgram"
```

---

## Task 10: `FoodBoginaIntro` — «Курс идёт 3 месяца»

**Files:**
- Create: `components/food-bogina/FoodBoginaIntro.tsx`

- [ ] **Шаг 1: создать компонент**

```tsx
import { foodBogina } from '@/content/food-bogina';

export function FoodBoginaIntro() {
    return (
        <section id="intro" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 mb-6 text-neutral-900">Курс идёт 3 месяца</h2>

            <div className="flex max-w-2xl flex-col gap-4 text-body text-neutral-700">
                {foodBogina.duration.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                ))}

                <p className="font-serif text-[22px] italic leading-tight text-primary-700">
                    {foodBogina.duration.accent}
                </p>
            </div>
        </section>
    );
}
```

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add components/food-bogina/FoodBoginaIntro.tsx
git commit -m "feat(food-bogina): добавить FoodBoginaIntro"
```

---

## Task 11: `FoodBoginaFormat` — формат + CTA вместо цены

**Files:**
- Create: `components/food-bogina/FoodBoginaFormat.tsx`

- [ ] **Шаг 1: создать компонент**

Клон `CoursePricing`, но справа вместо цены — длительность «3 месяца» (цены и даты старта ещё нет, это предзапись).

```tsx
import { TelegramButton } from '@/components/ui/TelegramButton';
import { foodBogina } from '@/content/food-bogina';

export function FoodBoginaFormat() {
    return (
        <section id="format" className="container-page py-16 lg:py-24">
            <div className="mx-auto grid max-w-[1030px] gap-10 rounded-[28px] bg-dark-gradient p-8 text-neutral-0 sm:p-12 lg:grid-cols-[minmax(0,1fr)_336px] lg:items-center lg:gap-16 lg:p-16">
                <div>
                    <h2 className="mb-6 text-h2 text-neutral-0">Формат, в каждом месяце</h2>
                    <ul className="flex flex-col">
                        {foodBogina.format.map((item) => (
                            <li
                                key={item}
                                className="flex gap-3 border-b border-white/15 py-3 text-[16px] leading-[1.45] text-white/75 first:pt-0 last:pb-0"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-5 rounded-[20px] bg-white/10 p-7 text-center">
                    <p className="font-serif text-[40px] italic font-medium leading-none text-accent-300">
                        3 месяца
                    </p>
                    <TelegramButton
                        goal={foodBogina.cta.tgGoalFormat}
                        text={foodBogina.cta.tgText}
                        variant="primary"
                        size="lg"
                        className="w-full !bg-neutral-0 !text-primary-700 hover:!bg-neutral-50"
                    >
                        {foodBogina.cta.label}
                    </TelegramButton>
                    <p className="text-[13px] leading-[1.5] text-white/60">{foodBogina.hero.note}</p>
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add components/food-bogina/FoodBoginaFormat.tsx
git commit -m "feat(food-bogina): добавить FoodBoginaFormat"
```

---

## Task 12: `FoodBoginaAuthor` — фото без выреза + регалии + закрывающий акцент

**Files:**
- Create: `components/food-bogina/FoodBoginaAuthor.tsx`

- [ ] **Шаг 1: создать компонент**

Клон `About.tsx` с главной (фото слева, прямоугольник, без удаления фона). Закрывающая цитата (`closingAccent`/`closing`) кладётся в хвост этой секции — по аналогии с тем, как курс кладёт её в хвост `CourseAudience`.

```tsx
import { Check } from 'lucide-react';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { foodBogina } from '@/content/food-bogina';

export function FoodBoginaAuthor() {
    return (
        <section id="author" className="container-page py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16 lg:items-center">
                <div>
                    <ResponsiveImage
                        name="food-bogina-author"
                        alt="Ксения Каменская"
                        widths={[320, 480, 760]}
                        fallbackWidth={480}
                        width={1242}
                        height={828}
                        sizes="(min-width: 1024px) 380px, 320px"
                        className="w-full rounded-lg object-cover aspect-[3/4] max-w-[320px] mx-auto lg:max-w-none lg:mx-0"
                    />
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-h2 text-neutral-900">Автор и ведущая курса</h2>
                    <div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-primary-500">
                            Квалификации
                        </p>
                        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-10">
                            {foodBogina.author.qualifications.map((q) => (
                                <li key={q.title} className="flex gap-3">
                                    <Check
                                        aria-hidden="true"
                                        className="mt-0.5 size-5 shrink-0 text-accent-500"
                                        strokeWidth={2.5}
                                    />
                                    <div>
                                        <p className="text-neutral-900">{q.title}</p>
                                        {q.institution && (
                                            <p className="mt-0.5 text-[13px] text-neutral-500">{q.institution}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-16 max-w-2xl text-center">
                <p className="font-serif text-[28px] italic leading-tight text-primary-700 lg:text-[34px]">
                    {foodBogina.closingAccent}
                </p>
                <p className="text-body mt-4 text-neutral-700">{foodBogina.closing}</p>
            </div>
        </section>
    );
}
```

- [ ] **Шаг 2: проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок.

- [ ] **Шаг 3: commit**

```bash
git add components/food-bogina/FoodBoginaAuthor.tsx
git commit -m "feat(food-bogina): добавить FoodBoginaAuthor"
```

---

## Task 13: Страница `/food-bogina/` и запись в `sitemap.ts`

**Files:**
- Create: `app/(public)/food-bogina/page.tsx`
- Modify: `app/sitemap.ts`

- [ ] **Шаг 1: создать страницу**

```tsx
import type { Metadata } from 'next';
import { FoodBoginaHero } from '@/components/food-bogina/FoodBoginaHero';
import { FoodBoginaAudience } from '@/components/food-bogina/FoodBoginaAudience';
import { FoodBoginaProgram } from '@/components/food-bogina/FoodBoginaProgram';
import { FoodBoginaIntro } from '@/components/food-bogina/FoodBoginaIntro';
import { FoodBoginaFormat } from '@/components/food-bogina/FoodBoginaFormat';
import { FoodBoginaAuthor } from '@/components/food-bogina/FoodBoginaAuthor';
import { ContactCtaBanner } from '@/components/sections/ContactCtaBanner';
import { foodBogina } from '@/content/food-bogina';

export const metadata: Metadata = {
    title: foodBogina.title,
    description: foodBogina.hero.lead,
    alternates: { canonical: '/food-bogina/' },
    openGraph: {
        type: 'website',
        locale: 'ru_RU',
        url: 'https://ksenia-kamenskaya.ru/food-bogina/',
        siteName: 'Ксения Каменская',
        title: `${foodBogina.title} · Ксения Каменская`,
        description: foodBogina.hero.lead,
        images: [{ url: '/images/og-cover.webp', width: 1200, height: 630, alt: foodBogina.title }],
    },
};

export default function FoodBoginaPage() {
    return (
        <>
            <FoodBoginaHero />
            <FoodBoginaAudience />
            <FoodBoginaProgram />
            <FoodBoginaIntro />
            <FoodBoginaFormat />
            <FoodBoginaAuthor />
            <ContactCtaBanner />
        </>
    );
}
```

- [ ] **Шаг 2: добавить запись в sitemap**

В `app/sitemap.ts` после записи `/course/` добавить:

```ts
        {
            url: 'https://ksenia-kamenskaya.ru/food-bogina/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
```

Итоговый файл:
```ts
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://ksenia-kamenskaya.ru/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
        {
            url: 'https://ksenia-kamenskaya.ru/course/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: 'https://ksenia-kamenskaya.ru/food-bogina/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];
}
```

- [ ] **Шаг 3: проверить**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: все три команды проходят без ошибок; `npm run build` печатает `/food-bogina` в списке статически собранных страниц.

- [ ] **Шаг 4: commit**

```bash
git add "app/(public)/food-bogina/page.tsx" app/sitemap.ts
git commit -m "feat(food-bogina): собрать страницу /food-bogina/ и добавить в sitemap"
```

---

## Task 14: Финальная проверка в браузере

**Files:** нет изменений — только проверка.

- [ ] **Шаг 1: запустить dev-сервер**

Run: `npm run dev`

- [ ] **Шаг 2: пройти путь пользователя**

Открыть `http://localhost:3000/`:
- Найти карточку «Food-Богиня» в карусели услуг (должна идти сразу после карточки курса).
- Кликнуть по карточке (не по кнопке) → должен открыться `/food-bogina/`.
- На `/food-bogina/` проверить сверху вниз: hero с портретом слева, нижний край портрета на уровне низа секции (не висит посередине) → сетка 5 карточек причин → аккордеон «Теоретическая часть»/«Практическая часть» (по умолчанию открыта теоретическая) → секция «Курс идёт 3 месяца» → тёмный блок «Формат, в каждом месяце» с кнопкой и «3 месяца» справа → блок «Автор и ведущая курса» со вторым фото (прямоугольное, без выреза фона) и закрывающей цитатой → `ContactCtaBanner` в самом низу.
- Проверить, что кнопка «Записаться» в хедере не отображается ни на `/course/`, ни на `/food-bogina/`, а хедер в обоих случаях тёмный/прозрачный.
- Кликнуть по обеим кнопкам CTA на `/food-bogina/` (hero и «Формат») — должны открывать Telegram-диплинк с текстом из `foodBogina.cta.tgText`.

- [ ] **Шаг 3: зафиксировать результат**

Если всё совпадает — задача выполнена, без коммита (это шаг проверки, не кода). Если найдены визуальные расхождения с макетом-артефактом (например, портрет слишком большой/маленький относительно колонки) — скорректировать классы в `FoodBoginaHero.tsx` (конкретно `max-w-[420px]`/`min-h-[520px]`) точечно и повторить шаги 1–2, затем отдельным коммитом:

```bash
git add components/food-bogina/FoodBoginaHero.tsx
git commit -m "fix(food-bogina): подогнать пропорции hero-портрета по месту"
```

---

## Self-Review (проведён при написании плана)

**Покрытие спеки:**
- Hero с портретом слева, прижатым к низу — Task 7. ✅
- 5 карточек причин — Task 8. ✅
- Аккордеон теория/практика — Task 9. ✅
- «Курс идёт 3 месяца» — Task 10. ✅
- Формат + CTA — Task 11. ✅
- Автор без выреза + закрывающий акцент — Task 12. ✅
- Страница и sitemap — Task 13. ✅
- `TG_GOALS`, карточка на главной, `ServiceCard.href`, `Header` для обеих программных страниц, переезд `DarkHeroBackground` — Tasks 1–5. ✅
- FAQ, форма стороннего сервиса, ссылка в хедере, удаление сырых файлов из `public/` — сознательно не включены, см. «Явно не делаем» в спеке; удаление `public/Food-club.pdf` (уже исчез сам) и `public/images/IMG_8463.JPG` остаётся отдельным шагом перед мёрджем в `main`, не частью этого плана.

**Типы:** `FoodBoginaReason`, `FoodBoginaStep` объявлены в Task 6 и используются с теми же именами в Tasks 8 и 9. `Qualification` переиспользуется из `content/home.ts` без повторного объявления. `TG_GOALS.foodBoginaHero/foodBoginaFormat/foodBoginaCard` объявлены в Task 1, используются в Tasks 2, 7, 11.

**Плейсхолдеров нет** — весь код полный, без «TODO»/«добавить обработку».
