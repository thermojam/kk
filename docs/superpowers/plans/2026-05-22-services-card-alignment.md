# Services · Card Alignment + Top Arrows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** В секции `#services` (1) выровнять контент карточек по горизонтали (бейдж/заголовок/описание/прайс/кнопка на одних линиях), (2) перенести стрелки карусели наверх в одну строку с `<h2>«Услуги»`, чтобы точки внизу центрировались.

**Architecture:** `EmblaCarousel` получает optional `heading?: ReactNode` slot — режим heading включает верхнюю строку (heading + arrows) и центрированные dots снизу. `ServicesCarousel` пробрасывает heading. `Services` оборачивает `<h2>` в этот слот. `ServiceCard` получает `min-h` на title-block / description / pricing + `mt-auto` на pricing для прижатия к низу. Других карусельных секций изменения не касаются (heading не передаётся → старое поведение). SPEC §5 актуализируется.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, embla-carousel.

**Spec:** `docs/superpowers/specs/2026-05-22-services-card-alignment-design.md`

---

## File Structure

| Файл                                          | Ответственность                          | Тип правки  |
| --------------------------------------------- | ---------------------------------------- | ----------- |
| `components/carousel/EmblaCarousel.tsx`       | Базовая карусель                         | расширение  |
| `components/sections/ServicesCarousel.tsx`    | Подключение карусели к ServiceCard       | расширение  |
| `components/sections/Services.tsx`            | Обёртка секции                           | упрощение   |
| `components/sections/ServiceCard.tsx`         | Карточка услуги                          | переработка |
| `SPEC.md` §5                                  | Описание секции                          | правка      |

---

## Task 1: EmblaCarousel — добавить `heading` slot

**Files:**
- Modify: `components/carousel/EmblaCarousel.tsx`

- [ ] **Step 1: Расширить тип `EmblaCarouselProps`**

В блок `type EmblaCarouselProps<T> = { … }` (около строк 12-21) дописать перед закрывающей `};`:

```ts
    heading?: ReactNode;
```

- [ ] **Step 2: Расширить деструктуризацию props в функции**

В сигнатуре `export function EmblaCarousel<T>({ items, renderItem, options, showArrows = false, showDots = true, slidesPerView = { base: 1 }, className, ariaLabel, }: EmblaCarouselProps<T>) {` (около строк 23-32) добавить `heading,` перед `}: EmblaCarouselProps<T>) {`. Финальная сигнатура:

```tsx
export function EmblaCarousel<T>({
    items,
    renderItem,
    options,
    showArrows = false,
    showDots = true,
    slidesPerView = { base: 1 },
    className,
    ariaLabel,
    heading,
}: EmblaCarouselProps<T>) {
```

- [ ] **Step 3: Переработать JSX root return**

Найти `return ( <div className={cn('flex flex-col gap-6', className)} …>` (строка 65 и далее) и **заменить весь return-блок целиком** на:

```tsx
    return (
        <div
            className={cn('flex flex-col gap-6', className)}
            role="region"
            aria-label={ariaLabel}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {heading && (
                <div className="flex items-end justify-between gap-4">
                    {heading}
                    {showArrows && <CarouselArrows embla={embla} />}
                </div>
            )}

            <div ref={viewportRef} className="embla__viewport" style={style}>
                <div className="embla__container">
                    {items.map((item, i) => (
                        <div key={i} className="embla__slide">
                            {renderItem(item, i)}
                        </div>
                    ))}
                </div>
            </div>

            {heading
                ? showDots && (
                      <div className="flex justify-center">
                          <CarouselDots embla={embla} />
                      </div>
                  )
                : (showArrows || showDots) && (
                      <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">{showDots && <CarouselDots embla={embla} />}</div>
                          {showArrows && <CarouselArrows embla={embla} />}
                      </div>
                  )}
        </div>
    );
```

Логика:
- Если `heading` передан → верхняя строка (heading + arrows), внизу только центрированные dots.
- Если `heading` не передан → текущее поведение (контролы внизу, dots слева через `flex-1`, arrows справа).

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: 0 errors. Pre-existing warnings без изменений.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: success.

---

## Task 2: ServicesCarousel — прокинуть `heading`

**Files:**
- Modify: `components/sections/ServicesCarousel.tsx`

- [ ] **Step 1: Заменить файл целиком**

```tsx
'use client';

import { type ReactNode } from 'react';
import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { ServiceCard } from '@/components/sections/ServiceCard';
import type { Service } from '@/content/home';

type ServicesCarouselProps = { items: Service[]; heading?: ReactNode };

export function ServicesCarousel({ items, heading }: ServicesCarouselProps) {
    return (
        <EmblaCarousel
            heading={heading}
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

Изменения относительно текущего файла:
- Добавлен импорт `type { ReactNode } from 'react'`.
- Props расширен `heading?: ReactNode`.
- В JSX добавлен `heading={heading}` в `EmblaCarousel`.

---

## Task 3: Services — передать `<h2>` через heading

**Files:**
- Modify: `components/sections/Services.tsx`

- [ ] **Step 1: Заменить файл целиком**

```tsx
import type { Service } from '@/content/home';
import { ServicesCarousel } from '@/components/sections/ServicesCarousel';
import { ContactCtaBanner } from '@/components/sections/ContactCtaBanner';

