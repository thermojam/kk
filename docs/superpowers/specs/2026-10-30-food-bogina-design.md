# Food Bogina: подготовка почвы для программной страницы + страница-заглушка

## Контекст

Проект уже умеет строить «программные» страницы — страница `/course/` собрана из:
- `content/course.ts` — типизированный контент (hero, personas, sessions, pricing, faq);
- `components/course/*` — секции, специфичные для курса;
- общих примитивов (`FAQ`, `ContactCtaBanner`, `TelegramButton`, `Button`, `ResponsiveImage`);
- целей Метрики в `lib/telegram.ts` (`TG_GOALS`);
- ручной записи в `app/sitemap.ts`.

Планируется вторая программа — «Фуд Богиня». Контента по ней пока нет, есть только название. Нужно:
1. Завести живую страницу-заглушку `/food-bogina/` с предзаписью через Telegram.
2. Подготовить код так, чтобы вторая программная страница не требовала копирования хардкода первой.

Явный выбор архитектуры (из обсуждения): **точечная починка существующих связей + пометка на будущее**, без построения общего «движка программных страниц» — это было бы абстракцией под гипотетические требования, пока у Food Bogina нет реального контента, по которому можно проверить, какая форма общих компонентов верна.

## Что фиксируем сейчас

- URL: `/food-bogina/`.
- CTA-механизм: Telegram deep-link (`TelegramButton` + `TG_GOALS`), как везде на сайте — сайт полностью статический (`output: 'export'`), форм/API-роутов нет и не будет.
- Видимость: карточка на главной в карусели услуг (`content/home.ts` → `services`), клик по карточке ведёт на `/food-bogina/`. В sitemap страница есть, из хедера отдельной ссылки нет (как у остальных страниц — хедер ведёт только на `/course/`).
- Визуальный стиль заглушки: тёмный hero сразу, как у `course/`/главной — без портрета (нет фото под программу), с декоративным фоном (блобы), который уже есть у `CourseHeroBackground`.
- Контент заглушки — минимальный: заголовок, одна строка-заметка, одна кнопка Telegram. Полный контент (personas/sessions/pricing/faq) добавится позже по образцу `content/course.ts`, без переделки того, что делаем сейчас.

## Точечные правки существующего кода

Эти три места — единственная реальная связанность между «программными» страницами в текущем коде. Их нужно обобщить один раз, остальное не трогаем.

### `components/layout/Header.tsx`

Сейчас:
```ts
const onCourse = pathname === '/course/';
const darkFirstScreen = pathname === '/' || onCourse;
...
{!onCourse && <Button href="/course/" ... />}
```
Хардкод одного пути заменяется на список программных путей:
```ts
const PROGRAM_PATHS = ['/course/', '/food-bogina/'];
const onProgramPage = PROGRAM_PATHS.includes(pathname);
const darkFirstScreen = pathname === '/' || onProgramPage;
...
{!onProgramPage && <Button href="/course/" ... />}
```
Список можно держать прямо в `Header.tsx` (используется только там) или вынести в `lib/constants.ts`, если удобнее для последующих правок — решаем на месте при реализации, значимой разницы нет.

### `components/sections/ServiceCard.tsx`

Сейчас:
```ts
const href = item.id === 'course' ? '/course' : undefined;
```
Условие по конкретному `id` убирается, карточка читает ссылку из контента:
```ts
const href = item.href;
```
Тип `Service` в `content/home.ts` получает новое опциональное поле:
```ts
export type Service = {
    ...
    href?: string;
};
```
Поведение не меняется: если `href` задан — вся карточка оборачивается в `Link`, кнопка CTA поверх неё остаётся обычным `TelegramButton` (как сейчас у курса — двойное действие: клик по карточке ведёт на страницу, клик по кнопке — прямой диплинк в Telegram с её собственным текстом/целью).

### `components/course/CourseHeroBackground.tsx` → `components/ui/DarkHeroBackground.tsx`

Компонент — только декоративные блюр-блобы, без картинок и логики, специфичной для курса. Используется двумя тёмными hero (курс и food-bogina), поэтому переезжает туда, где лежат остальные переиспользуемые визуальные примитивы (`Badge`, `Button` и т.п.). Имя и код не меняются, кроме пути; импорт в `CourseHero.tsx` обновляется.

