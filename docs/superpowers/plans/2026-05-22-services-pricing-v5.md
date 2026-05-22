# Services Pricing V5 (Serif Italic Display Number) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Цена в карточке услуги (`#services`) рендерится как «крупная серифная курсивная цифра + мелкая sans-приписка»; модель данных реструктурируется со строки на `{ value, meta? }`.

**Architecture:**
- `content/home.ts`: новый тип `ServicePrice`, поле `Service.pricing: string[]` заменяется на `Service.prices: ServicePrice[]` + опц. `pricingNote?: string`. 5 услуг переписываются под новую модель в одном коммите с типом — иначе typecheck сломается.
- `components/sections/ServiceCard.tsx`: только блок цен (строки 55–64) переписывается. Остальное — без изменений.
- `SPEC.md` §5: текстовые блоки карточек А/Б/В/Г и описание блока pricing обновляются под новый формат.

**Tech Stack:** Next.js 16 · TypeScript · Tailwind v4 · Embla Carousel (без изменений).

**Тесты в MVP:** не пишем (см. memory `feedback_no_tests_in_mvp.md`). Верификация — `pnpm typecheck`, `pnpm lint`, ручная проверка в `pnpm dev`. TDD-шаги в плане отсутствуют намеренно.

**Спека:** `docs/superpowers/specs/2026-05-22-services-pricing-v5-design.md` (коммит `93c8d60`).

---

## Task 1: Реструктурировать модель данных + переписать контент

**Files:**
- Modify: `content/home.ts`

Меняем тип `Service` и сразу переписываем 5 услуг — в одном коммите, иначе typecheck падает между шагами. Старое поле `pricing: string[]` удаляется полностью.

- [ ] **Step 1: Добавить тип `ServicePrice` и обновить `Service` в `content/home.ts`**

В файле `content/home.ts` найди блок типов (строки 16–26) и замени его на:

```ts
export type ServicePrice = {
    /** Крупная серифная часть. Примеры: "5 000 ₽", "3 / 6". */
    value: string;
    /** Мелкая sans-приписка справа от value. Примеры: "за 1,5 часа", "месяцев сопровождения". Опционально. */
    meta?: string;
};

export type Service = {
    id: string;
    badge: string;
    title: string;
    subtitle?: string;
    description: string;
    /** Список тарифов (0..N). Пустой массив — блок цен не рендерится. */
    prices: ServicePrice[];
    /** Дополнительная строка курсивом под тарифами. Опционально. */
    pricingNote?: string;
    cta: { label: string; href: string };
    featured?: boolean;
    disclaimer?: string;
};
```

- [ ] **Step 2: Переписать 5 услуг в массиве `services`**

В том же файле найди массив `services` (строка 94) и поменяй поле `pricing` на `prices` + добавь `pricingNote` где нужно. Полный конечный вид массива:

```ts
export const services: Service[] = [
    {
        id: 'consult-food-body',
        badge: 'Разовая',
        title: 'Консультация',
        subtitle: '«Отношения с едой и телом»',
        description:
            'Разовая встреча для тех, у кого основной запрос — про вес, переедание, контакт со своим телом. Разбираем, что происходит, ищем психологические причины и намечаем первые шаги.',
        prices: [{ value: '5 000 ₽', meta: 'за 1,5 часа' }],
        cta: { label: 'Записаться', href: '#contact' },
    },
    {
        id: 'path-to-self',
        badge: '★ Основная программа',
        title: 'Длительное сопровождение',
        subtitle: '«Путь к себе»',
        description:
            'Моя основная программа. Для женщин, готовых к системной работе. Темы: эмоциональное состояние, отношения с едой и телом, самооценка, границы, родовые сценарии, проявленность.',
        prices: [{ value: '3 / 6', meta: 'месяцев сопровождения' }],
        pricingNote: 'Стоимость — после диагностической встречи',
        cta: { label: 'Записаться на диагностику', href: '#contact' },
        featured: true,
    },
    {
        id: 'session',
        badge: 'Разовая',
        title: 'Психологическая сессия',
        subtitle: '1:1 онлайн',
        description:
            'Исследование корня проблемы, работа с эмоциями и жизненными сценариями. Подходит для широкого спектра запросов — отношения, страхи, потеря себя, проявленность.',
        prices: [
            { value: '5 000 ₽', meta: 'за 1,5 часа' },
            { value: '12 000 ₽', meta: 'пакет из 3 сессий' },
        ],
        cta: { label: 'Записаться', href: '#contact' },
    },
    {
        id: 'bereginya',
        badge: 'Телесная практика',
        title: 'Женская славянская гимнастика',
        subtitle: '«Сила Берегини»',
        description:
            'Авторская оздоровительная практика. Мягкие упражнения, которые возвращают контакт с телом, снимают физическое напряжение и помогают чувствовать себя в своём теле спокойно.',
        prices: [
            { value: '3 000 ₽', meta: 'видео-комплекс' },
            { value: '8 000 ₽', meta: 'с индивидуальным разбором' },
        ],
        cta: { label: 'Записаться', href: '#contact' },
        disclaimer:
            '⚠ Это оздоровительная практика, не лечебная физкультура. При хронических состояниях, беременности, обострениях, онкологических и психиатрических диагнозах — нужна консультация врача. Перед первым занятием попрошу заполнить короткую анкету о здоровье.',
    },
    {
        id: 'free-consult',
        badge: 'Бесплатно',
        title: 'Бесплатная консультация',
        subtitle: '20 минут',
        description: 'Знакомство, обсуждение запроса, помогу определить подходящий формат.',
        prices: [],
        cta: { label: 'Записаться', href: '#contact' },
    },
];
```

