# Phase 1: Основа проекта - Context

**Gathered:** 2026-08-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Фаза превращает пустой репозиторий в работающий Astro-проект как единый источник истины: каркас (npm, package.json, astro.config, tsconfig strict, src/), design tokens в CSS-переменных, валидирующиеся Content Collections и JSON-данные, базовые layouts и SEO, spike-документ покрытия Stacki, GitHub remote и CI — до начала визуальной сборки.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**6 requirements are locked.** See `01-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `01-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**
- Astro-скаффолд: package.json, astro.config, tsconfig (strict), src/ (pages, layouts, components, styles, content), .gitignore
- Design tokens как CSS-переменные (5 групп)
- Content Collections (projects, notes) + JSON-данные (services, skills, tools) со схемами
- Base layout + SEO-компонент + sitemap
- Spike Stacki: установка, прогон, документ покрытия в Git
- GitHub-remote + CI (lint → build)

**Out of scope (from SPEC.md):**
- Визуальная стилизация страниц и компонентов — фаза 2 (здесь только каркас и токены)
- Контент кейсов и тексты разделов — фаза 3
- Three.js и любая WebGL-работа — фазы 4–5
- Деплой на production — фаза 6
- Utility-first CSS (Tailwind) — запрещено ADR до проверки Stacki (см. Prohibitions)
- Тяжёлый клиентский фреймворк для всего сайта — запрещено ADR baseline
- Блог/контент-модель заметок для публикации — не учитывается по решению пользователя

</spec_lock>

<decisions>
## Implementation Decisions

### Структура проекта
- **D-01:** Стандартная плоская структура `src/`: pages, layouts, components, styles, content, data — стандарт Astro, максимально очевиден и для кодового режима, и для чтения инструментами.
- **D-02:** JSON-данные (services, skills, tools) хранятся в `src/data/*.json` — типизируются вместе с кодом, не публикуются по прямой ссылке.
- **D-03:** Шрифты (grotesk + mono из дизайн-спека) подключаются локально: WOFF2 в `public/fonts`, `font-display: swap` — лучший LCP, без внешних CDN-зависимостей, работает офлайн.
- **D-04:** **Принцип Stacki** (формулировка пользователя, подтверждена README `flowtricks/stacki`): Astro и его исходники — источник истины; Stacki — необязательный визуальный слой поверх проекта. Архитектурные решения НЕ принимаются в ущерб Astro ради ограничений Stacki. Но при равнозначных вариантах сохраняется совместимая с его визуальным режимом композиция страниц: layout + плоский список компонентов с props (парсинг-модель Stacki: «optional layout wrapper + flat list of self-closing component instances with props»). Более сложные страницы (произвольный HTML, выражения, вложенные children) редактируются через встроенный кодовый режим Stacki — ничего не перезаписывается деструктивно. — **Reversibility:** costly — принцип влияет на композицию страниц всех последующих фаз; пересмотр потребует перепроверки компонентной архитектуры.

### Схемы коллекций
- **D-05:** Схема `projects` полная под кейсы уже в фазе 1: метаданные в frontmatter (slug, title, summary, role, stack, year, status, client-type, order), четыре вопроса кейса (проблема → ответственность → решение → результат) — разделы в MDX-теле, а не поля frontmatter.
- **D-06:** MDX-расширение (`@astrojs/mdx`) устанавливается сразу; тело кейса — MDX. — **Reversibility:** reversible — расширение можно удалить до появления контента.
- **D-07:** Коллекция `notes` существует со схемой, контент пуст — валидирует edge «пустые коллекции проходят сборку».
- **D-08:** Контент на русском; структура схем закладывает задел на EN-версии (поля локали предусмотрены, но не обязательны) — полный i18n не входит в проект.
- **D-09:** Сортировка проектов в индексе — по явному полю `order` (детерминированный порядок; закрывает edge «равные даты»).

