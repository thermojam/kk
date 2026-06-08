# Yandex Metrika Activation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Активировать уже подключённый счётчик Яндекс.Метрики `109730343` на проде, включить Webvisor и синхронизировать юридические страницы — без поломки текущего opt-in потока.

**Architecture:** Интеграция ЯМ уже реализована (`lib/analytics/metrika.ts` + `consent.ts` + `CookieBanner.tsx`). План делает три минимальных изменения: (а) переключает `webvisor: false → true`, (б) дополняет privacy/cookies упоминанием Webvisor + bump `POLICY_VERSION 1 → 2` (заставит баннер пере-запросить согласие у всех, кто принял v1), (в) даёт `next build` доступ к `NEXT_PUBLIC_YM_ID=109730343` через закоммиченный `.env.production`.

**Tech Stack:** Next.js 16 (App Router, `output: 'export'`), TypeScript, Yandex Metrika tag.js. Без автотестов в MVP — проверка через `eslint` + `tsc --noEmit` + ручной smoke в браузере.

**Spec:** `docs/superpowers/specs/2026-06-08-yandex-metrika-design.md`

---

## File Map

**Группа A — Webvisor + политики (один логический коммит):**
- Modify `lib/analytics/metrika.ts` — `webvisor: false → true`, убрать комментарий аудита A3
- Modify `content/legal/privacy.ts` — пункт 1: добавить упоминание Webvisor; `lastUpdated`
- Modify `content/legal/cookies.ts` — пункт 2: добавить упоминание Webvisor; `lastUpdated`
- Modify `content/legal/policy-version.ts` — `POLICY_VERSION 1 → 2`

**Группа B — прод-ID (отдельный коммит):**
- Modify `.gitignore` — исключение `!.env.production`
- Create `.env.production` — `NEXT_PUBLIC_YM_ID=109730343`
- Modify `.env.example` — комментарий со ссылкой на прод-значение

**Группа C — ручная верификация (без коммита):**
- `npm run build && npm start` → smoke в браузере по чек-листу из spec'а

---

## Task 1: Включить Webvisor в Метрике

**Files:**
- Modify: `lib/analytics/metrika.ts:46-53`

- [ ] **Step 1: Open file and locate init-объект**

Текущий код в `lib/analytics/metrika.ts:46-53`:

```ts
    window.ym?.(YM_ID, 'init', {
        ssr: false,
        webvisor: false, // явно отключено (см. аудит A3)
        clickmap: true,
        ecommerce: false,
        accurateTrackBounce: true,
        trackLinks: true,
    });
```

- [ ] **Step 2: Заменить блок целиком на**

```ts
    window.ym?.(YM_ID, 'init', {
        ssr: false,
        webvisor: true,
        clickmap: true,
        ecommerce: false,
        accurateTrackBounce: true,
        trackLinks: true,
    });
```

Изменения: `webvisor: false → true`; убран инлайн-комментарий про аудит A3 (решение пересмотрено).

- [ ] **Step 3: Запустить typecheck**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

---

## Task 2: Обновить политику ПДн (privacy.ts)

**Files:**
- Modify: `content/legal/privacy.ts:5,11-13`

- [ ] **Step 1: Обновить `lastUpdated`**

Найти строку 5:

```ts
    lastUpdated: '2026-06-03',
```

Заменить на:

```ts
    lastUpdated: '2026-06-08',
```

- [ ] **Step 2: Расширить body пункта 1**

Найти секцию пункта 1 (строки 11-13):

```ts
        {
            heading: '1. Какие данные обрабатываются',
            body: 'Сайт не содержит форм сбора персональных данных. Единственный источник данных о посетителях — сервис веб-аналитики Яндекс.Метрика, который собирает обезличенную информацию о визитах: IP-адрес (передаётся в Яндекс с маскированием последнего октета), страница входа и выхода, время визита, тип устройства, источник перехода, тип браузера и язык интерфейса.',
        },
```

Заменить body целиком на:

```ts
        {
            heading: '1. Какие данные обрабатываются',
            body: 'Сайт не содержит форм сбора персональных данных. Единственный источник данных о посетителях — сервис веб-аналитики Яндекс.Метрика, который собирает обезличенную информацию о визитах: IP-адрес (передаётся в Яндекс с маскированием последнего октета), страница входа и выхода, время визита, тип устройства, источник перехода, тип браузера и язык интерфейса. Дополнительно через сервис Webvisor Яндекс.Метрики фиксируются обезличенные действия пользователя на странице: движение курсора, прокрутка, клики по элементам. Ввод текста в поля форм не записывается — поля автоматически маскируются Метрикой.',
        },
```

- [ ] **Step 3: Запустить typecheck**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

---

## Task 3: Обновить политику куки (cookies.ts)

