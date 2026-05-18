# Sprint 2 · Главная страница — Design Doc

**Дата:** 2026-05-18
**Спринт:** 2 (по SPEC §П1)
**Срок:** ~1,5 недели
**Источник:** [SPEC.md v2.2](../../../SPEC.md) §1–§7 (контент), §T1 (адаптив), §T3 (карусели), §T4 (токены)
**Предшественник:** [Sprint 1 design](2026-05-18-sprint-1-foundation-design.md), [Sprint 1 plan](../plans/2026-05-18-sprint-1-foundation.md)

---

## Goal

Превратить каркас секций Sprint 1 в работающую главную: 7 секций с реальным контентом, Hero-анимация, наполненные карусели, корректный адаптив mobile/desktop. После Sprint 2 главная содержательно готова — Sprint 3 подключает к секции 7 (форма) реальную отправку и API.

## Scope (что входит в Sprint 2)

- Секции 1–7 с финальным контентом из SPEC §1–§6 и UI-каркасом формы из §7.
- Hero-анимация: четыре эффекта (градиентный фон, движущиеся SVG-овалы, hover-scale портрета, частицы Accent) + fade-up на входе + `prefers-reduced-motion`.
- Реальные карусели (WorkAreas, Cases, Services) поверх готового `EmblaCarousel` из Sprint 1.
- Конвертация фото из `public/image-*.png` в `public/images/{hero,about}.webp`.
- Иконки Секции 3 через lucide-react.
- Адаптив по §T1, существующие токены/контейнер/типографика из Sprint 1.

## Out of Scope (что НЕ входит)

- Реальная отправка формы (RHF + Zod + `/api/lead`) — **Sprint 3**.
- Раскрытие «подробнее» в согласиях, юр.тексты — **Sprint 5**.
- Финальная страница `/thanks` — **Sprint 3**.
- Lighthouse-полировка, SEO-мета, OG-теги — **Sprint 6**.
- Mouse-move parallax портрета (упомянут в SPEC §1) — **Sprint 6 polish**.
- Демо-карусель `/materials` в `page.tsx` — переедет в **Sprint 4**.

---

## Ключевые решения (из брейншторма 2026-05-18)

| Решение | Выбор |
|---|---|
| Скоуп Секции 7 в Sprint 2 | UI-каркас формы, без RHF/Zod/onSubmit |
| Фото Hero/About | Конвертация PNG→WebP в `public/images/`, next/image для responsive |
| Hero-анимация | Полный набор по SPEC §1 (4 эффекта) |
| Иконки Секции 3 | lucide-react: `Waves` · `Compass` · `Mic` |
| Hero лейаут (десктоп) | Вариант C: портрет в круге 320×320, текст крупный, CTA в столбец |
| Карточка В Услуг | Вариант B: Primary-500 фон, белый текст, Accent-бейдж |
| Хранение контента | `content/home.ts` — типизированные массивы |
| RSC-стратегия | Islands: оболочки server, интерактив client |

---

## Architecture · File Structure

```
app/(public)/
└── page.tsx                        ← server, импортит секции 1-7 в порядке

components/sections/
├── Hero.tsx                        ← client (Framer Motion)
├── HeroBackground.tsx              ← client (SVG-овалы + точки Accent)
├── About.tsx                       ← server (next/image + qualifications)
├── WorkAreas.tsx                   ← server обёртка
├── WorkAreasMobileCarousel.tsx     ← client (Embla mobile-only)
├── WorkAreaCard.tsx                ← server (используется в grid и carousel)
├── Cases.tsx                       ← server обёртка
├── CasesMobileCarousel.tsx         ← client (Embla mobile-only)
├── CaseCard.tsx                    ← server
├── Services.tsx                    ← server обёртка
├── ServicesCarousel.tsx            ← client (Embla везде)
├── ServiceCard.tsx                 ← server (featured-флаг переключает стиль)
├── FAQ.tsx                         ← server обёртка
├── FAQAccordion.tsx                ← client (Radix Accordion)
└── ContactForm.tsx                 ← server (UI-каркас без логики)

components/icons/
└── WorkAreaIcons.tsx               ← обёртки lucide Waves/Compass/Mic

content/
└── home.ts                         ← workAreas, cases, services, faq, qualifications

public/images/
├── hero.webp                       ← из image-2.png + конвертация
└── about.webp                      ← из image-4.png + конвертация
```

