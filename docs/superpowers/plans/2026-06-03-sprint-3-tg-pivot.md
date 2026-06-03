# Sprint 3 — TG-pivot · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить лендинг из v2.2 (с формой/Backend) в v3 (статическая визитка с TG-воронкой) согласно SPEC_v3.md.

**Architecture:** Удаление всего backend-наследия (формы, MobileMenu, useActiveSection, материалы); добавление TG-утилиты + универсальной `TelegramButton` с гарантированным `reachGoal` (паттерн `transport: beacon`); ленивая Метрика после opt-in; редизайн WorkAreas (Soft Card), About (квалификации), Header/Footer/Hero под единый TG-CTA; две стилизованные юр.страницы; настройка `next export` под Beget.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind v4 · Framer Motion (Hero) · Embla Carousel · Radix Accordion (FAQ only) · lucide-react · Yandex Metrika.

**Testing approach (MVP):** Автотесты не пишем (решение пользователя). Каждая задача завершается: `npx tsc --noEmit` → `npm run lint` → ручная проверка в `npm run dev` → commit.

---

## File Structure

**Создаются:**
- `lib/telegram.ts` — `tgLink()`, `TG_GOALS` карта (источник истины из Части 1 SPEC_v3).
- `lib/analytics/metrika.ts` — ленивая загрузка скрипта, `reachGoal()` с очередью pending-целей, гарантированная отправка (transport beacon).
- `lib/analytics/consent.ts` — чтение/запись `{version, decision, timestamp}` в localStorage с привязкой к `POLICY_VERSION`.
- `components/ui/TelegramButton.tsx` — client-обёртка `<a>` + `reachGoal` без гонки с `target="_blank"`.
- `components/legal/CookieBanner.tsx` — баннер opt-in с текстом из SPEC_v3 §T5.
- `components/legal/LegalPageShell.tsx` — общий каркас для `/privacy` и `/cookies` (хедер v3 + футер v3 + типографика).
- `content/legal/policy-version.ts` — единая константа `POLICY_VERSION`.
- `content/legal/privacy.ts` — текст Политики ПДн.
- `content/legal/cookies.ts` — текст Политики cookie.
- `app/(public)/privacy/page.tsx`.
- `app/(public)/cookies/page.tsx`.

**Модифицируются:**
- `next.config.ts` — `output: 'export'`, `images.unoptimized: true`.
- `package.json` — удаляются неиспользуемые `@radix-ui/react-dialog`, `@radix-ui/react-checkbox`.
- `content/home.ts` — `WorkAreaIconName` обновляется (`waves`→`heart-pulse`, `mic`→`sparkles`), `Service` получает поле `tgGoal` + `tgText`, у сервисов задаётся приветственный текст.
- `components/icons/WorkAreaIcons.tsx` — новые иконки `HeartPulse`, `Compass`, `Sparkles`.
- `components/layout/Header.tsx` — упрощается до лого + одной `TelegramButton`, sticky/compact сохраняется.
- `components/layout/Footer.tsx` — три колонки v3, якорная навигация, TG-контакт через `TelegramButton`, юр.ссылки на `/privacy` и `/cookies`.
- `components/sections/Hero.tsx` — одна CTA-кнопка `TelegramButton` вместо двух.
- `components/sections/Services.tsx` — без структурных изменений (карты-кнопки используют `cta` из `home.ts`).
- `components/sections/ServiceCard.tsx` — кнопка `Записаться` → `TelegramButton` с `tgGoal` и `tgText` из карточки.
- `components/sections/ContactCtaBanner.tsx` — рефакторится в `TelegramButton`-баннер (имя файла остаётся).
- `components/sections/WorkAreas.tsx`, `WorkAreaCard.tsx` — Soft Card стиль (см. SPEC §3).
- `components/sections/About.tsx` — блок квалификаций выносится в отдельный модуль с маркером-«галочкой» и двумя колонками на `lg+`.
- `app/(public)/page.tsx` — удаляется импорт/использование `ContactForm`; добавляется `CookieBanner`.
- `app/(public)/layout.tsx` — без изменений (если CookieBanner подключаем в `page.tsx`); иначе CookieBanner монтируется здесь.
- `app/layout.tsx` — расширяется `metadata` (Open Graph, description, robots) + JSON-LD `Person`.

**Удаляются:**
- `components/sections/ContactForm.tsx`.
- `components/layout/MobileMenu.tsx`.
- `lib/hooks/useActiveSection.ts` (пустую папку `lib/hooks/` тоже удалить).
- `components/ui/Dialog.tsx`.
- `components/ui/Checkbox.tsx`.
- `components/ui/Input.tsx`.
- `components/ui/PhoneInput.tsx`.
- `content/materials/` (пустая, c `.gitkeep`).

---

## Audit Hooks (closed in tasks)

| Audit ID | Где закрыт |
|---|---|
| T1 (race reachGoal vs `target="_blank"`) | Task 4 (TelegramButton + Metrika `transport: 'beacon'`) |
| T2 (window opt-in → script load) | Task 5 (pending-goals очередь в `metrika.ts`) |
| R1–R4 (orphan cleanup) | Task 1 |
| S1 (static export) | Task 1 |
| S2 (SEO) | Task 16 |
| A1 (consent_decline goal) | Task 12 (вшит в `CookieBanner` через `reachGoal` ДО загрузки Метрики — пишется в localStorage, отправляется при следующем визите с opt-in) |

---

## Task 1 — Bootstrap: static export config + orphan cleanup

**Цель:** очистить наследие v2.2 и подготовить Next к статическому экспорту. Это разовая «уборка» — её удобно закрыть одним коммитом, чтобы следующие задачи стартовали с чистой базы.

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json` (удалить `@radix-ui/react-dialog`, `@radix-ui/react-checkbox`)
- Delete: `components/sections/ContactForm.tsx`, `components/layout/MobileMenu.tsx`, `lib/hooks/useActiveSection.ts`, `components/ui/Dialog.tsx`, `components/ui/Checkbox.tsx`, `components/ui/Input.tsx`, `components/ui/PhoneInput.tsx`
- Delete dir: `content/materials/`, `lib/hooks/`
- Modify: `app/(public)/page.tsx` (убрать импорт и использование `ContactForm`)
- Modify: `components/layout/Header.tsx` (убрать импорт `MobileMenu` и `useActiveSection` — временно, упрощение придёт в Task 6; на этом шаге достаточно компилируемого состояния)

- [ ] **Step 1.1: next.config.ts → static export**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'export',
    images: { unoptimized: true },
    trailingSlash: true,
};

export default nextConfig;
```

`trailingSlash: true` нужен Beget'у при отдаче статики (`/privacy/index.html`).

- [ ] **Step 1.2: package.json — удалить неиспользуемые Radix-зависимости**

```bash
npm uninstall @radix-ui/react-dialog @radix-ui/react-checkbox
```

- [ ] **Step 1.3: удалить orphans**

```bash
git rm components/sections/ContactForm.tsx \
       components/layout/MobileMenu.tsx \
       lib/hooks/useActiveSection.ts \
       components/ui/Dialog.tsx \
       components/ui/Checkbox.tsx \
       components/ui/Input.tsx \
       components/ui/PhoneInput.tsx
git rm -r content/materials lib/hooks
```

