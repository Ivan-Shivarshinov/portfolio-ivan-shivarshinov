---
phase: 02-vizualnaya-sistema
plan: 02
subsystem: ui
tags: [decisions, palette, theme, hero, tokens, figma, state]

# Dependency graph
requires:
  - phase: 02-vizualnaya-sistema (research/planning)
    provides: UI-SPEC Color contract (D-07/D-08, Project accent palette), RESEARCH A2 (Figma MCP недоступен), CONTEXT решения D-07–D-15
provides:
  - Зафиксированные hex палитры проектов (clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C; терракота #A84B32 — системный accent, locked) для токенов --project-* в tokens.css (02-03 Task 1)
  - Зафиксированный концепт первого экрана — дефолт D-12 «контрактная типографика» (метка «01 / HOME» + имя Unbounded + CTA «Смотреть работы») для index.astro и docs/hero-concept.md (02-05 Task 2)
affects: [02-03 (Task 1: --project-* hex в tokens.css, hero D-13 на главной), 02-05 (Task 2: docs/hero-concept.md с обоснованием по D-14), verify-work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Блок решений (паттерн 01-01): чекпоинт-план без кода — единственный артефакт записи в STATE.md, читаемые планами-потребителями"

key-files:
  created: []
  modified:
    - .planning/STATE.md (2 записи решений 02-02 в Decisions)

key-decisions:
  - "02-02: Принята палитра проектов (вариант palette-research, D-07/D-08): clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C; терракота #A84B32 — системный accent (locked, не переопределяется); enum-имена terracotta/clay/olive/slate/plum не пересматриваются (costly-контракт D-07, схема projects фазы 3)"
  - "02-02: Первый экран (index.astro) — дефолт D-12 «контрактная типографика» (вариант hero-default; Figma MCP в сессии планирования недоступен — RESEARCH A2, пользователь не передал ссылки/скриншоты): моно-метка «01 / HOME» + имя (Unbounded display) + primary CTA Button «Смотреть работы» (D-13-минимум)"

patterns-established:
  - "Запись решения-чекпоинта: формулировка, которую план-потребитель читает без повторного вопроса — значения + контекст (locked-ограничения) + явный потребитель (02-03 Task 1 / 02-05 Task 2)"

requirements-completed: [REQ-design-implications, R5, R9]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Зафиксировано решение 1: палитра проектов palette-research (clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C; терракота #A84B32 — системный accent locked; enum-имена не пересматриваются, D-07) — запись в .planning/STATE.md, потребитель 02-03 Task 1 (значения --project-* в tokens.css, контраст ≥ 4.5:1 проверяется check-contrast)"
    requirement: R5
    verification:
      - kind: manual_procedural
        ref: "grep 'clay #8A5A44' .planning/STATE.md (запись решения 02-02)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Зафиксировано решение 2: концепт первого экрана — дефолт D-12 (контрактная типографика: метка «01 / HOME» + имя Unbounded display + primary CTA «Смотреть работы»; Figma-концепты не предоставлены, RESEARCH A2) — запись в .planning/STATE.md, потребитель 02-05 Task 2 (docs/hero-concept.md с обоснованием по D-14)"
    requirement: R9
    verification:
      - kind: manual_procedural
        ref: "grep '01 / HOME' .planning/STATE.md (запись решения 02-02)"
        status: pass
    human_judgment: false

# Metrics
duration: 10min
completed: 2026-08-02
status: complete
---

# Phase 02, Plan 02: Решения фазы — палитра проектов и концепт первого экрана Summary

**Принята исследовательская палитра проектов (clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C; терракота #A84B32 — системный accent, locked) и зафиксирован дефолт D-12 концепта первого экрана (метка «01 / HOME» + имя Unbounded + CTA «Смотреть работы»); обе записи — в STATE.md для потребителей 02-03/02-05**

## Performance

- **Duration:** 10 min (континуация-сессия записи решений; план стартовал ранее и был приостановлен на чекпоинте в ожидании ответа пользователя)
- **Started:** 2026-08-02T21:07:05Z (запись решений)
- **Completed:** 2026-08-02T21:11:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- **Решение 1 (палитра проектов, D-07/D-08) зафиксировано:** пользователь принял вариант `palette-research` — clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C. Терракота #A84B32 остаётся системным accent (locked, не переопределяется); enum-имена terracotta/clay/olive/slate/plum не пересматриваются (costly-контракт D-07 — потребляется схемой projects фазы 3). Значения приглушённые (D-08), пары bg/surface ≥ 4.5:1 подтверждаются check-contrast в 02-03.
- **Решение 2 (концепт первого экрана, R9/D-12–D-15) зафиксировано:** пользователь выбрал дефолт D-12 «контрактная типографика» — главная рендерит моно-метку «01 / HOME» + имя (Unbounded display) + primary CTA Button «Смотреть работы» (D-13-минимум). Figma-концепты не предоставлены (MCP в сессии планирования недоступен — RESEARCH A2); задел под фазу 3 без перекомпоновки (D-12). Фиксация с обоснованием по D-14 — в docs/hero-concept.md (02-05 Task 2).
- Оба решения записаны в `.planning/STATE.md` в формулировках, читаемых планами-потребителями без повторного вопроса (указаны значения, locked-ограничения и явные потребители: 02-03 Task 1, 02-05 Task 2).

## Task Commits

Each task was committed atomically:

1. **Task 1: Решение 1 — hex палитры проектов (theme-проп, D-07/D-08)** - `75ce962` (docs)
2. **Task 2: Решение 2 — концепт первого экрана (R9, D-12/D-14/D-15)** - `571917d` (docs)

**Plan metadata:** `pending` (docs-коммит после state-обновлений)

## Files Created/Modified
- `.planning/STATE.md` - В Decisions добавлены 2 записи решений 02-02 (палитра palette-research с hex; концепт hero-default D-12), каждая с явным потребителем для 02-03/02-05; обновлён last_updated

## Decisions Made
- Палитра проектов: принят вариант `palette-research` (рекомендация чекпоинта) — исследовательские значения clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C; терракота #A84B32 locked как системный accent; enum-имена не пересматриваются (D-07)
- Концепт первого экрана: принят вариант `hero-default` (дефолт D-12 «контрактная типографика») — метка «01 / HOME» + имя Unbounded + CTA «Смотреть работы»; Figma-концепты не предоставлены (RESEARCH A2), вопрос снят до фазы 3

## Deviations from Plan

None - план исполнен ровно как написан: оба чекпоинта закрыты ответами пользователя, обе записи внесены в STATE.md по контракту плана.

## Issues Encountered
None - оба решения получены от пользователя одним ответом; Figma MCP (user_setup, опциональный) не потребовался, т.к. выбран вариант a (дефолт D-12).

## User Setup Required
None - опциональный user_setup (Figma) не задействован: выбран дефолт D-12, генерация концептов не требуется.

## Next Phase Readiness
- **02-03 Task 1 (tracer):** значения `--project-*` в tokens.css определены — clay #8A5A44, olive #6B6B3F, slate #55606E, plum #6E4A5C + терракота #A84B32 (--color-accent); рендер hero D-13-минимума на index.astro (метка + имя + CTA) подтверждён решением 2; контраст проверяется check-contrast (02-01)
- **02-05 Task 2:** docs/hero-concept.md фиксирует дефолт D-12 с обоснованием по критериям D-14 (реализуемость в системе, «Calm Interface, Active Work», задел под фазу 3)
- **02-05 Task 1:** влияния на index.astro нет — выбран вариант не сложнее D-13-минимума
- Разблокирована волна 2: оба решения фазы зафиксированы до реализации

## Self-Check: PASSED

- Файлы: .planning/STATE.md (2 записи решений 02-02), 02-02-SUMMARY.md — существуют
- Коммиты: 75ce962 (Task 1), 571917d (Task 2) — оба в истории
- Содержимое: grep 'clay #8A5A44' и grep '01 / HOME' по .planning/STATE.md находят записи решений 02-02

---
*Phase: 02-vizualnaya-sistema*
*Completed: 2026-08-02*
