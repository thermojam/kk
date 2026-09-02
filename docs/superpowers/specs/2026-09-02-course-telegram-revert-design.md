# Дизайн: возврат курса «Три ступени к телу» на Telegram-диплинк

**Дата:** 2026-09-02
**Ветка:** `ui-impeccable` → `main`
**Связано:** `2026-08-09-payments-course-design.md` (остаётся только в `feat/payments`),
`2026-06-05-telegram-cta-deeplinks-design.md`

## Контекст

На `ui-impeccable` реализован полный приём онлайн-оплаты через Альфа-Банк
(см. `2026-08-09-payments-course-design.md`) — API-роуты, SQLite заказов,
TLS-доверие, `CheckoutDialog`. Оплата пока не идёт в прод: банковские блокеры
(онлайн-касса, чек-лист на боевом домене) не закрыты.

Прямо сейчас сайту нужна не оплата, а прежний паттерн: карточка курса на
главной и кнопки на `/course` ведут в личный Telegram Ксении с предзаполненным
текстом, как остальные семь CTA сайта. Эксперт присылает ссылку на оплату
вручную после заявки в переписке.

Платёжный модуль не выбрасывается — он остаётся полностью рабочим в отдельной
ветке `feat/payments` на перспективу (когда банковские блокеры закроются).

## Ветки

`feat/payments` сейчас отстаёт от `ui-impeccable` (не содержит коммит
`all payment scenarios are supported`). Перед откатом она обновляется
до полного состояния оплаты: `git merge ui-impeccable` (fast-forward).
После этого `feat/payments` не трогается — резерв на будущее.

На `ui-impeccable` откат оплаты делается новыми коммитами поверх текущего
состояния (не через `git reset`/`revert` — там вперемешку и полезные UI-правки,
которые нужно сохранить). После отката `ui-impeccable` мержится в `main`,
и `main` становится основной публичной веткой.

## Платёжное ядро — удалить из публичной ветки

Файлы:
- `lib/payments/` целиком (`catalog.ts`, `gateway.ts`, `trust.ts`, `errors.ts`, `receipt.ts`, `orders.ts`)
- `app/api/pay/` целиком (`create`, `status`, `refund`)
- `app/(public)/payment/` целиком (`result/page.tsx`)
- `components/payment/` целиком (`BuyButton.tsx`, `CheckoutDialog.tsx`, `PaymentResult.tsx`)
- `instrumentation.ts`, `certs/russian-trusted-root.pem`, `scripts/diag.ts`
- `docs/payments-test-scenarios.md`
- `docs/superpowers/specs/2026-08-09-payments-course-design.md` (остаётся только в `feat/payments`)

`components/icons/CourseStepIcons.tsx` — **не трогать**: иконки трёх ступеней
курса, к оплате отношения не имеют.

Конфиги — вернуть к досостоянию:
- `next.config.ts`: восстановить `output: 'export'`, убрать комментарий про
  серверный рантайм — маркетинговые страницы снова статический экспорт,
  без POST route handlers.
- `package.json`: убрать `"type": "module"`, `engines.node >= 22.15`, скрипт
  `diag`.
- `.gitignore`: убрать `/data/` и `!certs/*.pem`.
- `tsconfig.json`: убрать `allowImportingTsExtensions`, если добавлен только
  под `scripts/diag.ts` — проверить при реализации.

## Переключение CTA на диплинк

`lib/telegram.ts`: убрать `PAY_GOALS`/`PayGoal`. Добавить в `TG_GOALS`:

```ts
serviceCourse: 'tg_click_service_course',   // карточка курса на главной
courseHero: 'tg_click_course_hero',         // первый экран /course
coursePricing: 'tg_click_course_pricing',   // блок цены /course
courseHeader: 'course_header_click',        // кнопка в хедере — переход на /course, не в Телеграм
```

### Карта CTA курса

