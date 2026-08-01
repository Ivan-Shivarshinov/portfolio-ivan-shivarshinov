---
phase: 01-osnova-proekta
plan: 04
subsystem: content
tags: [astro, content-layer, zod, json, validation, glob-loader, file-loader]

# Dependency graph
requires:
  - phase: 01-osnova-proekta
    provides: "scripts/check-collections.mjs (01-02), Astro scaffold с eslint/prettier/tokens (01-03)"
provides:
  - "Валидирующийся контентный слой: 5 коллекций (projects, notes, services, skills, tools) с zod-схемами из astro/zod"
  - "Строгая проверка дубликатов при сборке: дубликат slug (projects) и дубликат id (JSON) падают build"
  - "JSON-данные src/data/*.json (минимальные валидные записи) и пустые коллекции src/content/{projects,notes}"
affects: [фаза 2 — страницы потребляют services/skills/tools, фаза 3 — реальные кейсы в projects (MDX), фаза 5]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Content layer (Astro 7): defineCollection + glob() для MDX/MD + строгий JSON-лоадер для src/data; z из astro/zod (Zod 4)"
    - "Строгая детекция дубликатов: generateId-хук для glob() и собственный strict-json-loader вместо file() — дубликат падает сборку (AC R3)"
    - "Empty edge: пустые коллекции проходят сборку (D-07); order в схеме projects — детерминированная сортировка (D-09)"

key-files:
  created:
    - src/content.config.ts
    - src/data/services.json
    - src/data/skills.json
    - src/data/tools.json
    - src/content/projects/.gitkeep
    - src/content/notes/.gitkeep

key-decisions:
  - "Дубликат slug/id обязан падать сборку (AC R3): в Astro 7.1.6 дефолтные glob()/file() только предупреждают — добавлены generateId для projects и strict-json-loader вместо file() (опровергнута RESEARCH A5)"

patterns-established:
  - "Content layer pattern: glob() для MDX/MD, строгий JSON-лоадер для src/data, z из astro/zod"
  - "Strict duplicate detection: дубликат slug/id — ошибка сборки (AC R3)"

requirements-completed: [R3]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Контентный слой: 5 коллекций (projects glob MDX, notes glob MD, services/skills/tools JSON из src/data) со zod-схемами, валидируются при сборке; пустые коллекции проходят"
    requirement: R3
    verification:
      - kind: integration
        ref: "npm run check (astro check exit 0, TS strict, 13 files, 0 errors)"
        status: pass
      - kind: integration
        ref: "npm run build (astro build exit 0, 1 page, sitemap-index.xml)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Негативные фикстуры: дубликат slug (projects), отсутствие обязательного поля (notes, title), дубликат id (services.json) — каждая падает сборку ожидаемо; фикстуры удаляются, дерево чисто"
    requirement: R3
    verification:
      - kind: integration
        ref: "node scripts/check-collections.mjs (3/3 PASS, exit 0, рабочее дерево чисто от фикстур)"
        status: pass
    human_judgment: false

# Metrics
duration: 20min
completed: 2026-08-01
status: complete
---

# Phase 01 Plan 04: Контентный слой (Content Layer) Summary

**Валидирующийся контентный слой фазы: 5 zod-коллекций (projects/notes/services/skills/tools) со строгой детекцией дубликатов при сборке, JSON-данные в src/data/, пустые коллекции проходят сборку — R3 закрыт целиком**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-08-01T23:25:00Z
- **Completed:** 2026-08-01T23:37:00Z
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments

- `src/content.config.ts` — 5 коллекций: projects (glob `**/*.{md,mdx}` + строгий generateId), notes (glob `**/*.md`), services/skills/tools (строгий JSON-лоадер из src/data); z из `astro/zod` (Zod 4)
- Схема projects по D-05: slug, title, summary, role, stack, year, status enum, client-type, order (default 0 — D-09), titleEn optional (задел на EN, D-08); четыре вопроса кейса — в MDX-теле
- `src/data/services.json` / `skills.json` / `tools.json` — минимальные валидные записи на русском с уникальными id
- `src/content/projects/.gitkeep` и `src/content/notes/.gitkeep` — пустые коллекции (0 записей), edge «пустые коллекции проходят сборку» (D-07)
- `scripts/check-collections.mjs` перешёл из PREREQ_MISSING в зелёный: 3/3 негативных теста падают ожидаемо и удаляются

## Task Commits

Каждая задача закоммичена атомарно:

1. **Task 1: src/content.config.ts + JSON-данные + пустые коллекции** - `86ef912` (feat)

**Plan metadata:** pending final docs commit

## Files Created/Modified