**Files:**
- Modify: `content/legal/cookies.ts:5,14-17`

- [ ] **Step 1: Обновить `lastUpdated`**

Найти строку 5:

```ts
    lastUpdated: '2026-06-03',
```

Заменить на:

```ts
    lastUpdated: '2026-06-08',
```

- [ ] **Step 2: Расширить body пункта 2**

Найти секцию пункта 2 (строки 14-17):

```ts
        {
            heading: '2. Какие куки использует сайт',
            body: 'Сайт устанавливает куки Яндекс.Метрики (`_ym_*`) после явного согласия пользователя. Других куки сайт не устанавливает.',
        },
```

Заменить body целиком на:

```ts
        {
            heading: '2. Какие куки использует сайт',
            body: 'Сайт устанавливает куки Яндекс.Метрики (`_ym_*`) после явного согласия пользователя. Помимо счётчика страниц, Яндекс.Метрика записывает обезличенные действия на странице (курсор, прокрутку, клики) через сервис Webvisor; ввод в поля форм не записывается. Других куки сайт не устанавливает.',
        },
```

- [ ] **Step 3: Запустить typecheck**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

---

## Task 4: Поднять POLICY_VERSION

**Files:**
- Modify: `content/legal/policy-version.ts:3`

- [ ] **Step 1: Изменить значение константы**

Текущий код:

```ts
/** Версия политик. Инкремент → cookie-баннер показывается повторно. */
export const POLICY_VERSION = 1;
```

Заменить на:

```ts
/** Версия политик. Инкремент → cookie-баннер показывается повторно. */
export const POLICY_VERSION = 2;
```

- [ ] **Step 2: Запустить typecheck**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

---

## Task 5: Lint и коммит группы A

- [ ] **Step 1: Запустить полную проверку**

Run: `npm run lint && npx tsc --noEmit`
Expected: 0 ошибок, 0 ворнингов от ESLint. Если есть существующие ворнинги в репозитории — допустимо, главное чтобы не появилось новых от изменённых файлов.

- [ ] **Step 2: Просмотр диффа**

Run: `git diff --stat`
Expected: ровно 4 изменённых файла:
```
 content/legal/cookies.ts        | 2 +-
 content/legal/policy-version.ts | 2 +-
 content/legal/privacy.ts        | 4 ++--
 lib/analytics/metrika.ts        | 2 +-
```
(Точные числа строк могут отличаться.)

- [ ] **Step 3: Stage и commit**

```bash
git add lib/analytics/metrika.ts content/legal/privacy.ts content/legal/cookies.ts content/legal/policy-version.ts
git commit -m "$(cat <<'EOF'
feat(analytics): включить Webvisor + bump POLICY_VERSION → 2

Webvisor переведён в true. Политики ПДн и куки дополнены пунктом
о записи обезличенных действий пользователя (курсор/скролл/клики)
с указанием, что ввод в поля форм маскируется. POLICY_VERSION
поднят с 1 до 2 — баннер автоматически пере-запросит согласие
у всех, кто принял предыдущую версию.
EOF
)"
```

Expected: успешный коммит, working tree clean.

---

## Task 6: Разрешить `.env.production` в git

**Files:**
- Modify: `.gitignore:23`

- [ ] **Step 1: Найти строку игнора env-файлов**

Текущий блок в `.gitignore`:

```
# env files (can opt-in for committing if needed)
.env*
```

- [ ] **Step 2: Добавить исключение для прод-окружения**

Заменить блок на:

```
# env files (can opt-in for committing if needed)
.env*
!.env.production
```

- [ ] **Step 3: Проверка**

Run: `git check-ignore -v .env.production`
Expected: пустой вывод (файл больше не игнорируется) либо exit code 1 — означает, что игнор снят.

---

## Task 7: Создать `.env.production`

**Files:**
- Create: `.env.production`

- [ ] **Step 1: Записать файл**

Содержимое `.env.production`:

```
NEXT_PUBLIC_YM_ID=109730343
```

(Файл из одной строки + перевод строки на конце.)

- [ ] **Step 2: Проверка, что git его теперь видит**

Run: `git status .env.production`
Expected: файл указан как `Untracked` (или после `git add` — `new file`).

---

## Task 8: Обновить `.env.example`

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Заменить содержимое целиком**

Текущий `.env.example`:

```
# Yandex Metrika counter ID — обязательно для прод-сборки.
NEXT_PUBLIC_YM_ID=
```

Заменить на:

```
# Yandex Metrika counter ID — обязательно для прод-сборки.
# Прод-значение задано в .env.production: 109730343.
# Локально оставить пустым — счётчик не активируется (см. lib/analytics/metrika.ts).
NEXT_PUBLIC_YM_ID=
```

---

## Task 9: Коммит группы B