- [ ] **Step 1.4: app/(public)/page.tsx — убрать ContactForm**

Открыть файл, удалить строку `import { ContactForm } from '@/components/sections/ContactForm';` и сам тег `<ContactForm />`.

- [ ] **Step 1.5: components/layout/Header.tsx — снять зависимости от удалённого**

Минимальная правка: удалить два import'а (`MobileMenu`, `useActiveSection`), удалить `const activeId = useActiveSection(SECTION_IDS);` и любые ссылки на `activeId`/`MobileMenu` в JSX. Полный редизайн хедера — в Task 6, сейчас достаточно компилируемой версии.

- [ ] **Step 1.6: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Все три команды должны успешно отработать. `npm run build` выдаст папку `out/` (статический экспорт).

- [ ] **Step 1.7: commit**

```bash
git add -A
git commit -m "chore(sprint-3): static export + orphan cleanup

- next.config: output:'export', images.unoptimized, trailingSlash
- remove ContactForm, MobileMenu, useActiveSection, ui/Dialog,
  ui/Checkbox, ui/Input, ui/PhoneInput, content/materials, lib/hooks
- drop @radix-ui/react-dialog and @radix-ui/react-checkbox"
```

---

## Task 2 — `lib/telegram.ts` (утилита + карта целей)

**Цель:** единый источник истины для TG-ссылок и `reachGoal`-целей. Текст приветствий и goal-имена берутся из Части 1 SPEC_v3 (с учётом C1 — `tg_click_footer` добавлен).

**Files:**
- Create: `lib/telegram.ts`

- [ ] **Step 2.1: создать `lib/telegram.ts`**

```ts
const TG_USERNAME = 'xenia_kamensky';

/** Источник истины — Часть 1 SPEC_v3. Менять синхронно со спеком. */
export const TG_GOALS = {
    header: 'tg_click_header',
    hero: 'tg_click_hero',
    serviceFood: 'tg_click_service_food',
    serviceSession: 'tg_click_service_session',
    serviceProgram: 'tg_click_service_program',
    serviceGym: 'tg_click_service_gym',
    serviceFree: 'tg_click_service_free',
    servicesBanner: 'tg_click_services_banner',
    footer: 'tg_click_footer',
} as const;

export type TgGoal = (typeof TG_GOALS)[keyof typeof TG_GOALS];

export function tgLink(text: string): string {
    return `https://t.me/${TG_USERNAME}?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 2.2: верификация**

```bash
npx tsc --noEmit
```

Ожидаемо: PASS (utility — pure TS, без React).

- [ ] **Step 2.3: commit**

```bash
git add lib/telegram.ts
git commit -m "feat(telegram): tgLink + TG_GOALS map (SPEC §1)"
```

---

## Task 3 — `lib/analytics/consent.ts`

**Цель:** изолированный слой чтения/записи cookie-согласия. Нужен для `CookieBanner` (Task 12) и для `metrika.ts` (Task 5) — выделяем заранее.

**Files:**
- Create: `content/legal/policy-version.ts`
- Create: `lib/analytics/consent.ts`

- [ ] **Step 3.1: `content/legal/policy-version.ts`**

```ts
/** Версия политик. Инкремент → cookie-баннер показывается повторно. */
export const POLICY_VERSION = 1;
```

- [ ] **Step 3.2: `lib/analytics/consent.ts`**

```ts
import { POLICY_VERSION } from '@/content/legal/policy-version';

const KEY = 'kk.consent.v1';

type StoredConsent = {
    version: number;
    decision: 'accepted' | 'declined';
    timestamp: number;
};

export type ConsentDecision = StoredConsent['decision'];

const TTL_MS = 365 * 24 * 60 * 60 * 1000; // 12 месяцев

export function readConsent(): ConsentDecision | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredConsent;
        if (parsed.version !== POLICY_VERSION) return null;
        if (Date.now() - parsed.timestamp > TTL_MS) return null;
        return parsed.decision;
    } catch {
        return null;
    }
}

export function writeConsent(decision: ConsentDecision): void {
    if (typeof window === 'undefined') return;
    const value: StoredConsent = {
        version: POLICY_VERSION,
        decision,
        timestamp: Date.now(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(value));
}
```

- [ ] **Step 3.3: верификация**

```bash
npx tsc --noEmit
```

- [ ] **Step 3.4: commit**

```bash
git add content/legal/policy-version.ts lib/analytics/consent.ts
git commit -m "feat(analytics): consent storage with POLICY_VERSION + TTL"
```

---

## Task 4 — `lib/analytics/metrika.ts` (ленивая загрузка + reachGoal с очередью)

**Цель:** закрыть аудит T1 и T2 одной утилитой.
- **T1 (гонка с `target="_blank"`):** `reachGoal` вызывается с `transport_type: 'beacon'` → запрос уходит даже если вкладка фокус теряет.
- **T2 (окно между opt-in и загрузкой):** до готовности `window.ym` цели падают в очередь и переотправляются после init.

**Files:**
- Create: `lib/analytics/metrika.ts`

- [ ] **Step 4.1: написать `lib/analytics/metrika.ts`**

```ts
import { readConsent } from '@/lib/analytics/consent';

declare global {
    interface Window {
        ym?: (id: number, action: string, ...args: unknown[]) => void;
    }
}

const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID);

let initStarted = false;
const pendingGoals: string[] = [];

/** Безопасный no-op в SSR. */
function isClient(): boolean {
    return typeof window !== 'undefined';
}

/** Вставляет скрипт Метрики. Вызывать ТОЛЬКО после явного opt-in. */
export function initMetrika(): void {
    if (!isClient() || initStarted || !YM_ID) return;
    initStarted = true;

    (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () {
            (m[i].a = m[i].a || []).push(arguments);
        };
        m[i].l = +new Date();
        for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) return;
        }
        k = e.createElement(t);
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode.insertBefore(k, a);
    } as never)(
        window as never, document, 'script',
        'https://mc.yandex.ru/metrika/tag.js',
        'ym'
    );

    window.ym?.(YM_ID, 'init', {
        ssr: false,
        webvisor: false, // явно отключено (см. аудит A3)
        clickmap: true,
        ecommerce: false,
        accurateTrackBounce: true,
        trackLinks: true,
    });

    // Слить очередь отложенных целей.
    while (pendingGoals.length > 0) {
        const goal = pendingGoals.shift();
        if (goal) sendGoal(goal);
    }
}

function sendGoal(goal: string): void {
    // transport_type: 'beacon' — гарантирует доставку при переходе по target="_blank"
    window.ym?.(YM_ID, 'reachGoal', goal, undefined, undefined, {
        transport_type: 'beacon',
    });
}

/**
 * Отправляет goal в Метрику.
 * — Если согласия нет: no-op (но goal '_decline' от баннера может идти всегда — см. ниже).
 * — Если согласие есть, но скрипт ещё не загружен: ставим в очередь.
 */
export function reachGoal(goal: string): void {
    if (!isClient() || !YM_ID) return;
    if (readConsent() !== 'accepted') return;

    if (typeof window.ym !== 'function') {
        pendingGoals.push(goal);
        return;
    }
    sendGoal(goal);
}
```

- [ ] **Step 4.2: добавить `NEXT_PUBLIC_YM_ID` в `.env.example`**

Создать (или дополнить) `.env.example`:

