---
phase: 01-osnova-proekta
plan: 02
subsystem: testing
tags: [validation, scripts, node, astro, r1, r2, r3, r4, r5, wave0]

# Dependency graph
requires:
  - phase: 01-osnova-proekta
    provides: Wave 0 gaps contract (01-VALIDATION.md lines 63-70, Per-Task Verification Map R1-R5)
provides:
  - 5 validation scripts (verify-preview, check-tokens, check-seo, check-collections, check-spike-doc) with --self-test modes
  - Script contracts consumed by plans 01-03 (verify-preview --routes /, check-tokens), 01-04 (check-collections), 01-05 (check-seo, verify-preview full), 01-06 (check-spike-doc)
affects: [01-03, 01-04, 01-05, 01-06, CI workflow in 01-07]

# Tech tracking
tech-stack:
  added: [none — plain Node.js ESM, no frameworks]
  patterns:
    - "Validation scripts: plain Node.js ESM with --self-test mode for logic verification without a built project (no test framework in phase 1)"
    - "Windows-safe process spawning: .cmd shims (npx/npm) via cmd.exe wrapper with windowsVerbatimArguments (direct spawn throws EINVAL)"
    - "Negative tests: temporary fixtures named zz-check-* (no leading dot — Astro globs ignore dot-files), removed in finally, tree-clean assert after run"
    - "Preview verification: script spawns astro preview itself, polls GET / until 200 (60 s timeout), probes routes for 200 + text/html"

key-files:
  created:
    - scripts/verify-preview.mjs
    - scripts/check-tokens.mjs
    - scripts/check-seo.mjs
    - scripts/check-collections.mjs
    - scripts/check-spike-doc.mjs

key-decisions:
  - "npx spawn uses --no-install: fail-fast with a clear error when project deps are missing, instead of a nondeterministic interactive install prompt in non-TTY"
  - "Windows: .cmd shims spawned via cmd.exe /d /s /c with windowsVerbatimArguments (direct spawn of npx.cmd/npm.cmd throws EINVAL on this Node)"
  - "check-spike-doc.mjs defines the keyword contract for docs/stacki-coverage.md (each of 8 constructions + 2 edges has a keyword; verdict row must contain «проверено» or «ограничение») — consumer plan 01-06 writes the doc to this contract"
  - "check-collections.mjs fixtures are schema-compatible with the 01-04 schemas (projects frontmatter has all required fields; notes fixture lacks only title), so negative tests fail for the intended reason (DuplicateContentEntrySlugError / zod required / duplicate id), not for missing unrelated fields"
  - "client:* directive absence check stays in 01-05 as a separate grep verify (01-05 decided grep instead of extending check-seo.mjs); check-seo.mjs implements only the 01-02 contract (pairs, canonical+OG, sitemap-index.xml)"

patterns-established:
  - "Pattern 1: each script has --self-test with built-in fixtures (no network, no build) and a real-project mode; exit 0/1 contract"
  - "Pattern 2: verify scripts resolve repo root from import.meta.url — cwd-independent execution"

requirements-completed: [R1, R2, R3, R4, R5]

# Coverage metadata — per-deliverable requirements traceability (consumed by verify-work)
coverage:
  - id: D1
    description: "verify-preview.mjs — spawns astro preview, waits for readiness (60 s), probes HTTP 200 + text/html on /, /work, /lab, /about, /contact (R1)"
    requirement: R1
    verification:
      - kind: unit
        ref: "node scripts/verify-preview.mjs --self-test"
        status: pass
    human_judgment: false
  - id: D2
    description: "check-tokens.mjs — single tokens file whitelist src/styles/tokens.css, 5 variable groups, hardcode ban (hex, spacing-scale px) outside tokens.css (R2)"
    requirement: R2
    verification:
      - kind: unit
        ref: "node scripts/check-tokens.mjs --self-test"
        status: pass
    human_judgment: false
  - id: D3
    description: "check-collections.mjs — negative fixtures: duplicate slug, missing required field, duplicate id; each expects build exit != 0; fixtures removed in finally; tree-clean assert (R3)"
    requirement: R3
    verification:
      - kind: unit
        ref: "node scripts/check-collections.mjs --self-test"
        status: pass
    human_judgment: false
  - id: D4
    description: "check-seo.mjs — 5 unique title/description pairs, canonical + 6 OG tags per page, 5 url elements in dist/sitemap-index.xml (R4, Pitfall 3)"
    requirement: R4
    verification:
      - kind: unit
        ref: "node scripts/check-seo.mjs --self-test"
        status: pass
    human_judgment: false
  - id: D5
    description: "check-spike-doc.mjs — docs/stacki-coverage.md covers 8 constructions + 2 edge cases, each with verdict «проверено» or «ограничение» (R5)"
    requirement: R5
    verification:
      - kind: unit
        ref: "node scripts/check-spike-doc.mjs --self-test"
        status: pass
    human_judgment: false

