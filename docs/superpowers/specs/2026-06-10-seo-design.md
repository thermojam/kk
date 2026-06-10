# Дизайн: полноценная индексация (SEO для лендинга)

**Дата:** 2026-06-10
**Статус:** утверждён к имплементации
**Связано:** базовый стек метаданных в `app/layout.tsx`, текущий `components/seo/PersonJsonLd.tsx`

## Контекст

Лендинг психолога Ксении Каменской (Next.js 16, `output: 'export'`, прод-домен `https://ksenia-kamenskaya.ru`, email остаётся `hello@kamenskaya.ru` — намеренно, см. `2026-06-08-site-domain-update-design.md`). Уже есть базовые `Metadata` в `app/layout.tsx` (title/description/keywords/OG/Twitter, `metadataBase` корректный), JSON-LD Person на главной (использует `BUSINESS.siteUrl`), корректный `robots: { index: false }` на юр.страницах.

**Пробелы, мешающие полноценной индексации:**

| Пробел | Влияние |
|---|---|
| Нет `robots.txt` | Поисковики идут «по умолчанию», нет явного указания на sitemap |
| Нет `sitemap.xml` | Краулинг медленнее, обновления видны позднее |
| Нет canonical URL | Дубли при разных query/слэшах |
| Нет verification-метатегов | Невозможно подтвердить владение в Webmaster/Search Console |
| JSON-LD Person минимален | Карточка эксперта в выдаче неполная (нет image/knowsAbout/areaServed) |
| Нет FAQPage-схемы | Упущенный rich snippet, хотя FAQ-секция на лендинге уже есть |
| OG-картинка 960×1280 (вертикаль) | Соц.сети обрезают; ожидаемый формат — 1200×630 |

## Решения (зафиксировано в брейншторме)

| Вопрос | Решение |
|---|---|
| Поисковые системы | Яндекс + Google |
| Verification meta | Через `.env`: `NEXT_PUBLIC_YANDEX_VERIFICATION`, `NEXT_PUBLIC_GOOGLE_VERIFICATION`. Пустой ENV → meta не рендерится. |
| OG-картинка | Генерируем `og-cover.webp` 1200×630 из `about.webp` через `sharp` (`fit: 'cover'`, `position: 'attention'` — лицо в центре). Плюс `og-cover.jpg` как fallback для парсеров без webp. |
| JSON-LD объём | Person (расширенный) + FAQPage. Без Service/Breadcrumb. |

## Архитектура

Используем нативный Next.js Metadata API: `app/robots.ts` и `app/sitemap.ts` при `output: 'export'` генерируют статические `robots.txt` и `sitemap.xml` в `out/`. Никаких сторонних библиотек.

JSON-LD остаётся как пара изолированных компонентов в `components/seo/`. Person и FAQPage — независимые единицы с одной ответственностью каждая, оба рендерятся в `app/(public)/page.tsx`.

## Изменения по файлам

### Новые файлы

#### `app/robots.ts`

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/cookies/', '/privacy/', '/offer/'],
        },
        sitemap: 'https://ksenia-kamenskaya.ru/sitemap.xml',
        host: 'https://ksenia-kamenskaya.ru',
    };
}
```

Юр.страницы запрещены и в robots.txt, и через meta `robots: { index: false }` — defence-in-depth.

#### `app/sitemap.ts`

```ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://ksenia-kamenskaya.ru/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
    ];
}
```

Юр.страницы в sitemap не включаем — они noindex.

#### `components/seo/FaqJsonLd.tsx`

```tsx
import { faq } from '@/content/home';

export function FaqJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
```

`FAQItem` в `content/home.ts:41-45` имеет ровно поля `question: string` и `answer: string` — маппинг 1-в-1 без адаптаций.

### Правки существующих

#### `app/layout.tsx` — расширить `metadata`

В существующий объект `Metadata` добавить:

```ts
alternates: {
    canonical: '/',
},
verification: {
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
},
```

Заменить `openGraph.images` и `twitter.images` на ассет 1200×630:

```ts
openGraph: {
    ...
    images: [
        {
            url: '/images/og-cover.webp',
            width: 1200,
            height: 630,
            alt: 'Ксения Каменская — психолог',
        },
    ],
},
twitter: {
    ...
    images: ['/images/og-cover.webp'],
},
```

Если `process.env.NEXT_PUBLIC_YANDEX_VERIFICATION` или `..._GOOGLE_VERIFICATION` — `undefined`, Next.js не рендерит соответствующий meta-тег. Это требуемое поведение.

#### `app/(public)/cookies/page.tsx`, `.../privacy/page.tsx`, `.../offer/page.tsx`

Добавить в каждый `metadata`:

```ts
alternates: { canonical: '/cookies/' },  // соответствующий slug
```

`robots: { index: false, follow: false }` оставляем без изменений.

#### `app/(public)/page.tsx`

Добавить `<FaqJsonLd />` рядом с `<PersonJsonLd />`:

```tsx
<>
    <PersonJsonLd />
    <FaqJsonLd />
    <Hero />
    ...