```
# Yandex Metrika counter ID — обязательно для прод-сборки.
NEXT_PUBLIC_YM_ID=
```

- [ ] **Step 4.3: верификация**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 4.4: commit**

```bash
git add lib/analytics/metrika.ts .env.example
git commit -m "feat(analytics): lazy Metrika loader with pending-goals queue

- transport_type: beacon — закрывает гонку с target='_blank'
- pending-goals queue — закрывает окно между opt-in и init
- webvisor: false — явно отключено (соответствие политике)"
```

---

## Task 5 — `components/ui/TelegramButton.tsx`

**Цель:** универсальная обёртка для всех TG-CTA. Сама принимает решение, куда вести и какой goal стрелять.

**Files:**
- Create: `components/ui/TelegramButton.tsx`

- [ ] **Step 5.1: написать компонент**

```tsx
'use client';

import { type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { reachGoal } from '@/lib/analytics/metrika';
import { tgLink, type TgGoal } from '@/lib/telegram';

type Variant = 'accent' | 'primary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type TelegramButtonProps = {
    goal: TgGoal;
    text: string;
    children: ReactNode;
    variant?: Variant;
    size?: Size;
    className?: string;
};

export function TelegramButton({
    goal,
    text,
    children,
    variant = 'accent',
    size = 'md',
    className,
}: TelegramButtonProps) {
    return (
        <Button
            href={tgLink(text)}
            variant={variant}
            size={size}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => reachGoal(goal)}
        >
            {children}
        </Button>
    );
}
```

> Реализуется через существующий `components/ui/Button.tsx` — он уже умеет `href`, `variant`, `size`. Если `Button` не поддерживает `target`/`rel`/`onClick` как пропсы — добавить эти проброски в `Button.tsx` минимальной правкой (пропустить в `<a>`). Перед коммитом проверить `Button.tsx`.

- [ ] **Step 5.2: при необходимости — расширить `Button.tsx`**

Открыть `components/ui/Button.tsx`. Если type Props не включает `target?: string`, `rel?: string`, `onClick?: ...` — добавить:

```ts
type ButtonAsLinkExtras = {
    target?: '_blank' | '_self';
    rel?: string;
    onClick?: () => void;
};
```

и пробросить в рендер `<a>`. Никаких других изменений в `Button` не делать.

- [ ] **Step 5.3: верификация**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5.4: commit**

```bash
git add components/ui/TelegramButton.tsx components/ui/Button.tsx
git commit -m "feat(ui): TelegramButton wrapping Button + reachGoal"
```

---

## Task 6 — Header v3 (лого + одна TelegramButton)

**Цель:** превратить хедер в SPEC §T1 — лого + одна TG-кнопка, sticky/compact сохраняется (гистерезис 20px уже есть, перенесём without changes).

**Files:**
- Modify: `components/layout/Header.tsx`

- [ ] **Step 6.1: переписать `Header.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';
import { cn } from '@/lib/cn';

const COMPACT_THRESHOLD_PX = 20;

const HEADER_TG_TEXT =
    'Здравствуйте, Ксения! Хочу записаться на консультацию.';

export function Header() {
    const [compact, setCompact] = useState(false);
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
                    if (accDownRef.current >= COMPACT_THRESHOLD_PX) setCompact(true);
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
                    <Logo tone="duotone" />
                </Link>
                <TelegramButton
                    goal={TG_GOALS.header}
                    text={HEADER_TG_TEXT}
                    variant="accent"
                    size="md"
                >
                    Написать в Telegram
                </TelegramButton>
            </div>
        </header>
    );
}
```

- [ ] **Step 6.2: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

В браузере (`http://localhost:3000`):
- Hand-проверка: на десктопе и мобайле в хедере — лого + одна кнопка.
- Скролл вниз 50px → хедер становится компактным (`h-14`), появляется тонкая нижняя граница.
- Скролл вверх → хедер возвращается к `h-20`.
- Клик «Написать в Telegram» → открывается новая вкладка с TG.

- [ ] **Step 6.3: commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat(header): v3 — logo + single TelegramButton (SPEC §T1)"
```

---

## Task 7 — Hero v3 (одна CTA-кнопка)

**Цель:** убрать secondary CTA из Hero, заменить primary на `TelegramButton`.

**Files:**
- Modify: `components/sections/Hero.tsx`

- [ ] **Step 7.1: открыть `Hero.tsx`**

Найти CTA-блок (обычно после подзаголовка). Сейчас там, как минимум, есть:
```tsx
<Button href="#services" variant="ghost" size="md" className="text-white!">
```
и primary-кнопка с `href="/#contact"`.

- [ ] **Step 7.2: заменить CTA-блок**

```tsx
import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';

const HERO_TG_TEXT =
    'Здравствуйте, Ксения! Пишу с сайта — хочу записаться на бесплатную консультацию.';
```

Сам CTA-блок:
```tsx
<TelegramButton
    goal={TG_GOALS.hero}
    text={HERO_TG_TEXT}
    variant="accent"
    size="lg"
>
    Написать в Telegram · бесплатная консультация
</TelegramButton>
```

Старый `Button href="#services"` (secondary) — **удалить**.

- [ ] **Step 7.3: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

Hero: одна оранжевая кнопка, клик → TG. На мобайле кнопка занимает разумную ширину (не растягивается на 100% — Button уже это контролирует).

- [ ] **Step 7.4: commit**

```bash
git add components/sections/Hero.tsx
git commit -m "feat(hero): single TG CTA, drop secondary (SPEC §1)"
```

---

## Task 8 — Контент сервисов: расширить `Service` под TG-метаданные + обновить иконки WorkAreas

**Цель:** к каждому сервису привязать `tgGoal` и `tgText`; обновить `WorkAreaIconName`, чтобы Task 9 был чистым.

**Files:**
- Modify: `content/home.ts`

- [ ] **Step 8.1: обновить тип `WorkAreaIconName`**

В `content/home.ts`:

```ts
export type WorkAreaIconName = 'heart-pulse' | 'compass' | 'sparkles';
```

И в массиве `workAreas`:
- `body-emotions`: `icon: 'heart-pulse'`
- `life-scenarios`: `icon: 'compass'` (без изменений)
- `visibility`: `icon: 'sparkles'`

- [ ] **Step 8.2: расширить тип `Service`**

```ts
import type { TgGoal } from '@/lib/telegram';

export type Service = {
    id: string;
    badge: string;
    title: string;
    subtitle?: string;
    description: string;
    prices: ServicePrice[];
    pricingNote?: string;
    cta: { label: string; tgGoal: TgGoal; tgText: string };
    featured?: boolean;
    disclaimer?: string;
};
```

(поле `href` в `cta` удаляется; вместо него — `tgGoal`/`tgText`)

- [ ] **Step 8.3: обновить пять сервисов**

Тексты приветствий — из карты SPEC_v3 Часть 1.

```ts
// consult-food-body
cta: {
    label: 'Записаться',
    tgGoal: TG_GOALS.serviceFood,
    tgText: 'Здравствуйте! Интересует консультация «Отношения с едой и телом».',
},

// path-to-self
cta: {
    label: 'Записаться на диагностику',
    tgGoal: TG_GOALS.serviceProgram,
    tgText: 'Здравствуйте! Хочу записаться на диагностику по программе «Путь к себе».',
},

