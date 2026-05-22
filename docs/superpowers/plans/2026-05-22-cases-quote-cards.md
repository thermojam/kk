# Cases · Side-stripe + Numbered Quote Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести карточки в `#cases` в стиль pull-quote: белая карточка, фиолетовая полоса слева, серифная цифра «01/02/03» в правом верхнем углу, фиксированная высота title (2 строки) и body (8 строк) для ровной сетки.

**Architecture:** `CaseCard` переписывается на новый layout (relative + absolute декор + line-clamp). Принимает новый prop `number`. `Cases.tsx` и `CasesMobileCarousel.tsx` передают `number={idx + 1}`. SPEC §4 актуализируется. Никаких новых файлов. Автотестов нет (`feedback_no_tests_in_mvp.md`); верификация — `npm run lint`, `npm run build`, ручной просмотр в Playwright.

**Tech Stack:** Next.js 16, React 19, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-05-22-cases-quote-cards-design.md`

---

## File Structure

| Файл                                          | Ответственность                          | Тип правки |
| --------------------------------------------- | ---------------------------------------- | ---------- |
| `components/sections/CaseCard.tsx`            | Карточка кейса                           | переработка |
| `components/sections/Cases.tsx`               | Проброс индекса в map                    | правка     |
| `components/sections/CasesMobileCarousel.tsx` | Проброс индекса в renderItem             | правка     |
| `SPEC.md` §4                                  | Описание стиля карточки                  | правка     |

---

## Task 1: CaseCard.tsx — Side-stripe + Numbered

**Files:**
- Modify: `components/sections/CaseCard.tsx`

- [ ] **Step 1: Заменить файл целиком**

Содержимое:

```tsx
import type { Case } from '@/content/home';

type CaseCardProps = { item: Case; number: number };

export function CaseCard({ item, number }: CaseCardProps) {
    return (
        <article
            className="
                relative flex h-full flex-col gap-3 overflow-hidden
                rounded-xl bg-neutral-0 py-7 pl-8 pr-7
                shadow-[0_8px_24px_-18px_rgba(30,30,46,0.15)]
            "
        >
            <span
                aria-hidden="true"
                className="absolute left-0 top-5 bottom-5 w-[3px] rounded bg-primary-400"
            />
            <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-3 select-none font-serif text-[64px] italic leading-none text-primary-300/40"
            >
                {String(number).padStart(2, '0')}
            </span>

            <h3 className="line-clamp-2 min-h-[2lh] pr-12 font-serif text-[22px] font-medium italic leading-[1.18] text-neutral-900">
                «{item.title}»
            </h3>

            <p className="line-clamp-[8] min-h-[8lh] text-body leading-relaxed text-neutral-700">
                {item.body}
            </p>
        </article>
    );
}
```

Контракт изменения:
- Новый обязательный prop `number: number`. Передаётся родителями (`Cases`, `CasesMobileCarousel`).
- Все классы и теги переписаны. DOM-структура: `<article>` → `<span side-stripe>` → `<span number>` → `<h3>` → `<p>`.

---

## Task 2: Cases.tsx — проброс number в grid

**Files:**
- Modify: `components/sections/Cases.tsx`

- [ ] **Step 1: Заменить блок grid-карточек**

Найти блок:

```tsx
{items.map((item) => (
    <CaseCard key={item.id} item={item} />
))}
```

Заменить на:

```tsx
{items.map((item, idx) => (
    <CaseCard key={item.id} item={item} number={idx + 1} />
))}
```

Никаких других изменений в файле.

---

## Task 3: CasesMobileCarousel.tsx — проброс number в renderItem

**Files:**
- Modify: `components/sections/CasesMobileCarousel.tsx`

- [ ] **Step 1: Обновить renderItem**

Найти строку:

```tsx
renderItem={(item) => <CaseCard item={item} />}
```

Заменить на:

```tsx
renderItem={(item, idx) => <CaseCard item={item} number={idx + 1} />}
```

`EmblaCarousel.renderItem` уже принимает `(item, index)` — менять `EmblaCarousel.tsx` не требуется.

---

## Task 4: Verify lint + build

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: 0 errors. Pre-existing warnings в `Button.tsx` / `Logo.tsx` остаются.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit (накапливаем все TSX-правки в один коммит)**

```bash
git add components/sections/CaseCard.tsx components/sections/Cases.tsx components/sections/CasesMobileCarousel.tsx
git commit -m "feat(cases): side-stripe + numbered quote card style"
```

---

## Task 5: SPEC.md §4 — обновить описание стиля

**Files:**
- Modify: `SPEC.md` (раздел «СЕКЦИЯ 4 · Истории клиенток», после блока «Карусель (Embla)»)

- [ ] **Step 1: Вставить блок «Стиль карточки» после Карусели**

Найти строку:

```
- **Мобайл:** Embla, 1 кейс в кадре + край следующей, dots, без стрелок, loop выключен
```

После неё (и перед `---`, начинающим следующую секцию) **вставить**:

```
#### Стиль карточки (Side-stripe Quote)

- Фон: `--color-neutral-0` (белый), `rounded-xl`, тень `0 8px 24px -18px rgba(30,30,46,0.15)`
- Слева — вертикальная полоса `primary-400`, ширина 3px, с отступом 20px от верха и низа карточки
- В правом верхнем углу — серифная италик-цифра «01/02/03», 64px, `primary-300` 40% непрозрачности, декоративная
- Заголовок: 22px Cormorant Italic medium, `neutral-900`, фикс высота 2 строки (line-clamp-2 + min-h-[2lh])
- Body: 15px Nunito, `neutral-700`, leading-relaxed, фикс высота 8 строк (line-clamp-[8] + min-h-[8lh])
- Padding: 28px вверх/вниз, 32px слева (с учётом полосы), 28px справа
- h-full на карточке + grid (или embla) обеспечивают одинаковую высоту всех карточек в ряду
```

- [ ] **Step 2: Commit**

```bash
git add SPEC.md
git commit -m "docs(spec): cases §4 — side-stripe quote cards"
```

---

## Done

После Task 5:
- `CaseCard.tsx` — side-stripe + numbered, фикс высота title (2 строки) и body (8 строк).
- `Cases.tsx`, `CasesMobileCarousel.tsx` — пробрасывают `number={idx+1}`.
- `SPEC.md` §4 синхронизирован.
- Lint 0 errors, build success.
- Визуальная проверка в Playwright: десктоп 1280, мобайл 375.
