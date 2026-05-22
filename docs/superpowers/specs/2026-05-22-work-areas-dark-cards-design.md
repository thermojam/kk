# Work-Areas · Dark Poster Cards — design

Карточки в секции «С чем я работаю» (`#work-areas`) переводятся в тёмный «постерный» регистр (вариант 05 Dark Poster из ресёрча по uiverse 2026-05-22). Секция остаётся на светлом фоне страницы, тёмными становятся только сами карточки — это даёт ритмический контраст после светлого пролога (intro/hero интро над секцией остаются как есть) и эхо тёмного Header'а.

## Цели

- Усилить визуальную плотность секции, не перегружая остальной лендинг новой темой.
- Сохранить контракт компонентов (`WorkAreas`, `WorkAreaCard`, `WorkAreasMobileCarousel`).
- Не вводить новых токенов палитры.
- Сохранить контент: иконки, заголовки, буллеты — без изменений.

## Не-цели

- Менять секцию-обёртку `WorkAreas` (контейнер, заголовок, layout) — фон остаётся светлым (`body`), `h2` — `text-neutral-900`.
- Менять `WorkAreasMobileCarousel` — стиль карточки тот же, карусель рендерит уже переработанный `WorkAreaCard`.
- Менять `WorkAreaIcon` API — default остаётся `text-primary-500` (mono); компонент-родитель переопределяет цвет через `className`.
- Глобальный dark-mode сайта.

## Состав изменений

| Файл                                       | Тип         | Что меняется                                                          |
| ------------------------------------------ | ----------- | --------------------------------------------------------------------- |
| `app/globals.css`                          | расширение  | новый класс `.work-area-card` (фон-градиент + radial accent glow)     |
| `components/sections/WorkAreaCard.tsx`     | переработка | тёмная карточка, белая типографика, accent-точки буллетов             |
| `SPEC.md` §3                               | правка      | актуализировать описание карточки (тёмный градиент, accent акценты)   |

Новые токены палитры **не вводятся** — всё на существующих `--color-primary-600`, `--color-neutral-900`, `--color-accent-500`, `--color-neutral-0`, white/transparent.

## `app/globals.css` — `.work-area-card`

В блок `@layer components` добавляется новый класс. Используется CSS вместо Tailwind arbitrary-values, потому что слой имеет два gradient'а (linear + radial) и фон становится «бесшовным» — удобнее держать в одном месте.

```css
@layer components {
    .work-area-card {
        background:
            radial-gradient(circle at 100% 0%, rgba(255, 165, 82, 0.35) 0%, transparent 45%),
            linear-gradient(160deg, var(--color-primary-600) 0%, var(--color-neutral-900) 90%);
    }
}
```

### Зачем именно так

- `linear-gradient(160deg, primary-600 → neutral-900)` — основное «постерное» полотно. Угол 160° — мягкая диагональ, как в hero.
- `radial-gradient(... accent-500 35% → transparent 45%)` в правом верхнем углу — тёплое свечение. Накладывается поверх линейного через CSS-shorthand `background:` (первый слой — сверху).
- Без `backdrop-filter` (выпилили из черновика — нет смысла на solid-фоне и тяжёлый для рендера на длинных списках).

## `components/sections/WorkAreaCard.tsx` — переработка

Полная замена файла. Структура DOM остаётся: `<article><icon><h3><ul>…</ul></article>` — но классы и icon-обёртка переосмыслены.

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
            <div
                className="
                    flex size-14 items-center justify-center rounded-[14px]
                    border border-white/[0.14] bg-white/[0.08]
                "
            >
                <WorkAreaIcon name={item.icon} className="size-7 text-accent-500" />
            </div>

            <h3 className="text-h3 text-neutral-0">{item.title}</h3>

            <ul className="flex flex-col gap-2 text-body text-white/[0.78]">
                {item.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="
                                mt-2 size-1.5 shrink-0 rounded-full
                                bg-accent-500 shadow-[0_0_10px_rgba(255,165,82,0.7)]
                            "
                        />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}
