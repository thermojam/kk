# Header Dark · Brand Duotone — design

Редизайн хедера лендинга Ксении Каменской: тёмный фон во всех вьюпортах и секциях, двухцветный фирменный логотип, новые цвета для пунктов меню (с выделением активного), оранжевая CTA. Выбор: вариант B (Brand Duotone) из брейншторма 2026-05-22 + правка пользователя — CTA оранжевая, а не фиолетовая.

## Цели

- Сделать хедер визуальным продолжением Dark Poster hero: единый «постерный» регистр.
- Усилить узнаваемость лого через двухцветную марку (фирменные фиолет + оранж).
- Дать пользователю чёткую обратную связь о текущей секции через выделение активного пункта меню.
- Сохранить контракт компонентов (`Header`, `Logo`, `MobileMenu`), не вводить новых токенов палитры.

## Не-цели

- Менять структуру навигации, состав NAV, тексты ссылок.
- Менять Dialog (общий компонент) — стилизация затрагивает только панель MobileMenu, не Dialog в целом.
- Менять Footer, Hero, любые другие секции.
- Вводить полноценный dark-mode сайта — это локально тёмный хедер.
- Переписывать механизм compact-mode (текущая гистерезисная логика остаётся).

## Состав изменений

| Файл                                | Тип           | Что меняется                                                                              |
| ----------------------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `components/ui/Logo.tsx`            | расширение    | новый prop `tone?: 'mono' \| 'duotone'`; в duotone — кольцо фиолет, K белые, точка оранж  |
| `components/layout/Header.tsx`      | переработка   | тёмный фон, новые цвета меню и CTA, гамбургер на тёмном, выделение активного пункта         |
| `components/layout/MobileMenu.tsx`  | переработка   | тёмная тема панели справа                                                                  |
| `lib/hooks/useActiveSection.ts`     | новый файл    | хук определения активной секции через IntersectionObserver                                 |
| `SPEC.md`                           | правка        | актуализировать описание Header                                                            |

Новые токены палитры **не вводятся** — всё на существующих `--color-primary-500`, `--color-accent-500`, `--color-neutral-900`, `--color-neutral-0`, white/transparent.

## Logo.tsx — duotone

Расширяем компонент новым опциональным prop:

```ts
type LogoProps = {
    size?: number;
    variant?: 'mark' | 'mark+text';
    tone?: 'mono' | 'duotone';  // новый, дефолт 'mono'
    className?: string;
};
```

### Поведение

- `tone="mono"` *(дефолт, обратно совместимо)* — SVG использует `currentColor` для всех штрихов и заливок, цвет управляется родителем через CSS `color`. Никаких регрессий в существующих местах использования.
- `tone="duotone"`:
  - `<circle>` кольцо: `stroke="var(--color-primary-500)"`, `fill="rgba(106,90,200,0.08)"`, `strokeOpacity="1"`.
  - `<g>` с K-paths: `stroke="#ffffff"`.
  - центральная `<circle>` (точка): `fill="var(--color-accent-500)"`.

Реализация — условный JSX: при `tone === 'duotone'` рендерим SVG с явными цветами; при `tone === 'mono'` — текущий код с `currentColor` без изменений.

Подпись «Ксения Каменская» (`variant="mark+text"`) остаётся, цвет наследуется от родителя (`currentColor`) — в тёмном MobileMenu родитель задаст белый.

## Header.tsx — детали

### Контейнер

- Фон: `bg-neutral-900` (вместо `bg-neutral-0/95`).
- Backdrop-blur убираем — нет смысла на solid фоне.
- Sticky / `z-30` / `transition-[height,border-color]` / поведение compact (h-20 ↔ h-14 при гистерезисе ≥ 20px накопленного скролла) — без изменений.
- Border в compact mode: `border-b border-white/10` (вместо `border-neutral-100`). В expanded mode — `border-b border-transparent` (как сейчас).

### Логотип

```tsx
<Link href="/" aria-label="На главную">
    <Logo variant="mark" tone="duotone" />
</Link>
```

