---
phase: 03-kontent-i-stranicy
plan: 01
subsystem: content
tags: [astro, zod, content-collections, image-helper, check-scripts]

# Dependency graph
requires:
  - phase: 01-osnova-proekta
    provides: "Контентный слой (01-04): strictProjectId, strict-json-loader, коллекции projects/notes/services/skills/tools, пустые коллекции проходят сборку"
  - phase: 02-vizualnaya-sistema
    provides: "Палитра тем кейсов terracotta/clay/olive/slate/plum (D-07/D-08); terracotta — системный accent"
provides:
  - "Схема projects: theme (zod enum 5 значений, D-05), featured (boolean default false, D-08), cover: image() + coverAlt (R8), регэксп слага /^[a-z0-9-]+$/ (A2)"
  - "Коллекция contacts (strict-json-loader ./src/data/contacts.json, схема id/label/value/href, D-11)"
  - "Аудит границ коллекций в check-collections: projects 5–6, featured 2–3, theme без terracotta (D-06), cover-файл на диске, 4 h2 в теле ровно по одному разу, дублей cover нет, notes = 0 (D-07) — с self-test"
affects: [03-02, 03-03, 03-04, 03-05, 03-06]

# Tech tracking
tech-stack:
  added: ["image() хелпер схемы (astro:content schema-helper, Astro 7.1.6)", "strictJsonLoader для contacts"]
  patterns:
    - "schema: ({ image }) => z.object(...) — image()-хелпер валидирует файл при сборке относительно папки записи (R8, Pitfall 5/6)"
    - "Контрактная граница = чистая функция + реальный прогон + self-test-фикстура (паттерн check-скриптов проекта, 01-02)"
    - "Фикстуры негативных тестов схемо-совместимы: падение сборки строго от задуманной причины (Pitfall 9)"

key-files:
  created: []
  modified: [src/content.config.ts, scripts/check-collections.mjs]

key-decisions:
  - "cover/coverAlt добавлены в схему projects через image()-хелпер (R8, Open Question 2): build-level гарантия существования файла — единственный механизм без grep-проверки импортов"
  - "Фикстура duplicateSlugTest пишет временный PNG 1×1 (zz-check-cover.png) рядом с фикстурами и удаляет в finally — без файла image() уронил бы сборку zod-ошибкой, а не DuplicateContentEntrySlugError"
  - "Аудит границ — чистые функции (countBoundaries/featuredBoundaries/themeBoundary/bodyAudit/coverDupAudit/notesBoundary) + реальный прогон по src/content/projects; парсинг frontmatter — regex-матчи строк без YAML-библиотеки (стиль проекта)"
  - "Проверка «дубликат slug» усилена регэкспом /Duplicate slug/: strictProjectId бросает Error с сообщением 'Duplicate slug...', а не 'same slug'"

patterns-established:
  - "Pattern: schema-хелпер image() для файловых полей контента (cover) — типобезопасность + валидация файла при сборке"
  - "Pattern: граница контракта = чистые функции аудита + self-test-фикстуры (PASS/FAIL) + вывод в реальном прогоне"
  - "Pattern: временный ассет фикстуры (PNG) создаётся и удаляется тем же тестом, assertTreeClean ловит остатки по префиксу zz-check-"

requirements-completed: [REQ-evidence-cases]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Схема projects расширена (theme/featured/cover/coverAlt + регэксп слага), коллекция contacts зарегистрирована — сборка зелёная при пустых коллекциях и отсутствующем contacts.json"
    requirement: REQ-evidence-cases
    verification:
      - kind: integration
        ref: "npm run build (astro check + astro build) — exit 0"
        status: pass
      - kind: integration
        ref: "src/content.config.ts — schema: ({ image }) => z.object, theme enum, featured default, cover: image(), slug regex, contacts в export collections"
        status: pass
    human_judgment: false
  - id: D2
    description: "check-collections реализует границы коллекций (5–6 записей, featured 2–3, theme без terracotta, cover-файл существует, 4 h2 по одному разу, дублей cover нет, notes = 0) с self-test"
    requirement: REQ-evidence-cases
    verification:
      - kind: unit
        ref: "node scripts/check-collections.mjs --self-test — exit 0"
        status: pass
      - kind: integration
        ref: "node scripts/check-collections.mjs — 3 негативных теста PASS, DuplicateContentEntrySlugError подтверждён (реальный прогон до записей кейсов: аудит границ ожидаемо FAIL на 0 записей)"
        status: pass
    human_judgment: false
