# Phase 1: Основа проекта — Specification

**Created:** 2026-07-31
**Ambiguity score:** 0.13 (gate: ≤ 0.20)
**Requirements:** 6 locked

## Goal

Репозиторий из пустого состояния (только docs/ и .planning/) становится работающим Astro-проектом: чистая production-сборка, 5 базовых страниц (Home + заглушки Work/Lab/About/Contact), design tokens в CSS-переменных, валидирующиеся Content Collections с TypeScript strict, базовые layouts и SEO, документ покрытия Stacki (spike) и GitHub-репозиторий с CI — до начала визуальной сборки.

## Background

Текущее состояние: репозиторий содержит только контекстные документы (`docs/`), артефакты планирования (`.planning/`) и скрипт конвертации; кода нет — отсутствуют package.json, src/, конфигурация Astro, схемы данных, layouts, SEO-компонент, CI. Ничего из целевого состояния фазы 1 не существует. Рабочий цикл «Astro + AI-агент + Stacki + Git» требует подтверждения совместимости (spike) до того, как начнётся визуальная сборка (ADR Этап 0), а ADR задаёт baseline стека: Astro, TS strict, scoped CSS, Content Collections, MDX для кейсов, Astro Image, View Transitions, sitemap.

## Requirements

1. **Astro-скаффолд и сборка**: Astro-проект инициализирован через npm; `astro build` проходит без ошибок; preview открывается с корректным HTML на всех базовых страницах — Home плюс заглушки Work, Lab, About, Contact, использующие общий base layout.
   - Current: кода нет — нет package.json, astro.config, src/
   - Target: полный каркас Astro (package.json, astro.config, src/ со страницами и layouts), сборка и preview работают
   - Acceptance: `npm ci && npm run build` завершается кодом 0; `astro preview` отдаёт HTTP 200 с валидным HTML на маршрутах /, /work, /lab, /about, /contact

2. **Design tokens**: токены (цвета, шрифты, отступы, контейнеры, motion) определены как CSS-переменные в едином файле и применяются в стилях проекта; значения не дублируются между файлами.
   - Current: стилей нет
   - Target: единый файл tokens.css (или src/styles/tokens.css) с CSS-переменными по группам токенов; компонентные стили ссылаются на переменные
   - Acceptance: токены существуют для 5 групп (цвета, шрифты, отступы, контейнеры, motion); выборочная grep-проверка не находит хардкод-значений цвета/отступа в стилях там, где переменная существует; в проекте ровно один файл токенов

3. **Content Collections и TypeScript strict**: коллекции `projects` и `notes`, JSON-данные `services`, `skills`, `tools` валидируются zod-схемами при сборке; TypeScript strict включён, `astro check` проходит.
   - Current: схем данных нет
   - Target: Content Collections со схемами (frontmatter/JSON), TS strict в tsconfig, тип-чек в составе проверки
   - Acceptance: `astro check` завершается кодом 0; сборка падает при дубликате slug/id в записи; сборка проходит при пустых коллекциях (0 записей); сборка падает при отсутствии обязательного поля в записи

4. **Layouts и SEO**: базовые layouts и общий SEO-компонент обеспечивают каждой странице уникальные title, meta description, canonical и Open Graph; sitemap генерируется при сборке.
   - Current: layouts и SEO-компонента нет
   - Target: base layout + SEO-компонент (или эквивалентная интеграция), применяемый на всех 5 страницах; @astrojs/sitemap включён
   - Acceptance: у всех 5 страниц уникальные title и meta description (программная проверка собранного HTML: 5 уникальных пар); каждая страница содержит canonical и OG-теги; sitemap.xml генерируется и содержит все 5 маршрутов

5. **Spike-документ покрытия Stacki**: полный прогон Stacki на скаффолде — открытие проекта, чтение компонентов/props/variants, scoped styles, CSS-переменных, JSON-коллекций, frontmatter и View Transitions — с документом покрытия, закоммиченным в Git до начала визуальной сборки.
   - Current: совместимость стека со Stacki не проверялась; приложение Stacki не установлено
   - Target: Stacki установлен/запущен, прогон выполнен, документ `docs/stacki-coverage.md` (или аналогичный путь) зафиксирован в Git
   - Acceptance: документ существует в Git и содержит по одному пункту на каждую конструкцию (компоненты, props, variants, scoped styles, CSS-переменные, JSON-коллекции, frontmatter, View Transitions) с пометкой «проверено/не проверено/ограничение»; зафиксировано наблюдаемое поведение для: компонента, использующего scoped styles и CSS-переменную одновременно; коллекции с 0 записей; перечислены обнаруженные ограничения