# Metrics
duration: 15min
completed: 2026-08-01
status: complete
---

# Phase 01 Plan 02: Валидационный каркас Wave 0 — 5 скриптов проверки R1–R5

**5 plain-Node.js валидационных скриптов (verify-preview, check-tokens, check-seo, check-collections, check-spike-doc) с режимами --self-test, покрывающих требования R1–R5 фазы на уровне сборки/артефактов — волновые пробелы Wave 0 gaps 1-5 закрыты, gap 6 (package.json scripts) закреплён за планом 01-03**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-08-01T21:02:52Z
- **Completed:** 2026-08-01T21:05:20Z
- **Tasks:** 2
- **Files modified:** 5 created

## Accomplishments

- **scripts/verify-preview.mjs** (R1): спавнит `astro preview` (порт из `--port`, default 4321), ждёт готовности (polling GET / до 200, таймаут 60 с), пробивает маршруты `/ /work /lab /about /contact` на HTTP 200 + text/html; `--routes` ограничивает список (потребитель — tracer 01-03: `--routes /`); preview-процесс завершается в finally (Windows — taskkill дерева)
- **scripts/check-tokens.mjs** (R2): единый файл токенов (whitelist `src/styles/tokens.css`, любой другой файл с CSS-переменными в src/styles|src/components — нарушение), 5 групп (`--color-*`, `--font-*`/`--text-*`, `--space-*`, `--container-*`, `--motion-*`), запрет хардкода: hex (#RGB/#RRGGBB/#RRGGBBAA) и px шкалы отступов (4/8/16/24/32/48/64) вне tokens.css; 1–2 px (outline/focus) — не нарушение
- **scripts/check-seo.mjs** (R4): ровно 5 уникальных пар title/description по всем dist/**/*.html (детект дублей с перечислением страниц), canonical + 6 OG-тегов (og:title, og:description, og:type, og:url, og:locale) на каждой странице, 5 элементов url в `dist/sitemap-index.xml` (Pitfall 3: НЕ sitemap.xml)
- **scripts/check-collections.mjs** (R3): три негативных теста с временными фикстурами — дубликат slug (два `zz-check-*.mdx` без ведущей точки, схемо-совместимый frontmatter → ожидается DuplicateContentEntrySlugError), отсутствие обязательного поля title в notes, дубликат id в services.json (резервная копия → дубликат → build fail → восстановление в finally); финальный assert чистоты дерева (нет zz-check-* файлов, services.json байт-в-байт восстановлен)
- **scripts/check-spike-doc.mjs** (R5): docs/stacki-coverage.md обязан покрывать 8 конструкций (компоненты, props, variants, scoped styles, CSS-переменные, JSON-коллекции, frontmatter, View Transitions) + 2 краевых случая (scoped style + переменная одновременно; коллекция с 0 записей), каждый с вердиктом «проверено/ограничение»; контракт ключевых слов задокументирован для 01-06
- Все 5 скриптов имеют `--self-test` с встроенными фикстурами (без сети и без build): `node --check` + `--self-test` — зелёные (exit 0)

## Task Commits

Each task was committed atomically:

1. **Task 1: verify-preview.mjs + check-tokens.mjs** - `79c13c6` (feat)
2. **Task 2: check-seo.mjs + check-collections.mjs + check-spike-doc.mjs** - `bd8a1ea` (feat)

**Plan metadata:** pending (final docs commit)

## Files Created/Modified

- `scripts/verify-preview.mjs` - HTTP 200 + text/html на 5 маршрутах preview (R1); CLI: `--port N`, `--routes r1,r2`, `--self-test`
- `scripts/check-tokens.mjs` - единый файл токенов, 5 групп, запрет хардкода (R2); CLI: `--self-test`
- `scripts/check-seo.mjs` - 5 уникальных пар title/description, canonical + OG, sitemap-index.xml (R4); CLI: `--self-test`
- `scripts/check-collections.mjs` - негативные фикстуры дубликата slug/id и отсутствия поля (R3); CLI: `--self-test`
- `scripts/check-spike-doc.mjs` - 8 конструкций + 2 edge с вердиктами в docs/stacki-coverage.md (R5); CLI: `--self-test`

## Decisions Made

- `--no-install` для `npx astro preview`: честный fail-fast при неустановленных зависимостях вместо недетерминированного интерактивного промпта npx в non-TTY (подробности в Deviations)
- Windows-спавн `.cmd`-шимов через `cmd.exe /d /s /c` + `windowsVerbatimArguments`: прямой `spawn('npx.cmd')` на этой машине (Node 24.18.0, win32) бросает EINVAL
- check-spike-doc.mjs задаёт контракт ключевых слов документа (например, edge 1 детектируется по слову «одновременн», edge 2 — по «0 запис»/«пустая коллекц») — план 01-06 пишет документ под этот контракт
- Фикстуры check-collections.mjs схемо-совместимы со схемами 01-04 (projects: slug/title/summary/role/stack/year/status/client-type/order; notes: без title; services: {id,title,description}) — негативные тесты падают по задуманной причине
- Проверка отсутствия client:* директив остаётся в 01-05 отдельным grep (решение 01-05), а не расширением check-seo.mjs — check-seo.mjs реализует ровно контракт 01-02

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2/3 - Robustness] `npx` спавнится с `--no-install`; Windows-обёртка cmd.exe для .cmd-шимов**
- **Found during:** Task 1 (verify-preview.mjs)
- **Issue:** (a) план предписывал `npx astro preview` — в non-TTY npx может вести себя недетерминированно (промпт установки/ошибка), что недопустимо для verify-скрипта; (b) прямой `spawn('npx.cmd')`/`spawn('npm.cmd')` на Windows (Node 24.18.0) бросает EINVAL — скрипты не запустились бы вовсе
- **Fix:** `--no-install` добавлен в spawn preview (fail-fast с явной ошибкой «command not found» при отсутствии зависимостей — verify запускается после npm install); команды .cmd обёрнуты в `cmd.exe /d /s /c` с `windowsVerbatimArguments: true` (проверено эмпирически: npx --version / npm --version через обёртку — exit 0)
- **Files modified:** scripts/verify-preview.mjs, scripts/check-collections.mjs (runBuild)
- **Verification:** node --check + --self-test всех 5 скриптов, exit 0
- **Committed in:** 79c13c6, bd8a1ea (в составе task-коммитов)