- [ ] **Step 3: Проверить, что нет других потребителей старого `pricing`**

Run:
```bash
grep -rn "\.pricing\b\|pricing:" --include="*.ts" --include="*.tsx" .
```

Expected: единственное совпадение — `components/sections/ServiceCard.tsx:61` (`item.pricing.map(...)`). Это починим в Task 2. Если grep вернёт что-то ещё (тест, страница, другой компонент) — STOP и подними вопрос: возможно, есть скрытый потребитель, который тоже нужно обновить.

- [ ] **Step 4: Запустить typecheck**

Run:
```bash
pnpm typecheck
```

Expected: одна ошибка в `components/sections/ServiceCard.tsx:61` — `Property 'pricing' does not exist on type 'Service'`. Это ожидаемо — починим в Task 2. Никаких других ошибок быть не должно.

- [ ] **Step 5: Закоммитить**

```bash
git add content/home.ts
git commit -m "refactor(services): pricing model — { value, meta? } + pricingNote"
```

---

## Task 2: Переписать блок цен в `ServiceCard.tsx`

**Files:**
- Modify: `components/sections/ServiceCard.tsx`

Заменяем только блок `<ul>` (текущие строки 55–64) на новый блок с двумя ветками рендера. Бэйдж, title, subtitle, description, disclaimer, CTA-кнопка, обёртка `<article>` — не трогаем.

- [ ] **Step 1: Заменить блок pricing в `ServiceCard.tsx`**

В файле `components/sections/ServiceCard.tsx` найди текущий блок:

```tsx
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
```

Замени его на:

```tsx
            {(item.prices.length > 0 || item.pricingNote) && (
                <div
                    className={cn(
                        'mt-auto flex flex-col gap-2 border-t pt-3.5',
                        featured ? 'border-neutral-0/20' : 'border-neutral-100'
                    )}
                >
                    {item.prices.length > 0 && (
                        <ul className="flex flex-col gap-2">
                            {item.prices.map((price) => (
                                <li
                                    key={price.value + (price.meta ?? '')}
                                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
                                >
                                    <span
                                        className={cn(
                                            'font-serif italic font-medium leading-none tracking-[-0.01em] text-[32px] lg:text-[36px]',
                                            featured ? 'text-accent-500' : 'text-primary-500'
                                        )}
                                    >
                                        {price.value}
                                    </span>
                                    {price.meta && (
                                        <span
                                            className={cn(
                                                'text-[13px]',
                                                featured ? 'text-neutral-0/85' : 'text-neutral-500'
                                            )}
                                        >
                                            {price.meta}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {item.pricingNote && (
                        <p
                            className={cn(
                                'font-serif italic text-[13px]',
                                featured ? 'text-neutral-0/85' : 'text-neutral-500'
                            )}
                        >
                            {item.pricingNote}
                        </p>
                    )}
                </div>
            )}
```

- [ ] **Step 2: Обновить позицию `mt-auto` для CTA-кнопки на free-consult**

В том же файле найди блок:

