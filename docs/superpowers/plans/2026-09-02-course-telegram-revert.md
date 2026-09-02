# Возврат курса на Telegram-диплинк — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Карточка курса «Три ступени к телу» на главной и кнопки на `/course` снова ведут в личный Telegram Ксении с предзаполненным текстом (как остальные CTA сайта), вместо оплаты на сайте. Полный платёжный модуль остаётся рабочим в отдельной ветке `feat/payments` на будущее.

**Архитектура:** Ветка `feat/payments` подтягивается до текущего состояния `ui-impeccable` (fast-forward), чтобы забрать туда весь платёжный код целиком. На `ui-impeccable` платёжная витрина (`BuyButton`/`CheckoutDialog`) заменяется на `TelegramButton` в трёх точках, платёжное ядро (API-роуты, `lib/payments`, SQLite, TLS-доверие) удаляется, конфиги (`next.config.ts`, `package.json`, `tsconfig.json`, `.gitignore`) и юридический контент (футер, оферта) возвращаются к досостоянию. Затем `ui-impeccable` мержится в `main`.

**Tech Stack:** Next.js 16 (App Router, `output: 'export'`), TypeScript, Tailwind. Проект без автотестов (MVP-конвенция: lint + typecheck + ручная проверка вместо unit/e2e) — верификация каждой задачи через `npm run lint` и `npx tsc --noEmit`, финальная — через `npm run build` и ручной прогон в браузере.

**Спека:** `docs/superpowers/specs/2026-09-02-course-telegram-revert-design.md`

---

### Task 1: Обновить `feat/payments` до полного состояния оплаты

**Файлы:** нет изменений кода — только git.

- [ ] **Шаг 1: Проверить, что `feat/payments` — предок `ui-impeccable`**

Run: `git merge-base --is-ancestor feat/payments ui-impeccable && echo "OK: fast-forward possible"`
Expected: `OK: fast-forward possible`

- [ ] **Шаг 2: Обновить ветку**

```bash
git branch -f feat/payments ui-impeccable
```

- [ ] **Шаг 3: Проверить результат**

Run: `git log feat/payments --oneline -3`
Expected: первая строка — `all payment scenarios are supported - the design is responsive` (текущий tip `ui-impeccable`)

Ветка не пушится и не переключается — остаёмся на `ui-impeccable`. Коммита нет: это просто перестановка указателя ветки.

---

### Task 2: Новые цели Метрики для курса в `lib/telegram.ts`

**Файлы:**
- Modify: `lib/telegram.ts`

- [ ] **Шаг 1: Добавить четыре цели в `TG_GOALS`**

Было:
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
} as const;
```

Стало:
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
} as const;
```

`courseHeader` без префикса `tg_` намеренно: кнопка в хедере ведёт на `/course/`,
а не в Телеграм — это переход по сайту, не диплинк.

- [ ] **Шаг 2: Проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок (файл пока не используется новыми полями нигде — чистое добавление)

- [ ] **Шаг 3: Commit**

```bash
git add lib/telegram.ts
git commit -m "feat(telegram): add course TG_GOALS entries"
```

---

### Task 3: Диплинк на странице `/course`

**Файлы:**
- Modify: `content/course.ts`
- Modify: `components/course/CourseHero.tsx`
- Modify: `components/course/CoursePricing.tsx`

- [ ] **Шаг 1: `content/course.ts` — убрать `productId`, добавить `price`**

Было (строки 1–2):
```ts
import type { FAQItem } from '@/content/home';
import type { ProductId } from '@/lib/payments/catalog';
```

Стало:
```ts
import type { FAQItem } from '@/content/home';
```

Было:
```ts
export const course = {
    title: 'Три ступени к телу',
    /** productId из lib/payments/catalog.ts — связь витрины с оплатой. */
    productId: 'course' as ProductId,
```

Стало:
```ts
export const course = {
    title: 'Три ступени к телу',
    price: '6 900 ₽',
```

- [ ] **Шаг 2: `content/course.ts` — переписать `hero.note`**

Было:
```ts
        note: 'Карта или СБП. Доступ в закрытый чат — сразу после оплаты.',
```