**Что НЕ трогаем:** Header, Footer, MobileMenu, UI-примитивы (Button/Input/Card/Logo/...), `EmblaCarousel`+`CarouselDots`+`CarouselArrows` из Sprint 1 — кроме одного микрофикса в `CarouselArrows` (см. ниже).

**Микрофикс Sprint 1:** `components/carousel/CarouselArrows.tsx` получит класс `hidden md:flex` на корневом контейнере. Причина: SPEC §T3 говорит «стрелки только ≥ md», но в Sprint 1 этот класс не был добавлен. Одна строка, оправдана тем что без неё §T3 не выполнен на Услугах.

---

## Data Contracts · `content/home.ts`

```ts
export type WorkArea = {
    id: string;                       // slug, key
    icon: 'waves' | 'compass' | 'mic'; // дискриминант под lucide
    title: string;
    bullets: string[];                // из SPEC §3
};

export type Case = {
    id: string;
    title: string;                    // «Вес уходит в последнюю очередь» и т.д.
    body: string;
};

export type Service = {
    id: string;
    badge: string;                    // 'Разовая' | 'Основная программа' | 'Бесплатно' | 'Телесная практика'
    title: string;
    subtitle?: string;                // напр. 'Консультация «Отношения с едой и телом»'
    description: string;
    pricing: string[];                // ['1,5 часа · 5 000 ₽', ...]
    cta: { label: string; href: string };  // href = '#contact' в Sprint 2
    featured?: boolean;               // true только для services[2] («Путь к себе»)
    disclaimer?: string;              // только для «Сила Берегини»
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

export const workAreas: WorkArea[];   // 3 шт. из SPEC §3
export const cases: Case[];           // 3 шт. из SPEC §4
export const services: Service[];     // 5 шт. из SPEC §5
export const faq: FAQItem[];          // 8 шт. из SPEC §6
export const qualifications: Qualification[]; // 5 шт. из SPEC §2
```

**Принципы:**
- Иконка хранится как строковый дискриминант, маппится в lucide-компонент в `WorkAreaIcons.tsx`. Данные не содержат JSX.
- `Service.featured` — единая «правда» о выделении Карточки В.
- Все `href` в Sprint 2 — `#contact` (якорь на форму).

---

## Component Contracts

```tsx
// Hero — никаких пропов, контент Hero фиксирован
function Hero(): JSX.Element;

// About — список qualifications
type AboutProps = { qualifications: Qualification[] };

// WorkAreas / Cases — массив, рендерится в grid (lg+) и Embla (< lg)
type WorkAreasProps = { items: WorkArea[] };
type CasesProps = { items: Case[] };

// Services — массив, Embla везде (1 base / 3 lg)
type ServicesProps = { items: Service[] };

// FAQ — массив, Radix Accordion, первый item open по умолчанию
type FAQProps = { items: FAQItem[] };

// ContactForm — пропов нет, статичная вёрстка
function ContactForm(): JSX.Element;
```