// session
cta: {
    label: 'Записаться',
    tgGoal: TG_GOALS.serviceSession,
    tgText: 'Здравствуйте! Интересует психологическая сессия 1:1.',
},

// bereginya
cta: {
    label: 'Записаться',
    tgGoal: TG_GOALS.serviceGym,
    tgText: 'Здравствуйте! Интересует гимнастика «Сила Берегини». Готова заполнить анкету о здоровье.',
},

// free-consult
cta: {
    label: 'Записаться',
    tgGoal: TG_GOALS.serviceFree,
    tgText: 'Здравствуйте! Хочу записаться на бесплатную консультацию 20 минут.',
},
```

Не забыть `import { TG_GOALS } from '@/lib/telegram';` в `content/home.ts`.

- [ ] **Step 8.4: верификация**

```bash
npx tsc --noEmit
```

Ожидается серия TS-ошибок в `ServiceCard.tsx`, `WorkAreaIcons.tsx`, `ContactCtaBanner.tsx` — это ОК, их закроют следующие задачи. Сейчас важна только корректность `content/home.ts`.

- [ ] **Step 8.5: commit**

```bash
git add content/home.ts
git commit -m "feat(content): TG goals/texts on Service, new WorkArea icons

WorkAreaIconName: waves|mic → heart-pulse|sparkles (compass без изменений).
Service.cta.href → tgGoal+tgText (SPEC §1, карта точек входа)."
```

> Этот коммит временно ломает компиляцию проекта (см. Step 8.4) — это норма, закрывается Task 9 + Task 10. Если важно держать main всегда зелёным — выполнять Task 8–10 одним коммитом; для удобства ревью оставлен серией.

---

## Task 9 — WorkAreas Soft Card + новые иконки

**Цель:** соответствие SPEC §3 — карточки переходят на светлый Soft Card стиль.

**Files:**
- Modify: `components/icons/WorkAreaIcons.tsx`
- Modify: `components/sections/WorkAreaCard.tsx`
- Verify: `components/sections/WorkAreas.tsx`, `WorkAreasMobileCarousel.tsx` (структура не меняется)

- [ ] **Step 9.1: обновить `WorkAreaIcons.tsx`**

```tsx
import { Compass, HeartPulse, Sparkles } from 'lucide-react';
import type { WorkAreaIconName } from '@/content/home';

type WorkAreaIconProps = {
    name: WorkAreaIconName;
    className?: string;
};

const icons = {
    'heart-pulse': HeartPulse,
    compass: Compass,
    sparkles: Sparkles,
} as const;

export function WorkAreaIcon({ name, className }: WorkAreaIconProps) {
    const Icon = icons[name];
    return (
        <Icon
            aria-hidden="true"
            strokeWidth={1.5}
            className={className ?? 'size-7 text-primary-500'}
        />
    );
}
```

> `size-7` (28px) соответствует требованию SPEC §3 «иконка 28px» внутри icon-box 56×56.

- [ ] **Step 9.2: переписать `WorkAreaCard.tsx` под Soft Card**

SPEC §3 ключевые требования:
- Фон: `bg-neutral-0` (белый), `rounded-[var(--radius-lg)]`.
- Border: `border-neutral-100`; hover (desktop) → `border-primary-300` + `-translate-y-1`, transition 300ms.
- Тень: `shadow-[0_8px_24px_-18px_rgba(30,30,46,0.15)]`.
- Icon-box 56×56: `bg-primary-50`, `rounded-[var(--radius-md)]`, иконка `text-primary-500 size-7`.
- Заголовок: `text-neutral-900 text-h3`.
- Буллеты: `text-neutral-700`, маркер — точка `bg-accent-500 size-1.5 rounded-full`.

```tsx
import type { WorkArea } from '@/content/home';
import { WorkAreaIcon } from '@/components/icons/WorkAreaIcons';

type WorkAreaCardProps = { item: WorkArea };