Стало:
```ts
        note: 'Оставьте заявку в Телеграм — пришлём ссылку на оплату и добавим в закрытый чат.',
```

- [ ] **Шаг 3: `content/course.ts` — переписать FAQ `payment` и `access`**

Было:
```ts
        {
            id: 'payment',
            question: 'Как проходит оплата?',
            answer: 'Банковской картой или через СБП на защищённой странице Альфа-Банка. Карточные данные на сайт не передаются и у меня не хранятся. Чек придёт на почту, которую вы укажете при оплате.',
        },
        {
            id: 'access',
            question: 'Что будет после оплаты?',
            answer: 'Я напишу вам в Телеграм в течение дня и пришлю приглашение в закрытый чат курса. Там же будут ссылки на сессии и материалы.',
        },
```

Стало:
```ts
        {
            id: 'payment',
            question: 'Как проходит оплата?',
            answer: 'Напишите в Телеграм — пришлю ссылку на оплату картой или через СБП. Чек придёт на почту, которую вы укажете при оплате.',
        },
        {
            id: 'access',
            question: 'Что будет после оплаты?',
            answer: 'Приглашение в закрытый чат курса пришлю в Телеграм в течение дня. Там же будут ссылки на сессии и материалы.',
        },
```

- [ ] **Шаг 4: `components/course/CourseHero.tsx` — заменить `BuyButton` на `TelegramButton`**

Было:
```tsx
import { BuyButton } from '@/components/payment/BuyButton';
import { CourseHeroBackground } from '@/components/course/CourseHeroBackground';
import { Button } from '@/components/ui/Button';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { course } from '@/content/course';
import { formatPrice, getProduct } from '@/lib/payments/catalog';
```

Стало:
```tsx
import { TelegramButton } from '@/components/ui/TelegramButton';
import { CourseHeroBackground } from '@/components/course/CourseHeroBackground';
import { Button } from '@/components/ui/Button';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { course } from '@/content/course';
import { TG_GOALS } from '@/lib/telegram';
```

Было:
```tsx
export function CourseHero() {
    const price = formatPrice(getProduct(course.productId).priceKopecks);
```

Стало:
```tsx
export function CourseHero() {
    const price = course.price;
```

Было:
```tsx
                            <BuyButton
                                productId={course.productId}
                                label={`Купить курс · ${price}`}
                                variant="accent"
                                size="lg"
                                className="w-full px-8 sm:w-auto"
                            />
```

Стало:
```tsx
                            <TelegramButton
                                goal={TG_GOALS.courseHero}
                                text="Здравствуйте! Интересует курс «Три ступени к телу». Расскажите, как записаться."
                                variant="accent"
                                size="lg"
                                className="w-full px-8 sm:w-auto"
                            >
                                Записаться на курс · {price}
                            </TelegramButton>
```

- [ ] **Шаг 5: `components/course/CoursePricing.tsx` — заменить `BuyButton` на `TelegramButton`**

Было:
```tsx
import { BuyButton } from '@/components/payment/BuyButton';
import { course } from '@/content/course';
import { formatPrice, getProduct } from '@/lib/payments/catalog';

export function CoursePricing() {
    const price = formatPrice(getProduct(course.productId).priceKopecks);
```

Стало:
```tsx
import { TelegramButton } from '@/components/ui/TelegramButton';
import { course } from '@/content/course';
import { TG_GOALS } from '@/lib/telegram';

export function CoursePricing() {
    const price = course.price;
```

Было:
```tsx
                    <BuyButton
                        productId={course.productId}
                        label="Купить курс"
                        variant="primary"
                        size="lg"
                        className="w-full !bg-neutral-0 !text-primary-700 hover:!bg-neutral-50"
                    />
```

Стало:
```tsx
                    <TelegramButton
                        goal={TG_GOALS.coursePricing}
                        text="Здравствуйте! Готова начать курс «Три ступени к телу». Подскажите, как оплатить."
                        variant="primary"
                        size="lg"
                        className="w-full !bg-neutral-0 !text-primary-700 hover:!bg-neutral-50"
                    >
                        Записаться на курс
                    </TelegramButton>
```

