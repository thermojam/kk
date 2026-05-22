# Cases · Side-stripe + Numbered Quote Cards — design

Карточки в секции «Истории клиенток» (`#cases`) переводятся в стиль pull-quote: белые на тёплом светлом фоне страницы (контраст с тёмными `#work-areas` выше), с фиолетовой вертикальной полосой слева и серифной полупрозрачной цифрой главы в правом верхнем углу. Выбор пользователя: вариант 05 (Side-stripe Quote) + цифра из варианта 04 (Numbered Chapter) из ресёрча по uiverse 2026-05-22.

## Цели

- Сделать секцию визуально «ровной»: заголовки начинаются и заканчиваются на одной горизонтали; абзацы — тоже.
- Дать секции свой регистр: после тёмного `#work-areas` — спокойные светлые карточки с тонким декором.
- Сохранить контракт компонентов (`Cases`, `CaseCard`, `CasesMobileCarousel`).
- Не вводить новых токенов палитры.

## Не-цели

- Менять `Cases` обёртку (контейнер, заголовок секции, layout) — фон страницы остаётся `--color-neutral-0` (через `body`), `h2` — `text-neutral-900`.
- Менять `CasesMobileCarousel` структурно — только проброс индекса в renderItem.
- Менять контент `cases` в `content/home.ts`.
- Менять API `EmblaCarousel` — `renderItem` уже принимает `(item, index)`.

## Состав изменений

| Файл                                       | Тип         | Что меняется                                                                |
| ------------------------------------------ | ----------- | --------------------------------------------------------------------------- |
| `components/sections/CaseCard.tsx`         | переработка | side-stripe, серифная цифра, фиксированная высота title и body              |
| `components/sections/Cases.tsx`            | правка      | `items.map((item, idx) =>)` — пробрасываем `number={idx + 1}`                |
| `components/sections/CasesMobileCarousel.tsx` | правка    | `renderItem={(item, idx) =>}` — пробрасываем `number={idx + 1}`             |
| `SPEC.md` §4                               | правка      | блок «Стиль карточки (Side-stripe Quote)»                                   |

Никаких новых файлов, никаких новых токенов палитры.

## CaseCard.tsx — Side-stripe Quote + Numbered Chapter