```tsx
// app/(public)/page.tsx
import { workAreas, cases, services, faq, qualifications } from '@/content/home';

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

`page.tsx` — server-компонент, импорт `content/home.ts` идёт на сервере (нулевой JS на клиент для данных).

---

## Hero-анимация (4 эффекта + fade-up + reduced-motion)

### Эффект 1 · Градиентный фон (всегда статичен)

`linear-gradient(135deg, var(--color-primary-50), var(--color-accent-50))` на корневом контейнере Hero. CSS-only.

### Эффект 2 · Декоративные SVG-овалы (десктоп ≥ lg)

В `HeroBackground.tsx` — `<svg>` поверх градиента, `pointer-events: none`, `aria-hidden`. Три эллипса:

| Слой | Цвет | Размер | Позиция | Анимация |
|---|---|---|---|---|
| Овал 1 | primary-300, opacity 0.4 | 480×320 | ~-10% left, 20% top | translate XY ±15px, 18s, easeInOut, infinite |
| Овал 2 | primary-400, opacity 0.3 | 360×260 | ~60% left, 70% top | translate XY ±20px, 22s, противофаза |
| Овал 3 | primary-300, opacity 0.5 | 200×160 | ~80% left, 10% top | translate XY ±10px, 14s |

Framer Motion `motion.ellipse` с `animate={{ x: [...], y: [...] }}` и `transition={{ repeat: Infinity, duration, ease: 'easeInOut' }}`. На мобайле (< lg) — компонент не рендерится (CSS `hidden lg:block` или ранний `return null`).

### Эффект 3 · Частицы Accent (3–5 точек, десктоп ≥ lg)

Чистый CSS keyframes:

```css
@keyframes hero-particle {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
}
```

5 точек размером 8×8px, цвет `--color-accent-500`, opacity 0.7. Каждая получает inline `top`, `left`, `animation-delay` (0s, 1.2s, 2.4s, 3.6s, 4.8s) и `animation-duration` в диапазоне 5–7s. Размещаются вокруг портрета в круге, не залезая на текстовую колонку. На мобайле — `hidden lg:block`.

### Эффект 4 · Hover scale портрета (десктоп ≥ lg, hover-capable)

`motion.div` обёртка вокруг next/image-портрета: `whileHover={{ scale: 1.02 }}`, `transition={{ duration: 0.4, ease: 'easeOut' }}`. На мобайле hover не срабатывает физически, отдельной ветки рендера не делаем.

### Fade-up при входе (всегда, кроме reduced-motion)

Заголовок + подзаголовок + CTA-блок — `motion.div` с `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, длительность 0.6s, stagger 0.1s между элементами. Работает и на мобайле — единственная анимация мобильной версии Hero.

### `prefers-reduced-motion`

Хук `useReducedMotion()` из Framer Motion. Если `true`:
- `HeroBackground` не монтирует овалы и точки (ранний `return null` внутри).
- `whileHover={{}}` на портрете.
- `initial` совпадает с `animate` на fade-up — секция появляется без анимации.

### Hero лейаут (вариант C, десктоп)

```
┌──────────────────────────────────────────────────────────┐
│ gradient primary-50 → accent-50                          │
│                                                          │
│   Психология          ●                                  │
│   женского            ●                                  │
│   тела и                       ╭─────────────╮          │
│   проявленности.               │             │          │
│                                │   Портрет   │          │
│   Помогаю женщинам             │   320×320   │          │
│   перестать носить...          │   круг      │          │
│                                ╰─────────────╯          │
│   [ Записаться · 20 минут ]                ●            │
│   Узнать о программе →             ●                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- min-height 720px на lg+, auto на base
- На мобайле: портрет сверху (max-width 280px круг), текст и CTA снизу, всё центрировано

---

## Карусели и адаптив

### Сводка по T3

| Секция | Десктоп (lg+) | Мобайл | Loop | Стрелки |
|---|---|---|---|---|
| WorkAreas | Grid 3 кол. | Embla, 1 слайд | false | нет |
| Cases | Grid 3 кол. | Embla, 1 слайд | false | нет |
| Services | Embla, 3 слайда | Embla, 1 слайд | **true** | да (≥ md) |

### Паттерн A · Grid/Carousel (WorkAreas, Cases)

Server-секция рендерит обе версии в DOM, переключение через CSS `hidden lg:grid` / `lg:hidden`. Mobile-версия — тонкий client-wrapper над `EmblaCarousel`. Карточка (`WorkAreaCard` / `CaseCard`) — один server-компонент, переиспользуется и в grid, и в Embla.

```tsx
// WorkAreas.tsx (server)
<section id="work-areas" className="container-page py-16 lg:py-24">
    <h2 className="text-h2 mb-6">С чем я работаю</h2>
    <div className="hidden lg:grid grid-cols-3 gap-6">
        {items.map(item => <WorkAreaCard key={item.id} item={item} />)}
    </div>
    <div className="lg:hidden">
        <WorkAreasMobileCarousel items={items} />
    </div>