6. **Git и CI**: GitHub-remote создан; CI workflow выполняет lint перед build на каждый push и проходит с первого push; package.json фиксирует engines (Astro latest stable, Node LTS 22).
   - Current: репозиторий только локальный (git init в этой сессии), CI нет
   - Target: GitHub-remote, workflow build+lint, engines в package.json
   - Acceptance: `git remote -v` показывает GitHub-remote; `.github/workflows/` содержит workflow: job lint успешен, затем job build успешен; при пустой истории (первый push) workflow зелёный; package.json содержит engines: node >= 22, astro ^5 (latest stable)

## Boundaries

**In scope:**
- Astro-скаффолд: package.json, astro.config, tsconfig (strict), src/ (pages, layouts, components, styles, content), .gitignore
- Design tokens как CSS-переменные (5 групп)
- Content Collections (projects, notes) + JSON-данные (services, skills, tools) со схемами
- Base layout + SEO-компонент + sitemap
- Spike Stacki: установка, прогон, документ покрытия в Git
- GitHub-remote + CI (lint → build)

**Out of scope:**
- Визуальная стилизация страниц и компонентов — фаза 2 (здесь только каркас и токены)
- Контент кейсов и тексты разделов — фаза 3
- Three.js и любая WebGL-работа — фазы 4–5
- Деплой на production — фаза 6
- Utility-first CSS (Tailwind) — запрещено ADR до проверки Stacki (см. Prohibitions)
- Тяжёлый клиентский фреймворк для всего сайта — запрещено ADR baseline
- Блог/контент-модель заметок для публикации — не учитывается по решению пользователя

## Constraints

- Пакетный менеджер: npm (зафиксировано в интервью)
- Версии: Astro latest stable (5.x), Node LTS 22 — фиксируются в engines
- TypeScript strict включён
- Обычный CSS + CSS-переменные для первого прототипа (без Tailwind/utility-first) — ADR
- Baseline стека по ADR: Content Collections, MDX для кейсов, Astro Image, View Transitions, sitemap; React island — только для сложных блоков
- Контент не дублируется между слоями (данные в коллекциях, не в разметке)

## Acceptance Criteria

- [ ] `npm ci && npm run build` завершается кодом 0 на чистой установке
- [ ] Preview отдаёт HTTP 200 с валидным HTML на 5 маршрутах: /, /work, /lab, /about, /contact
- [ ] У всех 5 страниц уникальные title и meta description (проверка собранного HTML: 5 уникальных пар)
- [ ] Каждая страница содержит canonical и Open Graph теги
- [ ] sitemap.xml генерируется и содержит все 5 маршрутов
- [ ] Единый файл токенов с 5 группами CSS-переменных (цвета, шрифты, отступы, контейнеры, motion)
- [ ] `astro check` завершается кодом 0 при заполненных и при пустых коллекциях
- [ ] Сборка падает при дубликате slug/id в коллекции
- [ ] Сборка падает при отсутствии обязательного поля в записи (zod-схема)
- [ ] Spike-документ покрытия Stacki закоммичен до начала визуальной сборки и покрывает 8 конструкций + 2 заданных краевых случая
- [ ] GitHub-remote настроен; CI workflow зелёный на первом push; lint выполняется до build
- [ ] package.json содержит engines: node >= 22, astro ^5
- [ ] НЕ: в зависимостях нет utility-first CSS фреймворков (P1)
- [ ] НЕ: нет тяжёлого клиентского фреймворка как основы сайта (P2)
- [ ] НЕ: визуальная сборка не начиналась до коммита spike-документа (P3)

## Edge Coverage

**Coverage:** 16/16 applicable edges resolved · 0 unresolved