- [ ] **Step 1: Запустить lint+typecheck перед коммитом**

Run: `npm run lint && npx tsc --noEmit`
Expected: 0 ошибок (env-файлы не влияют, но проверяем гигиенически).

- [ ] **Step 2: Просмотр диффа**

Run: `git status && git diff .gitignore .env.example`
Expected:
- `.gitignore` — добавлена строка `!.env.production`
- `.env.example` — добавлены две строки комментариев
- `.env.production` — `Untracked`

- [ ] **Step 3: Stage и commit**

```bash
git add .gitignore .env.production .env.example
git commit -m "$(cat <<'EOF'
feat(analytics): включить счётчик ЯМ 109730343 в прод-сборке

Добавлен .env.production с публичным ID счётчика (next build инлайнит
значение в бандл). Для допуска файла в репозиторий в .gitignore
добавлено исключение !.env.production. ID публичный — не секрет.
EOF
)"
```

Expected: успешный коммит, working tree clean.

---

## Task 10: Manual verification production-сборки

- [ ] **Step 1: Чистая прод-сборка**

Run: `rm -rf .next out && npm run build`
Expected: успешная сборка без ошибок. В выводе должны быть упоминания экспорта статики (`output: 'export'`).

- [ ] **Step 2: Проверка, что ID попал в бандл**

Run: `grep -r "109730343" out/ | head -5`
Expected: минимум одно совпадение в каком-то HTML/JS-файле в `out/` — значит `NEXT_PUBLIC_YM_ID` корректно инлайнился.

- [ ] **Step 3: Локальный запуск собранной статики**

Run: `npx serve out`
Expected: запущен HTTP-сервер на localhost (по умолчанию `:3000`). Примечание: `npm start` для этого проекта не подходит — `next.config.ts` ставит `output: 'export'`, поэтому артефакт — статика в `out/`, а не next-сервер.

- [ ] **Step 4: Smoke-тест в браузере (инкогнито)**

Открыть `http://localhost:<порт>/` в окне инкогнито, открыть DevTools → Network, фильтр `mc.yandex.ru`.

Чек-лист:
1. **Стартовое состояние:** баннер «Принять / Отказаться» виден. В Network **нет** запросов к `mc.yandex.ru`. ✅
2. **Отказ:** нажать «Отказаться» → баннер исчез. Перезагрузить страницу — баннер не появляется. В Network по-прежнему **нет** ЯМ. ✅
3. **Сброс:** в DevTools Console выполнить `localStorage.clear()` → перезагрузить → баннер снова виден. ✅
4. **Согласие:** нажать «Принять» → баннер исчез, в Network появляется загрузка `https://mc.yandex.ru/metrika/tag.js`, затем beacon-запрос к `mc.yandex.ru/watch/109730343`. ✅
5. **Webvisor:** в Network видна также загрузка скрипта `webvisor.js` (или `watch/...?wv=1` — зависит от текущей версии tag.js). ✅

- [ ] **Step 5: Тест миграции POLICY_VERSION v1 → v2**

В DevTools Console (на загруженной странице, в инкогнито):

```js
localStorage.clear();
localStorage.setItem('kk.consent.v1', JSON.stringify({
    version: 1,
    decision: 'accepted',
    timestamp: Date.now()
}));
location.reload();
```

Expected:
- Баннер **должен показаться** (так как `consent.ts:21` проверяет `parsed.version !== POLICY_VERSION` — старая v1 не пройдёт против текущей v2 и вернёт `null`).
- В Network — `mc.yandex.ru` пока **не появляется**.
- Нажать «Принять» → ЯМ начинает грузиться.

- [ ] **Step 6: Проверка юр.страниц**

Открыть `http://localhost:<порт>/cookies/` и `http://localhost:<порт>/privacy/`.

Expected:
- На обеих страницах в тексте видно упоминание Webvisor.
- Дата обновления — `2026-06-08`.

- [ ] **Step 7: Если что-то не работает**

Любой сбой выше → НЕ коммитить дополнительно, остановиться, доложить пользователю. Не пытаться «починить» обходным путём.

---

## Follow-up (out-of-scope этого плана)

После деплоя на Beget:
1. Открыть kamenskaya.ru в инкогнито, принять куки, дождаться появления визита в кабинете ЯМ (5–10 минут).
2. В кабинете ЯМ добавить клик-цели по CSS-селекторам для Telegram-CTA (без правки кода).

---

## Done criteria

- [ ] Два коммита в `main`: «webvisor + политики» и «прод-ID счётчика».
- [ ] `npm run lint && npx tsc --noEmit` — чисто.
- [ ] `npm run build` — успех.
- [ ] Smoke-чек-лист Task 10 — все ✅.
- [ ] `git status` — working tree clean.