- [ ] **Шаг 6: Проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок. `lib/payments/catalog` пока ещё существует (удаляется в Task 6), поэтому
падать компиляции не на чем — эти три файла на него больше не ссылаются.

- [ ] **Шаг 7: Commit**

```bash
git add content/course.ts components/course/CourseHero.tsx components/course/CoursePricing.tsx
git commit -m "feat(course): switch /course CTAs from payment to telegram deeplink"
```

---

### Task 4: Диплинк в карточке курса на главной

**Файлы:**
- Modify: `content/home.ts`
- Modify: `components/sections/ServiceCard.tsx`

- [ ] **Шаг 1: `content/home.ts` — убрать импорт `ProductId` и union-тип `ServiceCta`**

Было (строки 1–3):
```ts
import type { TgGoal } from '@/lib/telegram';
import { TG_GOALS } from '@/lib/telegram';
import type { ProductId } from '@/lib/payments/catalog';
```

Стало:
```ts
import type { TgGoal } from '@/lib/telegram';
import { TG_GOALS } from '@/lib/telegram';
```

Было:
```ts
/**
 * Кнопка карточки: либо переписка в Телеграме, либо оплата на сайте.
 * У оплаты нет ни цены, ни текста сообщения — цена берётся из catalog.ts
 * по productId, чтобы на кнопке и в заказе не оказалось двух разных сумм.
 */
export type ServiceCta =
    | { kind: 'telegram'; label: string; tgGoal: TgGoal; tgText: string }
    | { kind: 'payment'; label: string; productId: ProductId };

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
    cta: ServiceCta;
    featured?: boolean;
    disclaimer?: string;
};
```

Стало:
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
    featured?: boolean;
    disclaimer?: string;
};
```

- [ ] **Шаг 2: `content/home.ts` — убрать `kind: 'telegram',` из шести обычных услуг**

Строка `            kind: 'telegram',` встречается ровно 6 раз (услуги
`consult-food-body`, `path-to-self`, `session`, `bereginya`, и ещё две) —
у всех одинаковый отступ в 12 пробелов. Убрать все шесть вхождений этой строки
целиком (заменить на пустую строку, т.е. удалить строку).

Run (после ручной правки — проверить, что не осталось ни одного):
`grep -n "kind: 'telegram'" content/home.ts`
Expected: пусто (0 совпадений)

- [ ] **Шаг 3: `content/home.ts` — заменить `cta` курса на диплинк, вернуть цену**

Было:
```ts
    {
        // Курс стоит вторым намеренно: на десктопе слайдер показывает три
        // карточки, и вторая оказывается по центру — там же, куда падает взгляд.
        id: 'course',
        badge: '✨ Новый курс',
        title: 'Три ступени к телу',
        subtitle: 'Групповой курс',
        description:
            'Три ступени: психокоррекция, питание и образ жизни, славянская гимнастика. Четыре недели, одна глубокая сессия в неделю. Оплата на сайте, доступ в закрытый чат сразу после оплаты.',
        // Цена не дублируется: карточка возьмёт её из catalog.ts по productId.
        prices: [],
        cta: { kind: 'payment', label: 'Купить', productId: 'course' },
        featured: true,
    },
```

Стало:
```ts
    {
        // Курс стоит вторым намеренно: на десктопе слайдер показывает три
        // карточки, и вторая оказывается по центру — там же, куда падает взгляд.
        id: 'course',
        badge: '✨ Новый курс',
        title: 'Три ступени к телу',
        subtitle: 'Групповой курс',
        description:
            'Три ступени: психокоррекция, питание и образ жизни, славянская гимнастика. Четыре недели, одна глубокая сессия в неделю. Запись — в Телеграм.',
        prices: [{ value: '6 900 ₽' }],
        cta: {
            label: 'Записаться',
            tgGoal: TG_GOALS.serviceCourse,
            tgText: 'Здравствуйте! Хочу записаться на курс «Три ступени к телу».',
        },
        featured: true,
    },