---

# Phase 03 Plan 01: Контракты контента фазы 3 (схема projects, коллекция contacts, границы коллекций)

Схема проектов расширена полями `theme` (zod enum 5 значений, D-05), `featured` (boolean default false, D-08), `cover: image()` + `coverAlt` (R8) и регэкспом слага (A2); введена коллекция `contacts` (strict-json-loader, `{id, label, value, href}`, D-11); check-collections получил жёсткие границы коллекций (5–6 записей, featured 2–3, темы без terracotta, cover-файлы, 4 h2 в теле, дублей cover нет, notes = 0) с self-test. Это интерфейсный контракт для всех последующих планов фазы (03-02…03-06).

## Tasks

| # | Name | Commit |
|---|------|--------|
| 1 | Расширить схему projects и добавить коллекцию contacts в content.config.ts | 387ac26 |
| 2 | Обновить check-collections.mjs — схемо-совместимая фикстура + границы коллекций | c3e73ec |

## Key Files

- **src/content.config.ts** (modified) — `schema: ({ image }) => z.object(...)` для projects; theme/featured/cover/coverAlt; `slug: z.string().regex(/^[a-z0-9-]+$/)`; коллекция `contacts` через strict-json-loader; регистрация в `export const collections`
- **scripts/check-collections.mjs** (modified) — projectFixture с theme: clay/featured: false/cover './zz-check-cover.png'/coverAlt; duplicateSlugTest пишет и удаляет PNG 1×1; auditCaseBoundaries/auditNotesBoundary (чистые функции countBoundaries, featuredBoundaries, themeBoundary, bodyAudit, coverDupAudit, notesBoundary); self-test-фикстуры новых границ; реальный прогон выводит «аудит границ» с exit 1 при проблемах

## Deviations from Plan

None — план выполнен точно как написан. Два уточнения в рамках плана:

- **Регэксп детекции дубликата усилен** (`/DuplicateContentEntrySlugError|same slug|Duplicate slug/i`): strictProjectId бросает plain Error с сообщением «Duplicate slug ...», поэтому «подтверждён» в отчёте теста ранее не выводился бы. Формальная проверка теста (build ≠ 0) не менялась.
- **Прочие негативные тесты не тронуты** (missingFieldTest/duplicateIdTest/assertTreeClean) — как требует план.

## Verification Results

- `npm run build` — exit 0 (Task 1 и после Task 2; contacts.json отсутствует — strict-json-loader логирует «File not found» и продолжает, пустые коллекции проходят — контракт 01-04)
- `node scripts/check-collections.mjs --self-test` — exit 0
- `node scripts/check-collections.mjs` (реальный прогон, 3 сборки) — 3 негативных теста PASS, «DuplicateContentEntrySlugError подтверждён» (Pitfall 9 закрыт: падение строго от дубликата slug, а не от zod); рабочее дерево чисто от фикстур; аудит границ ожидаемо FAIL на текущем состоянии (0 записей, 0 featured) — контракт «0 записей = FAIL» (SPEC edge R2); записи кейсов появятся в 03-04/03-05

## Notes for Next Plans

- Коллекция projects пуста до 03-04 — реальный прогон check-collections даёт FAIL по аудиту границ до появления записей (ожидаемое поведение, не дефект)
- contacts.json создаётся в 03-04; до этого лоадер логирует ошибку в каждой сборке
- Границы (5–6, featured 2–3, theme enum, 4 h2) параметризованы константами THEME_ENUM/BODY_HEADINGS — следующий план пишет кейсы под эти контракты
- Реальный прогон check-collections занимает ~60–90 c (3 сборки) — в verify-цепочку фазы он входит как есть

## Known Stubs

None — скрипты и схема без заглушек; отсутствующий contacts.json — запланированное состояние (создаётся в 03-04).

## Self-Check: PASSED

- [x] src/content.config.ts существует, содержит theme enum, cover: image(), contacts
- [x] scripts/check-collections.mjs существует, self-test exit 0
- [x] Коммиты 387ac26, c3e73ec найдены в git log