| Category | Requirement | Status | Resolution / Reason |
|----------|-------------|--------|---------------------|
| adjacency | R1 | ✅ covered | Уникальные title/description каждой из 5 страниц — AC «уникальные пары» |
| empty | R1 | ✅ covered | Сборка проходит при пустых коллекциях — AC «astro check при пустых коллекциях» |
| ordering | R1 | ⛔ dismissed | Порядок страниц в sitemap детерминирован самим Astro; вне контроля фазы |
| concurrency | R2 | ✅ covered | Ровно один файл токенов; дубли значений между файлами недопустимы — AC «единый файл токенов» |
| adjacency | R3 | ✅ covered | Дубликат slug/id → сборка падает — AC «сборка падает при дубликате» |
| empty | R3 | ✅ covered | Пустые коллекции валидны — AC «astro check при пустых коллекциях» |
| ordering | R3 | 🧪 backstop | Детерминированный порядок записей при равных датах — held-out edge test для plan-phase |
| adjacency | R4 | ✅ covered | Уникальные title/description, fail на дубль — AC «уникальные пары» |
| empty | R4 | ✅ covered | Отсутствие обязательных SEO-полей → fail сборки (zod required) — AC «сборка падает при отсутствии поля» |
| ordering | R4 | ⛔ dismissed | sitemap генерируется Astro детерминированно; специфицировать нечего |
| adjacency | R5 | ✅ covered | Scoped styles + CSS-переменная в одном компоненте: фиксировать наблюдаемое поведение — AC «зафиксировано наблюдаемое поведение» |
| empty | R5 | ✅ covered | Коллекция с 0 записей в Stacki — пункт покрытия — AC «коллекция с 0 записей» |
| ordering | R5 | ⛔ dismissed | Порядок правок Stacki не проверяется в spike; вне объёма |
| adjacency | R6 | ⛔ dismissed | Два быстрых push — штатное поведение GitHub Actions, не специфицируется |
| empty | R6 | ✅ covered | CI зелёный на первом push (пустая история) — AC «зелёный на первом push» |
| ordering | R6 | ✅ covered | lint до build в одном workflow — AC «lint до build» |

## Prohibitions (must-NOT)

**Coverage:** 3/3 applicable prohibitions resolved · 0 unresolved

| Prohibition (must-NOT statement) | Requirement | Status | Verification / Reason |
|----------------------------------|-------------|--------|------------------------|
| Utility-first CSS фреймворк (Tailwind и аналоги) НЕ добавляется в фазе 1 | R2 | resolved | verification: test — node-test по dependencies package.json (файл-негатив: известная-хорошая/известная-плохая фикстуры; GSD_PROHIB_SUBJECT); ADR: обычный CSS + переменные до проверки Stacki |
| Тяжёлый клиентский фреймворк НЕ становится основой всего сайта | R1 | resolved | verification: judgment — ADR baseline: React island только для сложных блоков; проверяется ревью |
| Визуальная сборка НЕ начинается до коммита spike-документа Stacki | R5 | resolved | verification: judgment — ADR Этап 0; проверяется по git-истории и порядку коммитов |

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                              |
|--------------------|-------|------|--------|------------------------------------|
| Goal Clarity       | 0.90  | 0.75 | ✓      | Базовые страницы = Home + 4 заглушки |
| Boundary Clarity   | 0.88  | 0.70 | ✓      | GitHub+CI в scope; стилизация/контент/Three.js/деплой вне |
| Constraint Clarity | 0.85  | 0.65 | ✓      | npm, Astro latest, Node LTS, engines |
| Acceptance Criteria| 0.85  | 0.70 | ✓      | 15 pass/fail критериев + 2 edge-теста |
| **Ambiguity**      | 0.13  | ≤0.20| ✓      |                              |

## Interview Log

| Round | Perspective     | Question summary                          | Decision locked                        |
|-------|-----------------|------------------------------------------|----------------------------------------|
| 1     | Researcher      | Пакетный менеджер?                       | npm                                     |
| 1     | Researcher      | Объём базовых страниц?                   | Home + заглушки Work/Lab/About/Contact |
| 1     | Researcher      | Глубина spike Stacki?                    | Полный прогон, документ покрытия       |
| 2     | Boundary Keeper| Git/CI в фазе 1?                         | GitHub remote + CI (lint→build)        |
| 2     | Boundary Keeper| Версии Astro/Node?                      | Latest stable 5.x + Node LTS 22 (engines) |
| 2     | Boundary Keeper| Границы фазы?                           | Визуал/контент/Three.js/деплой — вне    |

---

*Phase: 01-osnova-proekta*
*Spec created: 2026-07-31*
*Next step: /gsd-discuss-phase 1 — implementation decisions (структура папок, набор зависимостей, схемы коллекций, workflow CI)*