```

- [ ] **Шаг 4: `components/sections/ServiceCard.tsx` — убрать ветку оплаты**

Было:
```tsx
import Link from 'next/link';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { BuyButton } from '@/components/payment/BuyButton';
import { Badge } from '@/components/ui/Badge';
import { DisclaimerToggle } from '@/components/sections/DisclaimerToggle';
import type { Service } from '@/content/home';
import { formatPrice, getProduct } from '@/lib/payments/catalog';
import { cn } from '@/lib/cn';
```

Стало:
```tsx
import Link from 'next/link';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { Badge } from '@/components/ui/Badge';
import { DisclaimerToggle } from '@/components/sections/DisclaimerToggle';
import type { Service } from '@/content/home';
import { cn } from '@/lib/cn';
```

Было:
```tsx
    // У платной услуги prices намеренно пуст: цена приходит из каталога —
    // из того же места, откуда её берёт register.do.
    const prices =
        item.cta.kind === 'payment'
            ? [{ value: formatPrice(getProduct(item.cta.productId).priceKopecks) }]
            : item.prices;
```

Стало:
```tsx
    const prices = item.prices;
```

Было:
```tsx
            {item.cta.kind === 'payment' ? (
                <BuyButton
                    productId={item.cta.productId}
                    label={item.cta.label}
                    variant="primary"
                    size="md"
                    className={cn(
                        'relative z-10',
                        featured && '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50'
                    )}
                />
            ) : (
                <TelegramButton
                    goal={item.cta.tgGoal}
                    text={item.cta.tgText}
                    variant="primary"
                    className={cn(
                        prices.length === 0 && !item.pricingNote && 'mt-auto',
                        featured && '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50'
                    )}
                >
                    {item.cta.label}
                </TelegramButton>
            )}
```

Стало:
```tsx
            <TelegramButton
                goal={item.cta.tgGoal}
                text={item.cta.tgText}
                variant="primary"
                className={cn(
                    prices.length === 0 && !item.pricingNote && 'mt-auto',
                    featured && '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50'
                )}
            >
                {item.cta.label}
            </TelegramButton>
```

- [ ] **Шаг 5: Проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок

- [ ] **Шаг 6: Commit**

```bash
git add content/home.ts components/sections/ServiceCard.tsx
git commit -m "feat(home): switch course card CTA from payment to telegram deeplink"
```

---

### Task 5: Кнопка в хедере без `PAY_GOALS`

**Файлы:**
- Modify: `components/layout/Header.tsx`

- [ ] **Шаг 1: Заменить импорт и вызов цели**

Было:
```tsx
import { reachGoal } from '@/lib/analytics/metrika';
import { PAY_GOALS } from '@/lib/telegram';
```

Стало:
```tsx
import { reachGoal } from '@/lib/analytics/metrika';
import { TG_GOALS } from '@/lib/telegram';
```

Было:
```tsx
                        onClick={() => reachGoal(PAY_GOALS.headerClick)}
```

Стало:
```tsx
                        onClick={() => reachGoal(TG_GOALS.courseHeader)}
```

- [ ] **Шаг 2: Проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок (`PAY_GOALS` в `lib/telegram.ts` пока ещё существует, просто больше не используется здесь)

- [ ] **Шаг 3: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat(header): use TG_GOALS instead of PAY_GOALS for course link"
```

---

### Task 6: Удалить платёжное ядро, вернуть конфиги

**Файлы:**
- Delete: `lib/payments/` (`catalog.ts`, `gateway.ts`, `trust.ts`, `errors.ts`, `receipt.ts`, `orders.ts`)
- Delete: `app/api/pay/` (`create/route.ts`, `status/route.ts`, `refund/route.ts`)
- Delete: `app/(public)/payment/` (`result/page.tsx`)
- Delete: `components/payment/` (`BuyButton.tsx`, `CheckoutDialog.tsx`, `PaymentResult.tsx`)
- Delete: `instrumentation.ts`, `certs/russian-trusted-root.pem`, `scripts/diag.ts`
- Delete: `docs/payments-test-scenarios.md`, `docs/superpowers/specs/2026-08-09-payments-course-design.md`
- Modify: `lib/telegram.ts`, `next.config.ts`, `package.json`, `tsconfig.json`, `.gitignore`