export function WorkAreaCard({ item }: WorkAreaCardProps) {
    return (
        <article
            className="
                group flex h-full flex-col rounded-lg border border-neutral-100 bg-neutral-0 p-6
                shadow-[0_8px_24px_-18px_rgba(30,30,46,0.15)]
                transition duration-300
                lg:hover:-translate-y-1 lg:hover:border-primary-300
            "
        >
            <div
                className="
                    mb-4 flex h-14 w-14 items-center justify-center
                    rounded-md bg-primary-50
                "
            >
                <WorkAreaIcon name={item.icon} />
            </div>

            <h3 className="text-h3 mb-3 text-neutral-900">{item.title}</h3>

            <ul className="flex flex-col gap-2 text-neutral-700">
                {item.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                        />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}
```

> Если в `WorkAreas.tsx` секция имеет тёмный фон (`bg-neutral-900` / Dark Poster) — заменить на единый светлый фон секций. Конкретно: убрать класс `bg-neutral-900` или эквивалент. Если фон уже светлый — не трогать.

- [ ] **Step 9.3: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

Браузер:
- Секция «С чем я работаю»: 3 белые карточки на `lg+` (grid), 1 слайд на мобайле (Embla сохраняется).
- Иконки новые: сердечный пульс, компас, искры.
- Hover на десктопе: карточка приподнимается на 4px, border становится primary-300.
- Маркер буллетов — оранжевая точка.

- [ ] **Step 9.4: commit**

```bash
git add components/icons/WorkAreaIcons.tsx \
        components/sections/WorkAreaCard.tsx \
        components/sections/WorkAreas.tsx
git commit -m "feat(work-areas): Soft Card + new icons (SPEC §3)"
```

---

## Task 10 — Services: ServiceCard и ContactCtaBanner на `TelegramButton`

**Цель:** заменить все 5 CTA-кнопок карточек и CTA-баннер под каруселью на `TelegramButton`. Структурно ничего не меняется.

**Files:**
- Modify: `components/sections/ServiceCard.tsx`
- Modify: `components/sections/ContactCtaBanner.tsx`

- [ ] **Step 10.1: `ServiceCard.tsx` — заменить кнопку CTA**

Заменить блок с `<Button href={service.cta.href} ...>{service.cta.label}</Button>` на:

```tsx
import { TelegramButton } from '@/components/ui/TelegramButton';

// внутри карточки:
<TelegramButton
    goal={service.cta.tgGoal}
    text={service.cta.tgText}
    variant={service.featured ? 'accent' : 'primary'}
    size="md"
    className="w-full"
>
    {service.cta.label}
</TelegramButton>
```

(если `featured` отсутствует — `primary`).

- [ ] **Step 10.2: `ContactCtaBanner.tsx` — превратить в TG-баннер**

Полностью переписать содержимое:

```tsx
import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';

const BANNER_TG_TEXT =
    'Здравствуйте! Хочу начать с бесплатного звонка 20 минут.';

export function ContactCtaBanner() {
    return (
        <div className="mt-12 rounded-lg bg-primary-50 p-8 text-center lg:p-10">
            <h3 className="text-h3 mb-3 text-neutral-900">
                Не уверены, какой формат подойдёт?
            </h3>
            <p className="mb-6 text-neutral-700">
                Напишите — вместе разберёмся на бесплатном звонке 20 минут.
            </p>
            <TelegramButton
                goal={TG_GOALS.servicesBanner}
                text={BANNER_TG_TEXT}
                variant="accent"
                size="lg"
            >
                Написать в Telegram
            </TelegramButton>
        </div>
    );
}
```

> Если текущий `ContactCtaBanner` имеет иной copy — оставить существующий текст (вне scope sprint менять копирайт). Менять только тип кнопки.

- [ ] **Step 10.3: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

Браузер:
- Каждая из 5 карточек: клик «Записаться» → новая вкладка TG с правильным приветствием.
- CTA-баннер под каруселью: клик → TG.
- Featured-карточка («Путь к себе») визуально выделена (`variant="accent"`).

- [ ] **Step 10.4: commit**

```bash
git add components/sections/ServiceCard.tsx \
        components/sections/ContactCtaBanner.tsx
git commit -m "feat(services): all CTAs → TelegramButton (SPEC §1, §5)"
```

---

## Task 11 — About: блок квалификаций

**Цель:** SPEC §2 — квалификации выносятся в визуально обособленный модуль с маркером-«галочкой».

**Files:**
- Modify: `components/sections/About.tsx`

- [ ] **Step 11.1: добавить блок квалификаций**

В `About.tsx` после основного текстового блока добавить (вставить в нужное место колоночного layout'а):

```tsx
import { Check } from 'lucide-react';
import { qualifications } from '@/content/home';

// …

<div className="mt-10">
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
```

- [ ] **Step 11.2: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

Браузер:
- Секция «Обо мне»: квалификации визуально отделены, eyebrow `КВАЛИФИКАЦИИ` мелким primary-500.
- Каждая строка — оранжевая «галочка», под названием — серая институция (или пусто, если пусто).
- На `lg+`: две колонки.

- [ ] **Step 11.3: commit**

```bash
git add components/sections/About.tsx
git commit -m "feat(about): qualifications block with check markers, 2-col lg (SPEC §2)"
```

---

## Task 12 — Footer v3

**Цель:** SPEC §8 — три колонки, якорная навигация (`/#about`, `/#work-areas`, `/#cases`, `/#services`, `/#faq`), TG-контакт через `TelegramButton`, две юр.ссылки.

**Files:**
- Modify: `components/layout/Footer.tsx`

- [ ] **Step 12.1: переписать `Footer.tsx`**

```tsx
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';

const NAV = [
    { href: '/#about', label: 'Обо мне' },
    { href: '/#work-areas', label: 'С чем работаю' },
    { href: '/#cases', label: 'Истории' },
    { href: '/#services', label: 'Услуги' },
    { href: '/#faq', label: 'Вопросы' },
];

const FOOTER_TG_TEXT = 'Здравствуйте, Ксения! Пишу с сайта.';

export function Footer() {
    return (
        <footer className="bg-neutral-900 text-white/85">
            <div className="container-page py-16">
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Левая колонка */}
                    <div>
                        <Link href="/" aria-label="На главную">
                            <Logo tone="duotone" />
                        </Link>
                        <p className="mt-4 text-white">Ксения Каменская</p>
                        <p className="text-white/70">Психолог · Женские практики</p>
                        <p className="mt-6 text-[13px] text-white/55">
                            Услуги психолога не являются психотерапией
                            <br />
                            и медицинской помощью.
                        </p>
                    </div>

                    {/* Центральная колонка */}
                    <div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">
                            Контакты
                        </p>
                        <div className="flex flex-col gap-3">
                            <TelegramButton
                                goal={TG_GOALS.footer}
                                text={FOOTER_TG_TEXT}
                                variant="accent"
                                size="md"
                            >
                                @xenia_kamensky
                            </TelegramButton>
                            <a
                                href="https://t.me/kmensky_case"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/85 hover:text-accent-500"
                            >
                                Канал отзывов: t.me/kmensky_case
                            </a>
                            <a
                                href="mailto:hello@kamenskaya.ru"
                                className="text-white/85 hover:text-accent-500"
                            >
                                hello@kamenskaya.ru
                            </a>
                        </div>
                    </div>

                    {/* Правая колонка */}
                    <nav aria-label="Навигация в футере">
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">
                            Разделы
                        </p>
                        <ul className="flex flex-col gap-2">
                            {NAV.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-white/85 hover:text-accent-500"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Нижняя строка */}
                <div className="mt-12 border-t border-white/10 pt-6">
                    <p className="text-[13px] text-white/55">
                        ИП Каменская К. С. · ОГРНИП 323784700394015 · ИНН 781435744110
                    </p>
                    <p className="mt-2 text-[13px]">
                        <Link href="/privacy/" className="text-white/55 hover:text-accent-500">
                            Политика ПДн
                        </Link>
                        <span className="mx-2 text-white/30">·</span>
                        <Link href="/cookies/" className="text-white/55 hover:text-accent-500">
                            Cookie
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}
```

> Ссылки на юр.страницы — `/privacy/` и `/cookies/` (с trailing slash из-за `next.config.ts`). Якоря в формате `/#anchor` — закрывает аудит U3 (работают и с главной, и с юр.страниц).

- [ ] **Step 12.2: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

Браузер:
- Три колонки на `lg+`, стек на мобайле.
- Клик «@xenia_kamensky» → новая вкладка TG.
- Клик «Канал отзывов» → t.me/kmensky_case (без `?text`).
- Якорная навигация: с `/` ведёт к нужной секции; с `/privacy/` тоже работает (после Task 14).

- [ ] **Step 12.3: commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat(footer): v3 — anchor nav + TG contacts + legal links (SPEC §8)"
```

---

## Task 13 — CookieBanner + интеграция с Метрикой

**Цель:** баннер с текстом из SPEC §T5 (с правкой L1 из аудита); по «Принять» — Метрика стартует; по «Отказаться» — пишется в localStorage, скрипт не грузится.

**Files:**
- Create: `components/legal/CookieBanner.tsx`
- Modify: `app/(public)/page.tsx` (или `app/(public)/layout.tsx`, см. шаг 13.2)

- [ ] **Step 13.1: создать `components/legal/CookieBanner.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { initMetrika } from '@/lib/analytics/metrika';
import { readConsent, writeConsent } from '@/lib/analytics/consent';

export function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const decision = readConsent();
        if (decision === 'accepted') {
            initMetrika();
            return;
        }
        if (decision === null) {
            setVisible(true);
        }
        // 'declined' → ничего не делаем, баннер не показываем
    }, []);

    if (!visible) return null;

    function handleAccept() {
        writeConsent('accepted');
        setVisible(false);
        initMetrika();
    }

    function handleDecline() {
        writeConsent('declined');
        setVisible(false);
    }

    return (
        <div
            role="region"
            aria-label="Cookie-согласие"
            className="
                fixed inset-x-0 bottom-0 z-40 border-t border-neutral-100 bg-neutral-0 p-4
                shadow-[0_-8px_24px_-18px_rgba(30,30,46,0.2)]
                lg:p-6
            "
        >
            <div className="container-page flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[14px] text-neutral-700 lg:max-w-3xl">
                    Сайт использует cookie и Яндекс.Метрику для обезличенной
                    статистики посещений (IP, страницы, время визита). Оператор
                    данных — ООО «Яндекс». Срок хранения — 12 месяцев. Подробнее:{' '}
                    <Link href="/cookies/" className="underline hover:text-primary-500">
                        Политика cookie
                    </Link>
                    {' · '}
                    <Link href="/privacy/" className="underline hover:text-primary-500">
                        Политика ПДн
                    </Link>
                    .
                </p>
                <div className="flex shrink-0 gap-3">
                    <Button variant="ghost" size="md" onClick={handleDecline}>
                        Отказаться
                    </Button>
                    <Button variant="accent" size="md" onClick={handleAccept}>
                        Принять
                    </Button>
                </div>
            </div>
        </div>
    );
}
```

> `Button` должен поддерживать `onClick` без `href`. Если сейчас он рендерится только как `<a>` — расширить: при отсутствии `href` рендерить `<button type="button">`. Это та же микро-правка, что в Task 5.

- [ ] **Step 13.2: подключить баннер на главной**

Открыть `app/(public)/page.tsx`. После всех секций (внутри корневого фрагмента/тега) добавить:

```tsx
import { CookieBanner } from '@/components/legal/CookieBanner';