### Инструменты и CI
- **D-10:** Линтер/форматтер: ESLint + eslint-plugin-astro + prettier — зрелая экосистема, стандарт для Astro.
- **D-11:** Один CI-workflow (GitHub Actions): checkout → setup-node (Node 22) → npm ci (с кэшем) → lint → `astro check` → build. Линт выполняется до build (требование SPEC R6). — **Reversibility:** reversible — workflow легко расширить в фазе 6.
- **D-12 [informational]:** Деплой-адаптер в фазе 1 не закладывается; деплой — фаза 6.

### Spike Stacki
- **D-13:** Гибридный прогон: агент готовит чек-лист конструкций для проверки (по README `flowtricks/stacki`), пользователь запускает Stacki (desktop-приложение) на скаффолде и проходит сценарий, агент фиксирует результаты в документ покрытия.
- **D-14:** Результат spike — один документ `docs/stacki-coverage.md`: 8 конструкций (компоненты, props, variants, scoped styles, CSS-переменные, JSON-коллекции, frontmatter, View Transitions) + 2 краевых случая (scoped styles + переменная одновременно; коллекция с 0 записей), каждая с пометкой «проверено / ограничение».

### Claude's Discretion
Точные имена CSS-переменных, структура zod-схем (набор обязательных/необязательных полей), конфиги ESLint/Prettier, имена маршрутов заглушек — на усмотрение исследователя и планировщика в рамках решений выше и требований SPEC.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Locked requirements
- `.planning/phases/01-osnova-proekta/01-SPEC.md` — Locked requirements — MUST read before planning

### Контекстные документы
- `docs/Техническая стратегия портфолио Astro + AI-агент + Stacki.md` — ADR: baseline стека, workflow (Этап 0 — spike Stacki до визуальной сборки), §5 «Правила компонентной архитектуры для Stacki», порядок анимаций, quality gates
- `docs/design_direction_portfolio_ivan_shivarshinov.md` — дизайн-направление (SPEC): визуальный язык, типографика grotesk + mono, §08 «бюджет интерактивности»
- `docs/positioning_portfolio_ivan_shivarshinov.md` — PRD: позиционирование и структура разделов

### Внешние референсы
- `https://github.com/flowtricks/stacki` (README) — парсинг-модель Stacki («layout wrapper + flat list of self-closing components with props»), fallback в кодовый редактор, требования Node 18+/npm/git — референс для spike R5
- `https://github.com/flowtricks/stacki-releases` — релизы/установка Stacki

### Прочее
- `.planning/INGEST-CONFLICTS.md` — авто-разрешённые конфликты документов (центральная механика — индекс; GSAP-бюджет; платформа Astro)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Нет — репозиторий не содержит кода (docs/ и .planning/ только). Есть `convert_docx_to_md.py` в корне — утилита конвертации, не относится к приложению.

### Established Patterns
- Нет — паттерны будут установлены этой фазой и станут образцом для фаз 2–6.

### Integration Points
- Корень репозитория: создаётся package.json, astro.config, tsconfig, src/, public/, .github/workflows/.
- Существующие `docs/*.md` — источники контента/контекста для будущих фаз (не код).

</code_context>

<specifics>
## Specific Ideas

- «Задел на EN»: схемы коллекций должны позволять добавить англ-версии без миграции схем.
- Stacki-совместимая композиция страниц (layout + плоские компоненты с props) — целевой паттерн страниц начиная с фазы 2; фаза 1 закладывает структуру, в которой это естественно.
- Репозиторий публичный/приватный — не зафиксировано; планировщик может предложить, окончательное решение за пользователем при настройке remote.

</specifics>

<deferred>
## Deferred Ideas

- Полный i18n (двуязычный сайт с отдельными маршрутами) — сознательно не входит; только задел в схемах.
- Блог/публичная контент-модель — не учитывается по решению пользователя (spec-phase).
- GitHub Pages/Vercel адаптер — фаза 6.

</deferred>

---

*Phase: 01-osnova-proekta*
*Context gathered: 2026-08-01*