- [ ] **Шаг 1: Удалить платёжные файлы**

```bash
git rm -r lib/payments app/api/pay "app/(public)/payment" components/payment
git rm instrumentation.ts scripts/diag.ts
git rm -r certs
git rm docs/payments-test-scenarios.md
git rm docs/superpowers/specs/2026-08-09-payments-course-design.md
```

- [ ] **Шаг 2: `lib/telegram.ts` — убрать `PAY_GOALS`/`PayGoal`**

Было:
```ts
export type TgGoal = (typeof TG_GOALS)[keyof typeof TG_GOALS];

/** Цели воронки оплаты: клик → отправка формы → возврат из банка. */
export const PAY_GOALS = {
    headerClick: 'pay_header_click',
    buyClick: 'pay_click',
    submit: 'pay_submit',
    success: 'pay_success',
    fail: 'pay_fail',
} as const;

export type PayGoal = (typeof PAY_GOALS)[keyof typeof PAY_GOALS];

export function tgLink(text: string): string {
```

Стало:
```ts
export type TgGoal = (typeof TG_GOALS)[keyof typeof TG_GOALS];

export function tgLink(text: string): string {
```

- [ ] **Шаг 3: `next.config.ts` — вернуть статический экспорт**

Было:
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // output: 'export' убран намеренно. Приём платежей требует серверного
    // рантайма: пароль от шлюза уходит в теле каждого запроса к register.do
    // и не должен попадать в браузер, а при статическом экспорте route handlers
    // с POST невозможны в принципе. Маркетинговые страницы Next всё равно
    // отрендерит статически при сборке — скорость не меняется.
    images: { unoptimized: true },
    // Не трогать: sitemap с этими адресами уже в индексе, смена формы URL
    // положит выдачу.
    trailingSlash: true,
};

export default nextConfig;
```

Стало:
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'export',
    images: { unoptimized: true },
    // Не трогать: sitemap с этими адресами уже в индексе, смена формы URL
    // положит выдачу.
    trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Шаг 4: `package.json` — убрать серверные требования и `diag`**

Было:
```json
{
    "name": "kk",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "engines": {
        "node": ">=22.15.0"
    },
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "images": "node scripts/optimize-images.mjs",
        "diag": "node --env-file=.env scripts/diag.ts",
        "lint": "eslint",
        "format": "prettier --write .",
        "format:check": "prettier --check ."
    },
```

Стало:
```json
{
    "name": "kk",
    "version": "0.1.0",
    "private": true,
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "images": "node scripts/optimize-images.mjs",
        "lint": "eslint",
        "format": "prettier --write .",
        "format:check": "prettier --check ."
    },
```

И в `devDependencies`:

Было: `"@types/node": "^22",`
Стало: `"@types/node": "^20",`

- [ ] **Шаг 5: `tsconfig.json` — убрать `allowImportingTsExtensions`**

Было:
```json
        "isolatedModules": true,
        "allowImportingTsExtensions": true,
        "jsx": "react-jsx",
```

Стало:
```json
        "isolatedModules": true,
        "jsx": "react-jsx",