**2. [Rule 1 - Bug] Фикстура self-test check-spike-doc.mjs не удаляла ключевое слово**
- **Found during:** Task 2 (self-test no-vt)
- **Issue:** фикстура «документ без View Transitions» заменяла содержимое строки, оставляя подстроку «View Transitions» — тест детектировал «нет вердикта» вместо «отсутствует пункт», self-test падал
- **Fix:** замена всей строки таблицы целиком (строка без ключевого слова), self-test зелёный
- **Files modified:** scripts/check-spike-doc.mjs
- **Verification:** node scripts/check-spike-doc.mjs --self-test, exit 0
- **Committed in:** bd8a1ea

---

**Total deviations:** 2 auto-fixed (1 robustness ×2 файла, 1 тестовая фикстура)
**Impact on plan:** Все авто-фиксы необходимы для корректного запуска скриптов на целевой платформе (Windows) и честного fail-fast поведения; scope не расширен.

## Issues Encountered

- Windows-спавн .cmd-шимов: `spawn('npx.cmd', ...)` → EINVAL, `spawn('npx', ...)` → ENOENT на Node 24.18.0 (win32, Git Bash). Решение — cmd.exe-обёртка (задокументировано в Deviations; проверено эмпирически).
- Фикстура self-test в check-spike-doc.mjs (no-vt) маскировала отсутствие пункта ключевым словом в тексте замены — исправлено до коммита.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Wave 0 gaps 1-5 закрыты; gap 6 (package.json scripts dev/build/preview/lint/check/verify + engines) закреплён за планом 01-03 (tracer), который также проверит скрипты на живом каркасе: `node scripts/check-tokens.mjs` и `node scripts/verify-preview.mjs --routes /` (см. 01-03 verify)
- Полные прогоны скриптов против реального проекта: 01-04 (check-collections), 01-05 (check-seo + verify-preview полный), 01-06 (check-spike-doc) — согласно 01-VALIDATION.md Sampling Rate
- Контракты скриптов зафиксированы: конфигурации 01-03/01-04/01-05/01-06 сверяются с этим SUMMARY (artifacts-секции)

---
*Phase: 01-osnova-proekta*
*Completed: 2026-08-01*