// …
<CookieBanner />
```

> Альтернатива — подключить в `app/(public)/layout.tsx`, чтобы баннер появлялся и на `/privacy`, `/cookies`. Рекомендация: положить в layout, чтобы пользователь, попавший сразу на юр.страницу, тоже мог дать согласие.

- [ ] **Step 13.3: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

Браузер (предварительно очистить localStorage в DevTools):
- На первый визит: баннер виден внизу страницы.
- Клик «Принять» → баннер исчезает; в Network видны запросы `mc.yandex.ru/metrika/tag.js`; `localStorage['kk.consent.v1']` содержит `{"version":1,"decision":"accepted",...}`.
- Перезагрузить страницу — баннера нет, Метрика грузится сразу.
- Сбросить localStorage, кликнуть «Отказаться» → баннер исчезает; Метрика НЕ грузится; кнопки TG продолжают работать.

- [ ] **Step 13.4: commit**

```bash
git add components/legal/CookieBanner.tsx app/(public)/layout.tsx app/(public)/page.tsx
git commit -m "feat(legal): CookieBanner with opt-in Metrika (SPEC §T5, audit L1)"
```

---

## Task 14 — Контент юр.страниц + LegalPageShell

**Цель:** подготовить тексты Политики ПДн и Политики cookie + общий shell-компонент. Тексты — заготовка под формулировки от юриста; ИП-реквизиты и переменные шаблонизатора зашиты как константы.

**Files:**
- Create: `content/legal/privacy.ts`
- Create: `content/legal/cookies.ts`
- Create: `components/legal/LegalPageShell.tsx`

- [ ] **Step 14.1: общие реквизиты**

Создать `content/legal/business.ts`:

```ts
export const BUSINESS = {
    name: 'ИП Каменская Ксения Сергеевна',
    inn: '781435744110',
    ogrnip: '323784700394015',
    email: 'hello@kamenskaya.ru',
    tg: '@xenia_kamensky',
    siteUrl: 'https://kamenskaya.ru',
} as const;
```

- [ ] **Step 14.2: `content/legal/privacy.ts`**

Структура текста как массив секций — позволяет переиспользовать рендерер.

```ts
import { BUSINESS } from '@/content/legal/business';
import { POLICY_VERSION } from '@/content/legal/policy-version';

export const privacyPolicy = {
    title: 'Политика обработки персональных данных',
    version: POLICY_VERSION,
    lastUpdated: '2026-06-03',
    intro: `Настоящая Политика определяет порядок обработки персональных данных на сайте ${BUSINESS.siteUrl}, оператором которого является ${BUSINESS.name} (ИНН ${BUSINESS.inn}, ОГРНИП ${BUSINESS.ogrnip}).`,
    sections: [
        {
            heading: '1. Какие данные обрабатываются',
            body: 'Сайт не содержит форм сбора персональных данных. Единственный источник данных о посетителях — сервис веб-аналитики Яндекс.Метрика, который собирает обезличенную информацию о визитах: IP-адрес (передаётся в Яндекс с маскированием последнего октета), страница входа и выхода, время визита, тип устройства, источник перехода, тип браузера и язык интерфейса.',
        },
        {
            heading: '2. Цели обработки',
            body: 'Данные используются для анализа поведения пользователей на сайте, улучшения структуры контента, оценки эффективности информационных материалов.',
        },
        {
            heading: '3. Кто оператор данных Яндекс.Метрики',
            body: 'Оператором обезличенных данных, собираемых Яндекс.Метрикой, является ООО «Яндекс» (юр. адрес: 119021, г. Москва, ул. Льва Толстого, д. 16). Условия обработки описаны в Пользовательском соглашении сервисов Яндекса.',
        },
        {
            heading: '4. Сроки хранения',
            body: 'Cookie-файлы хранятся в браузере пользователя 12 месяцев с момента последнего визита. Данные на стороне Яндекс.Метрики — в соответствии с политикой Яндекса.',
        },
        {
            heading: '5. Согласие и отзыв согласия',
            body: 'Скрипт Яндекс.Метрики не загружается до явного согласия пользователя в cookie-баннере. Отозвать согласие можно очисткой cookies/localStorage в браузере либо нажав «Отказаться» при повторном показе баннера.',
        },
        {
            heading: '6. Контакты',
            body: `Вопросы об обработке данных — на ${BUSINESS.email} или в Telegram ${BUSINESS.tg}.`,
        },
    ],
};

export type PrivacyPolicy = typeof privacyPolicy;
```

> Текст — заготовка. Финальные формулировки утверждает юрист. В Task 17 (QA) добавлена сверка с юристом как блокер релиза.

- [ ] **Step 14.3: `content/legal/cookies.ts`**

```ts
import { BUSINESS } from '@/content/legal/business';
import { POLICY_VERSION } from '@/content/legal/policy-version';

export const cookiesPolicy = {
    title: 'Политика использования cookie',
    version: POLICY_VERSION,
    lastUpdated: '2026-06-03',
    intro: `Сайт ${BUSINESS.siteUrl} использует cookie-файлы и связанный с ними сервис Яндекс.Метрика для обезличенной статистики посещений.`,
    sections: [
        {
            heading: '1. Что такое cookie',
            body: 'Cookie — небольшие текстовые файлы, которые сайт сохраняет в браузере пользователя. Используются для идентификации устройства между сессиями.',
        },
        {
            heading: '2. Какие cookie использует сайт',
            body: 'Сайт устанавливает cookie Яндекс.Метрики (`_ym_*`) после явного согласия пользователя. Других cookie сайт не устанавливает.',
        },
        {
            heading: '3. Цель использования',
            body: 'Сбор обезличенной статистики посещений: страницы, источники, типы устройств. Данные используются для улучшения сайта.',
        },
        {
            heading: '4. Как отказаться',
            body: 'Нажмите «Отказаться» в cookie-баннере при первом визите. Если согласие было дано ранее — очистите cookies и localStorage в настройках браузера; при следующем визите баннер появится снова.',
        },
        {
            heading: '5. Срок хранения',
            body: 'Cookie Яндекс.Метрики хранятся до 12 месяцев. Локальная отметка о согласии — также 12 месяцев, после чего баннер показывается повторно.',
        },
        {
            heading: '6. Контакты',
            body: `Вопросы — на ${BUSINESS.email} или в Telegram ${BUSINESS.tg}.`,
        },
    ],
};

