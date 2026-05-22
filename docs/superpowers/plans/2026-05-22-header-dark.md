# Header Dark · Brand Duotone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести хедер в тёмную тему (фон `neutral-900`) с двухцветным duotone-логотипом, белыми пунктами меню с оранжевым выделением активного, оранжевой CTA. Мобильное меню — в той же тёмной палитре.

**Architecture:** Один новый хук (`useActiveSection`) + расширение `Logo` опциональным prop'ом `tone` + переработка `Header.tsx` (фон, цвета, активный пункт) + перекраска `MobileMenu.tsx`. Без новых токенов палитры, без новых компонентов. Автотестов нет (проектная политика `feedback_no_tests_in_mvp.md`); верификация — `npm run lint`, `npm run build`, ручной просмотр в браузере.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, framer-motion, Radix UI Dialog.

**Spec:** `docs/superpowers/specs/2026-05-22-header-dark-design.md`

---

## File Structure

| Файл                                | Ответственность                                       | Тип правки                  |
| ----------------------------------- | ------------------------------------------------------ | ---------------------------- |
| `components/ui/Logo.tsx`            | Логотип; mono/duotone tones                            | расширение (новый prop)     |
| `lib/hooks/useActiveSection.ts`     | Определение активной секции через IntersectionObserver | создание                     |
| `components/layout/Header.tsx`      | Хедер: nav, CTA, hamburger, compact mode               | переработка                  |
| `components/layout/MobileMenu.tsx`  | Боковая панель меню                                    | переработка                  |
| `SPEC.md` (T2)                      | Master-документ: описание хедера и мобайл-меню         | правка                       |

---

## Task 1: Logo.tsx — добавить `tone` prop

**Files:**
- Modify: `components/ui/Logo.tsx`

- [ ] **Step 1: Заменить файл целиком**

Содержимое `components/ui/Logo.tsx`:

```tsx
import { cn } from '@/lib/cn';

type LogoProps = {
    size?: number;
    variant?: 'mark' | 'mark+text';
    tone?: 'mono' | 'duotone';
    className?: string;
};

export function Logo({ size = 60, variant = 'mark', tone = 'mono', className }: LogoProps) {
    const isDuotone = tone === 'duotone';

    return (
        <span className={cn('inline-flex items-center gap-2', className)}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                {/* Background ring */}
                <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill={isDuotone ? 'rgba(106,90,200,0.08)' : 'currentColor'}
                    fillOpacity={isDuotone ? undefined : 0.04}
                    stroke={isDuotone ? 'var(--color-primary-500)' : 'currentColor'}
                    strokeOpacity={isDuotone ? 1 : 0.12}
                    strokeWidth="2"
                />

                {/* KK */}
                <g
                    stroke={isDuotone ? '#ffffff' : 'currentColor'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Left K */}
                    <path d="M28 24 V72" />
                    <path d="M28 48 L42 26" />
                    <path d="M28 48 L42 70" />

                    {/* Right K */}
                    <path d="M68 24 V72" />
                    <path d="M68 48 L54 26" />
                    <path d="M68 48 L54 70" />
                </g>

                {/* Center dot */}
                <circle
                    cx="48"
                    cy="48"
                    r="4.5"
                    fill={isDuotone ? 'var(--color-accent-500)' : 'currentColor'}
                />
            </svg>

            {variant === 'mark+text' && (
                <span className="font-serif italic text-[16px] leading-none">Ксения Каменская</span>
            )}
        </span>
    );
}
```

Контракт изменения:
- Новый prop `tone?: 'mono' | 'duotone'`, дефолт `'mono'` — полная обратная совместимость со всеми существующими использованиями.
- При `tone === 'duotone'`: кольцо `var(--color-primary-500)` со заливкой 8% фиолетовый, K-paths `#ffffff`, центральная точка `var(--color-accent-500)`.
- При `tone === 'mono'`: поведение идентично текущему (всё через `currentColor`).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 errors. 5 pre-existing warnings в `components/ui/Button.tsx` остаются (не наша зона).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success (`✓ Generating static pages`, `Finalizing page optimization`).

- [ ] **Step 4: Commit**

```bash
git add components/ui/Logo.tsx
git commit -m "feat(logo): add duotone tone variant"
```

---

## Task 2: useActiveSection — хук активной секции

**Files:**
- Create: `lib/hooks/useActiveSection.ts`

- [ ] **Step 1: Создать директорию**

Run: `mkdir -p /Users/nikitamensky/Desktop/kk/lib/hooks`

