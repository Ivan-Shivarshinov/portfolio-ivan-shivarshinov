---
phase: 02-vizualnaya-sistema
plan: 01
subsystem: testing
tags: [validation, wcag, contrast, astro, tokens, scripts]

# Dependency graph
requires:
  - phase: 01-osnova-proekta
    provides: 6 validation scripts (check-tokens, check-seo, check-collections, check-prohibitions, verify-preview, check-spike-doc) — каркас plain-Node self-test скриптов
provides:
  - Расширенный scripts/check-tokens.mjs: bp-группа (6 групп), проверка наличия токенов фазы 2, сверка чисел media-запросов с bp-токенами, grep-правило transition-токенов, W1-ассерт по dist, grep-контроль использования 8 компонентов, 0 <script> в dist
  - Новый scripts/check-contrast.mjs: WCAG 2.x контраст 20 пар UI-SPEC ≥ 4.5:1
  - Новый scripts/check-theme.mjs: negative-фикстура невалидного theme-пропа
  - package.json: скрипты check-contrast/check-theme, verify-цепочка с check-contrast
affects: [02-03 (реальный прогон check-tokens/check-contrast после расширения tokens.css), 02-04 (реальный прогон check-theme), 02-05 (grep-контроль использования), verify-work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Расширение существующего check-скрипта: GROUPS как точка расширения, фикстуры mkdtempSync для каждого правила"
    - "W1-ассерт по dist-HTML: walk dist/**/*.html + regex (паттерн check-seo.mjs), guard «dist не найден → предупреждение, не fail»"
    - "Negative-фикстура R5: временный src/pages/zz-check-theme.astro, ожидание exit != 0 от npm run check, удаление в finally"
    - "Windows-спавн .cmd-шимов через cmd.exe /d /s /c + windowsVerbatimArguments (STATE 01-02 T1)"

key-files:
  created:
    - scripts/check-contrast.mjs
    - scripts/check-theme.mjs
  modified:
    - scripts/check-tokens.mjs
    - package.json

key-decisions:
  - "[02-01 T1] W1-маршрут вычисляется относительно dist/ (relative(distDir, f)), а не корня проекта — иначе маршруты получаются dist/index.html вместо /"
  - "[02-01 T1] Grep-контроль использования компонентов пропускается с предупреждением, если в src/pages|src/layouts нет ни одного файла (аналог guard для dist) — фикстуры legacy-правил не дают ложных срабатываний"
  - "[02-01 T2] check-theme не включается в verify-цепочку: требует собранного ProjectCard и дублирует astro check; реальный прогон — в 02-04 Task 2"
  - "[02-01 T2] Повторный npm run check после удаления фикстуры — предупреждение, не fail (отличный exit может быть вызван посторонними ошибками типов)"

patterns-established:
  - "Расширение check-tokens: существующие правила и их self-tests сохраняются, GOOD_TOKENS дополняется новыми обязательными токенами (иначе старые фикстуры падают по ложной причине)"
  - "Проверка «чистого дерева»: после self-test/прогона git status не содержит zz-check-* файлов"
  - "Сверка расчётных эталонов WCAG с RESEARCH: чёрный×белый 21:1, #A84B32×#FAFAF7 5.40:1 — фактический прогон против проекта дал 15.93/6.59/5.40/4.95/5.65 (точное совпадение с таблицей исследования)"

requirements-completed: [REQ-design-implications, R1, R2, R3, R4, R5, R8]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Расширенный scripts/check-tokens.mjs: 6-я группа bp, обязательные токены фазы 2 (+clamp в --text-display), сверка чисел media-запросов с --bp-md/--bp-lg (min-width только), grep-правило transition (var(--motion-*)/var(--ease-*) без литералов), W1-ассерт по dist (ровно один aria-current=\"page\" с верным href), grep-контроль импорта 8 компонентов, 0 <script> в dist — все с self-tests на фикстурах (a)-(g)"
    requirement: R1
    verification:
      - kind: unit
        ref: "node scripts/check-tokens.mjs --self-test"
        status: pass
      - kind: unit
        ref: "node --check scripts/check-tokens.mjs"
        status: pass
    human_judgment: false
  - id: D2
    description: "Новый scripts/check-contrast.mjs: формула WCAG 2.x (luminance/ratio), 20 пар UI-SPEC Color ≥ 4.5:1, --color-line исключён, детекция «токен не найден»; self-test с эталонами 21:1, 5.40:1 (pass) и 1.35:1 (fail-path)"
    requirement: R8
    verification:
      - kind: unit
        ref: "node scripts/check-contrast.mjs --self-test"
        status: pass
      - kind: unit
        ref: "node --check scripts/check-contrast.mjs"
        status: pass
    human_judgment: false
  - id: D3
    description: "Новый scripts/check-theme.mjs: negative-фикстура zz-check-theme.astro с theme=\"bad\", ожидание exit != 0 от npm run check, удаление фикстуры в finally, проверка чистоты дерева от zz-check-*"
    requirement: R5
    verification:
      - kind: unit
        ref: "node scripts/check-theme.mjs --self-test"
        status: pass
      - kind: unit
        ref: "node --check scripts/check-theme.mjs"
        status: pass
    human_judgment: true
    rationale: "Реальный прогон negative-фикстуры против ProjectCard требует существующего компонента (план 02-04 Task 2); self-test покрывает только логику создания/удаления фикстуры"
  - id: D4
    description: "package.json: скрипты check-contrast и check-theme; verify-цепочка расширена — build → check-seo → check-tokens → check-contrast → check-collections → check-prohibitions (check-theme вне verify)"
    requirement: R8
    verification:
      - kind: unit
        ref: "node -e \"const p=require('./package.json'); ...\" (wiring assert)"
        status: pass
    human_judgment: false

# Metrics
duration: 18min
completed: 2026-08-02
status: complete
---

# Phase 02, Plan 01: Валидационный каркас фазы 2 Summary

**Расширение check-tokens.mjs (bp-группа, сверка чисел media-запросов, grep-правило transition-токенов, W1-ассерт по dist, grep-контроль использования компонентов, 0 `<script>`) + два новых скрипта: check-contrast.mjs (WCAG 2.x контраст 20 пар UI-SPEC ≥ 4.5:1) и check-theme.mjs (negative-фикстура невалидного theme-пропа), плюс wiring npm verify**

## Performance

- **Duration:** 18 min
- **Started:** 2026-08-02T20:55:28Z
- **Completed:** 2026-08-02T21:13:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- check-tokens.mjs расширен 7 новыми правилами (bp-группа — 6 групп всего, обязательные токены `--text-lead`/`--text-caption`/`--ease-enter`/`--ease-exit`/`--color-line`/`--project-clay`/`--project-olive`/`--project-slate`/`--project-plum` + `clamp(` в `--text-display`, сверка `@media (min-width: Npx)` со значениями `--bp-md`/`--bp-lg` в src/components|layouts|pages, запрет max-width, grep-правило transition только через `var(--motion-*)`/`var(--ease-*)`, W1-ассерт по dist с guard «dist не найден», grep-контроль импорта 8 компонентов, 0 `<script>` в dist) — все покрыты фикстурами self-test (a)-(g), legacy-правила и их self-tests сохранены
- check-contrast.mjs создан по паттерну check-tokens (walk не нужен — чтение tokens.css), формула WCAG 2.x дословно из RESEARCH Code Example 5; self-test эталоны 21:1 и 5.40:1 проходят, 1.35:1 детектируется как нарушение; фактический прогон против текущего проекта: существующие пары дали ровно значения таблицы RESEARCH (ink×bg 15.93, ink-muted×bg 6.59, accent×bg 5.40, accent×surface 4.95, accent-ink×accent 5.65)
- check-theme.mjs создан: negative-фикстура `src/pages/zz-check-theme.astro` с `theme="bad"`, ожидание exit != 0 от `npm run check` (TS strict), удаление в finally + проверка чистоты дерева; Windows-спавн через `cmd.exe /d /s /c` + `windowsVerbatimArguments` (STATE 01-02 T1); повторный check после удаления — предупреждение, не fail
- package.json: добавлены скрипты `check-contrast` и `check-theme`; verify = `npm run build && npm run check-seo && npm run check-tokens && npm run check-contrast && npm run check-collections && node scripts/check-prohibitions.mjs` (check-theme вне verify — прогоняется в 02-04 Task 2)

## Task Commits

Each task was committed atomically:

1. **Task 1: расширение scripts/check-tokens.mjs** - `af43e9f` (feat)
2. **Task 2: check-contrast.mjs + check-theme.mjs + wiring npm verify** - `c9ce49a` (feat)

**Plan metadata:** `pending` (docs commit после state-обновлений)

## Files Created/Modified
- `scripts/check-tokens.mjs` - Расширен: GROUPS 6 групп (+`bp (--bp-*)`), REQUIRED_TOKENS (9 токенов фазы 2 + clamp в `--text-display`), сверка `@media (min-width: Npx)` с bp-значениями из tokens.css + запрет max-width, grep-правило transition по src/components (литералы `\d+ms`/`cubic-bezier(`/ease-слова → нарушение), W1-ассерт по dist/**/*.html (ровно один `aria-current="page"`, href == маршруту файла; guard при отсутствии dist), grep-контроль импорта 8 компонентов в src/pages|src/layouts, 0 `<script>` в dist; self-tests (a)-(g) + регрессия legacy-правил
- `scripts/check-contrast.mjs` - Новый: `luminance()`/`ratio()` по WCAG 2.x (линеаризация sRGB), PAIRS — 20 пар UI-SPEC Color, порог 4.5:1, детекция «токен не найден», `--color-line` исключён; self-test с эталонами RESEARCH (21:1, 5.40:1, 1.35:1 fail-path, фикстура полной палитры → 0 нарушений, отсутствующий `--project-plum` → нарушение)
- `scripts/check-theme.mjs` - Новый: negative-фикстура theme="bad" → `npm run check` exit != 0; удаление в finally + проверка отсутствия zz-check-*; повторный check — предупреждение; self-test логики создания/удаления на временной директории (без astro)
- `package.json` - Скрипты `check-contrast`/`check-theme`; verify-цепочка с `npm run check-contrast` после check-tokens

## Decisions Made
- W1-маршрут вычисляется относительно dist-директории, а не корня проекта (иначе маршруты выходили `dist/index.html` вместо `/`) — исправлено в рамках Task 1 (см. Deviations)
- Grep-контроль использования компонентов пропускается с предупреждением при отсутствии файлов в src/pages|src/layouts (guard-паттерн, как для dist) — legacy-фикстуры self-test не дают ложных срабатываний
- check-theme вне verify-цепочки (дублирует astro check, требует ProjectCard) — реальный прогон в 02-04 Task 2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] W1-маршрут вычислялся от корня проекта вместо dist/**
- **Found during:** Task 1 (проверка self-test — фикстура good-dist)
- **Issue:** `routeForFile()` получал `rel(f)` = `dist/index.html` вместо `index.html` — маршруты выходили `/dist`, `/dist/work`; W1-ассерт ложно падал на корректных страницах
- **Fix:** маршрут вычисляется от пути, относительного dist-директории: `routeForFile(relative(distDir, f).replaceAll('\\', '/'))`
- **Files modified:** scripts/check-tokens.mjs
- **Verification:** `node scripts/check-tokens.mjs --self-test` exit 0 (фикстуры good-dist/bad-dist классифицируются верно)
- **Committed in:** af43e9f (Task 1 commit)

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Исправление необходимо для корректности W1-ассерта. Расширения объёма нет.

## Issues Encountered
None — оба таска прошли по плану; единственная проблема (W1-route) решена в рамках Task 1.

## User Setup Required
None - внешние сервисы не задействованы.

## Next Phase Readiness
- Wave 0 gaps 1-6 закрыты: gaps 1-3, 5-6 — здесь (check-contrast, расширение check-tokens с W1-ассертом и grep-правилами, npm verify); gap 4 (реальный прогон negative-фикстуры theme) — 02-04 Task 2
- Потребители: 02-03 (bp-группа и токены в tokens.css — реальный прогон check-tokens/check-contrast; W1-ассерт после build), 02-05 (grep-контроль использования компонентов), 02-04 Task 2 (check-theme против ProjectCard)
- Полный `npm run verify` зелёный только после 02-05 (bp-группа и 8 импортов требуют кода фаз 02-03/02-04/02-05) — ожидаемое поведение, паттерн фазы 1
- Реальный прогон check-tokens сейчас падает на отсутствии bp-группы и новых токенов (exit 1) — по контракту, до 02-03

## Self-Check: PASSED

- Файлы: scripts/check-tokens.mjs, scripts/check-contrast.mjs, scripts/check-theme.mjs, 02-01-SUMMARY.md — все существуют
- Коммиты: af43e9f (Task 1), c9ce49a (Task 2) — оба в истории
- Чистота дерева: 0 zz-check-* файлов после self-test

---
*Phase: 02-vizualnaya-sistema*
*Completed: 2026-08-02*
