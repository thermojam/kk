# Services · Card Alignment + Top Arrows — design

В секции «Услуги» (`#services`) два связанных улучшения:

1. **Карточки услуг (`ServiceCard`) выравниваются по горизонтали.** Бейдж, заголовок-блок, описание, прайс, кнопка по всем карточкам в ряду начинаются и заканчиваются на одной горизонтали — без «прыжков» по высоте. Реализуется через зарезервированные `min-h` на каждом блоке + `mt-auto` на прайс-блок.

2. **Стрелки карусели уезжают наверх, к заголовку секции.** Это освобождает нижнюю строку под точки (dots), которые становятся ровно по центру. Реализуется через новый optional `heading` slot в `EmblaCarousel`.

## Цели

- Стабильная горизонтальная сетка контента внутри ServiceCard.
- Гармоничный header-блок: `«Услуги»` слева, стрелки справа на той же базовой линии.
- Точки карусели — ровно по центру под слайдами.
- Без новых токенов палитры, без новых компонентов.

## Не-цели

- Менять `EmblaCarousel` для других секций (Cases, Materials, Qualifications, work-areas mobile) — у них `heading` prop не передаётся, layout остаётся прежним.
- Менять контент `services` в `content/home.ts`.
- Менять `ContactCtaBanner` под каруселью.
- Менять `Badge` / `Button` контракт.
- Менять loop / slidesPerView Embla.

## Состав изменений

| Файл                                          | Тип         | Что меняется                                                                          |
| --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------- |
| `components/carousel/EmblaCarousel.tsx`       | расширение  | новый prop `heading?: ReactNode`; в режиме heading — стрелки сверху, dots по центру    |
| `components/sections/ServicesCarousel.tsx`    | расширение  | принимает и пробрасывает `heading`                                                     |
| `components/sections/Services.tsx`            | правка      | `<h2>` уезжает в `heading={…}` ServicesCarousel; layout секции упрощается              |
| `components/sections/ServiceCard.tsx`         | переработка | `min-h` на title-block / description / pricing; `mt-auto` для прижимания pricing книзу |
| `SPEC.md` §5                                  | правка      | блок «Layout секции» и «Стиль карточки»                                                 |

Никаких новых файлов.

## EmblaCarousel — `heading` slot

```ts
type EmblaCarouselProps<T> = {
    // …существующие props…
    heading?: ReactNode;
};
```

### Поведение

- `heading` **не передан** → текущее поведение: контролы под слайдами одной строкой (dots слева через `flex-1`, arrows справа). Никаких регрессий.
- `heading` **передан** → новая раскладка:
  - **Верхняя строка** (`flex items-end justify-between gap-4 mb-8`): `heading` слева, `<CarouselArrows>` справа (если `showArrows`).
  - **Viewport** — как раньше.
  - **Нижняя строка**: только `<CarouselDots>`, обёрнутая в `<div className="flex justify-center">` — точки строго по центру.

### Имплементация EmblaCarousel.tsx

```tsx
return (
    <div className={cn('flex flex-col gap-6', className)} role="region" aria-label={ariaLabel} tabIndex={0} onKeyDown={handleKeyDown}>
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

        {heading ? (
            showDots && (
                <div className="flex justify-center">
                    <CarouselDots embla={embla} />
                </div>
            )
        ) : (
            (showArrows || showDots) && (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">{showDots && <CarouselDots embla={embla} />}</div>
                    {showArrows && <CarouselArrows embla={embla} />}
                </div>
            )
        )}
    </div>
);
```

Заметка про `gap-6` (24px) на root `<div>` — этот gap уже отделяет viewport от верхнего/нижнего блоков; никаких дополнительных margin'ов на heading не нужно. Внутри `mb-8` на heading блоке убран — gap родителя справляется.

### Поведение на узких экранах

`CarouselArrows` уже `hidden md:flex` — на мобильном стрелок нет. В режиме heading это значит верхняя строка содержит только `heading` (например `<h2>`). `flex items-end justify-between` с одним ребёнком — h2 прижат влево, нормальное поведение.

## Services.tsx — упрощение

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

`<h2>` уезжает в `heading` слот. Класс `mb-8` снимается (gap в `EmblaCarousel` уже создаёт отступ). `ContactCtaBanner` — без изменений; gap карусели плюс собственный отступ баннера держат вертикальный ритм.

## ServicesCarousel.tsx — pass-through

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

## ServiceCard.tsx — выравнивание блоков