Подпись «Ксения Каменская» **убирается** (был `mark+text`, стало `mark`). `text-primary-500` класс с обёртки убираем — цвет управляется внутри SVG.

### Десктоп-нав

```tsx
<a
    href={item.href}
    className={cn(
        'text-body relative py-2',
        isActive ? 'text-accent-500 font-bold' : 'text-white/105 hover:text-accent-500'
    )}
>
    {item.label}
    {isActive && (
        <span
            aria-hidden
            className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-sm"
            style={{ background: 'var(--color-accent-500)', height: 3 }}
        />
    )}
</a>
```

- Цвет дефолт: `text-white/105`.
- Hover: `text-accent-500`.
- Активный: `text-accent-500 font-bold` + оранжевое подчёркивание 3px (через `::after`-аналог — `<span>` с фоном accent-500).

`isActive` определяется через хук `useActiveSection` (см. ниже).

### Десктоп-CTA

```tsx
<Button href="/#contact" variant="accent" size="md">
    Записаться
</Button>
```

`variant="primary"` (фиолет) → `variant="accent"` (оранж). Размер `md`, `rounded-full` — без изменений (Button уже rounded-full).

### Гамбургер (мобайл)

```tsx
<button
    type="button"
    aria-label="Открыть меню"
    onClick={() => setMenuOpen(true)}
    className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full',
        'text-white hover:bg-white/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
        'lg:hidden'
    )}
>
    <Menu className="size-6" aria-hidden="true" />
</button>
```

Изменения: `text-neutral-900` → `text-white`, `hover:bg-neutral-100` → `hover:bg-white/10`, `focus-visible:ring-primary-300` → `focus-visible:ring-accent-500`.

## useActiveSection — хук

Новый файл `lib/hooks/useActiveSection.ts`. Возвращает id видимой секции из переданного списка id'ов.

```ts
'use client';

import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: string[]): string | null {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (sectionIds.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]) setActiveId(visible[0].target.id);
            },
            { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5] }
        );

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sectionIds]);

    return activeId;
}
```

- `rootMargin: '-40% 0px -40% 0px'` — секция считается активной, когда её центральная зона ~20% от viewport пересекает середину экрана. Снижает «дребезг».
- В Header.tsx: `const activeId = useActiveSection(['about','services','materials','contact'])`. `isActive` для пункта: `activeId === item.href.replace('/#', '')`.

## MobileMenu.tsx — тёмная тема

### Панель

- Внутренний `<div>` (контейнер контента Dialog): `bg-neutral-900` вместо текущего наследуемого светлого фона. Перебивается через классы внутри MobileMenu (стили Dialog не трогаем).

### Содержимое

- Логотип сверху: `<Logo variant="mark+text" tone="duotone" />` (с подписью — в большом мобильном меню это уместно). Подпись наследует цвет от родительского `text-white` или явный класс.
- Пункты: `text-white/105`, hover `text-accent-500`. Active state в мобайл-меню не выделяется (меню закрывается после клика).
- Разделитель: `border-t border-white/10` (был `border-neutral-100`).
- Кнопка: `<Button variant="accent" size="md" className="w-full">Записаться на консультацию</Button>` (был `variant="primary"`).
- Контакты внизу: `text-white/60` (было `text-neutral-700`).

## SPEC.md — правка

В разделе про Header (раздел T1 или соответствующий §) обновить:

- Фон хедера: `--color-neutral-0/95` → `--color-neutral-900`.
- Логотип: `mark+text` фиолетовый → `mark` (без подписи) duotone (кольцо primary-500, K white, dot accent-500).
- Цвета меню: `text-neutral-700` → `text-white/105`, hover/active → `text-accent-500` + оранжевое подчёркивание 3px на активном.
- CTA: `variant="primary"` → `variant="accent"`.
- Гамбургер: цвет иконки white, focus-ring accent-500.

В разделе про MobileMenu — аналогичные правки (тёмная тема панели).

