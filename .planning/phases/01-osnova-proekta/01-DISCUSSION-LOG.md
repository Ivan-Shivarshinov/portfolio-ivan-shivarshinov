# Phase 1: Основа проекта - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-01
**Phase:** 01-osnova-proekta
**Areas discussed:** Структура проекта, Схемы коллекций, Инструменты и CI, Процесс spike Stacki

---

## Структура проекта

| Option | Description | Selected |
|--------|-------------|----------|
| Стандартная плоская | src/pages, src/layouts, src/components, src/styles, src/content, src/data — стандарт Astro | ✓ |
| Доменная (feature-first) | src/works/{pages,components,styles}/... — компактнее, но менее стандартно | |

**User's choice:** Стандартная плоская + уточнение: «Stacki — просто визуальный редактор, работающий поверх; связь односторонняя, подгонять Astro под Stacki не нужно»
**Notes:** Пользователь уточнил принцип Stacki отдельно: Astro — источник истины; решения не принимаются в ущерб Astro; при равнозначных вариантах — композиция layout + плоские компоненты с props; сложные страницы — через кодовый режим. Принцип подтверждён исследованием README `flowtricks/stacki` (парсинг-модель «layout wrapper + flat list of self-closing component instances with props», code fallback для сложной разметки).

| Option | Description | Selected |
|--------|-------------|----------|
| Внутри src/data | JSON типизируется вместе с кодом | ✓ |
| В public/ | Доступны по URL, вне типизации | |

**User's choice:** Внутри `src/data`

| Option | Description | Selected |
|--------|-------------|----------|
| Локально | WOFF2 в public/fonts, font-display: swap | ✓ |
| Google Fonts CDN | Проще, но внешняя зависимость | |

**User's choice:** Локально

---

## Схемы коллекций

| Option | Description | Selected |
|--------|-------------|----------|
| Полные под кейсы | Meta в frontmatter, 4 вопроса кейса — разделы MDX-тела | ✓ |
| Минимальные | Только slug, title, date — детали в фазе 3 | |

**User's choice:** Полные под кейсы

| Option | Description | Selected |
|--------|-------------|----------|
| MDX сразу | ADR baseline включает MDX для кейсов | ✓ |
| Markdown, MDX позже | Расширение в фазе 3 | |

**User's choice:** MDX сразу

| Option | Description | Selected |
|--------|-------------|----------|
| Схема, контент пуст | notes валидируется, записей нет | ✓ |
| Убрать notes | Блог не планируется | |

**User's choice:** Схема, контент пуст

| Option | Description | Selected |
|--------|-------------|----------|
| Meta в frontmatter, тело в MDX | Гибко для длинных текстов | ✓ |
| Всё в frontmatter | Жёсткая структура | |

**User's choice:** Meta в frontmatter, тело в MDX

| Option | Description | Selected |
|--------|-------------|----------|
| Русский с заделом на EN | Поля локали заложены, не обязательны | ✓ |
| Двуязычный сразу | Полный i18n сейчас | |
| Только русский | Без заделов | |

**User's choice:** Русский, с заделом на EN

| Option | Description | Selected |
|--------|-------------|----------|
| Явное поле order | Детерминированный порядок, закрывает edge | ✓ |
| По дате | Меньше полей, правила при равных датах | |

**User's choice:** Явное поле order

---

## Инструменты и CI

| Option | Description | Selected |
|--------|-------------|----------|
| ESLint + Prettier | eslint-plugin-astro + astro-eslint-parser — стандарт Astro | ✓ |
| Biome | Один инструмент, менее зрелая поддержка Astro | |

**User's choice:** ESLint + Prettier

| Option | Description | Selected |
|--------|-------------|----------|
| Один workflow, полный прогон | checkout → npm ci → lint → check → build | ✓ |
| Раздельные workflow | Параллельнее, но сложнее | |

**User's choice:** Один workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Без задела | Деплой — фаза 6 | ✓ |
| Адаптер сразу | Vercel/Netlify/Cloudflare конфиг теперь | |

**User's choice:** Без задела

---

## Процесс spike Stacki

| Option | Description | Selected |
|--------|-------------|----------|
| Гибрид | Пользователь запускает приложение, агент готовит чек-лист и фиксирует | ✓ |
| Только пользователь | Агент не участвует | |
| Без живого прогона | Документ только по README | |

**User's choice:** Гибрид

| Option | Description | Selected |
|--------|-------------|----------|
| Один документ покрытия | docs/stacki-coverage.md, 8 конструкций + 2 краевых случая | ✓ |
| Документ + медиа | Скриншоты/видео — нагляднее, но тяжелее | |

**User's choice:** Один документ покрытия

---

## Claude's Discretion

Имена CSS-переменных, структура zod-схем, конфиги ESLint/Prettier, имена маршрутов заглушек.

## Deferred Ideas

- Полный i18n — не входит (только задел).
- Блог — не учитывается.
- Деплой-адаптер — фаза 6.