DOM-структура остаётся той же; добавляются `min-h` и `mt-auto`. Также `ul` с прайсингом теперь **рендерится всегда** (даже при пустом `pricing`) — нужно зарезервировать высоту, чтобы кнопка ровно стояла.

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

            {/* Title + subtitle — фикс высота */}
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

            {/* Description — фикс минимум 5 строк */}
            <p
                className={cn(
                    'text-body min-h-[5lh]',
                    featured ? 'text-neutral-0/90' : 'text-neutral-700'
                )}
            >
                {item.description}
            </p>

            {/* Pricing — фикс минимум 2 строки, прижато к низу (mt-auto) */}
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

### Поэлементно

- **Badge**: высота фиксированная (компонент `Badge` сам по себе одной высоты). Все бейджи стартуют на верхней линии карточки + `gap-4` под Badge.
- **Title-block min-h-[5.25rem]** (84px): вмещает 2 строки h3 на lg (24px × 1.25 × 2 = 60px) + subtitle (16px × 1.4 ≈ 22px). Если subtitle нет — резерв 84px всё равно держится.
- **Description min-h-[5lh]** (~5 строк text-body): на ширине ~360px помещаются описания услуг. Если контент короче (например free-consult — одно предложение) — резерв удерживает высоту блока. Контент **не** обрезается (без line-clamp) — для будущих более длинных описаний оставляем гибкость.
- **Pricing min-h-[3rem]** (48px) + `mt-auto`: даже при пустом `pricing` (free-consult — `[]`) `<ul>` рендерится с высотой 48px. `mt-auto` отжимает прайс-блок и всё, что под ним, к нижней части карточки → кнопки выровнены по нижней горизонтали.
- **Button**: высота фиксированная (компонент `Button` size-md).
- **Disclaimer**: только у одной карточки (`bereginya`); рендерится после кнопки. Не нарушает выравнивание Badge/Title/Description/Pricing/Button — но делает саму карточку выше. Embla `align-items: stretch` (default flex) растягивает все слайды на одной странице карусели до высоты самой высокой → пустое пространство в других карточках уходит на `mt-auto`.

### Условный render `<ul>` снят

Сейчас: `{item.pricing.length > 0 && <ul>…</ul>}`. После правки: `<ul>` рендерится всегда (если массив пустой — `<ul>` без `<li>`, видимости нет, но `min-h-[3rem]` резервирует место). Это даёт стабильную нижнюю линию для кнопки.

Семантически пустой `<ul>` корректен (нет требования non-empty). Доступность не страдает.

## SPEC.md §5 — правка

В конец описания «#### Под каруселью — CTA-баннер» (после строки 340) добавляется новый блок «#### Layout и стиль карточки» с описанием heading-режима и min-h блоков. См. конкретные правки в плане.

## Acceptance

- На lg+ в секции `#services`:
  - заголовок «Услуги» — слева, стрелки `‹ ›` — справа на одной горизонтали (`items-end` базовая линия);
  - под слайдами — точки строго по центру;
  - все 3 видимые карточки одинаковой высоты, бейджи на одной горизонтали, заголовки начинаются и заканчиваются на одной горизонтали, описания начинаются на одной горизонтали, прайс и кнопка прижаты к низу — также на одной горизонтали.
- На мобайле:
  - heading-row содержит только `<h2>` (стрелки скрыты через `hidden md:flex`);
  - 1 карточка в кадре, точки по центру под слайдом.
- Никаких регрессий в `Cases`, `WorkAreas` мобильной карусели, `Materials`, `Qualifications` — там `heading` не передаётся, layout прежний.
- Lint 0 errors, build success.

## Открытые риски

- **`min-h-[5lh]` на description**: для короткого free-consult (1 предложение) внизу description будет видимая пустота. С `mt-auto` на pricing она выглядит «дышаще», а не как баг — пустое пространство уходит между description-end и pricing-start. Если решим, что это плохо смотрится — уменьшим до 4lh или удалим резерв (карусель сама растянет высоты).
- **`<ul>` без `<li>`**: некоторые скрин-ридеры могут озвучить как «empty list». Это редкость и не критично; альтернатива — `aria-hidden="true"` на пустом списке. Решим по факту тестирования.
- **disclaimer на bereginya**: эта карточка длиннее остальных. На странице карусели с bereginya все 3 слайда стягиваются до её высоты — пустое место в других накапливается в `mt-auto` зоне (между description и pricing). Это нормально, но если эффект сильный — можем ограничить disclaimer line-clamp или поместить в expandable popover.

## Out of scope

- Менять контент услуг.
- Менять Badge / Button / Dialog / EmblaCarousel API за пределами `heading` prop.
- Менять FAQ, Footer, header.
- Менять секции #work-areas, #cases.