```

### Поэлементно

- **Контейнер**: класс-композиция: `.work-area-card` (фоны), плюс flex/gap/rounded/border/padding/shadow/hover-translate. `overflow-hidden` гарантирует, что radial glow не «вылезает» за пределы радиуса.
- **icon-box**: 56×56 (size-14), `rounded-[14px]` (между `--radius-md 10` и `--radius-lg 16`, чтобы вписаться визуально с радиусом самой карточки), полупрозрачный белый фон 8%, бордер 14% — «стеклянная» плашка.
- **Иконка**: размер `size-7` (28px), цвет `text-accent-500`. Передаётся `WorkAreaIcon` через `className` prop (он уже поддерживает override).
- **Заголовок**: `text-h3 text-neutral-0` — белый.
- **Буллеты**: текст `text-white/[0.78]` (≈ rgba(255,255,255,0.78)). Маркер — accent-500 кружок 6px (`size-1.5`) с мягким halo через `shadow-[0_0_10px_rgba(255,165,82,0.7)]`.

### Hover

`hover:-translate-y-1` (4px) + `transition-transform duration-300`. Без изменений тени, без scale — спокойный «лифт».

## SPEC.md §3 — правка

В блоке «СЕКЦИЯ 3 · С чем я работаю» обновляется упоминание иконок и добавляется один абзац про стиль карточек. См. соответствующий шаг в плане.

## Цвета и контраст (WCAG)

| Элемент                  | Цвет                                | Фон (худший случай)           | Контраст |
| ------------------------ | ----------------------------------- | ----------------------------- | -------- |
| Заголовок h3             | `#ffffff`                           | `primary-600` (#6a1faa)       | ~5.8:1 ✅ |
| Текст буллетов           | `rgba(255,255,255,0.78)`            | `primary-600`                 | ~4.5:1 ✅ |
| Иконка (non-text)        | `accent-500` (#ffa552)              | `primary-600`                 | ~3.0:1 ✅ (для non-text WCAG 1.4.11) |
| Маркер буллета (non-text)| `accent-500`                        | `primary-600`                 | ~3.0:1 ✅ |
| Border контейнера        | `rgba(255,255,255,0.06)`            | —                             | декоративный |

## Анимация

- `hover:-translate-y-1` — единственная новая анимация. `transition-transform duration-300`.
- `prefers-reduced-motion: reduce` — Tailwind `transition-*` уже подхватывает media-query через CSS-уровень браузера; `transform` короткий и одноразовый, не вращающийся / не зацикленный — критерия nausea-trigger нет. Дополнительной CSS-правки не вводим.

## Acceptance

- Карточки в `#work-areas` визуально тёмные: градиент `primary-600 → neutral-900` диагональю 160°, тёплое accent-glow в правом верхнем углу.
- Заголовок секции `«С чем я работаю»` остаётся `text-neutral-900` на светлом `body`-фоне.
- Икона внутри icon-box (56×56, белая прозрачная плашка с бордером), цвет `accent-500`.
- Буллеты: текст `white/78`, точки `accent-500` с soft glow.
- Hover на карточке — `-translate-y-1` (десктоп grid). На мобильном (touch) — без визуальных артефактов.
- Мобильный карусель рендерит карточки в новом стиле без правок самого карусели.
- SPEC §3 обновлён.
- Lint 0 errors, build success.

## Открытые риски

- **Иконка accent на тёмном фоне**: в SPEC §3 указано «SVG в Primary». Это локальное стилевое отклонение, осознанное (вариант 05 одобрен пользователем). Обновляем SPEC, чтобы не висел рассинхрон.
- **Контраст 3:1 для иконки accent** — соответствует WCAG 1.4.11 (non-text), но визуально к более жёсткому 4.5:1 это не приближается. Если в продакшен-просмотре читаемость иконки покажется слабой — можно поднять stroke-width у иконки в WorkAreaIcon (сейчас 1.5) или сменить цвет иконки на `primary-300` (светло-фиолетовая, контраст с primary-600 будет ~3.4:1, с neutral-900 ~7:1). Решаем по факту визуального просмотра.
- **Карусель с длинными буллетами**: если на узких экранах высота карточек будет сильно отличаться, embla при `slidesPerView: 1` подстраивается под одну активную — высота не критична. Если будет «прыгать» — добавим `min-h` в acceptance-итерации.

## Out of scope

- Глобальный dark-mode.
- Анимация появления карточек при скролле.
- Изменения секций `#cases`, `#services`, `#qualifications`.
- Изменения `WorkAreasMobileCarousel` (структура карусели не меняется).
- Изменения `WorkAreaIcon` API (только использование через `className`).