- `src/content.config.ts` — 5 коллекций, строгие лоадеры (generateId для projects, strict-json-loader для services/skills/tools), zod-схемы
- `src/data/services.json` — 3 записи (web-dev, web-apps, integration)
- `src/data/skills.json` — 3 записи (typescript, astro, nodejs)
- `src/data/tools.json` — 3 записи (git, figma, vscode)
- `src/content/projects/.gitkeep` — пустая коллекция кейсов (до фазы 3)
- `src/content/notes/.gitkeep` — пустая коллекция заметок (D-07)

## Decisions Made

- **Дубликат slug/id падает сборку через строгие лоадеры.** В Astro 7.1.6 дефолтные glob()/file() при дубликате только предупреждают (logger.warn) и перезаписывают запись — сборка не падает. Чтобы выполнялся AC R3 «сборка падает при дубликате», в content.config.ts добавлены: generateId-хук для projects (throw на дубликате slug между разными файлами; повторная генерация для того же файла в dev-watcher допустима) и strict-json-loader вместо file() (throw на отсутствии/дубликате id; поведение идентично file(): валидация через parseData, пересинк по watch в dev). Zod-схемы не менялись.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Дефолтные лоадеры Astro 7.1.6 не падают на дубликатах — RESEARCH A5 опровергнут эмпирически**
- **Found during:** Task 1 (верификация: check-collections.mjs дал 2/3 FAIL — дубликат slug и дубликат id НЕ роняли сборку)
- **Issue:** RESEARCH Pitfall 8 / Assumption A5 утверждали: дубликат slug → `DuplicateContentEntrySlugError`, дубликат id в file() → ошибка загрузки. В установленном Astro 7.1.6 новый content layer API (glob loader, file loader) при дубликате id/slug делает `logger.warn` + перезапись записи — build exit 0. `DuplicateContentEntrySlugError` существует только в legacy-режиме. Это нарушало must-have truth «Дубликат slug/id в коллекции → сборка падает» и AC R3.
- **Fix:** Строгие обёртки в src/content.config.ts: `strictProjectId()` — generateId для glob (throw при дубликате slug между файлами, id = data.slug либо slug из пути); `strictJsonLoader()` — собственный лоадер вместо file() (throw при отсутствии/дубликате id, полная совместимость с file(): parseData-валидация схемы, dev-watcher). `file` из astro/loaders больше не импортируется.
- **Files modified:** src/content.config.ts
- **Verification:** node scripts/check-collections.mjs — 3/3 PASS, сборка падает на всех трёх фикстурах ожидаемо; npm run check/build exit 0 на чистом дереве
- **Committed in:** 86ef912 (коммит Task 1)

---

**Total deviations:** 1 auto-fixed (1 по Rule 1 — поведение фреймворка)
**Impact on plan:** Отклонение необходимо для выполнения must-have truth и AC R3 («сборка падает при дубликате»). Объём не расширен: изменения только внутри src/content.config.ts, схемы и контракты JSON не менялись, API для фаз 2–3 (getCollection по id) совместим с дефолтным поведением Astro.

## Issues Encountered

- `readFile` из `node:fs` (callback API) с аргументом 'utf-8' давал `The "cb" argument must be of type function` — заменён импорт на `node:fs/promises`; попутно добавлены явные типы Loader/LoaderContext для TS strict (3 ошибки implicit any закрыты). Исправлено в рамках Task 1 до коммита.
- RESEARCH A5 (`file() требует уникальный id` — [CITED: docs]) оказался неверен для content layer API Astro 7: файловый лоадер предупреждает, а не бросает. Зафиксировано в SUMMARY и будет полезно фазе 3 (строгая детекция уже встроена в лоадеры, дубликаты в JSON невозможны).

## User Setup Required

None - внешние сервисы не требуются.

## Next Phase Readiness

- Контентный слой готов к потреблению: фаза 2 может читать services/skills/tools через `getCollection` с полными типами из zod-схем
- Фаза 3: кейсы добавляются как MDX в `src/content/projects/` с frontmatter по схеме D-05 (slug обязателен — он же id записи), заметки — MD в `src/content/notes/`
- Дубликат slug/id в коллекциях теперь невозможен без падения сборки — гарантия целостности данных на весь проект
- Детерминированная сортировка проектов через `order` (D-09) зафиксирована в схеме — backstop-маркер для фазы 3

## Self-Check: PASSED

- FOUND: src/content.config.ts, src/data/services.json, src/data/skills.json, src/data/tools.json, src/content/projects/.gitkeep, src/content/notes/.gitkeep
- FOUND: commit 86ef912 (feat(01-04): add content layer with 5 collections and JSON data)

---
*Phase: 01-osnova-proekta*
*Completed: 2026-08-01*