## Новые файлы

### `content/food-bogina.ts`

```ts
import { TG_GOALS } from '@/lib/telegram';

export const foodBogina = {
    title: 'Фуд Богиня',
    hero: {
        lead: 'Новая программа готовится.',
        note: 'Оставьте заявку в Телеграм — напишем первой, когда откроется запись.',
    },
    cta: {
        label: 'Хочу узнать первой',
        tgGoal: TG_GOALS.foodBoginaHero,
        tgText: 'Здравствуйте! Хочу узнать первой, когда откроется запись на «Фуд Богиню».',
    },
};
```
Точная копия не нужна — это сознательно маленький объект. Когда появится реальный контент, структура дополняется по образцу `content/course.ts` (personas/sessions/nutrition/pricing/faq), а не переписывается с нуля.

### `components/food-bogina/FoodBoginaHero.tsx`

Тёмный hero без портретной колонки: `DarkHeroBackground` на фоне, заголовок `foodBogina.title`, `hero.lead`, `hero.note`, одна `TelegramButton` с `cta.tgGoal`/`cta.tgText`. Структурно — упрощённая версия `CourseHero.tsx` без правой колонки с изображением.

### `app/(public)/food-bogina/page.tsx`

```tsx
export const metadata: Metadata = {
    title: foodBogina.title,
    description: '…',
    alternates: { canonical: '/food-bogina/' },
    openGraph: { ... },
};

export default function FoodBoginaPage() {
    return <FoodBoginaHero />;
}
```
Одна секция — это и есть вся страница-заглушка.

## Правки данных

**`lib/telegram.ts` → `TG_GOALS`**: добавить
```ts
foodBoginaCard: 'tg_click_food_bogina_card',
foodBoginaHero: 'tg_click_food_bogina_hero',
```

**`content/home.ts` → `services`**: новая карточка (без цен, `pricingNote` не нужен):
```ts
{
    id: 'food-bogina',
    badge: '✨ Скоро открытие',
    title: 'Фуд Богиня',
    subtitle: 'Предзапись',
    description: 'Новая программа готовится. Оставьте заявку — напишем первой, когда откроется запись.',
    prices: [],
    href: '/food-bogina',
    cta: {
        label: 'Узнать первой',
        tgGoal: TG_GOALS.foodBoginaCard,
        tgText: 'Здравствуйте! Хочу узнать первой, когда откроется запись на «Фуд Богиню».',
    },
},
```
Позиция в массиве — после карточки курса; `featured` не ставим, чтобы не конкурировать визуально с курсом.

**`app/sitemap.ts`**: добавить запись
```ts
{
    url: 'https://ksenia-kamenskaya.ru/food-bogina/',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
},
```

## Вне кода

Обе новые цели (`tg_click_food_bogina_card`, `tg_click_food_bogina_hero`) нужно завести в самой Яндекс.Метрике — ручной шаг на стороне пользователя, как указано в CLAUDE.md для каждой новой CTA-кнопки в Telegram.

## Проверка

Автотестов в проекте нет. Проверка:
- `npx tsc --noEmit` — типы (`Service.href`, новый контент) собираются без ошибок.
- `npm run lint`.
- `npm run build` — страница экспортируется статически, не ломает `output: 'export'`.
- Ручной просмотр в браузере (`npm run dev`): главная → карточка «Фуд Богиня» → переход на `/food-bogina/` → тёмный hero → кнопка открывает Telegram с нужным текстом; хедер на `/course/` и `/food-bogina/` ведёт себя одинаково (тёмный, без общей кнопки «Записаться»).

## Явно не делаем

- Не строим общий `components/program/*` слой и общий тип контента программной страницы — решение отложено до появления реального контента Food Bogina, который покажет, что действительно общее.
- Не рефакторим `course/*` под какую-либо новую абстракцию.
- Не добавляем форму/виджет стороннего сервиса — CTA остаётся Telegram-диплинком.
- Не добавляем ссылку на `/food-bogina/` в хедер.