- [ ] **Step 2: Создать файл `lib/hooks/useActiveSection.ts`**

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

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add lib/hooks/useActiveSection.ts
git commit -m "feat(hooks): useActiveSection via IntersectionObserver"
```

---

## Task 3: Header.tsx — тёмная тема, duotone logo, active nav, accent CTA

**Files:**
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Заменить файл целиком**

Содержимое `components/layout/Header.tsx`:

```tsx
'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { cn } from '@/lib/cn';
import { useActiveSection } from '@/lib/hooks/useActiveSection';

const NAV = [
    { href: '/#about', id: 'about', label: 'Обо мне' },
    { href: '/#services', id: 'services', label: 'Услуги' },
    { href: '/#materials', id: 'materials', label: 'Материалы' },
    { href: '/#contact', id: 'contact', label: 'Контакт' },
];

const SECTION_IDS = NAV.map((item) => item.id);

const COMPACT_THRESHOLD_PX = 20;

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [compact, setCompact] = useState(false);
    const activeId = useActiveSection(SECTION_IDS);

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
                    'sticky top-0 z-30 w-full bg-neutral-900 transition-[height,border-color] duration-150',
                    compact
                        ? 'h-14 border-b border-white/10'
                        : 'h-20 border-b border-transparent'
                )}
            >
                <div className="container-page flex h-full items-center justify-between">
                    <Link href="/" aria-label="На главную">
                        <Logo variant="mark" tone="duotone" />
                    </Link>

                    {/* Десктоп-нав */}
                    <nav
                        aria-label="Главная навигация"
                        className="hidden lg:flex items-center gap-8"
                    >
                        {NAV.map((item) => {
                            const isActive = activeId === item.id;
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'text-body relative py-2 transition-colors duration-150',
                                        isActive
                                            ? 'font-bold text-accent-500'
                                            : 'text-white/85 hover:text-accent-500'
                                    )}
                                >
                                    {item.label}
                                    {isActive && (
                                        <span
                                            aria-hidden
                                            className="absolute left-0 right-0 -bottom-0.5 rounded-sm"
                                            style={{
                                                height: 3,
                                                background: 'var(--color-accent-500)',
                                            }}
                                        />
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Десктоп-CTA */}
                    <div className="hidden lg:block">
                        <Button href="/#contact" variant="accent" size="md">
                            Записаться
                        </Button>
                    </div>

                    {/* Мобайл-меню кнопка */}
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
                </div>
            </header>

            <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
        </>
    );
}
```

Что меняется относительно текущего файла:
- `bg-neutral-0/95 backdrop-blur` → `bg-neutral-900` (плюс убрали `backdrop-blur`).
- `border-neutral-100` (compact) → `border-white/10`.
- `<Link className="text-primary-500">` → без класса; `<Logo variant="mark+text" />` → `<Logo variant="mark" tone="duotone" />`.
- NAV elements: добавлено поле `id` для каждой записи. Стили `text-body text-neutral-700 hover:text-primary-500` → условный `font-bold text-accent-500` (active) или `text-white/85 hover:text-accent-500` (default), плюс активный `<span>`-underline 3px.
- `<Button variant="primary">` → `<Button variant="accent">`.
- Hamburger: `text-neutral-900 hover:bg-neutral-100 focus-visible:ring-primary-300` → `text-white hover:bg-white/10 focus-visible:ring-accent-500`.
- Импорты: добавлен `useActiveSection`.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat(header): dark theme, duotone logo, active nav underline, accent CTA"
```

---

## Task 4: MobileMenu.tsx — тёмная тема

**Files:**
- Modify: `components/layout/MobileMenu.tsx`

- [ ] **Step 1: Заменить файл целиком**

Содержимое `components/layout/MobileMenu.tsx`:

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
        <Dialog open={open} onOpenChange={onOpenChange} title="Меню" hideTitle position="right">
            <div className="flex h-full flex-col bg-neutral-900 px-6 pt-6 pb-8">
                <div className="mb-8 flex items-center text-white">
                    <Logo variant="mark+text" tone="duotone" />
                </div>

                <nav aria-label="Главная навигация" className="flex flex-col gap-4">
                    {NAV.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            className="text-h3 text-white/85 transition-colors duration-150 hover:text-accent-500"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="my-8 border-t border-white/10" />

                <Button
                    href="/#contact"
                    variant="accent"
                    size="md"
                    onClick={close}
                    className="w-full"
                >
                    Записаться на консультацию
                </Button>

                <div className="mt-auto flex flex-col gap-2 pt-8 text-body text-white/60">
                    <a href="https://t.me/xenia_kamensky">@xenia_kamensky</a>
                    <a href="mailto:hello@kamenskaya.ru">hello@kamenskaya.ru</a>
                </div>
            </div>
        </Dialog>
    );
}
```

Что меняется относительно текущего файла:
- Контейнер: добавлен `bg-neutral-900` (был наследуемый светлый).
- Шапка с лого: добавлен `text-white`; `<Logo variant="mark+text" />` → `<Logo variant="mark+text" tone="duotone" />`.
- Nav-ссылки: `text-neutral-900 hover:text-primary-500` → `text-white/85 transition-colors duration-150 hover:text-accent-500`.
- Разделитель: `border-neutral-100` → `border-white/10`.
- `<Button variant="primary">` → `<Button variant="accent">`.
- Контакты: `text-neutral-700` → `text-white/60`.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add components/layout/MobileMenu.tsx
git commit -m "feat(mobile-menu): dark theme, duotone logo, accent CTA"
```