export type CookiesPolicy = typeof cookiesPolicy;
```

- [ ] **Step 14.4: `components/legal/LegalPageShell.tsx`**

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type Section = { heading: string; body: string };

type LegalPageShellProps = {
    title: string;
    lastUpdated: string;
    intro: string;
    sections: Section[];
};

export function LegalPageShell({
    title,
    lastUpdated,
    intro,
    sections,
}: LegalPageShellProps) {
    return (
        <>
            <Header />
            <main className="container-page py-16 lg:py-24">
                <article className="mx-auto max-w-3xl">
                    <h1 className="text-h1 mb-4 text-neutral-900">{title}</h1>
                    <p className="mb-10 text-[13px] text-neutral-500">
                        Действует с {lastUpdated}
                    </p>
                    <p className="text-body mb-10 text-neutral-700">{intro}</p>
                    <div className="flex flex-col gap-8">
                        {sections.map((s) => (
                            <section key={s.heading}>
                                <h2 className="text-h2 mb-3 text-neutral-900">
                                    {s.heading}
                                </h2>
                                <p className="text-body text-neutral-700">{s.body}</p>
                            </section>
                        ))}
                    </div>
                </article>
            </main>
            <Footer />
        </>
    );
}
```

> Hero/секции лендинга не дёргаем — shell кладёт только Header и Footer. Header в v3 уже не имеет навигации — это безопасно для отдельной страницы (никаких якорей, ведущих в никуда).

- [ ] **Step 14.5: верификация**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 14.6: commit**

```bash
git add content/legal/business.ts content/legal/privacy.ts \
        content/legal/cookies.ts components/legal/LegalPageShell.tsx
git commit -m "feat(legal): privacy/cookies copy + LegalPageShell"
```

---

## Task 15 — Юр.страницы `/privacy` и `/cookies`

**Цель:** подключить два роута на shell + контент.

**Files:**
- Create: `app/(public)/privacy/page.tsx`
- Create: `app/(public)/cookies/page.tsx`

- [ ] **Step 15.1: `app/(public)/privacy/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { privacyPolicy } from '@/content/legal/privacy';

export const metadata: Metadata = {
    title: 'Политика обработки персональных данных · Ксения Каменская',
    robots: { index: false, follow: false },
};

export default function PrivacyPage() {
    return (
        <LegalPageShell
            title={privacyPolicy.title}
            lastUpdated={privacyPolicy.lastUpdated}
            intro={privacyPolicy.intro}
            sections={privacyPolicy.sections}
        />
    );
}
```

- [ ] **Step 15.2: `app/(public)/cookies/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { cookiesPolicy } from '@/content/legal/cookies';

export const metadata: Metadata = {
    title: 'Политика cookie · Ксения Каменская',
    robots: { index: false, follow: false },
};

export default function CookiesPage() {
    return (
        <LegalPageShell
            title={cookiesPolicy.title}
            lastUpdated={cookiesPolicy.lastUpdated}
            intro={cookiesPolicy.intro}
            sections={cookiesPolicy.sections}
        />
    );
}
```

> `robots: noindex` — юр.страницы не должны индексироваться, главная остаётся индексируемой.

- [ ] **Step 15.3: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

Браузер:
- `http://localhost:3000/privacy/` → страница с заголовком, версией, intro и 6 секциями.
- `http://localhost:3000/cookies/` — аналогично.
- Хедер с лого и кнопкой «Написать в Telegram» — есть.
- Футер с якорной навигацией: клик «Обо мне» → редирект на `/` с прокруткой к `#about`.

- [ ] **Step 15.4: commit**

```bash
git add app/\(public\)/privacy/page.tsx app/\(public\)/cookies/page.tsx
git commit -m "feat(legal): /privacy and /cookies pages"
```

---

## Task 16 — SEO: metadata + JSON-LD Person

**Цель:** закрыть аудит S2 — SEO ≥ 90 в Lighthouse.

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/seo/PersonJsonLd.tsx`
- Modify: `app/(public)/page.tsx` (вставить JSON-LD)

- [ ] **Step 16.1: расширить metadata в `app/layout.tsx`**

```ts
import type { Metadata } from 'next';

export const metadata: Metadata = {
    metadataBase: new URL('https://kamenskaya.ru'),
    title: {
        default: 'Ксения Каменская · Психолог · Женские практики',
        template: '%s · Ксения Каменская',
    },
    description:
        'Психолог, специалист по работе с телом и эмоциями. Консультации, длительное сопровождение «Путь к себе», славянская гимнастика «Сила Берегини».',
    keywords: ['психолог', 'женские практики', 'консультация психолога', 'Сила Берегини', 'СПб'],
    authors: [{ name: 'Ксения Каменская' }],
    openGraph: {
        type: 'website',
        locale: 'ru_RU',
        url: 'https://kamenskaya.ru',
        siteName: 'Ксения Каменская',
        title: 'Ксения Каменская · Психолог · Женские практики',
        description:
            'Психолог, специалист по работе с телом и эмоциями. Консультации, программа «Путь к себе», «Сила Берегини».',
        images: [
            { url: '/images/og.jpg', width: 1200, height: 630, alt: 'Ксения Каменская — психолог' },
        ],
    },
    robots: { index: true, follow: true },
};
```

> OG-картинка (`public/images/og.jpg`, 1200×630) — нужно добавить в `public/images/`. Если её нет — оставить ссылку, отдельно поставить задачу дизайнеру.

- [ ] **Step 16.2: `components/seo/PersonJsonLd.tsx`**

```tsx
import { BUSINESS } from '@/content/legal/business';