Полная замена файла. Новый prop `number` (1-based) — обязательный.

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
            {/* Вертикальная фиолетовая полоса слева */}
            <span
                aria-hidden="true"
                className="absolute left-0 top-5 bottom-5 w-[3px] rounded bg-primary-400"
            />

            {/* Серифная полупрозрачная цифра в правом верхнем углу */}
            <span
                aria-hidden="true"
                className="
                    pointer-events-none absolute right-5 top-3 select-none
                    font-serif text-[64px] italic leading-none text-primary-300/40
                "
            >
                {String(number).padStart(2, '0')}
            </span>

            {/* Заголовок — фикс 2 строки (line-clamp + min-h) */}
            <h3
                className="
                    line-clamp-2 min-h-[2lh] pr-12
                    font-serif text-[22px] font-medium italic leading-[1.18]
                    text-neutral-900
                "
            >
                «{item.title}»
            </h3>

            {/* Абзац — фикс 8 строк (line-clamp + min-h) */}
            <p className="line-clamp-[8] min-h-[8lh] text-body leading-relaxed text-neutral-700">
                {item.body}
            </p>
        </article>
    );
}
```

### Поэлементно

- **Контейнер**: `bg-neutral-0`, `rounded-xl` (12px — чуть меньше `--radius-lg`, потому что декор тонкий — глаз ожидает менее «пухлой» формы), `shadow-[…tinted…]`, `overflow-hidden`, `relative`, `h-full` (нужен для выравнивания в grid-cols-3). `pl-8` оставляет место для side-stripe (3px полоса + 29px чистого отступа). `pr-7` обычный отступ справа. `py-7` — 28px вверх/вниз.
- **Side-stripe**: 3px ширина, не на всю высоту карточки — `top-5 bottom-5` (отступ по 20px от краёв), `rounded` для скруглённых концов. Цвет `bg-primary-400` (немного светлее, чем `primary-500`, чтобы не пересиливать текст).
- **Numbered chapter**: 64px Cormorant italic в правом верхнем углу, цвет `text-primary-300/40` (40% непрозрачности от `primary-300`). `select-none pointer-events-none` — декор не мешает выделению текста.
- **h3**: 22px Cormorant italic medium (500), color `neutral-900`. `pr-12` оставляет 48px справа, чтобы текст не наезжал на цифру. **`line-clamp-2 min-h-[2lh]`** — фиксирует ровно 2 строки независимо от длины заголовка. Все три текущих заголовка укладываются.
- **p**: 15px Nunito, color `neutral-700`, `leading-relaxed`. **`line-clamp-[8] min-h-[8lh]`** — фиксирует ровно 8 строк. Все три текущих body (~70 слов на ширине 280-380px) укладываются в 7-8 строк.

### Зачем `lh` единицы

`min-h-[2lh]` и `min-h-[8lh]` — современная CSS-фишка (CSS Values 4, `lh` = line-height текущего элемента). Поддержка: Chrome 99+, Safari 16.4+, Firefox 120+. Проект на Next 16 / React 19 — современный стек, для целевой аудитории это покрывает 99%+ браузеров. Если вылезет проблема — заменим на фиксированные px (`min-h-[52px]` для h3 = 22 × 1.18 × 2; `min-h-[192px]` для p = 15 × 1.6 × 8).

### `line-clamp-[8]` синтаксис

Tailwind v4 поддерживает `line-clamp-N` из коробки для N ≤ 6. Для N > 6 используется arbitrary value `line-clamp-[8]`. Альтернатива — `line-clamp-7` (тоже achievable через arbitrary `line-clamp-[7]`); 8 даёт небольшой запас на случай переноса.

## Cases.tsx — проброс индекса

```tsx
{items.map((item, idx) => (
    <CaseCard key={item.id} item={item} number={idx + 1} />
))}
```

Один штрих: добавляем `idx` в `.map()` и передаём `number={idx + 1}`.

## CasesMobileCarousel.tsx — проброс индекса

```tsx
renderItem={(item, idx) => <CaseCard item={item} number={idx + 1} />}
```

`EmblaCarousel.renderItem` уже имеет сигнатуру `(item: T, index: number) => ReactNode` — менять `EmblaCarousel` не требуется.

## SPEC.md §4 — правка

В блоке «СЕКЦИЯ 4 · Истории клиенток» (около строк 175-222) после блока «Карусель (Embla)» (около строки 222) и перед `---` (около строки 223) добавляется новый подраздел.

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

## Цвета и контраст (WCAG)

| Элемент            | Цвет                              | Фон             | Контраст |
| ------------------ | --------------------------------- | --------------- | -------- |
| Заголовок h3       | `--color-neutral-900` (#1e1e2e)   | `#ffffff`       | ~16:1 ✅ |
| Body p             | `--color-neutral-700` (#3a3a52)   | `#ffffff`       | ~10:1 ✅ |
| Цифра (декор)      | `primary-300/40` (~#c9a3e8 @ 40%) | `#ffffff`       | декоративный, контраст ~2.5:1 — не текст по смыслу, aria-hidden |
| Side-stripe (декор)| `primary-400` (#9b5fd1)           | `#ffffff`       | ~4.5:1, non-text ✅ |

## Анимация

Hover-эффектов на карточке нет (отличие от work-areas — это «постерные» с lift; cases — «бумажные», статичные). Это сознательное решение: pull-quote вид предполагает спокойствие.

## Acceptance

- Все 3 карточки одинаковой высоты в десктопном grid.
- Заголовки начинаются и заканчиваются на одной горизонтали (2 строки фикс).
- Body начинается и заканчивается на одной горизонтали (8 строк фикс).
- Слева на каждой карточке — фиолетовая полоса 3px, с отступом 20px сверху и снизу.
- В правом верхнем углу — крупная серифная полупрозрачная цифра «01», «02», «03».
- Никаких регрессий в `Cases.tsx` / `CasesMobileCarousel.tsx` за пределами проброса `number`.
- Lint 0 errors, build success.

## Открытые риски

- **Длинные заголовки или body будут обрезаны line-clamp.** Текущий контент в `content/home.ts` укладывается. Если в будущем добавится 4-й кейс с заголовком в 3 строки или абзацем в 9 — обрежется с многоточием. На MVP это норма.
- **`lh` unit поддержка в Safari**: с Safari 16.4 (март 2023) — стабильно. На iOS Safari < 16.4 fallback не предусмотрен; если коснёмся ретро-аудитории — заменим на пиксели.
- **Цифра 64px на узких мобильных колонках** (< 320px): декор может казаться слишком крупным. Карусель embla отдаёт минимум 280px на слайд (трим-снапы), 64px цифра + 48px pr-12 = всё ещё помещается, но визуально нужно проверить вживую.

## Out of scope

- Менять контент кейсов.
- Менять API EmblaCarousel.
- Менять секцию-обёртку `Cases.tsx` (контейнер, h2).
- Добавлять hover-анимации на cases.
- Менять секции `#work-areas`, `#services`, `#qualifications`.