## Цвета и контраст (WCAG)

| Элемент                                  | Цвет                            | Контраст vs neutral-900 |
| ---------------------------------------- | ------------------------------- | ----------------------- |
| Пункты меню (дефолт)                     | `rgba(255,255,255,0.85)`        | ~16:1 ✅                |
| Пункты меню (hover/active)               | `var(--color-accent-500)` (#ffa552) | 8.1:1 ✅            |
| Logo K-paths                             | `#ffffff`                       | 19:1 ✅                 |
| Logo ring                                | `var(--color-primary-500)`      | 5.0:1 ✅                |
| Logo центральная точка                   | `var(--color-accent-500)`       | 8.1:1 ✅                |
| Гамбургер иконка                         | `#ffffff`                       | 19:1 ✅                 |
| CTA текст (`text-neutral-900` на accent) | #1e1e2e на #ffa552              | 8.1:1 ✅                |
| Контакты в мобайл-меню                   | `rgba(255,255,255,0.6)`         | ~11:1 ✅                |

## Анимация

- Никаких новых keyframes.
- Цветовые transition (color/background-color) — `transition-colors duration-150` на nav-ссылках и гамбургере (уже используется в Button через `transition-colors`).
- Подчёркивание активного пункта появляется без анимации — мгновенно при смене `activeId` (если будет «прыгать» при скролле, добавим `transition-opacity duration-200` в имплементации).
- `prefers-reduced-motion: reduce` — все existing transitions и так короткие (150ms), оставляем как есть; новых анимаций нет.

## Acceptance

- Хедер `neutral-900` на всех вьюпортах, на всех секциях (sticky, всегда тёмный).
- Лого: кольцо фиолет, K белые, точка оранж. Подпись «Ксения Каменская» убрана из десктоп-хедера; в мобайл-меню — остаётся.
- Десктоп-меню: белые пункты (85% alpha), оранжевый hover, активный пункт — `text-accent-500 font-bold` + оранжевое подчёркивание 3px. Активный пункт определяется через IntersectionObserver.
- CTA в десктоп-хедере и в мобайл-меню — `variant="accent"` (оранжевая).
- Гамбургер виден на тёмном (белая иконка, оранжевый focus-ring).
- Мобайл-меню (Dialog панель): `bg-neutral-900`, белые пункты, оранжевая CTA, белая полупрозрачная подложка для разделителя и контактов.
- Compact mode при скролле работает как раньше (h-20 ↔ h-14, гистерезис 20px), border меняется с прозрачного на `white/10`.
- Lint + build чисты.
- Никаких регрессий в других местах использования `<Logo>` (mono-режим работает идентично текущему).

## Открытые риски

- **`useActiveSection` и SSR.** Хук `useEffect`-only, на сервере не выполняется — это нормально. Первый рендер на клиенте: `activeId === null` (никакой пункт не выделен), пока IntersectionObserver не сработает (1-2 кадра). Это незаметно; если станет проблемой — добавим логику «если scrollY < heroHeight → выделить ничего».
- **Логотип в Header без `mark+text`.** Если бренд-стиль ожидает «Ксения Каменская» рядом с маркой везде — пользователь это уже отверг (запрос «можно убрать»). В мобайл-меню подпись остаётся, в Footer (если используется) — не трогаем.
- **Mobile Safari `hover:bg-white/10`.** На touch-устройствах hover не релевантен. Это не риск, это нормально — focus-ring обеспечит обратную связь при keyboard nav.
- **Подчёркивание активного пункта при изменении ширины окна.** Если пользователь ресайзит окно, ширина пункта меняется — `<span>` под текстом тоже автоматически (он `left-0 right-0`). Без отдельной логики.

## Out of scope

- Глобальный dark-mode сайта.
- Анимация перехода между активными пунктами (sliding underline).
- Поиск, выпадающие меню, дропдауны.
- Изменения Footer.
- Smooth scroll при клике на якорь (уже работает по дефолту в Next или через CSS `scroll-behavior: smooth`).