```tsx
            <Button
                href={item.cta.href}
                variant="primary"
                className={featured ? '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50' : ''}
            >
                {item.cta.label}
            </Button>
```

Добавь `mt-auto` через `cn`, активный только когда блока цен нет (иначе у нас два `mt-auto` в колонке и Button «съест» прижим). Замени на:

```tsx
            <Button
                href={item.cta.href}
                variant="primary"
                className={cn(
                    item.prices.length === 0 && !item.pricingNote && 'mt-auto',
                    featured && '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50'
                )}
            >
                {item.cta.label}
            </Button>
```

Note: `cn` уже импортирован в этом файле (`import { cn } from '@/lib/cn'`). Дополнительных импортов не нужно.

- [ ] **Step 3: Запустить typecheck и lint**

Run:
```bash
pnpm typecheck && pnpm lint
```

Expected: PASS без ошибок и warning'ов.

- [ ] **Step 4: Запустить dev-сервер и проверить вручную**

Run:
```bash
pnpm dev
```

Открыть в браузере `http://localhost:3000`, доскроллить до секции «Услуги». Чек-лист:

- [ ] **Десктоп (≥ 1024px):**
  - В ряду видны 3 карточки одной высоты.
  - **Консультация:** под описанием — серая линия, ниже «5 000 ₽» крупным курсивом фиолетовым (Cormorant italic, ~36px), правее «за 1,5 часа» мелким серым sans (~13px).
  - **Длительное сопровождение (featured, фиолетовый фон):** «3 / 6» крупным курсивом оранжевым (`accent-500`), правее «месяцев сопровождения» белым полупрозрачным. Под этой строкой — `pricingNote` «Стоимость — после диагностической встречи» мелким белым курсивом.
  - **Психологическая сессия:** две строки цен, обе крупным курсивом фиолетовым.
- [ ] Прокрути карусель стрелками `›` — появляются:
  - **Сила Берегини:** две строки цен («3 000 ₽» / «8 000 ₽»), ниже свёрнутый disclaimer, ниже кнопка.
  - **Бесплатная консультация:** блок цен **отсутствует** (без border-t), кнопка прижата к низу карточки (`mt-auto` сработал на Button).
- [ ] **Мобайл (`< 1024px`):** уменьшить окно браузера до ~390px. Карусель показывает 1 слайд. Цены отображаются так же — крупная курсивная цифра + мелкая приписка. Свайп вправо/влево работает.
- [ ] **Featured-карточка:** проверь читаемость «3 / 6» оранжевым на фиолетовом — контраст должен быть высокий, цифры легко считываются.
- [ ] **Выравнивание:** в ряду из 3 карточек блоки цен начинаются примерно на одной горизонтали (за счёт `mt-auto`).

Если что-то выглядит не так (скачет высота, цифра режется, контраст плохой) — STOP и подними вопрос. Не правь «на глаз».

- [ ] **Step 5: Закоммитить**

```bash
git add components/sections/ServiceCard.tsx
git commit -m "feat(services): pricing V5 — serif italic display number + meta"
```

---

## Task 3: Обновить SPEC.md §5

**Files:**
- Modify: `SPEC.md` (секция 5 «Услуги», строки ~235–361)

Текстовые блоки карточек и описание блока pricing должны соответствовать новой модели.

- [ ] **Step 1: Обновить ASCII-описание карточки А (Консультация)**

В `SPEC.md` найди блок карточки А (строки ~243–258). Найди строку:

```
1,5 часа · 5 000 ₽
```

Замени на:

```
5 000 ₽    за 1,5 часа
```

- [ ] **Step 2: Обновить ASCII-описание карточки Б (Психологическая сессия)**

Найди блок карточки Б (строки ~260–276). Найди строки:

```
1,5 часа · 5 000 ₽
Пакет из 3 сессий — 12 000 ₽
```

Замени на:

```
5 000 ₽     за 1,5 часа
12 000 ₽    пакет из 3 сессий
```

- [ ] **Step 3: Обновить ASCII-описание карточки В (Путь к себе)**

Найди блок карточки В (строки ~278–296). Найди строки:

```
3 или 6 месяцев.
Стоимость — после диагностической встречи.
```

Замени на:

```
3 / 6     месяцев сопровождения
— Стоимость — после диагностической встречи
```

- [ ] **Step 4: Обновить ASCII-описание карточки Г (Сила Берегини)**

