# Sprint 1 · Каркас — Design Doc

**Дата:** 2026-05-18
**Статус:** утверждён
**Мастер-документ:** `/SPEC.md` v2.2
**Под-проект:** 1 из 6 (по плану `SPEC.md` §П1)

---

## 0. Контекст и решения

Это первый под-проект в декомпозиции работ по `SPEC.md`. Под-проекты соответствуют 6 спринтам §П1:

1. **Sprint 1 · Каркас** ← этот документ
2. Sprint 2 · Главная (секции 1–7 из SPEC)
3. Sprint 3 · Формы + API + email + БД
4. Sprint 4 · `/materials` + VK embed
5. Sprint 5 · Юр-страницы, cookie-баннер, дисклеймеры
6. Sprint 6 · Lighthouse, mobile QA, SEO, деплой

У каждого спринта будет свой spec → plan → execution цикл.

**Зафиксированные методологические решения (стартовый брейнсторм):**

- **Тесты:** автотестов в MVP не пишем. Качество — через `tsc --noEmit`, `next lint`, ручное тестирование в браузере, Lighthouse. Возможный возврат к вопросу — перед запуском в прод для финансово/юридически чувствительной логики (`/api/lead`, `/api/screening`, Robokassa callback).
- **БД:** в Sprint 1 не трогаем вообще — schema + Drizzle config + clients + миграции переезжают в Sprint 3, где они нужны для API.
- **UI-примитивы:** ручные компоненты на Tailwind поверх Radix-примитивов (`@radix-ui/react-dialog`, `react-accordion`, `react-checkbox`). Без shadcn/ui — полный контроль над визуалом.

---

## A. Цель и границы Sprint 1

**Цель:** подготовить технический фундамент так, чтобы Sprint 2 (главная) и Sprint 4 (materials) собирали секции из готовых примитивов без отвлечений на инфраструктуру.

**Входит:**
- Зависимости из раздела B.
- Дизайн-токены и типографика в `app/globals.css` (по `SPEC.md` §T4 и §T1).
- Шрифты Cormorant Garamond + Nunito через `next/font/google` (latin + cyrillic).
- Базовые UI-примитивы в `components/ui/`.
- Layout-обвязка: Header (sticky), MobileMenu (Radix Dialog + slide-in), Footer.
- Generic Embla-обёртка с Dots и Arrows.
- Чистая структура папок (создаём только то, во что что-то кладётся).
- Главный route `app/(public)/page.tsx` как пустой каркас: `<section id>` для всех будущих секций + якорная навигация + 3 демо-конфигурации Embla с плашками-плейсхолдерами.

**Не входит:**
- Контент секций главной (Hero, About, WorkAreas, Cases, Services, FAQ, ContactForm) — Sprint 2.
- Любые формы и `/api/*` — Sprint 3.
- БД (schema, drizzle, миграции, env) — Sprint 3.
- `/materials/*` и VK-embed — Sprint 4.
- Юр-страницы, cookie-баннер, дисклеймеры — Sprint 5.
- Аналитика (Яндекс.Метрика) — Sprint 5/6, грузится только после opt-in.
- Любые автотесты.

---

## B. Зависимости

Финальный `package.json` после Sprint 1:

```json
{
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
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**Обоснование добавлений:**

| Пакет | Зачем в Sprint 1 |
|---|---|
| `@radix-ui/react-dialog` | MobileMenu (a11y, focus-trap, body-lock из коробки). |
| `@radix-ui/react-accordion` | Базовый `Accordion` примитив для FAQ в Sprint 2 — но удобнее протестировать сразу. |
| `clsx` | Склейка классов в `lib/cn.ts`. |
| `embla-carousel-react` | Карусели (T3). Тестируется в Sprint 1 на демо-плашках. |
| `framer-motion` | Slide-in MobileMenu. В Sprint 2 пригодится для hero-параллакса. |
| `lucide-react` | Иконки `Menu`, `X`, стрелки каруселей; в Sprint 2 — иконки секции «С чем я работаю». |

**Не ставим в Sprint 1:** `@radix-ui/react-checkbox`, RHF, Zod, Drizzle, `pg`, `next-mdx-remote`, Unisender SDK — они приедут в свои спринты (Checkbox — в Sprint 3 вместе с формой).

---

## C. Дизайн-токены и типографика

**`app/globals.css`** содержит:

- Все цветовые токены из `SPEC.md` §T4 (Primary 50/300/400/500/600, Accent 50/500, Neutral 0/50/100/500/700/900, success, error).
- Шрифтовые CSS-переменные: `--font-sans` (Nunito), `--font-serif` (Cormorant Garamond, italic для display).
- Радиусы: `--radius-sm 6px`, `--radius-md 10px`, `--radius-lg 16px`, `--radius-pill 999px`.
- Блок `@theme inline` для Tailwind v4 — пробрасывает токены в утилиты (`bg-primary-500`, `text-accent-500`, `rounded-lg`, `font-serif` и т.д.).
- Утилитарные классы типографики:
    - `.font-display` → Cormorant Garamond Italic, mobile 48px / desktop 72px, line-height tight.
    - `.text-h1` → Nunito ExtraBold 800, mobile 32px / desktop 48px.
    - `.text-h2` → Nunito Bold 700, mobile 24px / desktop 36px.
    - `.text-h3` → Nunito Bold 700, mobile 20px / desktop 24px.
    - `.text-body` → Nunito Regular 400, mobile 15px / desktop 16px.
- Базовое правило `body` → `font-sans text-body text-neutral-900 bg-neutral-0`.
- Контейнер: класс `.container-page` → `max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8` (по `SPEC.md` §T1).
- Удаление дефолтного dark-mode из текущего `globals.css`.

**`app/layout.tsx`** подключает шрифты через `next/font/google`:

```typescript
const nunito = Nunito({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700', '800'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  style: ['italic'],
  display: 'swap',
});
```

`<html className="${nunito.variable} ${cormorant.variable}">` и `<body className="font-sans">`.

**Замечание Accent-цвета:** `SPEC.md` §T4 запрещает Accent как цвет текста на белом фоне (контраст 2.1:1, не проходит WCAG). Это правило не выражается в коде токенов, но фиксируется здесь и должно соблюдаться при имплементации.

---

## D. Структура файлов после Sprint 1

```
app/
├── (public)/
│   ├── layout.tsx              # Header + Footer обёртка
│   └── page.tsx                # пустой каркас + якоря-секции + 3 демо Embla
├── globals.css                 # токены + типографика
├── layout.tsx                  # root html, шрифты, metadata
└── favicon.ico

components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── PhoneInput.tsx
│   ├── Card.tsx
│   ├── Accordion.tsx           # Radix обёртка
│   ├── Dialog.tsx              # Radix обёртка
│   └── Logo.tsx                # SVG-знак К·К
├── layout/
│   ├── Header.tsx
│   ├── MobileMenu.tsx
│   └── Footer.tsx
└── carousel/
    ├── EmblaCarousel.tsx
    ├── CarouselDots.tsx
    └── CarouselArrows.tsx

lib/
└── cn.ts                       # clsx-обёртка

content/
└── materials/                  # пустая папка для *.mdx в Sprint 4

public/
└── images/                     # позже сюда hero.webp и about.webp
```

**Пустые папки заранее НЕ создаём.** `lib/db/`, `lib/email/`, `lib/legal/`, `lib/validation/`, `lib/rate-limit/`, `lib/analytics/`, `lib/payments/`, `components/forms/`, `components/sections/`, `components/materials/`, `components/legal/`, `app/api/` — появятся в своих спринтах.

**Удаляем из дефолтного скаффолда:** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`. `README.md` оставляем как есть до Sprint 6.

---

## E. UI-примитивы (`components/ui/`)

Все компоненты — server components по умолчанию. `'use client'` ставится только там, где нужна интерактивность (`Accordion`, `Dialog`, `PhoneInput`).

### `Button.tsx`

Варианты:
- `primary` — фон `bg-primary-500`, текст `text-neutral-0`, hover `bg-primary-600`.
- `secondary` — бордер `border-primary-500`, текст `text-primary-500`, прозрачный фон.
- `ghost` — только текст с подчёркиванием на hover.

Размеры:
- `md` (default) — высота 44px (touch-таргет минимум по `SPEC.md` §T1).
- `lg` — высота 52px (для hero-CTA в Sprint 2).

Props: `variant`, `size`, `disabled`, `type`, `onClick`, `children`, `className`, опционально `href` (тогда рендерится `<a>`, а не `<button>`).

Disabled state: `opacity-60 cursor-not-allowed pointer-events-none`.