</>
```

#### `components/seo/PersonJsonLd.tsx`

Расширить `data`:

```ts
const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ксения Каменская',
    jobTitle: 'Психолог, специалист по психосоматике и телесной терапии',
    description: 'Психолог. Консультации, длительное сопровождение «Путь к себе», славянская гимнастика «Сила Берегини».',
    image: `${BUSINESS.siteUrl}/images/about.webp`,
    url: BUSINESS.siteUrl,
    email: `mailto:${BUSINESS.email}`,
    knowsAbout: ['Психология', 'Психосоматика', 'Телесная терапия', 'Женские практики'],
    areaServed: {
        '@type': 'Country',
        name: 'Россия',
    },
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
```

`BUSINESS.siteUrl` в `content/legal/business.ts:7` уже содержит протокол `https://ksenia-kamenskaya.ru` — склейка через template-literal даёт корректный абсолютный URL `https://ksenia-kamenskaya.ru/images/about.webp`.

#### `scripts/optimize-images.mjs`

Добавить пайплайн генерации OG-картинки в существующий скрипт. Источник — `public/images/about.webp` (или его несжатый исходник, если есть). Цель — два файла в `public/images/`:

- `og-cover.webp`: 1200×630, fit: cover, position: attention, quality ~80
- `og-cover.jpg`: 1200×630, аналогично, quality ~82, для парсеров, не понимающих webp (некоторые версии VK/WhatsApp превью)

Псевдокод:

```js
await sharp(srcAbout)
    .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 80 })
    .toFile('public/images/og-cover.webp');

await sharp(srcAbout)
    .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile('public/images/og-cover.jpg');
```

Скрипт остаётся идемпотентным.

#### `.env.example`

Добавить две строки внизу:

```
# Yandex Webmaster site verification code (meta-tag method).
# Get from https://webmaster.yandex.ru → Settings → Confirm rights.
NEXT_PUBLIC_YANDEX_VERIFICATION=

# Google Search Console site verification code (HTML tag method).
# Get from https://search.google.com/search-console → Settings → Ownership verification.
NEXT_PUBLIC_GOOGLE_VERIFICATION=
```

`.env.production` не трогаем в этом спринте — пользователь дозаполнит сам после получения кодов из кабинетов.

## Что НЕ меняется

- `lib/analytics/*` — вне скоупа.
- `components/legal/*` — вне скоупа.
- Содержание секций (Hero, Cases, Services и т.д.) — не трогаем.
- Производительность (LCP/CLS/TTFB) — отдельный спринт `cleanup-perf`, уже отработан.
- Hreflang, AMP, Breadcrumb JSON-LD, Service JSON-LD — out-of-scope (только Person + FAQPage).

## Manual verification

1. `npm run lint && npx tsc --noEmit` — без ошибок.
2. `npm run images` — в `public/images/` появились `og-cover.webp` и `og-cover.jpg`, оба 1200×630, размер ~30–80 КБ.
3. `npm run build` — сборка проходит. В `out/` появились `robots.txt` и `sitemap.xml`.
4. Запуск локально (`npx serve out`) и проверки через `curl`:
   - `curl localhost:<port>/robots.txt` — корректный текст с `User-agent: *`, `Allow: /`, `Disallow: /cookies/`, `/privacy/`, `/offer/`, `Sitemap: https://ksenia-kamenskaya.ru/sitemap.xml`.
   - `curl localhost:<port>/sitemap.xml` — валидный XML с `<loc>https://ksenia-kamenskaya.ru/</loc>`.
   - `curl localhost:<port>/` | grep на:
     - `<link rel="canonical" href="https://ksenia-kamenskaya.ru">`
     - два `<script type="application/ld+json">` (Person + FAQPage)
     - `<meta property="og:image" content=".../og-cover.webp"`
     - **без** env: `<meta name="yandex-verification"` отсутствует
     - **с** env (тест-значение в `.env.local`): meta появляется
   - `curl localhost:<port>/cookies/` | grep `<link rel="canonical" href="https://ksenia-kamenskaya.ru/cookies"` + `<meta name="robots" content="noindex,nofollow">` (оба должны присутствовать).
5. После деплоя:
   - https://webmaster.yandex.ru/tools/microtest/ → структура Person и FAQPage валидна.
   - https://search.google.com/test/rich-results → FAQPage даёт preview с раскрытыми вопросами.

## Follow-up (out-of-scope)

- Подключение `ksenia-kamenskaya.ru` в Яндекс.Вебмастер и Google Search Console через полученные verification-коды.
- Подача `sitemap.xml` в кабинеты для ускорения обхода.
- Мониторинг позиций по ключевым запросам через 2–4 недели.
- При появлении новых страниц (например, отдельный блог) — расширить `sitemap.ts`.