Найди блок карточки Г (строки ~298–322). Найди строки:

```
Видео-комплекс — 3 000 ₽
Комплекс с индивидуальным разбором — 8 000 ₽
```

Замени на:

```
3 000 ₽    видео-комплекс
8 000 ₽    с индивидуальным разбором
```

- [ ] **Step 5: Обновить пункт «Pricing» в подразделе «Выравнивание контента карточки»**

В `SPEC.md` найди в подразделе «Выравнивание контента карточки» (строки ~353–360) пункт:

```
  - Pricing: `min-h-[3rem]` + `mt-auto` — прижимает прайс и всё, что под ним, к низу карточки; рендерится всегда (даже при пустом массиве)
```

Замени на:

```
  - Pricing: блок рендерится только если `prices.length > 0` или есть `pricingNote`. Контейнер с `border-t` (`neutral-100` на default, `neutral-0/20` на featured), `pt-3.5`, `mt-auto` — прижимает блок и всё, что под ним, к низу карточки. Внутри `<ul>` со строками тарифов: `value` — Cormorant italic 32px (lg: 36px), `text-primary-500` (default) / `text-accent-500` (featured); `meta` — sans 13px, `text-neutral-500` / `text-neutral-0/85`. `pricingNote` (если есть) — `<p>` Cormorant italic 13px после списка. Если блока цен нет (free-consult) — `mt-auto` переходит на кнопку.
```

- [ ] **Step 6: Закоммитить**

```bash
git add SPEC.md
git commit -m "docs(spec): §5 — pricing V5 visual + structural notes"
```

---

## Task 4: Финальная верификация и уборка артефактов

**Files:**
- Delete: `services-pricing-variants.html` (mockup-артефакт из брейншторма)

- [ ] **Step 1: Прогнать typecheck и lint в финальном виде**

Run:
```bash
pnpm typecheck && pnpm lint
```

Expected: PASS без ошибок.

- [ ] **Step 2: Удалить HTML-мокап**

Файл `services-pricing-variants.html` лежит в корне репо и был артефактом брейншторма для сравнения 5 вариантов. После выбора V5 он больше не нужен — спека и плана достаточно.

Run:
```bash
rm services-pricing-variants.html
git status --short services-pricing-variants.html
```

Expected: ` D services-pricing-variants.html` (статус «deleted, staged»). Если файла нет — пропусти этот шаг.

- [ ] **Step 3: Финальный визуальный smoke-test в браузере**

`pnpm dev` должен быть запущен с Task 2. Если нет — запусти заново. Открой `/` в браузере и убедись, что **ничего другого не сломалось**:

- [ ] Hero, About, Work Areas, Cases, Services, FAQ, Footer — все секции рендерятся.
- [ ] Сравни Services с тем, как было до правок (через `git stash` если нужно глянуть старую версию). Подтверди: бэйджи, заголовки, описания, дисклеймер «Силы Берегини», CTA-кнопки, мобильная карусель — без регрессий.
- [ ] Консоль браузера — без новых ошибок / warning'ов.

- [ ] **Step 4: Закоммитить удаление мокапа**

```bash
git add -u services-pricing-variants.html
git commit -m "chore: remove pricing variants HTML mockup"
```

- [ ] **Step 5: Финальный `git log` для проверки серии коммитов**

Run:
```bash
git log --oneline -5
```

Expected (порядок снизу вверх):
```
<hash> chore: remove pricing variants HTML mockup
<hash> docs(spec): §5 — pricing V5 visual + structural notes
<hash> feat(services): pricing V5 — serif italic display number + meta
<hash> refactor(services): pricing model — { value, meta? } + pricingNote
<hash> docs(spec): services pricing — V5 serif italic display number
```

Если порядок другой или какой-то коммит отсутствует — STOP, разобраться.

---

## Контрольный чек-лист исполнителя

Перед тем как объявить работу готовой:

- [ ] Все 4 таска отмечены checkbox'ами как выполненные.
- [ ] `pnpm typecheck` → 0 ошибок.
- [ ] `pnpm lint` → 0 ошибок.
- [ ] В браузере 5 карточек услуг выглядят согласно спецификации (см. чек-лист в Task 2 Step 4).
- [ ] Серия из 4 коммитов в `git log` (плюс предыдущий коммит спеки `93c8d60`).
- [ ] `services-pricing-variants.html` удалён.