### `Input.tsx`

Текстовый / email-инпут с label сверху и слотом под error-сообщение снизу.

Props: `label`, `name`, `type` (default `text`), `placeholder`, `required`, `error?` (строка), `className`, плюс остальные HTML-атрибуты через `...rest`.

Без RHF-интеграции в Sprint 1 — приедет в Sprint 3.

Стили: высота 48px, padding 12px 16px, бордер `border-neutral-100`, focus-ring `ring-2 ring-primary-300`, error — `border-error`.

### `PhoneInput.tsx`

`'use client'`. Контролируемая маска `+7 (___) ___-__-__`.

Реализация без сторонних библиотек (~30 строк):
- Хранит raw-цифры (10 цифр без префикса) внутри.
- При вводе — фильтрует не-цифры, ограничивает до 10, форматирует обратно в маску для отображения.
- `onChange` отдаёт наружу нормализованную строку `+7XXXXXXXXXX` или пустую если меньше 10 цифр.

Props: те же что у `Input` + `value` / `onChange`.

### `Card.tsx`

Простая обёртка `<div>` с `rounded-lg bg-neutral-0 shadow-sm border border-neutral-100 p-6`. Без compound-слотов — секции и материалы складывают свою внутреннюю верстку сами.

Props: `className`, `children`, `as?` (для смены тега, например `as="article"`).

### `Accordion.tsx`

`'use client'`. Обёртка `@radix-ui/react-accordion` с настроенными стилями. Плавный collapse через `data-state="open|closed"` и CSS `grid-template-rows` или `max-height` транзишн.

API:
```tsx
<Accordion items={[{ id, q, a }]} defaultOpenId={items[0].id} />
```

Анимация открытия: 200ms ease. Иконка (chevron из lucide) поворачивается на 180° при `data-state=open`.

### `Dialog.tsx`

`'use client'`. Обёртка `@radix-ui/react-dialog` — Overlay + Content + Title + Close.

API:
```tsx
<Dialog open onOpenChange title position="right|center">
  {children}
</Dialog>
```

`position="right"` — slide-in справа (для MobileMenu). `position="center"` — модал по центру (для будущего «подробнее ▾» возле чекбоксов согласий в Sprint 3).

Анимации через Framer Motion + Radix `data-state`.

### `Logo.tsx`

Inline-SVG знака «К·К» (двойная литера). Цвет — `currentColor`, контейнер задаёт цвет через `text-primary-500` или `text-neutral-0` в Footer.

Props:
- `size` — default 40px.
- `variant` — `mark` (только знак) / `mark+text` (знак + подпись «Ксения Каменская» справа, Cormorant Garamond Italic 16px, `text-neutral-900`).

---

## F. Layout — Header / MobileMenu / Footer

### `Header.tsx` (`'use client'`)

Десктоп (lg+) разметка:
```
[Logo]   Обо мне · Услуги · Материалы · Контакт   [Записаться]
```

Мобайл (<lg):
```
[Logo]                                                    [≡]
```

**Sticky-поведение (`SPEC.md` §T2):**
- На скролле вниз → компактная версия: высота 56px, тонкий `border-b border-neutral-100`.
- На скролле вверх → обычная: высота 80px, без бордера.
- Реализация: `useState` для «direction», `useEffect` со scroll listener throttled через `requestAnimationFrame` (без lodash).
- Hysteresis: переход «вниз → компакт» срабатывает после 20px накопленного движения вниз, чтобы не дёргалось при микро-движениях.

Якорные ссылки: `#about`, `#services`, `#materials`, `#contact`. Клик — `e.preventDefault()` + `document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'})`. С учётом высоты sticky-хедера — `scroll-margin-top` у целевых `<section>` (через CSS).

CTA «Записаться» (правая часть, десктоп) — `<Button variant="primary" size="md">` со скроллом к `#contact`.

На мобайле: иконка `Menu` (lucide-react), `aria-label="Открыть меню"`, по клику — открыть `MobileMenu`.

### `MobileMenu.tsx` (`'use client'`)

Использует наш `<Dialog position="right">` (на Radix) + Framer Motion для slide-in.

Содержимое (по `SPEC.md` §T2):
```
[ ✕ ]  Logo

  Обо мне
  Услуги
  Материалы
  Контакт

  ──────────

  [ Записаться на консультацию ]

  @xenia_kamensky
  hello@kamenskaya.ru
```

