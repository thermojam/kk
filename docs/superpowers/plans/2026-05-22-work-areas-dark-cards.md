# Work-Areas Dark Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести карточки в `#work-areas` в стиль Dark Poster (вариант 05 из ресёрча 2026-05-22): тёмный градиент `primary-600 → neutral-900`, accent-glow в углу, белая типографика, accent-точки буллетов. Секция-обёртка остаётся светлой.

**Architecture:** Класс `.work-area-card` в `globals.css` инкапсулирует тяжёлые фоны (linear + radial gradient). Компонент `WorkAreaCard` переписывается на тёмную палитру; `WorkAreaIcon` получает override цвета через существующий `className` prop. SPEC §3 актуализируется. Автотестов нет (`feedback_no_tests_in_mvp.md`); верификация — `npm run lint`, `npm run build`, ручной просмотр в Playwright.

**Tech Stack:** Next.js 16, React 19, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-05-22-work-areas-dark-cards-design.md`

---

## File Structure

| Файл                                       | Ответственность                          | Тип правки  |
| ------------------------------------------ | ---------------------------------------- | ----------- |
| `app/globals.css`                          | Класс `.work-area-card` (фон карточки)  | расширение  |
| `components/sections/WorkAreaCard.tsx`     | Карточка work-area                       | переработка |
| `SPEC.md` §3                               | Описание стиля карточки                  | правка      |

---

## Task 1: globals.css — `.work-area-card`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Добавить класс в блок `@layer components`**

В существующий блок `@layer components { .container-page { ... } ... }` (около строк 65-87) **дописать** после правила `.container-page` (но внутри того же `@layer components`):

```css
.work-area-card {
    background:
        radial-gradient(circle at 100% 0%, rgba(255, 165, 82, 0.35) 0%, transparent 45%),
        linear-gradient(160deg, var(--color-primary-600) 0%, var(--color-neutral-900) 90%);
}
```

Никакие другие правила не трогаем.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 errors. Pre-existing warnings в `components/ui/Button.tsx` остаются.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success.

---

## Task 2: WorkAreaCard.tsx — Dark Poster

**Files:**
- Modify: `components/sections/WorkAreaCard.tsx`

- [ ] **Step 1: Заменить файл целиком**

Содержимое `components/sections/WorkAreaCard.tsx`:

```tsx
import type { WorkArea } from '@/content/home';
import { WorkAreaIcon } from '@/components/icons/WorkAreaIcons';

type WorkAreaCardProps = { item: WorkArea };

export function WorkAreaCard({ item }: WorkAreaCardProps) {
    return (
        <article
            className="
                work-area-card relative flex h-full flex-col gap-4 overflow-hidden
                rounded-lg border border-white/[0.06] p-6
                text-neutral-0 shadow-[0_18px_40px_-22px_rgba(30,30,46,0.55)]
                transition-transform duration-300 hover:-translate-y-1
            "
        >
            <div className="flex size-14 items-center justify-center rounded-[14px] border border-white/[0.14] bg-white/[0.08]">
                <WorkAreaIcon name={item.icon} className="size-7 text-accent-500" />
            </div>

            <h3 className="text-h3 text-neutral-0">{item.title}</h3>

            <ul className="flex flex-col gap-2 text-body text-white/[0.78]">
                {item.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-500 shadow-[0_0_10px_rgba(255,165,82,0.7)]"
                        />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}
```

Что меняется относительно текущего файла:
- `bg-neutral-0 border-neutral-100 shadow-sm` → `work-area-card border-white/[0.06] shadow-[…tinted…]` плюс `overflow-hidden`, `relative`, `text-neutral-0`, `transition-transform duration-300 hover:-translate-y-1`.
- `<WorkAreaIcon name={item.icon} />` (default size-10 text-primary-500) → обёрнут в icon-box `size-14 bg-white/[0.08] …`, иконка `size-7 text-accent-500`.
- `text-h3 text-neutral-900` → `text-h3 text-neutral-0`.
- `text-body text-neutral-700` → `text-body text-white/[0.78]`.
- Точка буллета `bg-primary-400` → `bg-accent-500` с soft glow. Размер `size-1` → `size-1.5` (6px — на тёмном чуть крупнее, читается).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit (накапливаем CSS+TSX в один коммит)**

```bash
git add app/globals.css components/sections/WorkAreaCard.tsx
git commit -m "feat(work-areas): dark poster card style"
```

---

## Task 3: SPEC.md §3 — обновить описание стиля карточек

**Files:**
- Modify: `SPEC.md` (раздел «СЕКЦИЯ 3 · С чем я работаю», ~ строки 112–162)

- [ ] **Step 1: Обновить упоминания иконок в трёх блоках карточек**

В блоках карточек (строки 121–131, 134–145, 148–156) **заменить** строки вида:

```
Иконка: тело/волна (SVG в Primary)
Иконка: путь/развилка (SVG в Primary)
Иконка: микрофон/голос (SVG в Primary)
```

на (для каждой):

```
Иконка: тело/волна (SVG в Accent, на тёмной карточке)
Иконка: путь/развилка (SVG в Accent, на тёмной карточке)
Иконка: микрофон/голос (SVG в Accent, на тёмной карточке)
```

- [ ] **Step 2: Добавить блок «Стиль карточки» после блока «Карусель (Embla)»**

После строки `loop выключен` (около строки 161, в конце подраздела «#### Карусель (Embla)») и перед `---` (около строки 163) **вставить** новый подраздел:

```
#### Стиль карточки (Dark Poster)

- Фон: `linear-gradient(160deg, --color-primary-600 → --color-neutral-900)` + `radial-gradient` accent-glow в правом верхнем углу (rgba(255,165,82,0.35))
- Border: `rgba(255,255,255,0.06)`, radius `--radius-lg`
- Иконка: `accent-500`, размер 28px, в icon-box 56×56 со стеклянным фоном `rgba(255,255,255,0.08)` и бордером `rgba(255,255,255,0.14)`
- Заголовок: `--color-neutral-0` (#ffffff), `.text-h3`
- Буллеты: текст `rgba(255,255,255,0.78)`, маркер — `accent-500` точка 6px с soft glow
- Hover (desktop): `translateY(-4px)`, 300ms
- Тень: `0 18px 40px -22px rgba(30,30,46,0.55)`
```

- [ ] **Step 3: Commit**

```bash
git add SPEC.md
git commit -m "docs(spec): work-areas §3 — dark poster cards"
```

---

## Done

После Task 3 сводка состояния ветки `sprint-3-foundation`:
- `app/globals.css` содержит класс `.work-area-card` (тёмный градиент + accent glow).
- `components/sections/WorkAreaCard.tsx` — Dark Poster: тёмная карточка, белая типографика, accent-точки, hover-lift.
- Мобильный карусель (`WorkAreasMobileCarousel`) — без правок, наследует новый стиль через `WorkAreaCard`.
- `SPEC.md` §3 синхронизирован.
- Lint 0 errors, build success.
- Визуальная проверка в Playwright: десктоп 1280, мобайл 375.