---

## Task 5: SPEC.md (T2) — обновить описание Header и MobileMenu

**Files:**
- Modify: `SPEC.md` (раздел T2, ~ строки 643–680)

- [ ] **Step 1: Прочитать текущий блок**

Run: `sed -n '643,682p' SPEC.md` (или Read tool, lines 643-682).

Найти подразделы: «Десктоп (lg+)», «Мобайл (< lg)», «Оверлей при открытии», «Поведение», «Sticky-хедер».

- [ ] **Step 2: Обновить блок «Десктоп (lg+)»**

Найти строку (около 648-650):

```
**Десктоп (lg+):**
```
…
```
Логотип   Обо мне · Услуги · Материалы · Контакт   [ Записаться ]
```

Заменить блок схемы и добавить под ним описание стилей. Финальный фрагмент:

```
**Десктоп (lg+):**
```
Логотип (mark, duotone)   Обо мне · Услуги · Материалы · Контакт   [ Записаться ]
```

- Фон хедера: `--color-neutral-900` на всех вьюпортах и секциях
- Лого: duotone — кольцо `primary-500`, K `#ffffff`, центральная точка `accent-500`; без подписи в десктоп-хедере
- Пункты меню: `text-white/85`, hover → `accent-500`
- Активный пункт: `text-accent-500 + font-bold` + оранжевое подчёркивание 3px; активность определяется через `useActiveSection` (IntersectionObserver)
- CTA: `<Button variant="accent">Записаться</Button>` (оранжевая pill)
```

- [ ] **Step 3: Обновить блок «Мобайл (< lg)»**

Найти строку (около 653-655):

```
**Мобайл (< lg):**
```
Логотип                                               [ ≡ ]
```

Заменить на:

```
**Мобайл (< lg):**
```
Логотип (mark, duotone)                              [ ≡ ]
```

- Фон: `--color-neutral-900`
- Гамбургер: иконка `#ffffff`, hover `bg-white/10`, focus-ring `accent-500`
```

- [ ] **Step 4: Обновить блок «Оверлей при открытии»**

Найти блок (около 657-672), заканчивающийся:

```
  hello@kamenskaya.ru
```

Заменить блок целиком на:

```
**Оверлей при открытии (slide-in справа, 200ms, Framer Motion, тёмная тема):**
```
[ ✕ ]  Логотип (mark+text, duotone)

  Обо мне
  Услуги
  Материалы
  Контакт

  ──────────

  [ Записаться на консультацию ]   ← variant="accent"

  @xenia_kamensky
  hello@kamenskaya.ru
```

- Панель: фон `--color-neutral-900`
- Пункты: `text-h3 text-white/85`, hover → `accent-500`
- Разделитель: `border-white/10`
- CTA: `<Button variant="accent">` (оранжевая)
- Контакты: `text-white/60`
```

- [ ] **Step 5: Обновить строку «Sticky-хедер»**

Найти строку (около 679):

```
**Sticky-хедер:** на скролле вниз — компактная версия + `border-bottom`; на скролле вверх — обычная.
```

Заменить на:

```
**Sticky-хедер:** фон `neutral-900` всегда; на скролле вниз — компактная версия (h-14) + `border-bottom: white/10`; на скролле вверх — обычная (h-20). Гистерезис 20px накопленного скролла.
```

- [ ] **Step 6: Commit**

```bash
git add SPEC.md
git commit -m "docs(spec): header §T2 — dark theme, duotone logo, active nav"
```

---

## Done

После Task 5 сводка состояния ветки `sprint-3-foundation`:
- `Logo.tsx` поддерживает `tone="duotone"` (новый prop, обратно совместимо).
- `lib/hooks/useActiveSection.ts` отслеживает активную секцию через IntersectionObserver.
- `Header.tsx` — тёмный фон, duotone-лого без подписи, белые пункты с оранжевым hover, активный пункт с подчёркиванием 3px, оранжевая CTA, гамбургер на тёмном.
- `MobileMenu.tsx` — тёмная панель, duotone-лого с подписью, белые пункты, оранжевая CTA.
- `SPEC.md` §T2 синхронизирован.
- Lint 0 errors, build success.