Поведение:
- Body lock — Radix Dialog даёт из коробки.
- Закрытие: ✕ (внутри), Esc, клик-вне, клик на пункт меню (плюс скролл к якорю).
- Анимация: `translateX(100%) → 0`, duration 200ms, ease-out.
- `prefers-reduced-motion: reduce` → Framer Motion `useReducedMotion()` отключает translate, оверлей появляется мгновенно.
- Telegram-ник и email — пока хардкод `@xenia_kamensky` / `hello@kamenskaya.ru` (открытый вопрос из `SPEC.md` §П3 №3 о Telegram-нике закрывается в Sprint 3 при работе с формой).

### `Footer.tsx` (server component)

3 колонки на десктопе, вертикальный стек на мобайле. Контент строго по `SPEC.md` §1.8:

- **Левая:** `<Logo variant="mark+text" />`, «Психолог · Женские практики», дисклеймер «Услуги психолога не являются психотерапией и медицинской помощью» — Nunito Regular Small, `text-neutral-500`.
- **Центральная:** Telegram `@xenia_kamensky`, канал отзывов `t.me/kmensky_case`, email `hello@kamenskaya.ru`.
- **Правая:** навигация (те же якоря что в Header) — «Обо мне», «Услуги», «Материалы», «Контакт».
- **Нижняя строка** (full-width, над `border-t border-neutral-100`): «ИП Каменская К. С. · ОГРНИП 323784700394015 · ИНН 781435744110» + ссылки «Политика ПДн · Оферта · Cookie» — в Sprint 1 эти ссылки ведут в `#` (мёртвые), настоящие страницы появятся в Sprint 5.

---

## G. Embla обёртка (`components/carousel/`)

### `EmblaCarousel.tsx` (`'use client'`)

Generic-обёртка для всех 4 каруселей проекта (`SPEC.md` §T3).

```typescript
type EmblaCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  options?: EmblaOptionsType;
  showArrows?: boolean;
  showDots?: boolean;
  slidesPerView?: { base: number; lg?: number };
  className?: string;
  ariaLabel?: string;
};
```

Реализация:
- `useEmblaCarousel(options)` из `embla-carousel-react`.
- Контейнер `flex` с `overflow-hidden`, ширина каждого слайда регулируется CSS-переменной `--slide-size` (по умолчанию `100%` на base, `33.333%` на lg+ — настраивается через `slidesPerView`).
- Gap 16px между слайдами (margin-left у всех слайдов кроме первого).
- Strict snap включён (`align: 'start'` по умолчанию).
- Клавиатура: `onKeyDown` на корневом `div` ловит `ArrowLeft` / `ArrowRight` → `embla.scrollPrev()` / `scrollNext()`. Корневой `div` — `tabIndex=0`, `role="region"`, `aria-label={ariaLabel}`.
- `embla.on('reInit', ...)` для адаптива при resize.
- Автоплей выключен.

### `CarouselDots.tsx`

`'use client'`. Принимает `embla` (EmblaApi).

Слушает `embla.on('select')`, держит `selectedIndex` в state, рендерит ряд кружков. Активный — `bg-accent-500`, остальные — `bg-primary-300`. Кружки кликабельны (`embla.scrollTo(index)`), `aria-label={`Перейти к слайду ${i + 1}`}`. Высота кликабельной области 44px (touch-target), визуальный размер 8px.

### `CarouselArrows.tsx`

`'use client'`. Принимает `embla`.

Кнопки `←` / `→` (lucide `ChevronLeft` / `ChevronRight`). Видимы только на `md+` (`hidden md:flex`). Disabled state когда `embla.canScrollPrev()` / `canScrollNext()` возвращает `false` (актуально для loop=false: секции 3 и 4 — без loop; секции 5 и materials — с loop).

### Демо в `app/(public)/page.tsx`

Sprint 1 проверяет 3 конфигурации Embla на плашках-плейсхолдерах внутри пустых `<section>`:

1. **Секции 3/4 поведение:** Mobile-only Embla + desktop grid 3 — рендерим в `<section id="work-areas">` 3 плашки. Переключение через CSS-условный рендер (один компонент видим только на одном брейкпойнте), без `useMediaQuery`:
   ```tsx
   <div className="lg:hidden"><EmblaCarousel slidesPerView={{base:1}} options={{loop:false}} .../></div>
   <div className="hidden lg:grid grid-cols-3 gap-4">{items.map(...)}</div>
   ```