export function PersonJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ксения Каменская',
        jobTitle: 'Психолог, специалист по психосоматике и телесной терапии',
        url: BUSINESS.siteUrl,
        email: `mailto:${BUSINESS.email}`,
        sameAs: [
            'https://t.me/xenia_kamensky',
            'https://t.me/kmensky_case',
        ],
        worksFor: {
            '@type': 'Organization',
            name: BUSINESS.name,
            taxID: BUSINESS.inn,
        },
    };
    return (
        <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
```

- [ ] **Step 16.3: вставить JSON-LD в `app/(public)/page.tsx`**

В корневой контейнер страницы добавить `<PersonJsonLd />` (в самом начале или конце JSX — порядок не важен, главное что в рендер попадает).

- [ ] **Step 16.4: верификация**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

После `next export` проверить, что `out/index.html` содержит:
- `<meta name="description" ...>`
- `<meta property="og:title" ...>`
- `<script type="application/ld+json">`

- [ ] **Step 16.5: commit**

```bash
git add app/layout.tsx app/\(public\)/page.tsx components/seo/PersonJsonLd.tsx
git commit -m "feat(seo): metadata + OG + Person JSON-LD (audit S2)"
```

---

## Task 17 — Финальный QA и Lighthouse

**Цель:** убедиться, что цели спринта достигнуты, прежде чем мерджить в `main`.

**Files:** —

- [ ] **Step 17.1: полный пересборка**

```bash
rm -rf .next out
npm run build
```

Ожидается: успешный `next export`, папка `out/` содержит `index.html`, `privacy/index.html`, `cookies/index.html`.

- [ ] **Step 17.2: lint + typecheck финальный**

```bash
npx tsc --noEmit
npm run lint
```

Ожидается: zero errors, zero warnings.

- [ ] **Step 17.3: dev manual — все TG-точки**

`npm run dev`, открыть DevTools → Network. Перебрать **все** 9 точек входа:

| # | Точка | Действие | Что проверить |
|---|---|---|---|
| 1 | Header | клик «Написать в Telegram» | новая вкладка с TG, текст `Здравствуйте, Ксения! Хочу записаться...` |
| 2 | Hero | клик единственной кнопки | новая вкладка, текст про бесплатную консультацию |
| 3 | Services / consult-food-body | клик «Записаться» на первой карточке | текст про «Отношения с едой и телом» |
| 4 | Services / session | клик | текст про сессию 1:1 |
| 5 | Services / path-to-self | клик «Записаться на диагностику» | текст про «Путь к себе» |
| 6 | Services / bereginya | клик | текст про «Силу Берегини», готовность к анкете |
| 7 | Services / free-consult | клик | текст про 20 минут |
| 8 | Services banner | клик в CTA-баннере под каруселью | текст про звонок 20 минут |
| 9 | Footer | клик «@xenia_kamensky» | текст «Здравствуйте, Ксения! Пишу с сайта» |

Без согласия на cookie — все 9 кнопок работают (открывают TG), Метрика не подгружается. С согласием — в Network перед открытием TG уходит запрос `mc.yandex.ru/watch/<YM_ID>` с `goal=tg_click_*`.

- [ ] **Step 17.4: проверка консент-поведения**

| Сценарий | Ожидание |
|---|---|
| Очистить localStorage, перезагрузить | Баннер виден |
| «Принять» | Баннер скрывается, Метрика грузится, `localStorage['kk.consent.v1']` есть |
| Перезагрузить | Баннера нет, Метрика грузится |
| «Отказаться» (после очистки localStorage) | Баннер скрывается, Метрика НЕ грузится, кнопки TG работают |
| Изменить `POLICY_VERSION` в `content/legal/policy-version.ts` на 2, перезагрузить | Баннер показан снова (старое согласие невалидно) |

- [ ] **Step 17.5: мобильная проверка**

DevTools → Device toolbar → iPhone 14 Pro.
- Hero: одна кнопка не растягивается на всю ширину, портрет скрыт.
- Хедер: лого + кнопка помещаются, без бургера.
- Услуги: Embla карусель, 1 слайд.
- WorkAreas: Embla, 1 слайд.
- Cookie-баннер: закреплён внизу, текст читается.
- Футер: 3 колонки превращаются в стек.

- [ ] **Step 17.6: Lighthouse**

Открыть `npm run build && npx serve out` (или `next start`) на чистой вкладке Chrome incognito.

Запустить Lighthouse → Mobile → все категории. Целевые пороги:

| Категория | Цель | Действие при провале |
|---|---|---|
| Performance | ≥ 90 | Проверить: WebP всех картинок, отсутствие unused JS, `<link rel="preload">` для шрифтов |
| Accessibility | ≥ 95 | Проверить: aria-label на иконках, контраст |
| Best Practices | ≥ 95 | Проверить: HTTPS-only ссылки, отсутствие deprecated API |
| SEO | ≥ 90 | Проверить: meta description, h1 уникален, structured data валидна |

При недостижении — фиксить причинно, не косметически.

- [ ] **Step 17.7: проверка static export для Beget**

```bash
npx serve out -l 4000
```

Открыть `http://localhost:4000` — должна работать главная. `/privacy/` и `/cookies/` — открываются как директории. Картинки грузятся (unoptimized). Никаких `next/server` ошибок.

- [ ] **Step 17.8: финальный коммит и слияние в main**

Если все проверки прошли:

```bash
git status            # должно быть clean
git checkout main
git merge --no-ff sprint-3-foundation
```

(Слияние в main — действие, заметное для других; ждать явного OK от пользователя, не делать самостоятельно.)

---

## Open follow-ups (вне scope Sprint 3)

Следующие пункты аудита остаются на потом — фиксируются как issues после спринта, не блокеры:

- **U1** — фолбэк-канал для пользователей без Telegram. Решение Ксении: оставляем потери или добавляем `mailto:` как secondary CTA в Hero/Services.
- **U2** — «Сила Берегини»: принудительный disclaimer перед TG-кнопкой или правка `?text=` без обязательства «готова заполнить анкету».
- **A1** — отправлять `consent_decline` в Метрику с задержкой при следующем визите.
- **A2** — engagement-сигналы (scroll-depth, time on section).
- **L2** — уточнить ОКВЭД с бухгалтером (96.09 vs 86.90.19 vs 88.99).
- **scroll-margin-top** при компактном хедере (24px несостыковка после редизайна).
- **OG-картинка** `public/images/og.jpg` 1200×630 — нужен дизайн.
- **`.env.production`** на сервере Beget — заполнить `NEXT_PUBLIC_YM_ID` перед сборкой.
- **Финальный текст юр.политик** — от юриста.

---

## Self-Review

**Покрытие SPEC_v3:**

| SPEC раздел | Закрыт |
|---|---|
| Часть 0 «Удалено» | Task 1 |
| Часть 1 «TG-интеграция, утилита, карта целей» | Task 2 + Task 5 |
| Часть 1 «Два типа TG-ссылок» (после правки C2) | Task 12 (Footer) |
| Часть 1 «tg_click_footer» (после C1) | Task 2 (TG_GOALS.footer) + Task 12 |
| Часть 2 §1 «Hero одна CTA» | Task 7 |
| Часть 2 §2 «About — квалификации» | Task 11 |
| Часть 2 §3 «WorkAreas Soft Card + новые иконки» | Task 8 + Task 9 |
| Часть 2 §5 «Services — TelegramButton» | Task 8 + Task 10 |
| Часть 2 §8 «Footer v3» | Task 12 |
| Часть 3 §T1 «Header v3» | Task 6 |
| Часть 3 §T2 «Стек сокращён» | Task 1 (uninstall) |
| Часть 3 §T5 «Аналитика + cookie» (после L1) | Task 3 + Task 4 + Task 13 |
| Часть 4 «Юр.слой» | Task 14 + Task 15 |
| Часть 4 «Якоря /#anchor на юр.страницах» (U3) | Task 12 (footer ссылки уже `/#`) |
| Часть 5 «Структура проекта v3» | Task 1 + Task 14/15 (новые пути) |
| Часть 6 «План Спринта 3 — 10 задач + QA» | Полностью |
| Аудит S1 (static export) | Task 1 |
| Аудит S2 (SEO) | Task 16 |
| Аудит T1 (race) | Task 4 |
| Аудит T2 (queue) | Task 4 |
| Аудит R1–R4 (orphans) | Task 1 |

Пробелов нет. Аудит-замечания U1, U2, A1, A2, L2 явно вынесены в follow-ups.

**Placeholder scan:** проверено — конкретные файлы, конкретный код в каждом шаге, конкретные команды. Единственное место с допуском «утвердить с юристом» — текст cookie-баннера и юр.политик, что естественно для документов внешней зависимости.

**Type consistency:** `TgGoal` определён в Task 2, используется в Task 5, 8. `Service.cta.tgGoal/tgText` определён в Task 8, используется в Task 10. `WorkAreaIconName` обновлён в Task 8, потребляется в Task 9. `ConsentDecision` определён в Task 3, читается в Task 4 и Task 13. Совпадает.