# Hero Title and CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать Hero-заголовок читаемым и сократить тексты обеих CTA-кнопок.

**Architecture:** Изменение локализовано в `Hero.tsx`. Существующие компоненты кнопок, ссылки, аналитика, анимации и фон сохраняются.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, lucide-react

---

### Task 1: Обновить композицию заголовка и CTA

**Files:**
- Modify: `components/sections/Hero.tsx`

- [ ] **Step 1: Зафиксировать текущее состояние**

Run: `npm run lint -- components/sections/Hero.tsx`

Expected: команда завершается без новых ошибок в `Hero.tsx`.

- [ ] **Step 2: Добавить иконку Telegram и обновить заголовок**

В `components/sections/Hero.tsx` импортировать:

```tsx
import { Send } from 'lucide-react';
```

Заменить заголовок на:

```tsx
<motion.h1
    {...fadeUp(0.05)}
    className="max-w-[14ch] font-display text-white lg:max-w-none lg:text-[64px]"
    style={{ lineHeight: 1.08 }}
>
    <span>Психология женского тела</span>
    <br className="hidden lg:block" />
    <span className="text-accent-500"> и&nbsp;проявленности.</span>
</motion.h1>
```

Увеличить ширину текстовой колонки:

```tsx
<div className="flex flex-col gap-6 lg:order-1 lg:max-w-160">
```

- [ ] **Step 3: Сократить CTA**

Заменить содержимое primary CTA на:

```tsx
<Send aria-hidden="true" className="size-5" />
Написать
```

Заменить текст secondary CTA на:

```tsx
Мои услуги
```

- [ ] **Step 4: Проверить линтер**

Run: `npm run lint -- components/sections/Hero.tsx`

Expected: PASS.

- [ ] **Step 5: Проверить production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Проверить Hero визуально**

Открыть локальную главную страницу на desktop и mobile viewport.

Expected:

- desktop-заголовок состоит из двух смысловых строк;
- mobile-заголовок переносится естественно;
- обе CTA короткие и не переполняются;
- портрет и остальные элементы Hero не изменились.