2. **Секции 5 поведение:** Embla везде, lg=3 / base=1, loop=true. Рендерим в `<section id="services">` 5 плашек.
3. **Materials поведение:** идентично #1, но рендерим в `<section id="materials">` 4 плашки.

Плашки — простые `<Card>` с надписью «Слайд N».

---

## H. Definition of Done

Чек-лист ручной проверки (без unit-тестов):

### Установка и конфиг
- [ ] Зависимости из раздела B установлены, `package.json` корректен.
- [ ] `app/globals.css` содержит все токены из `SPEC.md` §T4 + типографические утилиты.
- [ ] `app/layout.tsx` подключает Cormorant Garamond + Nunito через `next/font/google` с latin + cyrillic.
- [ ] Дефолтные SVG из `public/` удалены, дефолтный dark из `globals.css` убран.

### UI-примитивы
- [ ] `Button`, `Input`, `PhoneInput`, `Card`, `Accordion`, `Dialog`, `Logo` существуют, типизированы, рендерятся без ошибок.
- [ ] Touch-таргеты ≥ 44px (`Button size=md`, `Input` 48px).
- [ ] `PhoneInput` маска: ввод цифр форматирует в `+7 (___) ___-__-__`, бэкспейс корректно стирает, `onChange` отдаёт нормализованный `+7XXXXXXXXXX`.

### Layout
- [ ] Header показывает Logo + навигацию + CTA на десктопе, Logo + кнопку ≡ на мобайле.
- [ ] Sticky-поведение: компактная версия на скролле вниз, обычная на скролле вверх, без дёрганий (hysteresis 20px).
- [ ] Якорные ссылки в Header плавно скроллят, с учётом sticky-высоты.
- [ ] MobileMenu открывается слайдом справа, закрывается ✕ / Esc / клик-вне / клик-на-пункт.
- [ ] Body lock работает (страница не скроллится при открытом меню).
- [ ] `prefers-reduced-motion: reduce` отключает анимацию.
- [ ] Footer: 3 колонки на десктопе, стек на мобайле, реквизиты ИП в нижней строке.

### Embla
- [ ] `EmblaCarousel` принимает все props из раздела G и работает.
- [ ] Dots переключают слайды, активная точка `bg-accent-500`.
- [ ] Стрелки на md+, disabled когда нельзя пролистать (loop=false).
- [ ] Свайп пальцем (touch) и drag мышью работают.
- [ ] Стрелки ← / → с клавиатуры работают при фокусе на каруселе.
- [ ] Три демо-конфигурации в `app/(public)/page.tsx` отрендерены и работают на 320 / 768 / 1024 / 1280px.

### Главная (плейсхолдер)
- [ ] `app/(public)/page.tsx` рендерит `<section id>` для: `#hero`, `#about`, `#work-areas`, `#cases`, `#services`, `#faq`, `#contact`.
- [ ] Якорные ссылки в Header и MobileMenu плавно скроллят к нужной секции.

### Качество
- [ ] `npm run build` собирается без ошибок и без warnings от Next.
- [ ] `tsc --noEmit` чисто.
- [ ] `next lint` чисто.
- [ ] Lighthouse на пустом каркасе (prod build): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95.
- [ ] Адаптив проверен в DevTools на 320 / 640 / 1024 / 1280px.

---

## I. Открытые вопросы Sprint 1

Никаких блокирующих. Открытые вопросы из `SPEC.md` §П3 решаются в своих спринтах:

- №1 Юрист → блокирует Sprint 5.
- №2 Согласия клиенток на публикацию кейсов → блокирует контент Sprint 2.
- №3 Telegram-ник Ксении (`@xenia_kamensky` vs `@ksenia_kmensky`) → в Sprint 1 хардкодим `@xenia_kamensky` (брендбук), при необходимости меняется в Sprint 3.
- №4 VK Видео аккаунт → блокирует Sprint 4.
- №5 Опциональность телефона в форме → блокирует Sprint 3.

---

## J. Следующий шаг

После утверждения этой спеки — переход к `superpowers:writing-plans` для генерации детального implementation plan по Sprint 1. План будет содержать пошаговые задачи с критериями проверки (формат CLAUDE.md §4 «Goal-Driven Execution»).