type ServicesProps = { items: Service[] };

export function Services({ items }: ServicesProps) {
    return (
        <section id="services" className="container-page py-16 lg:py-24">
            <ServicesCarousel
                items={items}
                heading={<h2 className="text-h2 text-neutral-900">Услуги</h2>}
            />
            <ContactCtaBanner />
        </section>
    );
}
```

Изменения относительно текущего файла:
- `<h2 className="text-h2 text-neutral-900 mb-8">Услуги</h2>` удалена как отдельная строка.
- В `ServicesCarousel` добавлен prop `heading={<h2 ...>Услуги</h2>}` (без `mb-8` — отступ создаёт `gap-6` корневого flex в EmblaCarousel).

---

## Task 4: ServiceCard — `min-h` на блоках + `mt-auto` на pricing

**Files:**
- Modify: `components/sections/ServiceCard.tsx`

- [ ] **Step 1: Заменить файл целиком**

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

            <div className="flex min-h-[5.25rem] flex-col gap-1">
                <h3 className={cn('text-h3', featured ? 'text-neutral-0' : 'text-neutral-900')}>
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
                    'text-body min-h-[5lh]',
                    featured ? 'text-neutral-0/90' : 'text-neutral-700'
                )}
            >
                {item.description}
            </p>

            <ul
                className={cn(
                    'mt-auto flex min-h-[3rem] flex-col gap-1 text-[14px]',
                    featured ? 'text-neutral-0/85' : 'text-neutral-500'
                )}
            >
                {item.pricing.map((line) => (
                    <li key={line}>{line}</li>
                ))}
            </ul>

            <Button
                href={item.cta.href}
                variant="primary"
                className={featured ? '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50' : ''}
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

Изменения относительно текущего файла:
- В title-блоке `<div className="flex flex-col gap-1">` → `<div className="flex min-h-[5.25rem] flex-col gap-1">` (резерв высоты под 2 строки h3 + subtitle).
- В description `<p className="text-body flex-1 …">` → `<p className="text-body min-h-[5lh] …">` (убран `flex-1`, добавлен `min-h-[5lh]`).
- В pricing был условный render `{item.pricing.length > 0 && <ul>…</ul>}` → теперь `<ul>` **всегда** рендерится, с `mt-auto flex min-h-[3rem] …` (прижимает к низу + резерв 48px).
- Остальное — без изменений.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit (карусель + секция + карточка одним коммитом)**

```bash
git add components/carousel/EmblaCarousel.tsx \
       components/sections/ServicesCarousel.tsx \
       components/sections/Services.tsx \
       components/sections/ServiceCard.tsx
git commit -m "feat(services): top arrows + aligned card content"
```

---

## Task 5: SPEC.md §5 — описать новый layout

**Files:**
- Modify: `SPEC.md` (раздел «СЕКЦИЯ 5 · Услуги», около строк 235-340)

- [ ] **Step 1: Вставить блок «Layout и стиль карточки» после CTA-баннера**

Найти блок:

```
#### Под каруселью — CTA-баннер
```
Не знаешь, с чего начать? Начни с бесплатного звонка.
[ Бесплатная консультация · 20 минут ]
```

---

### СЕКЦИЯ 6 · FAQ
```

После закрывающей ``` блока CTA-баннера, **перед** `---` (около строки 342), вставить:

```
#### Layout секции

- Заголовок «Услуги» и стрелки карусели — в одной верхней строке (на lg+): h2 слева, `‹ ›` справа, `items-end` базовая линия
- Под слайдами — только точки (dots), строго по центру (`justify-center`)
- На мобайле (< md) стрелки скрыты, в верхней строке остаётся только h2
- Реализация: `EmblaCarousel` принимает optional prop `heading?: ReactNode` — при его наличии включается этот layout

#### Выравнивание контента карточки

- Все карточки в ряду одной высоты (embla flex `align-items: stretch`)
- Внутри карточки фиксированные высоты блоков:
  - Bage: естественная высота (одинаковая)
  - Title + subtitle: `min-h-[5.25rem]` (84px) — резерв под 2 строки h3 + subtitle
  - Description: `min-h-[5lh]` (~5 строк text-body) — без line-clamp; контент длиннее растягивает блок
  - Pricing: `min-h-[3rem]` + `mt-auto` — прижимает прайс и кнопку к низу карточки; рендерится всегда (даже при пустом массиве)
  - Button: естественная высота
- Disclaimer (только у «Силы Берегини») — после кнопки, увеличивает высоту карточки; embla растягивает соседние слайды на той же странице
```

- [ ] **Step 2: Commit**

```bash
git add SPEC.md
git commit -m "docs(spec): services §5 — top arrows + aligned cards"
```

---

## Done

После Task 5:
- `EmblaCarousel.tsx` — optional `heading` slot (опции for top arrows + центрированные dots).
- `ServicesCarousel.tsx` — пробрасывает heading.
- `Services.tsx` — `<h2>«Услуги»` уезжает в heading slot.
- `ServiceCard.tsx` — фикс высоты title-block / description / pricing, `mt-auto` на pricing для нижнего выравнивания.
- `SPEC.md` §5 синхронизирован.
- Lint 0 errors, build success.
- Визуальная проверка в Playwright: десктоп 1280 (heading row + центрированные dots + ровные карточки), мобайл 375 (heading без стрелок).