```

- [ ] **Шаг 6: `.gitignore` — убрать блоки `/data/` и `!certs/*.pem`**

Было:
```
# production
/build

# Таблица заказов. Должна пережить деплой: при выкладке в новую директорию
# файл базы переносится руками.
/data/

# misc
.DS_Store
*.pem
# Корень УЦ Минцифры — публичный сертификат, а не секрет. Без него в репозитории
# на сервере не соберётся доверие шлюзу и платежи упадут с SELF_SIGNED_CERT_IN_CHAIN.
!certs/*.pem

# debug
```

Стало:
```
# production
/build

# misc
.DS_Store
*.pem

# debug
```

- [ ] **Шаг 7: Обновить `package-lock.json` под откаченный `@types/node`**

```bash
npm install
```

Expected: устанавливается без ошибок; в `git diff package-lock.json` меняется
только запись `@types/node` (^22 → ^20), остальные пакеты не трогаются.

- [ ] **Шаг 8: Проверить**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Expected: все три команды проходят без ошибок; `npm run build` печатает информацию
о статическом экспорте (папка `out/`), без предупреждений о route handlers.

- [ ] **Шаг 9: Commit**

```bash
git add -A
git commit -m "chore: remove payment core, revert configs to static export

Payment infrastructure (Alfa-Bank gateway, checkout, orders DB) remains
fully intact and functional on feat/payments for future use."
```

---

### Task 7: Футер и оферта — вернуть к досостоянию

**Файлы:**
- Modify: `components/layout/Footer.tsx`
- Modify: `content/legal/offer.ts`
- Modify: `content/legal/policy-version.ts`

- [ ] **Шаг 1: `components/layout/Footer.tsx` — убрать блок логотипов платёжных систем**

Было:
```tsx
                <div className="mt-12 border-t border-white/10 pt-6">
                    <p className="text-[13px] text-white/55">
                        {BUSINESS.name} · ОГРНИП {BUSINESS.ogrnip} · ИНН {BUSINESS.inn}
                    </p>
                    {/* Банк проверяет наличие принимаемых платёжных систем
                        при финальном мониторинге ресурса. Фон у PNG прозрачный,
                        и марки ложатся прямо на чёрный футер: пропадает только
                        микроподпись под значком СБП — она нечитаема в любом
                        случае, там 6 пикселей. */}
                    {/* next/image здесь ни к чему: это статичный PNG на 12 КБ
                        в самом низу страницы, и перегонять его через лоадер
                        нечего. В проекте next/image не используется вообще. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/HorizontalLogos5.png"
                        alt="Принимаем к оплате: Visa, Mastercard, МИР, СБП. Платежи защищает PayKeeper"
                        width={506}
                        height={39}
                        loading="lazy"
                        decoding="async"
                        className="mt-4 block h-[26px] w-auto max-w-full"
                    />
                    <p className="mt-2 text-[13px]">
```

Стало:
```tsx
                <div className="mt-12 border-t border-white/10 pt-6">
                    <p className="text-[13px] text-white/55">
                        {BUSINESS.name} · ОГРНИП {BUSINESS.ogrnip} · ИНН {BUSINESS.inn}
                    </p>
                    <p className="mt-2 text-[13px]">
```

Пункт «Курс» в `NAV` и класс `rounded-t-[clamp(42px,7vw,72px)]` на `<footer>` — оставить как есть, это не про оплату.

- [ ] **Шаг 2: `content/legal/offer.ts` — вернуть §2, §4, §6 к досостоянию, поднять версию**

Было:
```ts
    lastUpdated: '2026-08-09',
```

Стало:
```ts
    lastUpdated: '2026-09-02',
```

Было:
```ts
        {
            heading: '2. Как принимается оферта',
            body: 'Оферта считается принятой в момент, когда заказчик пишет в Телеграм, по электронной почте или иным способом связывается с исполнителем для записи на консультацию, а также подтверждает согласованный формат и время встречи. Акцептом оферты также является оплата услуги на сайте: отмечая согласие с условиями и нажимая кнопку оплаты, заказчик принимает настоящую оферту в полном объёме.',
        },
```

Стало:
```ts
        {
            heading: '2. Как принимается оферта',
            body: 'Оферта считается принятой в момент, когда заказчик пишет в Телеграм, по электронной почте или иным способом связывается с исполнителем для записи на консультацию, а также подтверждает согласованный формат и время встречи.',
        },
```

Было:
```ts
        {
            heading: '4. Стоимость и оплата',
            body: 'Стоимость услуг указывается на сайте или согласуется отдельно перед записью. Курс оплачивается на сайте банковской картой или через Систему быстрых платежей (СБП): платёжная страница расположена на стороне Альфа-Банка, реквизиты карты вводятся на ней и исполнителю не передаются и не хранятся. К оплате принимаются карты Visa, Mastercard и МИР, а также переводы через СБП. Услуга считается оплаченной в момент подтверждения платежа банком — этот момент и является моментом акцепта оферты. Кассовый чек направляется на адрес электронной почты, указанный заказчиком при оплате, в порядке, предусмотренном Федеральным законом № 54-ФЗ. По остальным услугам оплата производится способом, согласованным сторонами, до начала консультации либо в иной момент, если это отдельно подтверждено.',
        },
```

Стало:
```ts
        {
            heading: '4. Стоимость и оплата',
            body: 'Стоимость услуг указывается на сайте или согласуется отдельно перед записью. Оплата производится способом, согласованным сторонами, до начала консультации либо в иной момент, если это отдельно подтверждено.',
        },
```

Было:
```ts
        {
            heading: '6. Возвраты',
            body: `По программам и пакетам услуг возврат рассчитывается пропорционально непроведённым встречам. По групповому курсу: при отказе до даты старта потока возвращается полная стоимость, после старта — стоимость непроведённых сессий. Заявление на возврат направляется на ${BUSINESS.email}; исполнитель рассматривает его в течение 5 рабочих дней. Возврат производится тем же способом, которым прошла оплата: на банковскую карту либо на счёт, с которого поступил перевод по СБП; срок зачисления зависит от банка-эмитента и обычно не превышает 10 рабочих дней. Если возврат требуется по инициативе заказчика по иным услугам, стороны согласуют расчёт исходя из уже оказанных услуг.`,
        },
```

Стало:
```ts
        {
            heading: '6. Возвраты',
            body: 'По программам и пакетам услуг возврат рассчитывается пропорционально непроведённым встречам. Если возврат требуется по инициативе заказчика, стороны согласуют расчёт исходя из уже оказанных услуг.',
        },
```

- [ ] **Шаг 3: `content/legal/policy-version.ts` — поднять версию**

Было:
```ts
export const POLICY_VERSION = 3;
```

Стало:
```ts
export const POLICY_VERSION = 4;
```

- [ ] **Шаг 4: Проверить**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок

- [ ] **Шаг 5: Commit**

```bash
git add components/layout/Footer.tsx content/legal/offer.ts content/legal/policy-version.ts
git commit -m "content(legal): revert offer and footer to pre-payment wording"
```

---

### Task 8: Финальная проверка и мерж в `main`

**Файлы:** нет изменений кода.

- [ ] **Шаг 1: Полная проверка**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Expected: всё чисто, `npm run build` собирает статический экспорт в `out/`.

- [ ] **Шаг 2: Ручной прогон в браузере**

```bash
npm run dev
```

Открыть `http://localhost:3000/` и проверить:
- Карточка курса «Три ступени к телу» на слайдере услуг — кнопка «Записаться»
  открывает Telegram-диплинк с текстом «Здравствуйте! Хочу записаться на курс
  «Три ступени к телу».».
- Кнопка в хедере ведёт на `/course/`.

Открыть `http://localhost:3000/course/` и проверить:
- Кнопка в первом экране «Записаться на курс · 6 900 ₽» открывает диплинк
  «Здравствуйте! Интересует курс «Три ступени к телу». Расскажите, как
  записаться.».
- Кнопка в блоке цены «Записаться на курс» открывает диплинк «Здравствуйте!
  Готова начать курс «Три ступени к телу». Подскажите, как оплатить.».
- Футер — без логотипов платёжных систем.
- `/offer/` — раздел «4. Стоимость и оплата» без упоминания банка/карт/СБП.

Остановить dev-сервер (`Ctrl+C`).

- [ ] **Шаг 3: Смёржить `ui-impeccable` в `main`**

```bash
git checkout main
git merge ui-impeccable
git checkout ui-impeccable
```

- [ ] **Шаг 4: Проверить итоговое состояние веток**

Run: `git log main --oneline -3 && echo --- && git log feat/payments --oneline -3`
Expected: `main` заканчивается коммитом Task 7 (`content(legal): revert offer...`);
`feat/payments` заканчивается коммитом `all payment scenarios are supported...`
(история из Task 1, оплата там цела).

Пуш в `origin` — по отдельному запросу, не автоматически.