</section>
```

Дубль карточек в DOM — приемлемая цена за простоту (паттерн из demo `page.tsx` Sprint 1).

### Паттерн B · Embla везде (Services)

Одна карусель, разный `slidesPerView`:

```tsx
// Services.tsx (server)
<section id="services" className="container-page py-16 lg:py-24">
    <h2 className="text-h2 mb-6">Услуги</h2>
    <ServicesCarousel items={items} />
    <ContactCtaBanner />
</section>

// ServicesCarousel.tsx (client)
<EmblaCarousel
    items={items}
    renderItem={(item) => <ServiceCard item={item} />}
    options={{ loop: true }}
    slidesPerView={{ base: 1, lg: 3 }}
    showArrows
    showDots
    ariaLabel="Услуги"
/>
```

### `ServiceCard` — особый случай Карточки В

```tsx
<article
    className={cn(
        'flex flex-col rounded-lg p-6 h-full',
        item.featured
            ? 'bg-primary-500 text-neutral-0'
            : 'bg-neutral-0 border border-neutral-100'
    )}
>
    <Badge tone={item.featured ? 'accent' : 'neutral'}>{item.badge}</Badge>
    {/* title, optional subtitle, description, pricing, cta, optional disclaimer */}
</article>
```

- Один компонент на 5 карточек. `item.featured` переключает фон и стиль кнопки (на Primary-фоне CTA-кнопка инвертируется: белая с Primary-текстом).
- Бейдж: серый фон/бордер для обычных, Accent для featured.
- `disclaimer` рендерится только для «Сила Берегини», под кнопкой, отделён горизонтальной линией.

### CTA-баннер под каруселью Услуг

Отдельный компонент `ContactCtaBanner` под `ServicesCarousel`:
```
Не знаешь, с чего начать? Начни с бесплатного звонка.
[ Бесплатная консультация · 20 минут ]   → href='#contact'
```
Фон `primary-50`, кнопка primary, выровнено по центру на мобайле, по левому краю на десктопе.

### Адаптив (§T1)

Все утилиты — из Sprint 1:
- `.container-page` — max-width 1200px, паддинги 16/24/32px по брейкпоинтам.
- `.text-h1`/`.text-h2`/`.text-h3`/`.text-body`/`.font-display` — типографические утилиты с разными размерами на mobile/desktop.
- Брейкпоинты `sm:640 / md:768 / lg:1024 / xl:1280`.
- Все touch-таргеты ≥ 44×44px.
- `section[id] { scroll-margin-top: 80px; }` — уже в globals.css.

---

## Verification gates

Без автотестов (по `feedback_no_tests_in_mvp`). Каждый шаг закрывается:

| Gate | Команда |
|---|---|
| Типы | `npx tsc --noEmit` |
| Лайтер | `npm run lint` (pre-existing warning в `Button.tsx` из Sprint 1 — игнор) |
| Форматинг | `npm run format:check` (fix `npm run format`) |
| Билд | `npm run build` |
| Ручной QA | `npm run dev` + браузер: desktop 1280px + mobile 375px DevTools |

После Sprint 2 целиком — Lighthouse отложен на Sprint 6. Но если Performance < 70 на `/` — рефлексивный стоп и точечный фикс (обычно — `sizes` у `<Image>`).

### Anti-acceptance criteria

- TypeScript ошибки (warning от eslint допустимы только pre-existing из Sprint 1).
- `prefers-reduced-motion: reduce` не отрабатывает в Hero (овалы/точки продолжают двигаться).
- Стрелки каруселей видны на мобайле или прыгают по высоте.
- Якоря меню не скроллят корректно с учётом sticky-header (offset 80px).
- Карточка В Услуг визуально не выделяется от соседей на десктопе.

---

## Порядок работ (work order)

```
0. Ассеты:
   - image-2.png → public/images/hero.webp (sharp/cwebp)
   - image-4.png → public/images/about.webp
   - удалить исходные image-*.png из public/