| Точка | Label | Текст диплинка |
|---|---|---|
| Карточка на главной (`ServiceCard`) | «Записаться» | «Здравствуйте! Хочу записаться на курс «Три ступени к телу».» |
| `CourseHero` (первый экран /course) | «Записаться на курс · 6 900 ₽» | «Здравствуйте! Интересует курс «Три ступени к телу». Расскажите, как записаться.» |
| `CoursePricing` (блок цены /course) | «Записаться на курс» | «Здравствуйте! Готова начать курс «Три ступени к телу». Подскажите, как оплатить.» |

Слово «Купить» убирается везде — оплата больше не на сайте.

### Изменения по файлам

**`content/home.ts`** — услуга `course`: `cta: { kind: 'payment', ... }` →
`{ kind: 'telegram', label: 'Записаться', tgGoal: TG_GOALS.serviceCourse, tgText: '...' }`
(текст из таблицы); `prices: []` → `prices: [{ value: '6 900 ₽' }]`; из описания
убрать «Оплата на сайте, доступ в закрытый чат сразу после оплаты» — заменить
на нейтральную формулировку без упоминания сайта.

**`components/sections/ServiceCard.tsx`** — убрать импорт `BuyButton` и ветку
`cta.kind === 'payment'`, убрать импорт `formatPrice/getProduct`. `ServiceCta`
в `content/home.ts` перестаёт быть union — возвращается к простому типу,
как было до оплаты.

**`components/course/CourseHero.tsx`**, **`components/course/CoursePricing.tsx`**
— заменить `BuyButton` на `TelegramButton` (goal и текст из таблицы). Цена —
из нового поля `content/course.ts: price: '6 900 ₽'` вместо
`formatPrice(getProduct(...))`.

**`components/layout/Header.tsx`** — заменить `PAY_GOALS.headerClick` на
`TG_GOALS.courseHeader`; кнопка остаётся обычной ссылкой на `/course/`.

**`content/course.ts`** — убрать `productId`/импорт `ProductId` из
`lib/payments/catalog`, добавить `price: '6 900 ₽'`. Переписать:
- `hero.note`: «Карта или СБП. Доступ в закрытый чат — сразу после оплаты.» →
  «Оставьте заявку в Телеграм — пришлём ссылку на оплату и добавим в закрытый чат.»
- FAQ `payment` и `access` — переписать под ручную оплату по ссылке от Ксении
  в Телеграме, а не через сайт.

## Футер и оферта — вернуть к досостоянию

`main` уже содержит нужный текст (диф `main..ui-impeccable` показывает, что
платёжные правки в `Footer.tsx` и `content/legal/offer.ts` — чистые добавления
поверх состояния `main`). Тактика: взять `Footer.tsx` и `content/legal/offer.ts`
из `main`, затем вручную вернуть в `Footer.tsx` два изменения, не связанных
с оплатой: пункт «Курс» в `NAV` и класс
`rounded-t-[clamp(42px,7vw,72px)]`.

Из футера уходит блок с логотипами платёжных систем
(`HorizontalLogos5.png`). Реквизиты ИП (`BUSINESS.name` · ОГРНИП · ИНН)
**остаются** — они были в футере и до оплаты, это не банковское требование.

Оферта возвращается к досостоянию по §2 (без фразы про акцепт оплатой на
сайте), §4 (без карты/СБП/Альфа-Банка), §6 (без спецклаузулы возврата для
курса). `POLICY_VERSION` → `4`, `lastUpdated` → `2026-09-02` — текст
меняется, значит версия растёт и баннер cookie/политик покажется повторно.

## Проверка

1. `npm run lint` и `npx tsc --noEmit` — чисто, никаких висячих импортов на
   удалённые модули.
2. `npm run build` — снова со статическим экспортом (`output: 'export'`),
   без API-роутов.
3. Глазами: карточка курса на главной ведёт в Telegram с текстом из таблицы;
   `/course` — обе кнопки стали Telegram-диплинками с текстом из таблицы;
   кнопка в хедере ведёт на `/course`.
4. `feat/payments` не изменилась в части оплаты — там всё как в `ui-impeccable`
   до отката.