1. content/home.ts:
   - типы (WorkArea, Case, Service, FAQItem, Qualification)
   - 5 массивов из SPEC §1-§6
   - gate: tsc

2. components/icons/WorkAreaIcons.tsx:
   - обёртка <WorkAreaIcon name="waves|compass|mic" />
   - lucide Waves/Compass/Mic с фирменным размером/цветом

3. About (server) — простейшая, проверяет паттерн server-секции:
   - next/image about.webp
   - текст + список qualifications с Accent-буллетами
   - адаптив: фото слева на lg+, сверху на base
   - подключить в page.tsx, gate: build + ручная проверка

4. FAQ (server + FAQAccordion client):
   - Radix Accordion из Sprint 1
   - первый item open по умолчанию
   - анимация collapse уже в globals.css

5. WorkAreas (server + WorkAreasMobileCarousel + WorkAreaCard):
   - grid 3 (lg+) / Embla 1 (mobile)
   - иконки через WorkAreaIcons

6. Cases (server + CasesMobileCarousel + CaseCard):
   - копия паттерна WorkAreas, без иконок

7. Services + ServicesCarousel + ServiceCard:
   - микрофикс CarouselArrows (hidden md:flex)
   - переключение featured-стиля
   - CTA-баннер ContactCtaBanner под каруселью

8. ContactForm (server, UI only):
   - заголовок секции
   - 5 полей через Input/PhoneInput из Sprint 1
   - 2 чекбокса Radix
   - заглушки «подробнее ▾» (без раскрытия — Sprint 5)
   - disabled-кнопка, статичная

9. Hero (client) + HeroBackground:
   - все 4 эффекта (градиент + овалы + точки + hover-scale)
   - useReducedMotion гард
   - проверка на мобайле: только fade-up

10. Финальный смок:
    - удалить демо-секцию /materials из page.tsx (переедет в Sprint 4)
    - tsc + lint + format:check + build зелёные
    - ручная проверка desktop+mobile, все якоря, hover, открытие FAQ, свайп каруселей
```

Hero намеренно последним: самая «тяжёлая» секция (4 анимации + reduced-motion), стоит делать когда вся структура страницы уже работает. Иначе риск отвлечения на полировку анимации, пока другие секции пустые.

---

## Open questions

Ни один не блокирует Sprint 2:

- **TG-ник Ксении** (`@xenia_kamensky` vs `@ksenia_kmensky`) — упоминается в SPEC §П3, актуально для секции 7 (микротекст под формой) и `/thanks` (Sprint 3). В Sprint 2 UI-каркаса формы — не используется.
- **Опциональность телефона** в форме — SPEC уже отмечает `phone` опциональным, в Sprint 2 это закреплено разметкой (без `required`).
- **VK Видео-аккаунт** — для Sprint 4 (/materials), не для Sprint 2.

---

## Файлы Sprint 2 (полный список)

**Создаём:**
- `content/home.ts`
- `components/sections/{Hero,HeroBackground,About,WorkAreas,WorkAreasMobileCarousel,WorkAreaCard,Cases,CasesMobileCarousel,CaseCard,Services,ServicesCarousel,ServiceCard,FAQ,FAQAccordion,ContactForm}.tsx`
- `components/sections/ContactCtaBanner.tsx` (вспомогательный)
- `components/icons/WorkAreaIcons.tsx`
- `public/images/hero.webp`, `public/images/about.webp`

**Модифицируем:**
- `app/(public)/page.tsx` — переписываем под импорт секций из content/home.ts, убираем демо-плейсхолдеры
- `components/carousel/CarouselArrows.tsx` — добавляем `hidden md:flex` (микрофикс §T3)

**Удаляем:**
- `public/image-2.png`, `public/image-4.png` — после конвертации в WebP

**Не трогаем:**
- `app/layout.tsx`, `app/globals.css`, `app/icon.svg`
- `components/layout/{Header,MobileMenu,Footer}.tsx`
- `components/ui/*` (Logo, Button, Input, PhoneInput, Card, Accordion, Dialog)
- `components/carousel/{EmblaCarousel,CarouselDots}.tsx`
- `lib/cn.ts`
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`